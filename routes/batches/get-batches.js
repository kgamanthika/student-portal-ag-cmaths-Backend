// backend/routes/batches/get-batches.js
const express = require("express");
const router = express.Router();
const Batches = require("../../models/Batches");
const verifyToken = require("../../middleware/auth");

// GET /batches
router.get("/", verifyToken, async (req, res) => {
  try {
    const data = await Batches.find().sort({ createdAt: -1 });


    res.json({ success: true,   batches: data });
  } catch (err) {
    res.status(500).json({ success: false });
  }
});


module.exports = router;
