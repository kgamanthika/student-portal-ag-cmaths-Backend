const express = require("express");
const router = express.Router();
const Recordings = require("../../models/Recordings");
const fs = require("fs");
const path = require("path");

// DELETE recording
router.delete("/:recordingId", async (req, res) => {
  try {
    const { recordingId } = req.params;

    // Find recording
    const recording = await Recordings.findById(recordingId);
    if (!recording) {
      return res.status(404).json({ success: false, message: "Recording not found" });
    }

    // Delete file from disk
    const filePath = path.join(__dirname, "..", "..", recording.recording_Url);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    // Delete from DB
    await Recordings.findByIdAndDelete(recordingId);

    res.json({ success: true, message: "Recording deleted" });
  } catch (err) {
    console.error("Error deleting recording:", err);
    res.status(500).json({ success: false, message: "Server error while deleting recording" });
  }
});

module.exports = router;
