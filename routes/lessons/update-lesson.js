const express = require("express");
const router = express.Router();
const Lessons = require("../../models/Lessons");
const verifyToken = require("../../middleware/auth");

router.put("/:id", verifyToken, async (req, res) => {
  try {
    const lessonId = req.params.id;
    const { LessonName, description, date } = req.body;

    // Validation
    if (!LessonName || LessonName.trim() === "") {
      return res.status(400).json({
        success: false,
        error: "Lesson name is required",
      });
    }

    const updatedLesson = await Lessons.findByIdAndUpdate(
      lessonId,
      {
        LessonName,
        description: description || "",
        date,
      },
      { new: true, runValidators: true }
    );

    if (!updatedLesson) {
      return res.status(404).json({
        success: false,
        error: "Lesson not found",
      });
    }

    res.json({
      success: true,
      lesson: updatedLesson,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message,
    });
  }
});

module.exports = router;
