import express from 'express';
import {
  createRoom,
  getRoomById,
  voteInRoom,
  getUserRooms,
  getResults,
} from '../controllers/roomController';
import { authenticateToken } from '../middlewares/authMiddleware';

const router = express.Router();

router.post('/', authenticateToken, createRoom);
router.get('/my-rooms', authenticateToken, getUserRooms);
router.get('/:roomId', getRoomById);
router.post('/:roomId/vote', voteInRoom);
router.get('/:roomId/results', authenticateToken, getResults);

export default router;
