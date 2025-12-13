const express = require("express");
const router = express.Router();
const Class = require("../../models/Class");
const verifyToken = require("../../middleware/auth");


router.post("/", verifyToken, async (req, res) => {
  try {
    const { name, access } = req.body;
    if (!name || !access || !access.length)
      return res.status(400).json({ success: false, error: "Invalid data" });

    const newClass = new Class({ name, access });
    await newClass.save();

    res.json({ success: true, class: newClass });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});


module.exports = router;
