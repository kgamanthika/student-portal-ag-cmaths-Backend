// backend/routes/lessons/delete-lesson.js
const express = require("express");
const router = express.Router();
const Lessons = require("../../models/Lessons");
const Recordings = require("../../models/Recordings");
const Assignments = require("../../models/Assignments");
const Homeworks = require("../../models/Homeworks");        // ← NEW
const verifyToken = require("../../middleware/auth");
const mongoose = require("mongoose");
const cloudinary = require("cloudinary").v2;                 // ← NEW

// ── Cloudinary config ─────────────────────────
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// ── Helpers ──────────────────────────────────
// Extract Cloudinary public_id from a URL
// e.g. https://res.cloudinary.com/demo/raw/upload/v123/Homeworks/abc.pdf
//   → "Homeworks/abc.pdf"
const getPublicIdFromUrl = (url) => {
  if (!url) return null;
  const parts = url.split("/upload/");
  if (parts.length < 2) return null;
  return parts[1].replace(/^v\d+\//, "");
};

// Best-effort Cloudinary cleanup — never throws
const destroyIfCloudinary = async (url, resourceType = "raw") => {
  const publicId = getPublicIdFromUrl(url);
  if (!publicId) return;
  try {
    await cloudinary.uploader.destroy(publicId, { resource_type: resourceType });
  } catch (err) {
    console.warn("Cloudinary delete failed:", publicId, err.message);
  }
};

// ── DELETE /:id ──────────────────────────────
router.delete("/:id", verifyToken, async (req, res) => {
  try {
    const lessonId = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(lessonId)) {
      return res.status(400).json({
        success: false,
        error: "Invalid lesson ID",
      });
    }

    // 1️⃣ Fetch related docs BEFORE deleting (need their Cloudinary URLs)
    const [assignments, homeworks] = await Promise.all([
      Assignments.find({ lessons_id: lessonId }).lean(),
      Homeworks.find({ lessons_id: lessonId }).lean(),
    ]);

    // 2️⃣ Clean up Cloudinary files (best effort, in parallel)
    await Promise.all([
      ...assignments.map((a) => destroyIfCloudinary(a.assignment_Url)),
      ...homeworks.flatMap((h) =>
        [h.homework_Url, ...(h.attachments || [])].map((u) =>
          destroyIfCloudinary(u)
        )
      ),
    ]);

    // 3️⃣ Delete related Mongo records
    await Recordings.deleteMany({ lessons_id: lessonId });
    await Assignments.deleteMany({ lessons_id: lessonId });
    await Homeworks.deleteMany({ lessons_id: lessonId });      // ← NEW

    // 4️⃣ Delete the lesson
    const deletedLesson = await Lessons.findByIdAndDelete(lessonId);

    if (!deletedLesson) {
      return res.status(404).json({
        success: false,
        error: "Lesson not found",
      });
    }

    res.json({
      success: true,
      message: "Lesson and related content deleted successfully",
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      error: "Server error",
    });
  }
});

module.exports = router;