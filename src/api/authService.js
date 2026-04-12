import axiosInstance from './axiosInstance';

const fetchProfileAndInject = async (authData) => {
  const token = authData?.data?.accessToken || authData?.data?.token || authData?.accessToken || authData?.token;
  if (token) {
    try {
      const profileRes = await axiosInstance.get('/profile/me', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const user = profileRes.data?.data?.user || profileRes.data?.user;
      if (user) {
        if (!authData.data) authData.data = {};
        authData.data.user = user;
      }
    } catch (err) {
      console.error('Failed to fetch profile during auth:', err);
    }
  }
  return authData;
};

export const getProfile = async () => {
  const response = await axiosInstance.get('/profile/me');
  return response.data;
};

/**
 * Register a new user.
 * @param {{ email, password, firstName, lastName, role, dateOfBirth, gender }} data
 */
export const registerUser = async (data) => {
  const response = await axiosInstance.post('/auth/register', data);
  return fetchProfileAndInject(response.data);
};

/**
 * Login an existing user.
 * @param {{ email, password }} data
 */
export const loginUser = async (data) => {
  const response = await axiosInstance.post('/auth/login', data);
  return fetchProfileAndInject(response.data);
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
