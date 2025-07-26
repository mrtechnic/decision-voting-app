import React, { useContext } from "react";
import { XCircle, CheckCircle, Clock, Vote } from "lucide-react";
import { AuthContext } from "../contexts/AuthContext";
import { useRoom } from "../hooks/UseRoom";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

const RoomView: React.FC<{ roomId: string; onBack: () => void }> = ({
  roomId,
  onBack,
}) => {
  const authContext = useContext(AuthContext);
  const token = authContext?.token;
  const user = authContext?.user;

  const {
    room,
    loading,
    error,
    voting,
    hasVoted,
    liveTallies,
    showLiveTallies,
    handleVote,
  } = useRoom(roomId, token ?? undefined, user);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="text-lg animate-pulse text-gray-500">
          Loading room...
        </div>
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

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleString();

  const displayTallies = room.tallies || liveTallies || [];
  const showResults = room.isExpired || showLiveTallies;

  const chartData = room.options.map((option, index) => ({
    name: option.text,
    votes: displayTallies[index] || 0,
  }));

  console.log("Chart Data:", chartData);

  const colors = [
    "#2563eb",
    "#10b981",
    "#f59e0b",
    "#ef4444",
    "#8b5cf6",
    "#ec4899",
  ];

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-6">
        <button onClick={onBack} className="text-blue-600 hover:underline">
          ← Back
        </button>
        <div className="flex items-center gap-2">
          {room.isExpired ? (
            <XCircle className="text-red-500" size={20} />
          ) : (
            <CheckCircle className="text-green-500" size={20} />
          )}
          <span className="text-sm text-gray-500">
            {room.isExpired ? "Voting Ended" : "Active"}
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
          {room.isExpired ? "Final Results" : "Vote your preferred candidate"}
        </h3>

        {room.options.map((option, index) => {
          const voteCount = displayTallies[index] || 0;
          const percentage =
            room.totalVotes > 0 ? (voteCount / room.totalVotes) * 100 : 0;

          return (
            <div key={index} className="border rounded-lg p-4">
              <div className="flex justify-between items-center mb-2">
                <span className="font-medium">{option.text}</span>
                {showResults && (
                  <span className="text-sm text-gray-500">
                    {voteCount} votes ({percentage.toFixed(1)}%)
                  </span>
                )}
              </div>

              {showResults && (
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              )}

              {!room.isExpired && !hasVoted && (
                <button
                  onClick={() => handleVote(index)}
                  disabled={voting}
                  className="mt-3 w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50"
                  aria-label={`Vote for ${option.text}`}
                >
                  {voting ? "Voting..." : "Vote for this option"}
                </button>
              )}
            </div>
          );
        })}
      </div>
   
      {chartData.length > 0 && (
        <div className="mt-10">
          <h3 className="text-lg font-semibold mb-2">Live Voting Chart</h3>
          <div style={{ width: "100%", height: 300 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <XAxis dataKey="name" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="votes">
                  {chartData.map((_, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={colors[index % colors.length]}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
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
    </div>
  );
};

export default RoomView;
