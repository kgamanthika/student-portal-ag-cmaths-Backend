const mongoose = require("mongoose");

const recordingSchema = new mongoose.Schema({

    lessons_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Lessons",
        required: true,
    },

    recording_title: {
        type: String,
        required: true,
    },

    recording_Url: {
        type: String,
        required: true,
    },

    recording_description: {
        type: String,
        default: "",
    },
    recording_watermark: {
        type: String,
        default: "",
    },

    createdAt: {
    type: Date,
    default: Date.now,
  },
    
  
});

module.exports = mongoose.model("Recordings", recordingSchema);