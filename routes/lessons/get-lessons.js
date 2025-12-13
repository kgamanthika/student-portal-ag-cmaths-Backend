// backend/routes/lessons/get-lessons-by-class.js
const express = require("express");
const router = express.Router();
const Lessons = require("../../models/Lessons");
const Recordings = require("../../models/Recordings");
const Assignments = require("../../models/Assignments");
const verifyToken = require("../../middleware/auth");

// GET /lessons/:classId
router.get("/:classId", verifyToken, async (req, res) => {
  try {
    const { classId } = req.params;

    // Find lessons for this class
    const lessons = await Lessons.find({ class_id: classId }).sort({ date: 1 }).lean();

    // Fetch recordings for each lesson
    for (const lesson of lessons) {
      lesson.recordings = await Recordings.find({ lessons_id: lesson._id }).lean();
      lesson.assignments = await Assignments.find({ lessons_id: lesson._id }).lean();
    }

    res.json({ success: true, lessons });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

module.exports = router;
