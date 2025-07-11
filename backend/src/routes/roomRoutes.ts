import express from 'express';
import {
  createRoom,
  getRoomById,
  voteInRoom,
  getUserRooms,
  getResults,
  getLiveTallies,
} from '../controllers/roomController';
import { authenticateToken } from '../middlewares/authMiddleware';

const router = express.Router();

// Only authenticated users can create or view their own rooms
router.post('/', authenticateToken, createRoom);
router.get('/my-rooms', authenticateToken, getUserRooms);

// Public access to room and voting
router.get('/:roomId', getRoomById);          // ✅ public
router.post('/:roomId/vote', voteInRoom);     // ✅ public

// Only authenticated users (specifically the creator) can see results/tallies
router.get('/:roomId/results', authenticateToken, getResults);
router.get('/:roomId/tallies', authenticateToken, getLiveTallies);

export default router;
