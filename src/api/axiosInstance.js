import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 15000,
  withCredentials: true,
  // Note: We deliberately omit a hardcoded 'Content-Type'. 
  // Axios will automatically set 'application/json' for normal data 
  // and 'multipart/form-data; boundary=...' for FormData (like image uploads).
});

// ─── Queue for Refresh Token ──────────────────────────────────────────────────
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });

  failedQueue = [];
};

// ─── Request Interceptor ──────────────────────────────────────────────────────
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('neura_token');
    if (token && token !== 'undefined' && token !== 'null') {
      config.headers.set('Authorization', `Bearer ${token}`);
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ─── Response Interceptor ─────────────────────────────────────────────────────
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const status = error.response?.status;

    // 1. If 401 Unauthorized and not already retrying, attempt refresh
    if (status === 401 && !originalRequest._retry && originalRequest.url !== '/auth/login' && originalRequest.url !== '/auth/refresh-token') {
      
      if (isRefreshing) {
        // If already refreshing, queue the request
        return new Promise(function(resolve, reject) {
          failedQueue.push({ resolve, reject });
        }).then(token => {
          originalRequest.headers.set('Authorization', `Bearer ${token}`);
          return axiosInstance(originalRequest);
        }).catch(err => {
          return Promise.reject(err);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // Must use raw axios to avoid interceptor loops
        const { data } = await axios.post(
          `${import.meta.env.VITE_API_BASE_URL}/auth/refresh-token`, 
          {}, 
          { withCredentials: true }
        );
        
        const newAccessToken = data?.data?.accessToken;
        if (newAccessToken) {
          localStorage.setItem('neura_token', newAccessToken);
          
          processQueue(null, newAccessToken);
          originalRequest.headers.set('Authorization', `Bearer ${newAccessToken}`);
          
          return axiosInstance(originalRequest);
        } else {
          throw new Error('No access token returned from refresh API');
        }
      } catch (refreshError) {
        processQueue(refreshError, null);
        localStorage.removeItem('neura_token');
        localStorage.removeItem('neura_user');
        window.location.href = '/auth/login';
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    // 2. If it's still 401 (e.g. refresh failed or no token provided), force logout
    if (status === 401 || (error.response?.data?.message === 'No access token provided')) {
      if (originalRequest.url !== '/auth/refresh-token') {
        localStorage.removeItem('neura_token');
        localStorage.removeItem('neura_user');
        window.location.href = '/auth/login';
      }
    }

    if (status === 429) {
      // Rate limited — the error message will be surfaced by react-hot-toast in the calling hook
      error.message = 'Too many requests. Please wait a moment and try again.';
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
