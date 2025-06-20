import { useState, useEffect, useContext } from "react";
import { XCircle, CheckCircle, Clock, Vote } from "lucide-react";
import { AuthContext, type AuthContextType } from "../contexts/AuthContext";
import type { Room } from "../types";
import { getLiveTallies, getRoom, vote } from "../utils/api";

const RoomView: React.FC<{ roomId: string; onBack: () => void }> = ({ roomId, onBack }) => {
  const [room, setRoom] = useState<Room | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [voting, setVoting] = useState(false);
  const [hasVoted, setHasVoted] = useState(false);
  const [liveTallies, setLiveTallies] = useState<number[]>([]);
  const [showLiveTallies, setShowLiveTallies] = useState(false);
   const authContext = useContext<AuthContextType | undefined>(AuthContext);
  const token = authContext?.token;
  const user = authContext?.user;

  const loadRoom = async () => {
    try {
      const result = await getRoom(roomId);
      setRoom(result.room);
      
      if (user && result.room.creatorEmail === user.email && !result.room.isExpired) {
        try {
          const talliesResult = await getLiveTallies(roomId, token!);
          setLiveTallies(talliesResult.tallies);
          setShowLiveTallies(true);
        } catch (err) {
          console.log('Not room creator or cannot access tallies');
        }
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRoom();
  }, [roomId]);

  const handleVote = async (optionIndex: number) => {
    if (!room || voting) return;
    
    setVoting(true);
    try {
      await vote(roomId, optionIndex, token || undefined);
      setHasVoted(true);
      loadRoom();
    } catch (err: any) {
      if (err.message.includes('already voted')) {
        setHasVoted(true);
      }
      setError(err.message);
    } finally {
      setVoting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="text-lg">Loading room...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center">
        <div className="text-red-600 mb-4">{error}</div>
        <button
          onClick={onBack}
          className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700"
        >
          Go Back
        </button>
      </div>
    );
  }

  if (!room) return null;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const displayTallies = room.tallies || liveTallies || [];
  const showResults = room.isExpired || showLiveTallies;

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={onBack}
          className="text-blue-600 hover:underline"
        >
          ← Back
        </button>
        <div className="flex items-center gap-2">
          {room.isExpired ? (
            <XCircle className="text-red-500" size={20} />
          ) : (
            <CheckCircle className="text-green-500" size={20} />
          )}
          <span className="text-sm text-gray-500">
            {room.isExpired ? 'Voting Ended' : 'Active'}
          </span>
        </div>
      </div>

      <h1 className="text-2xl font-bold mb-4">{room.title}</h1>
      <p className="text-gray-600 mb-6">{room.description}</p>

      <div className="mb-6">
        <div className="flex items-center text-sm text-gray-500 mb-2">
          <Clock size={16} className="mr-2" />
          Deadline: {formatDate(room.deadline)}
        </div>
        <div className="flex items-center text-sm text-gray-500">
          <Vote size={16} className="mr-2" />
          Total Votes: {room.totalVotes}
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold">
          {room.isExpired ? 'Final Results' : 'Vote for your preferred option'}
        </h3>
        
        {room.options.map((option, index) => {
          const voteCount = displayTallies[index] || 0;
          const percentage = room.totalVotes > 0 ? (voteCount / room.totalVotes) * 100 : 0;
          
          return (
            <div key={index} className="border rounded-lg p-4">
              <div className="flex justify-between items-center mb-2">
                <span className="font-medium">{option}</span>
                {showResults && (
                  <span className="text-sm text-gray-500">
                    {voteCount} votes ({percentage.toFixed(1)}%)
                  </span>
                )}
              </div>
              
              {showResults && (
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              )}
              
              {!room.isExpired && !hasVoted && (
                <button
                  onClick={() => handleVote(index)}
                  disabled={voting}
                  className="mt-3 w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50"
                >
                  {voting ? 'Voting...' : 'Vote for this option'}
                </button>
              )}
            </div>
          );
        })}
      </div>

      {hasVoted && !room.isExpired && (
        <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center">
            <CheckCircle className="text-green-500 mr-2" size={20} />
            <span className="text-green-700">
              Thank you for voting! Your vote has been recorded.
            </span>
          </div>
        </div>
      )}

      {error && (
        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="text-red-600">{error}</div>
        </div>
      )}
    </div>
  );
};

export default RoomView;