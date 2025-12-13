const mongoose = require("mongoose");

const assignmentSchema = new mongoose.Schema({
  assignment_title: {
    type: String,
    required: true,
  },

  assignment_Url: {
    type: String,
    required: true,
  },

  assignment_description: {
    type: String,
    default: "",
  },

  lessons_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Lessons",
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Assignment", assignmentSchema);
