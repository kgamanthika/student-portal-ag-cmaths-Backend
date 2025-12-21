// backend/routes/exams/get-submitted-exams.js
const express = require("express");
const router = express.Router();
const SubmitExam = require("../../models/SubmitExam");
const verifyToken = require("../../middleware/auth");

// GET /get-submitted-exams/:examId
router.get("/:examId", verifyToken, async (req, res) => {
  try {
    const { examId } = req.params;

    const submittedExams = await SubmitExam.find({ examId })
      .populate("studentId", "studentId")
      .sort({ submittedAt: -1 });

    res.json({ success: true, submittedExams });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

module.exports = router;
