import app from './app';
import mongoose from 'mongoose';
import dotenv from 'dotenv';


dotenv.config();


const PORT = process.env.PORT || 5000;


// MongoDB connection
mongoose.connect(process.env.MONGO_URI)

  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.error("❌ MongoDB error:", err));

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
