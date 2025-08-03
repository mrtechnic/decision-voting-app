import { Response } from 'express';
import DecisionRoom from '../models/DecisionRoom';
import { generateRoomId } from '../utils/helpers';
import { AuthRequest } from '../middlewares/authMiddleware';

export const createRoom = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { title, description, options, deadline } = req.body;

    if (!title || !description || !options || !deadline) {
      res.status(400).json({ error: 'All fields are required' });
      return;
    }

    if (options.length < 2 || options.length > 5) {
      res.status(400).json({ error: 'Must have 2–5 options' });
      return;
    }

    if (new Date(deadline) <= new Date()) {
      res.status(400).json({ error: 'Deadline must be in the future' });
      return;
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

export const getRoomById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { roomId } = req.params;
    const room = await DecisionRoom.findOne({ roomId }).populate('creator', 'name');

    if (!room) {
      res.status(404).json({ error: 'Room not found' });
      return;
    }

    const isExpired = room.deadline ? new Date() > room.deadline : false;
    
    console.log('Room options from database:', room.options);
    console.log('Total votes calculated:', room.options.reduce((sum, option) => sum + option.votes, 0));

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
        hasVoted: false, // Will be implemented with your new voter identification method
        totalVotes: room.options.reduce((sum, option) => sum + option.votes, 0),
        voters: room.voters,
        createdAt: room.createdAt
      }
    });
  } catch (error) {
    console.error('Get room error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const voteInRoom = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { roomId } = req.params;
    const { optionId } = req.body;

    if (!optionId) {
      res.status(400).json({ error: 'Option ID is required' });
      return;
    }

    const room = await DecisionRoom.findOne({ roomId });
    if (!room) {
      res.status(404).json({ error: 'Room not found' });
      return;
    }

    if (!room.deadline || new Date() > room.deadline) {
      res.status(400).json({ error: 'Voting has ended' });
      return;
    }

    // TODO: Implement your new voter identification method here
    // For now, allowing multiple votes (temporary)
    // const voterIdentifier = yourNewVoterIdentificationMethod(req);
    // if (room.voters.includes(voterIdentifier)) {
    //   res.status(400).json({ error: 'You have already voted in this room' });
    //   return;
    // }

    const optionIndex = room.options.findIndex((option) => option.id === optionId);
    if (optionIndex === -1) {
      res.status(400).json({ error: 'Invalid option' });
      return;
    }

    console.log('Before vote - Option votes:', room.options[optionIndex].votes);
    room.options[optionIndex].votes += 1;
    console.log('After vote - Option votes:', room.options[optionIndex].votes);
    // room.voters.push(voterIdentifier); // Will be implemented with your new method

    await room.save();
    console.log('Room saved successfully');

    // Emit real-time update to all clients in the room
    const io = req.app.get('io');
    if (io) {
      const tallies = room.options.map((option) => option.votes || 0);
      const totalVotes = room.options.reduce((sum, option) => sum + option.votes, 0);
      
      io.to(roomId).emit('vote-updated', {
        roomId,
        tallies,
        totalVotes,
        optionId,
        voterCount: room.voters.length,
        uniqueVoters: room.voters.length
      });
    }

    res.json({
      message: 'Vote cast successfully',
      totalVotes: room.options.reduce((sum, option) => sum + option.votes, 0),
      uniqueVoters: room.voters.length
    });
  } catch (error) {
    console.error('Vote error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const getUserRooms = async (req: AuthRequest, res: Response): Promise<void> => {
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

export const getResults = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { roomId } = req.params;
    const room = await DecisionRoom.findOne({ roomId });

    if (!room) {
      res.status(404).json({ error: 'Room not found' });
      return;
    }

    if (room.creator.toString() !== req.user._id.toString()) {
      res.status(403).json({ error: 'Only room creator can view results' });
      return;
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

export const getLiveTallies = async (req: AuthRequest, res: Response): Promise<void> => {
  const { roomId } = req.params;

  try {
    const room = await DecisionRoom.findOne({ roomId }).populate('creator', 'email');

    if (!room) {
      res.status(404).json({ message: "Room not found" });
      return 
    }

    const isExpired = room.deadline ? new Date() > room.deadline : false;

    // Only allow creator to see live tallies before deadline
    if (!isExpired && (room.creator as any).email !== req.user.email) {
      res.status(403).json({ message: "Only creator can view live tallies" });
      return 
    }

    const tallies = room.options.map((option) => option.votes || 0);
    res.json({ tallies });
    return 
  } catch (err) {
    console.error("Error fetching tallies:", err);
    res.status(500).json({ message: "Server error" });
    return 
  }
};

export const deleteRoom = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { roomId } = req.params;
    
    const room = await DecisionRoom.findOne({ roomId });
    if (!room) {
      res.status(404).json({ error: 'Room not found' });
      return;
    }

    // Only the creator can delete the room
    if (room.creator.toString() !== req.user._id.toString()) {
      res.status(403).json({ error: 'Only room creator can delete this room' });
      return;
    }

    await DecisionRoom.findByIdAndDelete(room._id);

    res.json({ message: 'Room deleted successfully' });
  } catch (error) {
    console.error('Delete room error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

