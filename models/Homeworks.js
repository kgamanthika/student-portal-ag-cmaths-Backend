const mongoose = require("mongoose");

const homeworkSchema = new mongoose.Schema({
  homework_title: {
    type: String,
    required: true,
  },

  homework_Url: {
    type: String,
    // required: true,
  },

  homework_description: {
    type: String,
    default: "",
  },

  homework_instructions: {
    type: String,
    default: "",
  },

  homework_dueDate: {
    type: Date,
    default: null,
  },

  // Array of Cloudinary URLs (multiple files)
  attachments: {
    type: [String],
    default: [],
  },

  lessons_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Lesson",
    required: true,
  },

  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Homework", homeworkSchema);