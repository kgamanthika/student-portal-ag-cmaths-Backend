const express = require("express");
const router = express.Router();

const Recordings = require("../../models/Recordings");
const Lessons = require("../../models/Lessons");

router.put("/:recordingId", async (req, res) => {
  try {
    const { recordingId } = req.params;

    const {
      recording_title,
      recording_description,
      recording_Url,
      recording_watermark,
      recording_enabled,
    } = req.body;

    // Find recording
    const recording = await Recordings.findById(recordingId);

    if (!recording) {
      return res.status(404).json({
        success: false,
        message: "Recording not found",
      });
    }

    // Update fields
    if (recording_title !== undefined) {
      recording.recording_title = recording_title;
    }

    if (recording_description !== undefined) {
      recording.recording_description = recording_description;
    }

    if (recording_Url !== undefined) {
      recording.recording_Url = recording_Url;
    }

    if (recording_watermark !== undefined) {
      recording.recording_watermark = recording_watermark;
    }

    // IMPORTANT
    if (recording_enabled !== undefined) {
      recording.recording_enabled = recording_enabled;
    }

    // Save
    await recording.save();

    // Get updated lesson
    const lesson = await Lessons.findById(recording.lessons_id).lean();

    // Get all recordings for lesson
    const recordings = await Recordings.find({
      lessons_id: recording.lessons_id,
    }).lean();

    return res.json({
      success: true,
      message: "Recording updated successfully",
      recording,
      lesson: {
        ...lesson,
        recordings,
      },
    });
  } catch (err) {
    console.error("Update recording error:", err);

    return res.status(500).json({
      success: false,
      message: "Server error while updating recording",
    });
  }
});

module.exports = router;