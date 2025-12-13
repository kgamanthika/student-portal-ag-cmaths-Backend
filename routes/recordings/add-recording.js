const express = require("express");
const router = express.Router();
const Recordings = require("../../models/Recordings");
const Lessons = require("../../models/Lessons");

router.post("/:lessonId/recordings", async (req, res) => {
  try {
    const { lessonId } = req.params;

    const {
      recording_Url,
      recording_title,
      recording_description = "",
      recording_watermark = "",
    } = req.body;

    if (!recording_Url) {
      return res.status(400).json({
        success: false,
        message: "YouTube URL is required",
      });
    }

    const newRecording = await Recordings.create({
      lessons_id: lessonId,
      recording_title,
      recording_Url,
      recording_description,
      recording_watermark,
    });

    // 🔥 Fetch updated lesson with recordings
    const lesson = await Lessons.findById(lessonId).lean();
    const recordings = await Recordings.find({ lessons_id: lessonId }).lean();

    res.json({
  success: true,
  lesson: {
    ...lesson,
    recordings, // include ALL recordings
  },
});
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: "Server error while saving recording",
    });
  }
});


module.exports = router;
