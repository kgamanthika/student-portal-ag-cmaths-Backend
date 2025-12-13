const express = require("express");
const router = express.Router();
const Assignments = require("../../models/Assignments");
const fs = require("fs");
const path = require("path");

router.delete("/:assignmentId", async (req, res) => {
  try {
    const { assignmentId } = req.params;

    const assignment = await Assignments.findById(assignmentId);
    if (!assignment) {
      return res.status(404).json({ success: false, message: "Assignment not found" });
    }

    // Delete file safely
    const filePath = path.join(process.cwd(), assignment.assignment_Url);
    if (fs.existsSync(filePath)) {
      await fs.promises.unlink(filePath);
    }

    await Assignments.findByIdAndDelete(assignmentId);

    res.json({ success: true, message: "Assignment deleted successfully" });
  } catch (err) {
    console.error("Error deleting assignment:", err);
    res.status(500).json({ success: false, message: "Server error while deleting assignment" });
  }
});

module.exports = router;
