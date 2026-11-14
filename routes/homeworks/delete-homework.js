const express = require("express");
const router = express.Router();
const Homeworks = require("../../models/Homeworks");
const verifyToken = require("../../middleware/auth");
const cloudinary = require("cloudinary").v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Helper: extract public_id from a Cloudinary URL
// e.g. https://res.cloudinary.com/demo/raw/upload/v123/Homeworks/abc.pdf
//   → "Homeworks/abc.pdf"
const getPublicIdFromUrl = (url) => {
  if (!url) return null;
  try {
    const parts = url.split("/upload/");
    if (parts.length < 2) return null;
    // remove version prefix like v12345/
    return parts[1].replace(/^v\d+\//, "");
  } catch {
    return null;
  }
};

router.delete("/:homeworkId", verifyToken, async (req, res) => {
  try {
    const { homeworkId } = req.params;

    const homework = await Homeworks.findById(homeworkId);
    if (!homework) {
      return res
        .status(404)
        .json({ success: false, message: "Homework not found" });
    }

    // Delete all uploaded files from Cloudinary
    const urlsToDelete = [
      homework.homework_Url,
      ...(homework.attachments || []),
    ].filter(Boolean);

    const uniqueUrls = [...new Set(urlsToDelete)];

    await Promise.all(
      uniqueUrls.map(async (url) => {
        const publicId = getPublicIdFromUrl(url);
        if (!publicId) return;
        try {
          await cloudinary.uploader.destroy(publicId, {
            resource_type: "raw",
          });
        } catch (err) {
          console.warn("Cloudinary delete failed for", publicId, err.message);
        }
      })
    );

    await Homeworks.findByIdAndDelete(homeworkId);

    res.json({ success: true, message: "Homework deleted successfully" });
  } catch (err) {
    console.error("Error deleting homework:", err);
    res.status(500).json({
      success: false,
      message: "Server error while deleting homework",
    });
  }
});

module.exports = router;