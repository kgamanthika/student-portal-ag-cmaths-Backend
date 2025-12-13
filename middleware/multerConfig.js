const multer = require("multer");
const path = require("path");

// Reusable storage generator
const createStorage = (folderName) =>
  multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, `uploads/${folderName}`);
    },
    filename: (req, file, cb) => {
      const unique = Date.now() + "-" + Math.round(Math.random() * 1e9);
      cb(null, unique + path.extname(file.originalname));
    },
  });

// Separate uploaders for different types
exports.uploadExam = multer({ storage: createStorage("Exams") });
// folder for lesson recordings
exports.uploadLessonRecording = multer({
  storage: createStorage("LessonRecordings"),
});
// folder for assignment
exports.uploadAssignment = multer({ storage: createStorage("Assignments") });
// folder for images
exports.uploadImage = multer({ storage: createStorage("Images") });
