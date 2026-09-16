const express = require("express");
const router = express.Router();

const Class = require("../../models/Class");
const Lesson = require("../../models/Lessons");
const Recording = require("../../models/Recordings");
const verifyToken = require("../../middleware/auth");

router.delete("/:id", verifyToken, async (req, res) => {
  try {
    const classId = req.params.id;

    // 1. Check if class exists
    const existingClass = await Class.findById(classId);

    if (!existingClass) {
      return res.status(404).json({
        success: false,
        error: "Class not found",
      });
    }

    // 2. Find all lessons belonging to this class
    const lessons = await Lesson.find({
      class_id: classId,
    }).select("_id");

    const lessonIds = lessons.map((lesson) => lesson._id);

    // 3. Delete all recordings related to those lessons
    if (lessonIds.length > 0) {
      await Recording.deleteMany({
        lessons_id: { $in: lessonIds },
      });
    }

    // 4. Delete all lessons belonging to the class
    await Lesson.deleteMany({
      class_id: classId,
    });

    // 5. Delete the class
    await Class.findByIdAndDelete(classId);

    res.json({
      success: true,
      message: "Class, lessons and recordings deleted successfully",
      deletedLessons: lessonIds.length,
    });
  } catch (err) {
    console.error("Delete class error:", err);

    res.status(500).json({
      success: false,
      error: err.message,
    });
  }
});

module.exports = router;
// const express = require("express");
// const router = express.Router();
// const Class = require("../../models/Class");
// const Lessons = require("../../models/Lessons");
// const verifyToken = require("../../middleware/auth");


// router.delete("/:id", verifyToken, async (req, res) => {
//   try {
//     const classId = req.params.id;
//     const deletedLesson = await Lessons.findByIdAndDelete(classId.lesson_id);
//     const deletedClass = await Class.findByIdAndDelete(classId);

//     if (!deletedClass)
//       return res.status(404).json({ success: false, error: "Class not found" });

//     res.json({ success: true, message: "Class deleted successfully" });
//   } catch (err) {
//     res.status(500).json({ success: false, error: err.message });
//   }
// });


// module.exports = router;
