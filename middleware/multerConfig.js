const multer = require("multer");
const cloudinary = require("cloudinary").v2;

// Cloudinary config
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Use memory storage (not disk)
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Reusable uploader
const uploadToCloudinary = (folderName) => async (req, res, next) => {
  if (!req.file) return res.status(400).json({ message: "No file uploaded" });

  try {
    const stream = cloudinary.uploader.upload_stream(
      { folder: folderName, resource_type: "auto" },
      (error, result) => {
        if (error) return res.status(500).json(error);

        // save url in request for next controller
        req.fileUrl = result.secure_url;
        next();
      }
    );

    stream.end(req.file.buffer);
  } catch (err) {
    res.status(500).json(err);
  }
};

// Export uploaders (same names as yours)
exports.uploadExam = [
  upload.single("file"),
  uploadToCloudinary("Exams"),
];

exports.uploadLessonRecording = [
  upload.single("file"),
  uploadToCloudinary("LessonRecordings"),
];

exports.uploadAssignment = [
  upload.single("file"),
  uploadToCloudinary("Assignments"),
];

exports.uploadImage = [
  upload.single("file"),
  uploadToCloudinary("Images"),
];
