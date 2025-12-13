const express = require("express");
const router = express.Router();
const Exam = require("../../models/Exam");
const multer = require("multer");
const verifyToken = require("../../middleware/auth");
const path = require("path");
const fs = require("fs");

// ------------------------------
// Folder: uploads/exams
// ------------------------------
const examUploadFolder = "uploads/exams";

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
// POST /api/exams
// ------------------------------
router.post("/", verifyToken, upload.single("file"), async (req, res) => {
  try {
    const { examName, access, startTime, durationMin } = req.body;

    const newExam = new Exam({
      examName,
      access: JSON.parse(access),
      startTime,
      durationMin,
      fileUrl: req.file ? `/uploads/exams/${req.file.filename}` : "",
    });

    await newExam.save();

    res.json({ success: true, exam: newExam });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
