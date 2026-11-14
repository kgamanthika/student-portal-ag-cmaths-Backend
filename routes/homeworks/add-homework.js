const express = require("express");
const router = express.Router();
const Homeworks = require("../../models/Homeworks");
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
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB per file
});

// ------------------------------
// Helpers
// ------------------------------
// Map MIME → Cloudinary resource_type so images go to /image/upload/
// (which preserves extensions automatically) and everything else to /raw/.
const getResourceType = (mimetype) => {
  if (!mimetype) return "raw";
  if (mimetype.startsWith("image/")) return "image";
  if (mimetype.startsWith("video/")) return "video";
  return "raw"; // pdf, docx, xlsx, pptx, zip, etc.
};

// Extract extension from a filename (".pdf", ".docx", etc.)
const getExtension = (filename) => {
  const m = filename.match(/\.([a-z0-9]+)$/i);
  return m ? `.${m[1].toLowerCase()}` : "";
};

// Sanitize base filename (strip extension, spaces, weird chars)
const sanitizeBaseName = (filename) =>
  filename
    .replace(/\.[^.]+$/, "") // drop ext
    .replace(/[^\w\-.]+/g, "_") // safe chars only
    .replace(/_+/g, "_") // collapse repeats
    .slice(0, 60) || "file"; // cap length

// Upload a single buffer to Cloudinary and resolve with the result
const uploadBuffer = (file) => {
  const resourceType = getResourceType(file.mimetype);
  const ext = getExtension(file.originalname);
  const base = sanitizeBaseName(file.originalname);

  // Unique suffix so re-uploads don't collide
  const unique = `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

  // ⚠️ CRITICAL:
  //  - For raw files, public_id MUST end with the extension or Cloudinary
  //    drops it forever. We build it ourselves.
  //  - For images/videos, DO NOT include the extension in public_id;
  //    Cloudinary appends it automatically from the format.
  const publicId =
    resourceType === "raw"
      ? `${unique}_${base}${ext}` // e.g. "171234_abc123_Algebra_Set_1.pdf"
      : `${unique}_${base}`; // e.g. "171234_abc123_photo" → /image/upload/...photo.png

  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: "Homeworks",
        resource_type: resourceType,
        public_id: publicId,
        // Remove use_filename/unique_filename — we've already built public_id
        overwrite: false,
        invalidate: true,
      },
      (err, result) => (err ? reject(err) : resolve(result))
    );
    stream.end(file.buffer);
  });
};

// ------------------------------
// POST /api/homeworks
// ------------------------------
router.post("/", verifyToken, upload.array("files", 10), async (req, res) => {
  try {
    const {
      homework_title,
      homework_description,
      homework_dueDate,
      homework_instructions,
      lessons_id,
    } = req.body;

    if (!homework_title || !lessons_id) {
      return res
        .status(400)
        .json({ success: false, message: "Title & lesson ID required" });
    }

    // if (!req.files || req.files.length === 0) {
    //   return res
    //     .status(400)
    //     .json({ success: false, message: "At least one file is required" });
    // }

    let uploadedUrls = [];

    try {
      const results = await Promise.all(req.files.map(uploadBuffer));
      uploadedUrls = results.map((r) => r.secure_url);
    } catch (err) {
      console.error("Cloudinary error:", err);
      return res.status(500).json({
        success: false,
        message: "File upload failed",
        error: err.message,
      });
    }

    const newHomework = new Homeworks({
      homework_title,
      homework_description,
      homework_instructions,
      homework_dueDate: homework_dueDate || null,
      lessons_id,
      homework_Url: uploadedUrls[0],
      attachments: uploadedUrls,
    });

    await newHomework.save();

    res.status(201).json({
      success: true,
      message: "Homework created",
      homework: newHomework,
    });
  } catch (err) {
    console.error("Homework save error:", err);
    res
      .status(500)
      .json({ success: false, message: "Server error", error: err.message });
  }
});

module.exports = router;