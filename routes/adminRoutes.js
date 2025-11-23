const express = require("express");
const User = require("../models/User");
const bcrypt = require("bcryptjs");

const router = express.Router();

// Add Student
router.post("/add-student", async (req, res) => {
  const { name, email, password, studentId } = req.body;

  const hashed = await bcrypt.hash(password, 10);

  const user = new User({
    name,
    email,
    password: hashed,
    role: "student",
    studentId
  });

  await user.save();
  res.json({ message: "Student added" });
});

// Get all students
router.get("/students", async (req, res) => {
  const students = await User.find({ role: "student" });
  res.json(students);
});

// Delete Student
router.delete("/student/:id", async (req, res) => {
  await User.findByIdAndDelete(req.params.id);
  res.json({ message: "Student deleted" });
});

module.exports = router;
