const mongoose = require("mongoose");

const examSchema = new mongoose.Schema({

  
  examName: {
    type: String,
    required: true,
  },

  access: {
    type: [String],
    required: true,
  },

  startTime: {
    type: Date,
    required: true,
  },

  durationMin: {
    type: Number,
    required: true,
  },

  fileUrl: {
    type: String,
    default: "",
  },

  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Exam", examSchema);
