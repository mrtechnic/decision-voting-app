import { useState, useContext, useEffect } from "react";
import { AuthContext, type AuthContextType } from "../../contexts/AuthContext";
import { Plus, Users } from "lucide-react";
import RoomView from '../../components/RoomView'
import RoomCard from "../../components/RoomCard";
import CreateRoomForm from "../../components/CreateRoomForm";

export interface Room {
  id: string;
  title: string;
  description: string;
  options: string[];
  deadline: string;
  roomId: string;
  tallies?: number[];
  totalVotes: number;
  isExpired: boolean;
  creatorEmail?: string;
}



const Dashboard: React.FC = () => {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [currentView, setCurrentView] = useState<'dashboard' | 'room'>('dashboard');
  const [currentRoomId, setCurrentRoomId] = useState<string>('');
  const authContext = useContext<AuthContextType | undefined>(AuthContext);
  const token = authContext?.token;
  const user = authContext?.user;

  const loadRooms = async () => {
    if (!token) return;
    
    setLoading(true);
    try {
      const result = await api.getMyRooms(token);
      setRooms(result.rooms);
    } catch (err) {
      console.error('Failed to load rooms:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRooms();
  }, [token]);

  const handleViewRoom = (roomId: string) => {
    setCurrentRoomId(roomId);
    setCurrentView('room');
  };

  const handleBackToDashboard = () => {
    setCurrentView('dashboard');
    loadRooms(); // Refresh rooms when returning
  };

  if (currentView === 'room') {
    return <RoomView roomId={currentRoomId} onBack={handleBackToDashboard} />;
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Decision Rooms</h1>
          <p className="text-gray-600">Welcome back, {user?.email}</p>
        </div>
        <button
          onClick={() => setShowCreateForm(true)}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
        >
          <Plus size={20} />
          Create Room
        </button>
      </div>

      {loading ? (
        <div className="text-center py-8">
          <div className="text-lg">Loading your rooms...</div>
        </div>
      ) : rooms.length === 0 ? (
        <div className="text-center py-12">
          <Users size={48} className="mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No rooms yet</h3>
          <p className="text-gray-600 mb-4">Create your first decision room to get started!</p>
          <button
            onClick={() => setShowCreateForm(true)}
            className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700"
          >
            Create Your First Room
          </button>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          {rooms.map((room) => (
            <RoomCard key={room.id} room={room} onView={handleViewRoom} />
          ))}
        </div>
      )}

      {showCreateForm && (
        <CreateRoomForm
          onClose={() => setShowCreateForm(false)}
          onSuccess={() => {
            loadRooms();
            setShowCreateForm(false);
          }}
        />
      )}
    </div>
  );
};

export default Dashboard;