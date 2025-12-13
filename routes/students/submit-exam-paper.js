const express = require("express");
const router = express.Router();
const SubmitExam = require("../../models/SubmitExam");
const verifyToken = require("../../middleware/auth");
const multer = require("multer");
const fs = require("fs");
const path = require("path");

// ------------------------------
// Folder: uploads/submitted-exams
// ------------------------------
const examUploadFolder = "uploads/submitted-exams";

if (!fs.existsSync(examUploadFolder)) {
  fs.mkdirSync(examUploadFolder, { recursive: true });
}

// Multer storage configuration
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, examUploadFolder);
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({ storage });

// ------------------------------
// POST /api/submit-exam
// ------------------------------
router.post("/", verifyToken, upload.single("answerPDF"), async (req, res) => {
  try {
    const { examId } = req.body;
    const studentId = req.user.id; // from verifyToken

    if (!req.file) {
      return res.status(400).json({ success: false, message: "No file uploaded" });
    }

    // Check if student already submitted
    const existing = await SubmitExam.findOne({ examId, studentId });
    if (existing) {
      // Optional: delete the newly uploaded file to avoid orphan files
      fs.unlinkSync(req.file.path);

      return res.status(400).json({
        success: false,
        message: "You have already submitted this exam",
      });
    }

    // Save new submission
    const newSubmission = new SubmitExam({
      examId,
      studentId,
      answerPDF: `/uploads/submitted-exams/${req.file.filename}`,
      submittedAt: new Date(),
    });

    await newSubmission.save();

    res.json({ success: true, message: "Exam submitted successfully", submission: newSubmission });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
});
module.exports = router;