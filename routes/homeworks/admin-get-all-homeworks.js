// backend/routes/homeworks/admin-get-all-homeworks.js
const express = require("express");
const router = express.Router();
const Homeworks = require("../../models/Homeworks");
const HomeworkSubmission = require("../../models/HomeworkSubmissions");
const Lessons = require("../../models/Lessons");
const Class = require("../../models/Class");      
const User = require("../../models/User");         
const verifyToken = require("../../middleware/auth");

router.get("/", verifyToken, async (req, res) => {
  try {
    // 1. All homeworks
    const homeworks = await Homeworks.find().lean();
    const lessonIds = [...new Set(homeworks.map((h) => String(h.lessons_id)))];

    // 2. Lessons
    const lessons = await Lessons.find({ _id: { $in: lessonIds } }).lean();
    const lessonMap = Object.fromEntries(lessons.map((l) => [String(l._id), l]));

    // 3. Classes
    const classIds = [...new Set(lessons.map((l) => String(l.class_id)))];
    const classes = await Class.find({ _id: { $in: classIds } }).lean();
    const classMap = Object.fromEntries(classes.map((c) => [String(c._id), c]));

    // 4. Students
    const students = await User.find({ role: "student" }).lean();

    // 5. Submissions
    const submissions = await HomeworkSubmission.find().lean();

    const submissionMap = {};
    submissions.forEach((s) => {
      submissionMap[`${String(s.homework_id)}|${String(s.student_id)}`] = {
        _id: String(s._id),
        files: s.files || [],
        submittedAt: s.submittedAt,
      };
    });

    // 6. Homework columns
    const homeworkColumns = homeworks
      .map((hw) => {
        const lesson = lessonMap[String(hw.lessons_id)];
        const klass = lesson ? classMap[String(lesson.class_id)] : null;
        
        return {
          _id: String(hw._id),
          title: hw.homework_title,
          lessonId: String(hw.lessons_id),
          lessonName: lesson?.LessonName || "Unknown Lesson", // <-- ADDED THIS
          classId: klass ? String(klass._id) : null,
          className: klass?.name || "Unknown Class",
          access: klass?.access || [],
          attachments: hw.attachments || [],
        };
      })
      // Sort by Class, then Lesson, then Homework Title
      .sort((a, b) => {
        if (a.className !== b.className) {
          return a.className.localeCompare(b.className);
        }
        if (a.lessonName !== b.lessonName) {
          return a.lessonName.localeCompare(b.lessonName);
        }
        return a.title.localeCompare(b.title);
      });

    // 7. Student rows
    const studentRows = students.map((student) => {
      const row = {
        _id: String(student._id),
        name:
          student.name ||
          student.fullName ||
          student.username ||
          student.email ||
          "Unknown",
        stId:
          student.studentId ||
          student.st_id ||
          student.stId ||
          student.registrationNumber ||
          "",
        cells: {},
      };

      homeworkColumns.forEach((hw) => {
        const key = `${hw._id}|${row._id}`;
        const sub = submissionMap[key];
        row.cells[hw._id] = sub
          ? {
              status: "done",
              submissionId: sub._id,
              files: sub.files,
              submittedAt: sub.submittedAt,
            }
          : { status: "no" };
      });

      return row;
    });

    res.json({
      success: true,
      homeworks: homeworkColumns,
      students: studentRows,
    });
  } catch (err) {
    console.error("admin all-homeworks error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

module.exports = router;