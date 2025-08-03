import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_DECISION_VOTING_API_URL || 'http://localhost:3000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add Authorization token if available
const authHeader = (token?: string) =>
  token ? { Authorization: `Bearer ${token}` } : {};

export const signin = async (email: string, password: string) => {
  try {
      const response = await api.post('/auth/login', { email, password });
  return response.data;
  } catch (error: any) {
    throw error.response?.data || { message: 'SOmething went wrong'};
  }

};

export const signup = async (email: string, password: string, name: string) => {
  try {
    const response = await api.post('/auth/register', { email, password, name });
    return response.data;
  } catch (error: any) {
    throw error.response?.data || { message: 'Something went wrong' };
  }
};

export const createRoom = async (roomData: any, token: string) => {
  const response = await api.post('/rooms', roomData, {
    headers: authHeader(token),
  });
  return response.data;
};

export const getRoom = async (roomId: string) => {
  const response = await api.get(`/rooms/${roomId}`);
  return response.data;
};

export const vote = async (
  roomId: string,
  optionId: string,
  token?: string
) => {
  const response = await api.post(
    `/rooms/${roomId}/vote`,
    { optionId },
    {
      headers: authHeader(token),
    }
  );
  return response.data;
};

export const getMyRooms = async (token?: string) => {
  const response = await api.get('/rooms/my-rooms', {
    headers: authHeader(token),
  });
  return response.data;
};

export const getLiveTallies = async (roomId: string, token?: string) => {
  const response = await api.get(`/rooms/${roomId}/tallies`, {
    headers: authHeader(token),
  });
  return response.data;
};

export const deleteRoom = async (roomId: string, token: string) => {
  const response = await api.delete(`/rooms/${roomId}`, {
    headers: authHeader(token),
  });
  return response.data;
};

export default api


