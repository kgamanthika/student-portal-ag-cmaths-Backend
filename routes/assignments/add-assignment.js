const express = require("express");
const router = express.Router();
const Assignments = require("../../models/Assignments");
const multer = require("multer");
const verifyToken = require("../../middleware/auth");
const cloudinary = require("cloudinary").v2;

// ------------------------------
// Cloudinary config
// ------------------------------
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// ------------------------------
// Multer (memory, not disk)
// ------------------------------
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB
});

// ------------------------------
// POST /api/assignments
// ------------------------------
router.post("/", verifyToken, upload.single("file"), async (req, res) => {
  try {
    const { assignment_title, assignment_description, lessons_id } = req.body;

    if (!assignment_title || !lessons_id) {
      return res.status(400).json({ success: false, message: "Title & lesson ID required" });
    }

    let fileUrl = "";

    if (req.file) {
      console.log("File received:", req.file.originalname);

      try {
        const uploadResult = await new Promise((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream(
            { folder: "Assignments", resource_type: "raw", use_filename: true },
            (err, result) => (err ? reject(err) : resolve(result))
          );
          stream.end(req.file.buffer);
        });

        fileUrl = uploadResult.secure_url;
        console.log("Cloudinary URL:", fileUrl);
      } catch (err) {
        console.error("Cloudinary error:", err);
        return res.status(500).json({ success: false, message: "File upload failed", error: err.message });
      }
    }

    const newAssignment = new Assignments({
      assignment_title,
      assignment_description,
      lessons_id,
      assignment_Url: fileUrl,
    });

    await newAssignment.save();

    res.status(201).json({ success: true, message: "Assignment uploaded", assignment: newAssignment });
  } catch (err) {
    console.error("Assignment save error:", err);
    res.status(500).json({ success: false, message: "Server error", error: err.message });
  }
});


module.exports = router;
