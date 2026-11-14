
const express = require("express");
const router = express.Router();
const multer = require("multer");
const cloudinary = require("cloudinary").v2;

const HomeworkSubmission = require("../../models/HomeworkSubmissions");
const verifyToken = require("../../middleware/auth");

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 50 * 1024 * 1024 },
});

const getResourceType = (mimetype) => {
  if (mimetype?.startsWith("image/")) return "image";
  if (mimetype?.startsWith("video/")) return "video";
  return "raw";
};

const getExtension = (filename) => {
  const match = filename.match(/\.[a-z0-9]+$/i);
  return match ? match[0].toLowerCase() : "";
};

const sanitizeBaseName = (filename) =>
  filename
    .replace(/\.[^.]+$/, "")
    .replace(/[^\w\-.]+/g, "_")
    .replace(/_+/g, "_")
    .slice(0, 60) || "file";

const uploadBuffer = (file) => {
  const resourceType = getResourceType(file.mimetype);
  const ext = getExtension(file.originalname);
  const base = sanitizeBaseName(file.originalname);

  const unique = `${Date.now()}_${Math.random()
    .toString(36)
    .slice(2, 8)}`;

  // Raw files must retain their file extension in public_id.
  const publicId =
    resourceType === "raw"
      ? `${unique}_${base}${ext}`
      : `${unique}_${base}`;

  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: "HomeworkSubmissions",
        resource_type: resourceType,
        public_id: publicId,
        overwrite: false,
        invalidate: true,
      },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      }
    );

    stream.end(file.buffer);
  });
};

router.post("/", verifyToken, upload.single("file"), async (req, res) => {
  try {
    const { homework_id, lessons_id, student_note } = req.body;

    if (!homework_id || !lessons_id) {
      return res.status(400).json({
        success: false,
        message: "homework_id and lessons_id are required",
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "One file is required",
      });
    }

    const student_id =
      req.user?.id || req.user?._id || req.userId;

    if (!student_id) {
      return res.status(401).json({
        success: false,
        message: "Student identity missing",
      });
    }

    const existing = await HomeworkSubmission.findOne({
      homework_id,
      student_id,
    });

    if (existing) {
      return res.status(409).json({
        success: false,
        message: "You have already submitted this homework",
      });
    }

    let result;

    try {
      result = await uploadBuffer(req.file);
    } catch (error) {
      console.error("Cloudinary upload error:", error);

      return res.status(500).json({
        success: false,
        message: "File upload failed",
        error: error.message,
      });
    }

    // Store complete file information.
    const fileData = {
      url: result.secure_url,
      originalName: req.file.originalname,
      mimeType: req.file.mimetype,
      size: req.file.size,
      publicId: result.public_id,
      resourceType: result.resource_type,
      format: result.format || getExtension(req.file.originalname).replace(".", ""),
    };

    const submission = await HomeworkSubmission.create({
      homework_id,
      lessons_id,
      student_id,
      student_note: student_note || "",
      files: [fileData],
    });

    return res.status(201).json({
      success: true,
      message: "Homework submitted successfully",
      submission,
    });

  } catch (error) {
    console.error("Homework submission error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
});

module.exports = router;
