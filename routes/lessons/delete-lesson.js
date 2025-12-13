// backend/routes/lessons/delete-lesson.js
const express = require("express");
const router = express.Router();
const Lessons = require("../../models/Lessons");
const Recordings = require("../../models/Recordings");
const Assignments = require("../../models/Assignments");
const verifyToken = require("../../middleware/auth");
const mongoose = require("mongoose");

router.delete("/:id", verifyToken, async (req, res) => {
  try {
    const lessonId = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(lessonId)) {
      return res.status(400).json({
        success: false,
        error: "Invalid lesson ID",
      });
    }

    // 1️⃣ Delete recordings first
    await Recordings.deleteMany({ lessons_id: lessonId });
    await Assignments.deleteMany({ lessons_id: lessonId });

    // 2️⃣ Delete lesson
    const deletedLesson = await Lessons.findByIdAndDelete(lessonId);

    if (!deletedLesson) {
      return res.status(404).json({
        success: false,
        error: "Lesson not found",
      });
    }

    res.json({
      success: true,
      message: "Lesson and related recordings deleted successfully",
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      error: "Server error",
    });
  }
});

module.exports = router;
