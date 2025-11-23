const mongoose = require("mongoose");

const marksSchema = new mongoose.Schema({
  studentId: String,
  subject: String,
  marks: Number,
  term: String
});

module.exports = mongoose.model("Marks", marksSchema);
