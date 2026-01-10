const express = require("express");
const router = express.Router();
const User = require("../../models/User");
const Exam = require("../../models/Exam");
const SubmitExam = require("../../models/SubmitExam");
const verifyToken = require("../../middleware/auth");

router.get("/", verifyToken, async (req, res) => {
  try {
    const userAccess = await User.findById(req.user.id).then(u => u.studentClass || []);
    const exams = await Exam.find({ access: { $in: userAccess } });

    // Get student-specific data
    const studentExams = await SubmitExam.find({ studentId: req.user.id });

    const examsWithStudentData = exams.map(exam => {
      const studentData = studentExams.find(se => se.examId.toString() === exam._id.toString());
      
      // Check if 24-hour global window has passed
      const examStartTime = new Date(exam.startTime);
      const examEndTime = new Date(examStartTime.getTime() + (24 * 60 * 60 * 1000)); // 24 hours from exam start
      const now = new Date();
      const is24hWindowPassed = now > examEndTime;
      
      return {
        ...exam.toObject(),
        studentStartTime: studentData?.studentStartTime || null,
        alreadySubmitted: !!studentData?.submittedAt,
        is24hWindowPassed: is24hWindowPassed,
        globalEndTime: examEndTime
      };
    });

    res.json({ success: true, exams: examsWithStudentData });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

module.exports = router;
