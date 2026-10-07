const express = require("express");
const User = require("../models/User");
const Payment = require("../models/Payment");
const bcrypt = require("bcryptjs");
const verifyToken = require("../middleware/auth");
const sendSMS = require("../services/smsService");

const router = express.Router();

// Add Student
// Add Student
router.post("/add-student", verifyToken, async (req, res) => {
  if (!["admin", "system-owner"].includes(req.user.role)) {
    return res.status(403).json({ error: "Forbidden" });
  }

  try {
    const {
      name,
      email,
      contactNumber,
      password,
      studentId,
      studentClass,
      mode,
    } = req.body;

    // Check if email already exists
    const existingEmail = await User.findOne({ email });

    if (existingEmail) {
      return res.status(400).json({
        success: false,
        message: "Email already exists",
      });
    }

    // Check if studentId already exists
    const existingStudentId = await User.findOne({ studentId });

    if (existingStudentId) {
      return res.status(400).json({
        success: false,
        message: "Student ID already exists",
      });
    }

    // Check if contact number already exists
    const existingContactNumber = await User.findOne({
      contactNumber,
    });

    if (existingContactNumber) {
      return res.status(400).json({
        success: false,
        message: "Contact number already exists",
      });
    }

    // Hash password
    const hashed = await bcrypt.hash(password, 10);

    // Create student
    const user = new User({
      name,
      email,
      contactNumber,
      password: hashed,
      role: "student",
      studentId,
      studentClass,
      mode,
    });

    await user.save();

    // ==========================================
    // SEND LOGIN DETAILS SMS
    // ==========================================

    let smsSent = false;

    if (contactNumber) {
      const message =
        `Welcome to Amesh Gamage Combined Maths Class,\n\n` +
        `Dear ${name},\n` +
        `Your student account has been created.\n\n` +
        `Web: amg-cmaths.app \n` +
        `Email: ${email} \n` +
        `Password: ${studentId}`;

      try {
        await sendSMS(contactNumber, message);

        smsSent = true;


      } catch (smsError) {
        console.error(
          "Login SMS failed:",
          smsError.message
        );
      }
    }

    // ==========================================

    return res.json({
      success: true,
      message: smsSent
        ? "Student added and login details sent by SMS"
        : "Student added successfully, but SMS could not be sent",
      smsSent,
    });

  } catch (error) {
    console.error("Add Student Error:", error);

    // Fallback for Mongo duplicate error
    if (error.code === 11000) {
      if (error.keyPattern?.email) {
        return res.status(400).json({
          success: false,
          message: "Email already exists",
        });
      }

      if (error.keyPattern?.studentId) {
        return res.status(400).json({
          success: false,
          message: "Student ID already exists",
        });
      }

      if (error.keyPattern?.contactNumber) {
        return res.status(400).json({
          success: false,
          message: "Contact number already exists",
        });
      }
    }

    return res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
});

// Get all students
router.get("/students", verifyToken, async (req, res) => {
  if (!["admin", "system-owner","student"].includes(req.user.role)) {
    return res.status(403).json({ error: "Forbidden" });
  }
  const students = await User.find({ role: "student" });
  res.json(students);
});

// Delete Student
// Delete Student
router.delete("/student/:id", verifyToken, async (req, res) => {
  if (!["admin", "system-owner"].includes(req.user.role)) {
    return res.status(403).json({ error: "Forbidden" });
  }

  try {
    const studentId = req.params.id;

    // 1. Check if student exists
    const student = await User.findOne({
      _id: studentId,
      role: "student",
    });

    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found",
      });
    }

    // 2. Delete all payments belonging to this student
    const deletedPayments = await Payment.deleteMany({
      studentId: studentId,
    });

    // 3. Delete the student
    await User.findByIdAndDelete(studentId);

    res.json({
      success: true,
      message: "Student and related payments deleted successfully",
      deletedPayments: deletedPayments.deletedCount,
    });
  } catch (error) {
    console.error("Delete Student Error:", error);

    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
});
// router.delete("/student/:id", verifyToken, async (req, res) => {
//   if (!["admin", "system-owner"].includes(req.user.role)) {
//     return res.status(403).json({ error: "Forbidden" });
//   }
//   await User.findByIdAndDelete(req.params.id);
//   res.json({ message: "Student deleted" });
// });

// Update Student
// Update Student (including optional password)
router.put("/student/:id", verifyToken, async (req, res) => {
  if (!["admin", "system-owner"].includes(req.user.role)) {
    return res.status(403).json({ error: "Forbidden" });
  }

  try {
    const {
      name,
      email,
      contactNumber,
      studentId,
      studentClass,
      mode,
      password,
    } = req.body;

    // ==========================================
    // DUPLICATE CHECKS
    // Only check fields that were actually sent
    // ==========================================

    // Check email only when email is provided
    if (email !== undefined) {
      const existingEmail = await User.findOne({
        email,
        _id: { $ne: req.params.id },
      });

      if (existingEmail) {
        return res.status(400).json({
          success: false,
          message: "Email already exists",
        });
      }
    }

    // Check student ID only when studentId is provided
    if (studentId !== undefined) {
      const existingStudentId = await User.findOne({
        studentId,
        _id: { $ne: req.params.id },
      });

      if (existingStudentId) {
        return res.status(400).json({
          success: false,
          message: "Student ID already exists",
        });
      }
    }

    // Check contact number only when contactNumber is provided
    if (contactNumber !== undefined) {
      const existingContactNumber = await User.findOne({
        contactNumber,
        _id: { $ne: req.params.id },
      });

      if (existingContactNumber) {
        return res.status(400).json({
          success: false,
          message: "Contact number already exists",
        });
      }
    }

    // ==========================================
    // BUILD UPDATE DATA
    // ==========================================

    const updateData = {};

    if (name !== undefined) {
      updateData.name = name;
    }

    if (email !== undefined) {
      updateData.email = email;
    }

    if (contactNumber !== undefined) {
      updateData.contactNumber = contactNumber;
    }

    if (studentId !== undefined) {
      updateData.studentId = studentId;
    }

    if (studentClass !== undefined) {
      updateData.studentClass = studentClass;
    }

    if (mode !== undefined) {
      updateData.mode = mode;
    }

    // ==========================================
    // PASSWORD
    // ==========================================

    if (password && password.trim() !== "") {
      const hashed = await bcrypt.hash(password, 10);
      updateData.password = hashed;
    }

    // ==========================================
    // UPDATE STUDENT
    // ==========================================

    const updated = await User.findByIdAndUpdate(
      req.params.id,
      updateData,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!updated) {
      return res.status(404).json({
        success: false,
        message: "Student not found",
      });
    }

    res.json({
      success: true,
      message: "Student updated",
      student: updated,
    });

  } catch (error) {
    console.error("Update Student Error:", error);

    // ==========================================
    // MONGODB DUPLICATE KEY ERROR
    // ==========================================

    if (error.code === 11000) {

      if (error.keyPattern?.email) {
        return res.status(400).json({
          success: false,
          message: "Email already exists",
        });
      }

      if (error.keyPattern?.studentId) {
        return res.status(400).json({
          success: false,
          message: "Student ID already exists",
        });
      }

      if (error.keyPattern?.contactNumber) {
        return res.status(400).json({
          success: false,
          message: "Contact number already exists",
        });
      }
    }

    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
});

module.exports = router;
