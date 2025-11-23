const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

// Connect MongoDB
mongoose.connect("mongodb://127.0.0.1:27017/studentPortal")
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.log(err));

// Routes
app.get("/", (req, res) => {
  res.send("Backend running...");
});

app.listen(5000, () => console.log("Server running on port 5000"));

const authRoutes = require("./routes/authRoutes");
app.use("/auth", authRoutes);

const adminRoutes = require("./routes/adminRoutes");
app.use("/admin", adminRoutes);

const marksRoutes = require("./routes/marksRoutes");
app.use("/marks", marksRoutes);
