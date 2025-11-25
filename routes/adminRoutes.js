const express = require("express");
const User = require("../models/User");
const bcrypt = require("bcryptjs");

const router = express.Router();

// Add Student
router.post("/add-student", async (req, res) => {
  try {
    const { name, email, password, studentId, mode } = req.body;

    // Check if email already exists
    const existingEmail = await User.findOne({ email });
    if (existingEmail) {
      return res.status(400).json({
        success: false,
        message: "Email already exists"
      });
    }

    // Check if studentId already exists
    const existingStudentId = await User.findOne({ studentId });
    if (existingStudentId) {
      return res.status(400).json({
        success: false,
        message: "Student ID already exists"
      });
    }

    const hashed = await bcrypt.hash(password, 10);

    const user = new User({
      name,
      email,
      password: hashed,
      role: "student",
      studentId,
      mode,
    });

    await user.save();
    res.json({ success: true, message: "Student added" });

  } catch (error) {
    console.error("Add Student Error:", error);

    // Fallback for Mongo duplicate error
    if (error.code === 11000) {
      if (error.keyPattern.email) {
        return res.status(400).json({
          success: false,
          message: "Email already exists"
        });
      }
      if (error.keyPattern.studentId) {
        return res.status(400).json({
          success: false,
          message: "Student ID already exists"
        });
      }
    }

    res.status(500).json({
      success: false,
      message: "Server Error"
    });
  }
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


// Update Student
// Update Student (including optional password)
router.put("/student/:id", async (req, res) => {
  try {
    const { name, email, studentId, mode, password } = req.body;

    const updateData = { name, email, studentId, mode };

    // If password is provided, hash it
    if (password && password.trim() !== "") {
      const hashed = await bcrypt.hash(password, 10);
      updateData.password = hashed;
    }

    const updated = await User.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({
        success: false,
        message: "Student not found"
      });
    }

    res.json({
      success: true,
      message: "Student updated",
      student: updated
    });

  } catch (error) {
    console.error("Update Student Error:", error);

    if (error.code === 11000) {
      if (error.keyPattern.email) {
        return res.status(400).json({
          success: false,
          message: "Email already exists"
        });
      }
      if (error.keyPattern.studentId) {
        return res.status(400).json({
          success: false,
          message: "Student ID already exists"
        });
      }
    }

    res.status(500).json({
      success: false,
      message: "Server Error"
    });
  }
});



module.exports = router;
