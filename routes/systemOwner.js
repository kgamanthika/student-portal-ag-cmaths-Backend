const express = require("express");
const Marks = require("../models/Marks");
const User = require("../models/User");
const bcrypt = require("bcryptjs");
const verifyToken = require("../middleware/auth");


const router = express.Router();

// get all exams
router.get("/",verifyToken, async (req, res) => {
  if (!["admin", "system-owner","student"].includes(req.user.role)) {
    return res.status(403).json({ success: false, message: "Forbidden" });
  }
  try {
    const data = await Marks.find();
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch exams" });
  }
});
//delete all students
router.delete("/delete-all-students", verifyToken, async (req, res) => {
  if (!["system-owner"].includes(req.user.role)) {
    return res.status(403).json({ success: false, message: "Forbidden" });
  }
  try {
    await User.deleteMany({ role: "student" });
    await Marks.deleteMany();
    res.json({ success: true, message: "All students deleted successfully" });
  } catch (err) {
  
    res.status(500).json({ success: false, message: "Failed to delete all students" });
  }
});
// delete selected exam
router.delete("/:id",verifyToken, async (req, res) => {

  if (!["system-owner"].includes(req.user.role)) {
    return res.status(403).json({ success: false, message: "Forbidden" });
  }
  try {
    if (req.params.id == "all") {
      //delete all exams
      const deletedExams = await Marks.deleteMany({});
      return res.json({success: true, message: "All exams deleted successfully" });
    }

    const findExam = await Marks.findById(req.params.id);
    Exam = findExam.term;
    subject = findExam.subject;

    //delete all marks related to the exam and subject
    const deletedExam = await Marks.deleteMany({
      term: Exam,
      subject: subject,
    });

    if (!deletedExam) {
      return res.status(404).json({ success: false, message: "Exam not found" });
    }
    res.json({success: true, message: "Exam deleted successfully" });
  } catch (err) {
    res.status(500).json({ success: false, message: "Failed to delete exam" });
  }
});

//create system admin
router.post("/create-system-admin",verifyToken, async (req, res) => {
  if (!["system-owner"].includes(req.user.role)) {
    return res.status(403).json({ success: false, message: "Forbidden" });
  }
  try {
    const {name, email, password, role } = req.body;

    // Check if the user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false,message: "User already exists" });
    }
    
    const hashed = await bcrypt.hash(password, 10);
    // Create a new system admin user
    const newAdmin = new User({
      name,
      email,
      password: hashed,
      role,
    });

    await newAdmin.save();
    res.json({ success: true,message: "System Admin created successfully" });
  } catch (err) {
  
    res.status(500).json({ success: false,message: "Failed to create System Admin" });
  }
});


//delete system admin
router.delete("/delete-system-admin/:id",verifyToken, async (req, res) => {
  if (!["system-owner"].includes(req.user.role)) {
    return res.status(403).json({ success: false, message: "Forbidden" });
  }
  try {
    const deletedAdmin = await User.findByIdAndDelete(req.params.id);
    if (!deletedAdmin) {
      return res.status(404).json({ success: false, message: "System Admin not found" });
    }
    res.json({ success: true, message: "System Admin deleted successfully" });
  } catch (err) {
    res.status(500).json({ success: false, message: "Failed to delete System Admin" });
  }
});

//get all system admins
router.get("/get-all-system-admins",verifyToken, async (req, res) => {
  if (!["system-owner"].includes(req.user.role)) {
    return res.status(403).json({ success: false, message: "Forbidden" });
  }
  try {
   const admins = await User.find({ role: { $in: ["admin", "system-owner"] } });

    
    res.json(admins);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch system admins" });
  }
});

module.exports = router;
