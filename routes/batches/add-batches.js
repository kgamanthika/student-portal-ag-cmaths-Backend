const express = require("express");
const router = express.Router();
const Batches = require("../../models/Batches");
const verifyToken = require("../../middleware/auth");

router.post("/", verifyToken, async (req, res) => {
  try {
    const { name } = req.body;
    if (!name)
      return res.status(400).json({ success: false, error: "Invalid data" });

    const existingBatch = await Batches.findOne({ name });

    if (existingBatch) {
      return res.status(400).json({
        success: false,
        error: "Batch already exists",
      });
    }

    const newBatch = new Batches({ name });
    await newBatch.save();

    res.json({ success: true, batch: newBatch });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
