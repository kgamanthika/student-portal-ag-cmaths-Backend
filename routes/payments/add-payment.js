const express = require("express");
const router = express.Router();
const Payment = require("../../models/Payment");

router.post("/", async (req, res) => {
  try {
    const payments = req.body; // array of payments

    const results = [];

    for (const p of payments) {
      const { studentId, st_id, month, paid } = p;

      // 🔹 Upsert: update if exists, create if not
      const updatedPayment = await Payment.findOneAndUpdate(
        { studentId, month },        // search filter
        { st_id, paid },             // fields to update
        { new: true, upsert: true }  // create if not exists, return updated doc
      );

      results.push(updatedPayment);
    }

    res.json({
      success: true,
      message: "Payments updated successfully",
      payments: results,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: "Server error while saving payments",
    });
  }
});

module.exports = router;