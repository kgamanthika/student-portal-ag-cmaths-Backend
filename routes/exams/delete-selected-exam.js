// backend/routes/exams/delete-selected-exam.js
const express = require("express");
const router = express.Router();
const Exam = require("../../models/Exam"); // your Exam model
const verifyToken = require("../../middleware/auth");
const mongoose = require("mongoose");


// DELETE /delete-selected-exam/:id
router.delete("/:id", verifyToken, async (req, res) => {

  try {
    const examId = req.params.id;

    // check if valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(examId)) {
      return res.status(400).json({ success: false, message: "Invalid exam ID" });
    }

    const deletedExam = await Exam.findByIdAndDelete(examId);

    if (!deletedExam) {
      return res.status(404).json({ success: false, message: "Exam not found" });
    }

    res.json({ success: true, message: "Exam deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

module.exports = router;
