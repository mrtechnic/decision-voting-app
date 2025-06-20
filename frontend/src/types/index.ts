export interface User {
  id: string;
  email: string;
  username: string;
}

export interface Room {
  _id: string;
  title: string;
  description: string;
  options: string[];
  deadline: string;
  creator: {
    _id: string;
    name: string;
  };
  inviteCode: string;
  createdAt: string;
  isActive: boolean;
  voteCounts?: Record<string, number>;
  totalVotes?: number;
  hasVoted?: boolean;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
}

export interface CreateRoomData {
  title: string;
  description: string;
  options: string[];
  deadline: string;
}