import axiosInstance from './axiosInstance';

/**
 * Create a new therapy room (doctor only)
 * POST /therapy-rooms
 */
export const createTherapyRoom = async (payload) => {
  const response = await axiosInstance.post('/therapy-rooms', payload);
  return response.data;
};

/**
 * Get all active therapy rooms
 * GET /therapy-rooms
 */
export const getActiveTherapyRooms = async () => {
  const response = await axiosInstance.get('/therapy-rooms');
  return response.data;
};

/**
 * Get a specific therapy room by roomId
 * GET /therapy-rooms/:roomId
 */
export const getTherapyRoom = async (roomId) => {
  const response = await axiosInstance.get(`/therapy-rooms/${roomId}`);
  return response.data;
};

/**
 * Join a therapy room by room code
 * GET /therapy-rooms/join/:code
 */
export const joinTherapyRoom = async (code) => {
  const response = await axiosInstance.get(`/therapy-rooms/join/${code}`);
  return response.data;
};

/**
 * End a therapy room (host/doctor only)
 * PATCH /therapy-rooms/:roomId/end
 */
export const endTherapyRoom = async (roomId) => {
  const response = await axiosInstance.patch(`/therapy-rooms/${roomId}/end`);
  return response.data;
};
