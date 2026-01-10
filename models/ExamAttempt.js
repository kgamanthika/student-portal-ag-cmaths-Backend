const mongoose = require("mongoose");

const examAttemptSchema = new mongoose.Schema({
  examId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Exam",
    required: true,
  },
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },

  studentStartTime: {
    type: Date,
    required: true,
  },

  studentEndTime: {
    type: Date,
    required: true,
  },

  isTimeUp: {
    type: Boolean,
    default: false,
  },
});

module.exports = mongoose.model("ExamAttempt", examAttemptSchema);
