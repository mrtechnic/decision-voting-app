import { useEffect, useState } from 'react';
import { getRoom, getLiveTallies, vote } from '../utils/api';
import type { Room, User } from '../types';

export const useRoom = (
  roomId: string,
  token?: string | null,
  user?: User | null
) => {
  const [room, setRoom] = useState<Room | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [hasVoted, setHasVoted] = useState(false);
  const [voting, setVoting] = useState(false);
  const [liveTallies, setLiveTallies] = useState<number[]>([]);
  const [showLiveTallies, setShowLiveTallies] = useState(false);

  const loadRoom = async () => {
    try {
      const result = await getRoom(roomId);
      setRoom(result.room);

      const safeToken = token ?? undefined;

      if (user && result.room.creatorEmail === user.email && !result.room.isExpired) {
        try {
          const talliesResult = await getLiveTallies(roomId, safeToken);
          setLiveTallies(talliesResult.tallies);
          setShowLiveTallies(true);
        } catch (err) {
          console.warn('Cannot access tallies');
        }
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

const handleVote = async (optionIndex: number) => {
  if (!room || voting || optionIndex >= room.options.length || optionIndex < 0)
    return;

  const selectedOption = room.options[optionIndex];
  if (!selectedOption?.id) {
    setError("Invalid option selected");
    return;
  }

  setVoting(true);
  try {
    await vote(roomId, selectedOption.id, token || undefined);
    setHasVoted(true);

    // Always reload room info
    await loadRoom();

    // Fetch fresh tallies if voting is still open
    if (!room.isExpired) {
      try {
        const talliesResult = await getLiveTallies(roomId, token || undefined);
        setLiveTallies(talliesResult.tallies);
        setShowLiveTallies(true);
      } catch (err) {
        console.warn("Could not refresh tallies");
      }
    }
  } catch (err: any) {
    if (err.message.includes("already voted")) {
      setHasVoted(true);
    }
    setError(err.message);
  } finally {
    setVoting(false);
  }
};


  useEffect(() => {
    loadRoom();
  }, [roomId]);

  return {
    room,
    loading,
    error,
    hasVoted,
    voting,
    liveTallies,
    showLiveTallies,
    handleVote,
    reloadRoom: loadRoom
  };
};
