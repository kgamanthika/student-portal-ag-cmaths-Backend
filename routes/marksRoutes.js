const express = require("express");
const Marks = require("../models/Marks");

const router = express.Router();

// Add marks
router.post("/add", async (req, res) => {
  const mark = new Marks(req.body);
  await mark.save();
  res.json({ message: "Marks added" });
});

// Get student marks
router.get("/:studentId", async (req, res) => {
  const data = await Marks.find({ studentId: req.params.studentId });
  res.json(data);
});

module.exports = router;
