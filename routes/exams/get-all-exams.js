// backend/routes/exams/get-all-exams.js
const express = require("express");
const router = express.Router();
const Exam = require("../../models/Exam");
const verifyToken = require("../../middleware/auth");

// GET /exams
router.get("/", verifyToken, async (req, res) => {
  try {
    const exams = await Exam.find().sort({ createdAt: -1 }); // latest first
    res.json({ success: true, exams });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

module.exports = router;
