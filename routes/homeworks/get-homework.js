const express = require("express");
const router = express.Router();
const Homeworks = require("../../models/Homeworks");
const verifyToken = require("../../middleware/auth");

router.get("/:lessonId", verifyToken, async (req, res) => {
  try {
    const { lessonId } = req.params;
    const homeworks = await Homeworks.find({ lessons_id: lessonId }).sort({
      createdAt: -1,
    });
    res.json({ success: true, homeworks });
  } catch (err) {
    console.error("Error fetching homework:", err);
    res.status(500).json({
      success: false,
      message: "Server error while fetching homework",
    });
  }
});

module.exports = router;