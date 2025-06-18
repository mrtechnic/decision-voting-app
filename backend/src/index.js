const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");

dotenv.config();



const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(express.json());

// Routes (test route)
app.get("/", (req, res) => {
  res.send("🎉 API is running...");
});

// MongoDB connection
mongoose.connect(process.env.MONGO_URI)

  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.error("❌ MongoDB error:", err));

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
