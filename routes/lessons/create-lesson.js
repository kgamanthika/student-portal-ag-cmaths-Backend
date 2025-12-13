const express = require("express");
const router = express.Router();
const Lessons = require("../../models/Lessons");
const verifyToken = require("../../middleware/auth");


router.post("/", verifyToken, async (req, res) => {
  try {
    const { LessonName, description, class_id, date } = req.body;

    if (!LessonName || LessonName.trim() === "") {
      return res.status(400).json({
        success: false,
        error: "Lesson name is required",
      });
    }

    const newLesson = new Lessons({
      LessonName,
      description: description || "",
      class_id,
      date,
    });

    await newLesson.save();

    // Convert to plain object and add assignments & recordings arrays
    const lessonObj = newLesson.toObject();
    lessonObj.assignments = [];
    lessonObj.recordings = [];

    res.json({
      success: true,
      lesson: lessonObj,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message,
    });
  }
});



module.exports = router;
