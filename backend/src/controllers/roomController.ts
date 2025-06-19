import { Request, Response } from 'express';
import DecisionRoom from '../models/DecisionRoom';
import { generateRoomId, getVoterIdentifier } from '../utils/helpers';

export const createRoom = async (req: any, res: Response): Promise<void> => {
  try {
    const { title, description, options, deadline } = req.body;

    if (!title || !description || !options || !deadline) {
      res.status(400).json({ error: 'All fields are required' });
      return 
    }

    if (options.length < 2 || options.length > 5) {
       res.status(400).json({ error: 'Must have 2–5 options' });
       return 
    }

    if (new Date(deadline) <= new Date()) {
      res.status(400).json({ error: 'Deadline must be in the future' });
      return 
    }

    const roomId = generateRoomId();
    const formattedOptions = options.map((option: string, index: number) => ({
      id: `option_${index + 1}`,
      text: option.trim(),
      votes: 0
    }));

    const room = new DecisionRoom({
      title: title.trim(),
      description: description.trim(),
      options: formattedOptions,
      creator: req.user._id,
      deadline: new Date(deadline),
      roomId,
      voters: []
    });

    await room.save();

    res.status(201).json({
      message: 'Decision room created successfully',
      room: {
        id: room._id,
        title: room.title,
        description: room.description,
        options: room.options,
        deadline: room.deadline,
        roomId: room.roomId,
        createdAt: room.createdAt
      }
    });
  } catch (error) {
    console.error('Room creation error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const getRoomById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { roomId } = req.params;
    const room = await DecisionRoom.findOne({ roomId }).populate('creator', 'username');

    if (!room) {
      res.status(404).json({ error: 'Room not found' });
      return
    }

    const voterIdentifier = getVoterIdentifier(req);
    const hasVoted = room.voters.includes(voterIdentifier);
    const isExpired = room.deadline ? new Date() > room.deadline : false;

    res.json({
      room: {
        id: room._id,
        title: room.title,
        description: room.description,
        options: room.options,
        deadline: room.deadline,
        roomId: room.roomId,
        creator: room.creator,
        isExpired,
        hasVoted,
        totalVotes: room.options.reduce((sum, option) => sum + option.votes, 0),
        createdAt: room.createdAt
      }
    });
  } catch (error) {
    console.error('Get room error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const voteInRoom = async (req: Request, res: Response): Promise<void> => {
  try {
    const { roomId } = req.params;
    const { optionId } = req.body;

    if (!optionId) {
      res.status(400).json({ error: 'Option ID is required' });
      return
    }

    const room = await DecisionRoom.findOne({ roomId });
    if (!room) {
      res.status(404).json({ error: 'Room not found' });
      return
    }

    if (!room.deadline || new Date() > room.deadline) {
      res.status(400).json({ error: 'Voting has ended' });
      return
    }

    const voterIdentifier = getVoterIdentifier(req);
    if (room.voters.includes(voterIdentifier)) {
      res.status(400).json({ error: 'You have already voted in this room' });
      return
    }

    const optionIndex = room.options.findIndex(option => option.id === optionId);
    if (optionIndex === -1) {
      res.status(400).json({ error: 'Invalid option' });
      return
    }

    room.options[optionIndex].votes += 1;
    room.voters.push(voterIdentifier);

    await room.save();

    res.json({
      message: 'Vote cast successfully',
      totalVotes: room.options.reduce((sum, option) => sum + option.votes, 0)
    });
  } catch (error) {
    console.error('Vote error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const getUserRooms = async (req: any, res: Response) => {
  try {
    const rooms = await DecisionRoom.find({ creator: req.user._id }).sort({ createdAt: -1 });

    const roomsWithStats = rooms.map(room => ({
      id: room._id,
      title: room.title,
      description: room.description,
      options: room.options,
      deadline: room.deadline,
      roomId: room.roomId,
      isExpired: room.deadline ? new Date() > room.deadline : false,
      totalVotes: room.options.reduce((sum, option) => sum + option.votes, 0),
      createdAt: room.createdAt
    }));

    res.json({ rooms: roomsWithStats });
  } catch (error) {
    console.error('Get user rooms error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const getResults = async (req: any, res: Response): Promise<void> => {
  try {
    const { roomId } = req.params;
    const room = await DecisionRoom.findOne({ roomId });

    if (!room) {
      res.status(404).json({ error: 'Room not found' });
      return 
    }

    if (room.creator.toString() !== req.user._id.toString()) {
      res.status(403).json({ error: 'Only room creator can view results' });
      return 
    }

    const totalVotes = room.options.reduce((sum, option) => sum + option.votes, 0);
    const resultsWithPercentages = room.options.map(option => ({
      ...option.toObject(),
      percentage: totalVotes > 0 ? Math.round((option.votes / totalVotes) * 100) : 0
    }));

    res.json({
      results: {
        options: resultsWithPercentages,
        totalVotes,
        isExpired: room.deadline ? new Date() > room.deadline : false,
        deadline: room.deadline
      }
    });
  } catch (error) {
    console.error('Get results error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};
