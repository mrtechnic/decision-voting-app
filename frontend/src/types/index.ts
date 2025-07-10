export interface User {
  id: string;
  email: string;
  username: string;
}

export type Option = {
  id?: string;
  text: string;
  votes?: number;
  _id?: string;
};

export interface Room {
  id: string;
  title: string;
  description: string;
  options: Option[];
  deadline: string;
  roomId: string;
  tallies?: number[];
  totalVotes: number;
  isExpired: boolean;
  creatorEmail?: string;
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