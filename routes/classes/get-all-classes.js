// backend/routes/classes/get-all-classes.js
const express = require("express");
const router = express.Router();
const Class = require("../../models/Class");
const verifyToken = require("../../middleware/auth");

// GET /classes
router.get("/", verifyToken, async (req, res) => {
  try {
    const data = await Class.find().sort({ createdAt: -1 });


    res.json({ success: true,   classes: data });
  } catch (err) {
    res.status(500).json({ success: false });
  }
});


module.exports = router;
