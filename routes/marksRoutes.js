const express = require("express");
const Marks = require("../models/Marks");
const verifyToken = require("../middleware/auth");
const User = require("../models/User");
const sendSMS = require("../services/smsService");

const router = express.Router();

// Add marks
router.post("/add", verifyToken, async (req, res) => {
  if (!["admin", "system-owner"].includes(req.user.role)) {
    return res.status(403).json({
      message: "Forbidden"
    });
  }

  try {
    const {
      studentId,
      subject,
      marks,
      term
    } = req.body;

    // =====================================
    // 1. FIND STUDENT
    // =====================================

    const student = await User.findOne({ studentId });

    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found"
      });
    }

    // =====================================
    // 2. SAVE MARKS
    // =====================================

    const mark = new Marks({
      studentId,
      subject,
      marks,
      term
    });

    await mark.save();

    // =====================================
    // 3. CREATE SMS MESSAGE
    // =====================================

    const message =
  `Dear ${student.name},\n\n` +
  `ST-ID : ${student.studentId}\n` +
  `Exam  : ${subject} PAPER-${term}\n` +
  `Marks : ${marks}%.\n\n` +
  `Thank you.\n` +
  `Amesh Gamage`;

    // =====================================
    // 4. SEND SMS
    // =====================================

    let smsSent = false;

    try {
      if (student.contactNumber) {
        await sendSMS(
          student.contactNumber,
          message
        );

        smsSent = true;

        // console.log(
        //   `SMS sent to ${student.contactNumber}`
        // );
      } else {
        console.log(
          `No contact number for student ${studentId}`
        );
      }
    } catch (smsError) {
      console.error(
        "SMS sending failed:",
        smsError
      );
    }

    // =====================================
    // 5. RESPONSE
    // =====================================

    res.json({
      success: true,
      message: smsSent
        ? "Marks added and SMS sent successfully"
        : "Marks added successfully, but SMS could not be sent",
      smsSent
    });

  } catch (err) {
    console.error("Add Marks Error:", err);

    res.status(500).json({
      success: false,
      message: "Failed to add marks"
    });
  }
});

// Get all marks (optional: for admin view)
router.get("/",verifyToken, async (req, res) => {
  if (!["admin", "system-owner","student"].includes(req.user.role)) {
    return res.status(403).json({ message: "Forbidden" });
  }
  try {
    const data = await Marks.find();
    res.json(data);
  } catch (err) {
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
