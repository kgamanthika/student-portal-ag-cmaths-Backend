const express = require("express");
const router = express.Router();
const Class = require("../../models/Class");
const verifyToken = require("../../middleware/auth");

router.put("/:id", verifyToken, async (req, res) => {
  try {
    const classId = req.params.id;
    const { name, access } = req.body;

    if (!name || !access || !access.length)
      return res.status(400).json({ success: false, error: "Invalid data" });

    const updatedClass = await Class.findByIdAndUpdate(
      classId,
      { name, access },
      { new: true }
    );

    if (!updatedClass)
      return res.status(404).json({ success: false, error: "Class not found" });

    res.json({ success: true, class: updatedClass });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});


module.exports = router;
