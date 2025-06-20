import { XCircle, CheckCircle, Clock, Vote, Eye, Share2 } from "lucide-react";
import type { Room } from "../types";

const RoomCard: React.FC<{ room: Room; onView: (roomId: string) => void }> = ({ room, onView }) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const copyInviteUrl = () => {
    const url = `${window.location.origin}/room/${room.roomId}`;
    navigator.clipboard.writeText(url);
    alert('Invite URL copied to clipboard!');
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-blue-500">
      <div className="flex justify-between items-start mb-3">
        <h3 className="text-lg font-semibold text-gray-900">{room.title}</h3>
        <div className="flex items-center gap-2">
          {room.isExpired ? (
            <XCircle className="text-red-500" size={20} />
          ) : (
            <CheckCircle className="text-green-500" size={20} />
          )}
          <span className="text-sm text-gray-500">
            {room.isExpired ? 'Ended' : 'Active'}
          </span>
        </div>
      </div>
      
      <p className="text-gray-600 mb-4">{room.description}</p>
      
      <div className="space-y-2 mb-4">
        <div className="flex items-center text-sm text-gray-500">
          <Clock size={16} className="mr-2" />
          Deadline: {formatDate(room.deadline)}
        </div>
        <div className="flex items-center text-sm text-gray-500">
          <Vote size={16} className="mr-2" />
          Total Votes: {room.totalVotes}
        </div>
      </div>
      
      <div className="flex gap-2">
        <button
          onClick={() => onView(room.roomId)}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
        >
          <Eye size={16} />
          View Details
        </button>
        <button
          onClick={copyInviteUrl}
          className="flex items-center gap-2 bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700"
        >
          <Share2 size={16} />
          Copy Link
        </button>
      </div>
    </div>
  );
};

export default RoomCard;