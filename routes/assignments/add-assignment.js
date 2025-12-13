const express = require("express");
const router = express.Router();
const Assignments = require("../../models/Assignments");
const multer = require("multer");
const verifyToken = require("../../middleware/auth");
const fs = require("fs");
const path = require("path");

// ------------------------------
// Folder: uploads/assignments
// ------------------------------
const assignmentUploadFolder = "uploads/assignments";

if (!fs.existsSync(assignmentUploadFolder)) {
  fs.mkdirSync(assignmentUploadFolder, { recursive: true });
}

// ------------------------------
// Multer storage configuration
// ------------------------------
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, assignmentUploadFolder);
  },
  filename: function (req, file, cb) {
    const uniqueName =
      Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueName + path.extname(file.originalname));
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB
});

// ------------------------------
// POST /api/assignments
// ------------------------------
router.post(
  "/",
  verifyToken,
  upload.single("file"),
  async (req, res) => {
    try {
      const {
        assignment_title,
        assignment_description,
        lessons_id,
      } = req.body;

      if (!assignment_title || !lessons_id) {
        return res.status(400).json({
          success: false,
          message: "assignment_title and lessons_id are required",
        });
      }

      const newAssignment = new Assignments({
        assignment_title,
        assignment_description,
        lessons_id,
        assignment_Url: req.file
          ? `/uploads/assignments/${req.file.filename}`
          : "",
      });

      await newAssignment.save();

      res.status(201).json({
        success: true,
        message: "Assignments uploaded successfully",
        assignment: newAssignment,
      });
    } catch (err) {
      console.error("Add Assignments Error:", err);
      res.status(500).json({
        success: false,
        error: err.message,
      });
    }
  }
);

module.exports = router;
