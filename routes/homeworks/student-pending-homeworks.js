const express = require("express");
const router = express.Router();
const Class = require("../../models/Class");
const Lessons = require("../../models/Lessons");
const Homeworks = require("../../models/Homeworks");
const HomeworkSubmission = require("../../models/HomeworkSubmissions");
const User = require("../../models/User");
const verifyToken = require("../../middleware/auth");

router.get("/", verifyToken, async (req, res) => {
  try {
    const studentId = req.user?.id || req.user?._id || req.userId;
    if (!studentId) return res.status(401).json({ success: false, message: "Unauthorized" });

    // 1. Get student's batch/access
    const student = await User.findById(studentId).lean();
    if (!student) return res.status(404).json({ success: false, message: "Student not found" });
    
    // User.studentClass contains the access keys used by Class.access.
    const studentAccess = [
      ...(Array.isArray(student.studentClass) ? student.studentClass : []),
      ...(Array.isArray(student.access) ? student.access : []),
      ...(Array.isArray(student.batch) ? student.batch : []),
    ];

    // 2. Find classes the student has access to
    const classes =
      studentAccess.length > 0
        ? await Class.find({ access: { $in: studentAccess } }).lean()
        : [];
    const classIds = classes.map(c => c._id);

    // 3. Find lessons in those classes
    const lessons = await Lessons.find({ class_id: { $in: classIds } }).lean();
    const lessonIds = lessons.map(l => l._id);

    // 4. Find all homeworks for those lessons
    const homeworks = await Homeworks.find({ lessons_id: { $in: lessonIds } }).lean();

    // 5. Find all submissions by this student
    const submissions = await HomeworkSubmission.find({ student_id: studentId }).lean();
    const submittedIds = submissions.map(s => String(s.homework_id));

    // 6. Filter homeworks that haven't been submitted
    const pendingHomeworks = homeworks.filter(hw => !submittedIds.includes(String(hw._id)));

    // 7. Attach lesson and class info for display
    const pendingWithDetails = pendingHomeworks.map(hw => {
      const lesson = lessons.find(l => String(l._id) === String(hw.lessons_id));
      const cls = classes.find(c => String(c._id) === String(lesson?.class_id));
      return {
        ...hw,
        lessonName: lesson?.LessonName || "Unknown Lesson",
        className: cls?.name || "Unknown Class",
      };
    });

    res.json({ success: true, pending: pendingWithDetails });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

module.exports = router;