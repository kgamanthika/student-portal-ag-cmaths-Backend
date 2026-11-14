// backend/routes/lessons/get-lessons-by-class.js
const express = require("express");
const router = express.Router();
const Lessons = require("../../models/Lessons");
const Recordings = require("../../models/Recordings");
const Assignments = require("../../models/Assignments");
const Homeworks = require("../../models/Homeworks");
const HomeworkSubmission = require("../../models/HomeworkSubmissions"); // ← NEW
const verifyToken = require("../../middleware/auth");

// GET /lessons/:classId
router.get("/:classId", verifyToken, async (req, res) => {
  try {
    const { classId } = req.params;

    // Figure out who is asking (adjust field names to match your auth middleware)
    const studentId =
      req.user?.id || req.user?._id || req.userId || req.student?._id;

    // Find lessons for this class
    const lessons = await Lessons.find({ class_id: classId })
      .sort({ date: 1 })
      .lean();

    // Fetch recordings, assignments & homeworks for each lesson
    for (const lesson of lessons) {
      lesson.recordings = await Recordings.find({
        lessons_id: lesson._id,
      }).lean();

      lesson.assignments = await Assignments.find({
        lessons_id: lesson._id,
      }).lean();

      const homeworks = await Homeworks.find({
        lessons_id: lesson._id,
      }).lean();

      // Attach hasSubmission flag per homework for this student
      if (homeworks.length > 0 && studentId) {
        const homeworkIds = homeworks.map((h) => h._id);

        const submissions = await HomeworkSubmission.find({
          homework_id: { $in: homeworkIds },
          student_id: studentId,
        })
          .select("homework_id submittedAt")
          .lean();

        // Build a quick lookup: homeworkId → submittedAt
        const submissionMap = new Map(
          submissions.map((s) => [
            s.homework_id.toString(),
            s.submittedAt,
          ])
        );

        lesson.homeworks = homeworks.map((hw) => ({
          ...hw,
          hasSubmission: submissionMap.has(hw._id.toString()),
          submittedAt: submissionMap.get(hw._id.toString()) || null,
        }));
      } else {
        lesson.homeworks = homeworks;
      }
    }

    res.json({ success: true, lessons });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

module.exports = router;