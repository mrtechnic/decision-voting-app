import mongoose from 'mongoose';

const decisionRoomSchema = new mongoose.Schema({
  title: String,
  description: String,
  options: [
    {
      id: String,
      text: String,
      votes: { type: Number, default: 0 },
    },
  ],
  creator: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  deadline: Date,
  roomId: { type: String, required: true, unique: true },
  voters: [String],
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model('DecisionRoom', decisionRoomSchema);
