const express = require("express");
const router = express.Router();
const SubmitExam = require("../../models/SubmitExam");
const verifyToken = require("../../middleware/auth");
const multer = require("multer");
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
// POST /api/submit-exam
// ------------------------------
router.post("/", verifyToken, upload.single("answerPDF"), async (req, res) => {
  try {
    const { examId } = req.body;
    const studentId = req.user.id;

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No file uploaded",
      });
    }

    // Check if student already submitted
    const existing = await SubmitExam.findOne({ examId, studentId });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: "You have already submitted this exam",
      });
    }

    // Upload PDF to Cloudinary
    const uploadResult = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder: "Submitted-Exams",
          resource_type: "raw", // important for PDF
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );

      stream.end(req.file.buffer);
    });

    const newSubmission = new SubmitExam({
      examId,
      studentId,
      answerPDF: uploadResult.secure_url, // ✅ Cloudinary URL
      submittedAt: new Date(),
    });

    await newSubmission.save();

    res.json({
      success: true,
      message: "Exam submitted successfully",
      submission: newSubmission,
    });
  } catch (err) {
    console.error("Submit exam error:", err);
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
});

module.exports = router;
