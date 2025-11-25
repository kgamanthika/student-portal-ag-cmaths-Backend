const express = require("express");
const Marks = require("../models/Marks");

const router = express.Router();

// Add marks
router.post("/add", async (req, res) => {
  try {
    const mark = new Marks(req.body);
    await mark.save();
    res.json({ message: "Marks added", success: true });
  } catch (err) {
    res.status(500).json({ message: "Failed to add marks", success: false });
  }
});

// Get all marks (optional: for admin view)
router.get("/", async (req, res) => {
  try {
    const data = await Marks.find();
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch marks" });
  }
});

// Get marks by studentId
router.get("/:studentId", async (req, res) => {
  try {
    const data = await Marks.find({ studentId: req.params.studentId });
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch marks" });
  }
});

// Delete a mark by _id
router.delete("/:id", async (req, res) => {
  try {
    await Marks.findByIdAndDelete(req.params.id);
    res.json({ message: "Mark deleted", success: true });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete mark", success: false });
  }
});

// Update a mark by _id
router.put("/:id", async (req, res) => {
  try {
    const updatedMark = await Marks.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json({ message: "Mark updated", success: true, data: updatedMark });
  } catch (err) {
    res.status(500).json({ message: "Failed to update mark", success: false });
  }
});

// student details by ID
router.get("/student/:id", async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);
    res.json(student);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch student" });
  }
});

module.exports = router;
