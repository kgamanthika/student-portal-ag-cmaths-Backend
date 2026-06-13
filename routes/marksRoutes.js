const express = require("express");
const Marks = require("../models/Marks");
const User = require("../models/User");
const verifyToken = require("../middleware/auth");

const router = express.Router();

// Add marks
router.post("/add", verifyToken, async (req, res) => {
  if (!["admin", "system-owner"].includes(req.user.role)) {
    return res.status(403).json({ message: "Forbidden" });
  }
  try {
    const mark = new Marks(req.body);
    await mark.save();
    res.json({ message: "Marks added", success: true });
  } catch (err) {
    res.status(500).json({ message: "Failed to add marks", success: false });
  }
});

// Get all marks (optional: for admin view)
// router.get("/",verifyToken, async (req, res) => {
//   if (!["admin", "system-owner","student"].includes(req.user.role)) {
//     return res.status(403).json({ message: "Forbidden" });
//   }
//   try {
//     const data = await Marks.find();
//     res.json(data);
//   } catch (err) {
//     res.status(500).json({ message: "Failed to fetch marks" });
//   }
// });
router.get("/", verifyToken, async (req, res) => {
  try {

    // Admin can see everything
    if (["admin", "system-owner"].includes(req.user.role)) {
      const data = await Marks.find();
      return res.json(data);
    }

    // Student
    if (req.user.role === "student") {

      const currentStudent = await User.findById(req.user.id);

      if (!currentStudent) {
        return res.status(404).json({ message: "Student not found" });
      }

      const classStudents = await User.find({
        role: "student",
        studentClass: {
          $in: currentStudent.studentClass
        }
      });

      const studentIds = classStudents.map(s => s.studentId);

      const marks = await Marks.find({
        studentId: { $in: studentIds }
      });

      return res.json(marks);
    }

    return res.status(403).json({ message: "Forbidden" });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch marks" });
  }
});

// Get marks by studentId
router.get("/:studentId",verifyToken, async (req, res) => {
  if (!["admin", "system-owner","student"].includes(req.user.role)) {
    return res.status(403).json({ message: "Forbidden" });
  }
  try {
    const data = await Marks.find({ studentId: req.params.studentId });
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch marks" });
  }
});

// Delete a mark by _id
router.delete("/:id",verifyToken, async (req, res) => {
  if (!["admin", "system-owner"].includes(req.user.role)) {
    return res.status(403).json({ message: "Forbidden" });
  }
  try {
    await Marks.findByIdAndDelete(req.params.id);
    res.json({ message: "Mark deleted", success: true });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete mark", success: false });
  }
});

// Update a mark by _id
router.put("/:id", verifyToken, async (req, res) => {
  if (!["admin", "system-owner"].includes(req.user.role)) {
    return res.status(403).json({ message: "Forbidden" });
  }
  try {
    const updatedMark = await Marks.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json({ message: "Mark updated", success: true, data: updatedMark });
  } catch (err) {
    res.status(500).json({ message: "Failed to update mark", success: false });
  }
});

// student details by ID
router.get("/student/:id",verifyToken, async (req, res) => {
  if (!["admin", "system-owner"].includes(req.user.role)) {
    return res.status(403).json({ message: "Forbidden" });
  }
  try {
    const student = await Student.findById(req.params.id);
    res.json(student);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch student" });
  }
});

module.exports = router;
