const express = require("express");
const router = express.Router();
const Class = require("../../models/Class");
const verifyToken = require("../../middleware/auth");


router.delete("/:id", verifyToken, async (req, res) => {
  try {
    const classId = req.params.id;
    const deletedClass = await Class.findByIdAndDelete(classId);

    if (!deletedClass)
      return res.status(404).json({ success: false, error: "Class not found" });

    res.json({ success: true, message: "Class deleted successfully" });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});


module.exports = router;
