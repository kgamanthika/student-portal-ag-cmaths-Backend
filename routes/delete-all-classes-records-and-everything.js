const express = require("express");
const router = express.Router();
const fs = require("fs");
const path = require("path");
const verifyToken = require("../middleware/auth"); // only one ".."

const Recordings = require("../models/Recordings");
const Class = require("../models/Class");
const Lesson = require("../models/Lessons");
const Exam = require("../models/Exam");
const Assignments = require("../models/Assignments");
const Marks = require("../models/Marks");
const SubmitExam = require("../models/SubmitExam");

// Helper: Delete all files in a folder recursively
// Helper: Clear all files inside a folder and its subfolders, but keep folders
const clearFolderFiles = (folderPath) => {
  if (!fs.existsSync(folderPath)) {
    console.log("Folder does not exist:", folderPath);
    return;
  }

  fs.readdirSync(folderPath).forEach((item) => {
    const curPath = path.join(folderPath, item);
    const stat = fs.lstatSync(curPath);

    if (stat.isDirectory()) {
      // Recurse into subfolder
      clearFolderFiles(curPath);
      // Do NOT remove the subfolder itself
    } else {
      fs.unlinkSync(curPath);
      console.log("Deleted file:", curPath);
    }
  });
};




// DELETE all classes records and everything
router.delete("/",verifyToken, async (req, res) => {
  try {
    // 1️⃣ Delete associated recordings files
    const recordings = await Recordings.find();
    recordings.forEach((recording) => {
      const filePath = path.join(__dirname, "..", "..", recording.recording_Url);
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    });

    // 2️⃣ Delete all uploaded exam/assignment files
const uploadsDir = path.join(__dirname, "..", "uploads");
console.log("Uploads dir:", uploadsDir);

clearFolderFiles(uploadsDir);


    // 3️⃣ Delete all DB collections
    await Recordings.deleteMany();
    await Lesson.deleteMany();
    await Class.deleteMany();
    await Exam.deleteMany();
    await Assignments.deleteMany();
    await Marks.deleteMany();
    await SubmitExam.deleteMany();

    // 4️⃣ Recreate uploads folder (empty)
    if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir);

    res.json({ success: true, message: "All data and uploads cleared successfully" });
  } catch (err) {
    console.error("Error deleting all data:", err);
    res.status(500).json({ success: false, message: "Server error while deleting data" });
  }
});

module.exports = router;
