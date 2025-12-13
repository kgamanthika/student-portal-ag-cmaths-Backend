const mongoose = require("mongoose");

const lessonSchema = new mongoose.Schema({
  LessonName: {
    type: String,
    required: true,
  },

  description: {
    type: String,
    default: "",
  },
  class_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Class", // assuming you have a Class model
    required: true,
  },
  date: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Lesson", lessonSchema);
