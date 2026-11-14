
const mongoose = require("mongoose");

const homeworkSubmissionSchema = new mongoose.Schema({
  homework_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Homework",
    required: true,
  },

  lessons_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Lesson",
    required: true,
  },

  student_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Student",
    required: true,
  },

  // Mixed supports both old string URLs and new file objects.
  files: {
    type: [mongoose.Schema.Types.Mixed],
    default: [],
  },

  student_note: {
    type: String,
    default: "",
  },

  submittedAt: {
    type: Date,
    default: Date.now,
  },
});

homeworkSubmissionSchema.index(
  { homework_id: 1, student_id: 1 },
  { unique: true }
);

module.exports = mongoose.model(
  "HomeworkSubmission",
  homeworkSubmissionSchema
);
