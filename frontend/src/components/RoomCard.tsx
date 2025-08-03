import { XCircle, CheckCircle, Clock, Vote, Eye, Share2, Trash2, AlertTriangle, Users } from "lucide-react";
import { useContext, useState } from "react";
import { AuthContext } from "../contexts/AuthContext";
import { deleteRoom } from "../utils/api";
import toast from "react-hot-toast";
import type { Room } from "../types";

const RoomCard: React.FC<{ 
  room: Room; 
  onView: (roomId: string) => void;
  onDelete?: (roomId: string) => void;
}> = ({ room, onView, onDelete }) => {
  const authContext = useContext(AuthContext);
  const token = authContext?.token;
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const copyInviteUrl = () => {
    const url = `${window.location.origin}/room/${room.roomId}`;
    navigator.clipboard.writeText(url);
    toast.success('Invite URL copied to clipboard!');
  };

  const handleDeleteClick = () => {
    setShowDeleteConfirm(true);
  };

  const handleDeleteConfirm = async () => {
    if (!token) return;

    try {
      await deleteRoom(room.roomId, token);
      toast.success('Room deleted successfully!');
      onDelete?.(room.roomId);
      setShowDeleteConfirm(false);
    } catch (error: any) {
      console.error('Failed to delete room:', error);
      toast.error(error.response?.data?.error || 'Failed to delete room');
    }
  };

  const handleDeleteCancel = () => {
    setShowDeleteConfirm(false);
  };

  return (
    <>
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all duration-200 overflow-hidden">
        {/* Header with status */}
        <div className="p-5 pb-4">
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-semibold text-gray-900 truncate mb-1">
                {room.title}
              </h3>
              <p className="text-sm text-gray-600 line-clamp-2">
                {room.description}
              </p>
            </div>
            <div className="flex items-center gap-1.5 ml-3">
              {room.isExpired ? (
                <div className="flex items-center gap-1 px-2 py-1 bg-red-50 text-red-700 rounded-full text-xs font-medium">
                  <XCircle size={12} />
                  Ended
                </div>
              ) : (
                <div className="flex items-center gap-1 px-2 py-1 bg-green-50 text-green-700 rounded-full text-xs font-medium">
                  <CheckCircle size={12} />
                  Active
                </div>
              )}
            </div>
          </div>

          {/* Stats row */}
          <div className="flex items-center gap-4 text-sm text-gray-500">
            <div className="flex items-center gap-1.5">
              <Clock size={14} />
              <span>{formatDate(room.deadline)}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Vote size={14} />
              <span>{room.totalVotes} votes</span>
            </div>
            {room.voters && (
              <div className="flex items-center gap-1.5">
                <Users size={14} />
                <span>{room.voters.length} voters</span>
              </div>
            )}
          </div>
        </div>

        {/* Action buttons */}
        <div className="px-5 pb-5">
          <div className="flex gap-2">
            <button
              onClick={() => onView(room.roomId)}
              className="flex-1 flex items-center justify-center gap-2 bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
            >
              <Eye size={14} />
              View
            </button>
            <button
              onClick={copyInviteUrl}
              className="flex items-center gap-1.5 bg-gray-100 text-gray-700 px-3 py-2 rounded-lg hover:bg-gray-200 transition-colors text-sm"
            >
              <Share2 size={14} />
              Share
            </button>
            <button
              onClick={handleDeleteClick}
              className="flex items-center gap-1.5 bg-red-50 text-red-600 px-3 py-2 rounded-lg hover:bg-red-100 transition-colors text-sm"
            >
              <Trash2 size={14} />
              Delete
            </button>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center gap-3 mb-4">
              <AlertTriangle className="text-red-500" size={24} />
              <h3 className="text-lg font-semibold text-gray-900">Delete Room</h3>
            </div>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete "<strong>{room.title}</strong>"? 
              This action cannot be undone and all voting data will be permanently lost.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={handleDeleteCancel}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
              >
                Delete Room
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default RoomCard;