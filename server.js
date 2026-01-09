const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");

dotenv.config(); // load .env

const app = express();
app.use(cors());
app.use(express.json());

// Connect MongoDB
require('dotenv').config();

mongoose.connect(process.env.MONGO_URI)
.then(() => console.log("MongoDB Connected"))
.catch((err) => console.error("MongoDB connection error:", err));

// mongoose.connect("mongodb://127.0.0.1:27017/studentPortal")
//   .then(() => console.log("MongoDB Connected"))
//   .catch((err) => console.log(err));

// Routes
app.get("/", (req, res) => {
  res.send("Backend running...");
});

const authRoutes = require("./routes/authRoutes");
app.use("/auth", authRoutes);

const adminRoutes = require("./routes/adminRoutes");
app.use("/admin", adminRoutes);

const marksRoutes = require("./routes/marksRoutes");
app.use("/marks", marksRoutes);

const sysOwnerRouter = require("./routes/systemOwner");
app.use("/sysOwner", sysOwnerRouter);

const examRoutes = require("./routes/exams/create-exam");
app.use("/create-exam", examRoutes);

const deleteSelectedExamRoutes = require("./routes/exams/delete-selected-exam");
app.use("/delete-selected-exam", deleteSelectedExamRoutes);

const getAllExamsRoutes = require("./routes/exams/get-all-exams");
app.use("/get-all-exams", getAllExamsRoutes);

app.use("/uploads", express.static("uploads"));

const classRoutes = require("./routes/classes/create-class");
app.use("/create-class", classRoutes);

const deleteClassRoutes = require("./routes/classes/delete-class");
app.use("/delete-class", deleteClassRoutes);

const updateClassRoutes = require("./routes/classes/update-class");
app.use("/update-class", updateClassRoutes);

const classDetailsRoutes = require("./routes/classes/class-details");
app.use("/class-details", classDetailsRoutes);

const createLessonRoutes = require("./routes/lessons/create-lesson");
app.use("/create-lesson", createLessonRoutes);

const getLessonsRoutes = require("./routes/lessons/get-lessons");
app.use("/get-lessons", getLessonsRoutes);

const addRecordingRoutes = require("./routes/recordings/add-recording");
app.use("/lessons", addRecordingRoutes);

const deleteRecordingRoutes = require("./routes/recordings/delete-recording");
app.use("/delete-recording", deleteRecordingRoutes);

const getStudentClassesRoutes = require("./routes/students/get-student-classes");
app.use("/get-student-classes", getStudentClassesRoutes);

const getAllClassesRoutes = require("./routes/classes/get-all-classes");
app.use("/get-all-classes", getAllClassesRoutes);

const deleteLessonRoutes = require("./routes/lessons/delete-lesson");
app.use("/delete-lesson", deleteLessonRoutes);

const updateLessonRoutes = require("./routes/lessons/update-lesson");
app.use("/update-lesson", updateLessonRoutes);

const addAssignmentRoutes = require("./routes/assignments/add-assignment");
app.use("/add-assignment", addAssignmentRoutes);

const deleteAssignmentRoutes = require("./routes/assignments/delete-assignment");
app.use("/delete-assignment", deleteAssignmentRoutes);

const getStudentExamsRoutes = require("./routes/students/get-student-exams");
app.use("/get-student-exams", getStudentExamsRoutes);

const submitExamPaperRoutes = require("./routes/students/submit-exam-paper");
app.use("/submit-exam-paper", submitExamPaperRoutes);

const getSubmittedExamsRoutes = require("./routes/exams/get-submitted-exams");
app.use("/get-submitted-exams", getSubmittedExamsRoutes);

const deleteAllClassesRecordsAndEverythingRoutes = require("./routes/delete-all-classes-records-and-everything");
app.use("/delete-all-classes-records-and-everything", deleteAllClassesRecordsAndEverythingRoutes);


//to auto run back
// Keep-alive endpoint for Render or UptimeRobot
app.get("/ping", (req, res) => {
  console.log("Ping received at", new Date().toISOString());
  res.send("pong");
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
