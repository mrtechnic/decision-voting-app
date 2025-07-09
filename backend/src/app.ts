import "dotenv/config" 
import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import authRoutes from './routes/authRoutes';
import roomRoutes from './routes/roomRoutes';
import voteRoutes from './routes/voteRoutes'
import mongoose from 'mongoose';



const app = express();




const PORT = process.env.PORT || 3000;


// MongoDB connection
const mongoUri = process.env.MONGO_URI;
if (!mongoUri) {
  throw new Error("MONGO_URI environment variable is not defined");
}

mongoose.connect(mongoUri)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB error:", err));


app.use(cors({origin: "*"}));
app.use(morgan('common'));
app.use(express.json());
app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 100 }));


app.use('/api/auth', authRoutes);
app.use('/api/rooms', roomRoutes);
app.use('/api/votes', voteRoutes);

// Health check
app.get('/api/health', (_, res) => {
  res.json({ status: 'OK' });
});

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});



// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});

