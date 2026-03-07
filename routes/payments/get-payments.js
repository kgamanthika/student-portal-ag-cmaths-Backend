const express = require("express");
const router = express.Router();
const Payment = require("../../models/Payment");

// GET all payments
router.get("/", async (req, res) => {
  try {

    const payments = await Payment.find()
      .populate("studentId", "name studentId")
      .lean();

    res.json({
      success: true,
      payments,
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: "Server error while fetching payments",
    });
  }
});

module.exports = router;