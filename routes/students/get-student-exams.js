// backend/routes/exams/get-all-exams.js
const express = require("express");
const router = express.Router();
const User = require("../../models/User");
const Exam= require("../../models/Exam");
const verifyToken = require("../../middleware/auth");

// GET /exams
router.get("/", verifyToken, async (req, res) => {

  try {
    // Make sure req.user.access is an array
    const userAccess = await User.findById(req.user.id).then(user => user.studentClass || []);

    const exams = await Exam.find({ access: { $in: userAccess } });
    res.json({ success: true, exams });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

module.exports = router;
