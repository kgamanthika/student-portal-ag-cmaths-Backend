const express = require("express");
const router = express.Router();
const HomeworkSubmission = require("../../models/HomeworkSubmissions");
const Homework = require("../../models/Homeworks");     // ← NEW
const verifyToken = require("../../middleware/auth");

router.post("/", verifyToken, async (req, res) => {
  try {
    const { homeworkId, studentId, action } = req.body;
    if (!homeworkId || !studentId || !["done", "no"].includes(action)) {
      return res.status(400).json({ success: false, message: "Invalid input" });
    }

    const existing = await HomeworkSubmission.findOne({
      homework_id: homeworkId,
      student_id: studentId,
    });

    // ── Turn OFF ──────────────────────────────
    if (action === "no") {
      if (existing) {
        await HomeworkSubmission.findByIdAndDelete(existing._id);
      }
      return res.json({ success: true, message: "Marked as not submitted" });
    }

    // ── Turn ON ───────────────────────────────
    if (action === "done") {
      if (existing) {
        return res.json({ success: true, message: "Already marked done" });
      }

      // 🔑 Fetch parent homework → grab lessons_id (required by schema)
      const homework = await Homework.findById(homeworkId).lean();
      if (!homework) {
        return res
          .status(404)
          .json({ success: false, message: "Homework not found" });
      }

      const sub = await HomeworkSubmission.create({
        homework_id: homeworkId,
        lessons_id: homework.lessons_id,     // ← FIX
        student_id: studentId,
        student_note: "Marked manually by admin",
        files: [],
        submittedAt: new Date(),
      });

      return res.json({ success: true, submission: sub });
    }
  } catch (err) {
    console.error("toggle homework submission error:", err);
    res.status(500).json({
      success: false,
      message: err.message || "Server error",
      error: err.code || null,
    });
  }
});

module.exports = router;