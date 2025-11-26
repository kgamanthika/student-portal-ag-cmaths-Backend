const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: String,
  email: {
    type: String,
    unique: true,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: ["admin", "student"],
    default: "student",
  },
  studentId: String, // only for students
  mode: {
    type: String,
    enum: ["Online", "Physical"],
    required: false,
  },
});

module.exports = mongoose.model("User", userSchema);
