const express = require("express");
const router = express.Router();
const Exam = require("../../models/Exam");
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
// Multer (memory storage)
// ------------------------------
const upload = multer({
  storage: multer.memoryStorage(),
});

// ------------------------------
// POST /api/exams
// ------------------------------
router.post("/", verifyToken, upload.single("file"), async (req, res) => {
  try {
    const { examName, access, startTime, durationMin } = req.body;

    let fileUrl = "";

    // Upload file to Cloudinary
    if (req.file) {
      const uploadResult = await new Promise((resolve, reject) => {
  const stream = cloudinary.uploader.upload_stream(
    {
      folder: "Exams",
      resource_type: "raw", // important for PDFs
      use_filename: true,
      unique_filename: false,
      type: "upload",       // <-- makes the file public
    },
    (error, result) => {
      if (error) reject(error);
      else resolve(result);
    }
  );

  stream.end(req.file.buffer);
});

fileUrl = uploadResult.secure_url;

    }

    const newExam = new Exam({
      examName,
      access: JSON.parse(access),
      startTime,
      durationMin,
      fileUrl: fileUrl,   // ✅ Cloudinary URL
    });

    await newExam.save();

    res.json({ success: true, exam: newExam });
  } catch (err) {
    console.error("Exam upload error:", err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
