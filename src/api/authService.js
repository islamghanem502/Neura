import axiosInstance from './axiosInstance';

/**
 * Register a new user.
 * @param {{ email, password, firstName, lastName, role, dateOfBirth, gender }} data
 */
export const registerUser = async (data) => {
  const response = await axiosInstance.post('/auth/register', data);
  return response.data; // { status, message, data: { accessToken, user } }
};

/**
 * Login an existing user.
 * @param {{ email, password }} data
 */
export const loginUser = async (data) => {
  const response = await axiosInstance.post('/auth/login', data);
  return response.data; // { status, message, data: { accessToken, user } }
};

/**
 * Logout — clears local storage.
 * Call this to terminate the session client-side.
 */
export const logoutUser = async () => {
  try {
    await axiosInstance.post('/auth/logout');
  } catch (err) {
    console.error('Logout error:', err);
  } finally {
    localStorage.removeItem('neura_token');
    localStorage.removeItem('neura_user');
  }
};
