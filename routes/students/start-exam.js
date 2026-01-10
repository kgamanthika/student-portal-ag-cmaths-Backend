const express = require("express");
const router = express.Router();
const ExamAttempt = require("../../models/ExamAttempt");
const Exam = require("../../models/Exam");
const verifyToken = require("../../middleware/auth");

router.post("/", verifyToken, async (req, res) => {
  try {
    const { examId } = req.body;
    const studentId = req.user.id;

    // Find existing attempt
    let attempt = await ExamAttempt.findOne({ examId, studentId });

    if (!attempt) {
      // Find exam to get duration
      const exam = await Exam.findById(examId);
      if (!exam) {
        return res.status(404).json({ success: false, message: "Exam not found" });
      }

      const now = new Date();
      const durationMs = exam.durationMin * 60 * 1000; // convert minutes to milliseconds
      const endTime = new Date(now.getTime() + durationMs);

      // Create new attempt
      attempt = new ExamAttempt({
        examId,
        studentId,
        studentStartTime: now,
        studentEndTime: endTime,
      });

      await attempt.save();
    }

    res.json({
      success: true,
      attempt,
    });
  } catch (err) {
    console.error("START EXAM ERROR:", err);
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
