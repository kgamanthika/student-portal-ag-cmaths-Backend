const express = require("express");
const router = express.Router();
const Class = require("../../models/Class");
const verifyToken = require("../../middleware/auth");



router.get("/:id", verifyToken, async (req, res) => {
  try {
    const classId = req.params.id;
    const classData = await Class.findById(classId);

    if (!classData)
      return res.status(404).json({ success: false, error: "Class not found" });

    res.json({ success: true, class: classData });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});



module.exports = router;
