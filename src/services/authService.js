import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
const API_VERSION = import.meta.env.VITE_API_VERSION || 'v1';
const API_URL = `${API_BASE_URL}/api/${API_VERSION}`;

// Token storage keys
const STORAGE_KEYS = {
  ACCESS_TOKEN: 'access_token',
  REFRESH_TOKEN: 'refresh_token',
  USER: 'user',
};

// Create axios instance
const axiosInstance = axios.create({
  baseURL: API_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add token
axiosInstance.interceptors.request.use(
  (config) => {
    const token = getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle token refresh
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = getRefreshToken();
        if (refreshToken) {
          const response = await axios.post(`${API_URL}/auth/refresh`, {
            refresh_token: refreshToken,
          });

          const { accessToken, refreshToken: newRefreshToken } = response.data.data;
          
          setAccessToken(accessToken);
          setRefreshToken(newRefreshToken);

          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          return axiosInstance(originalRequest);
        }
      } catch (refreshError) {
        logout();
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

// Storage helpers
export const setAccessToken = (token) => {
  localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, token);
};

export const getAccessToken = () => {
  return localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
};

export const setRefreshToken = (token) => {
  localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, token);
};

export const getRefreshToken = () => {
  return localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
};

export const setUser = (user) => {
  localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
};

export const getUser = () => {
  const user = localStorage.getItem(STORAGE_KEYS.USER);
  return user ? JSON.parse(user) : null;
};

export const clearAuth = () => {
  localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
  localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
  localStorage.removeItem(STORAGE_KEYS.USER);
};

// Auth functions
export const initiateGoogleLogin = () => {
  window.location.href = `${API_BASE_URL}/api/${API_VERSION}/auth/google`;
};

export const initiateGithubLogin = () => {
  window.location.href = `${API_BASE_URL}/api/${API_VERSION}/auth/github`;
};

export const handleAuthCallback = (accessToken, refreshToken) => {
  if (accessToken && refreshToken) {
    setAccessToken(accessToken);
    setRefreshToken(refreshToken);
    return true;
  }
  return false;
};

export const getCurrentUser = async () => {
  try {
    const response = await axiosInstance.get('/auth/me');
    const user = response.data.data;
    setUser(user);
    return user;
  } catch (error) {
    console.error('Failed to get current user:', error);
    throw error;
  }
};

export const logout = async () => {
  try {
    const refreshToken = getRefreshToken();
    await axiosInstance.post('/auth/logout', {
      refresh_token: refreshToken,
    });
  } catch (error) {
    console.error('Logout error:', error);
  } finally {
    clearAuth();
  }
};

export const isAuthenticated = () => {
  const token = getAccessToken();
  return !!token;
};

// User profile functions
export const getUserProfile = async () => {
  try {
    const response = await axiosInstance.get('/user/profile');
    return response.data.data;
  } catch (error) {
    console.error('Failed to get user profile:', error);
    throw error;
  }
};

export const updateUserProfile = async (data) => {
  try {
    const response = await axiosInstance.put('/user/profile', data);
    const updatedUser = response.data.data;
    setUser(updatedUser);
    return updatedUser;
  } catch (error) {
    console.error('Failed to update profile:', error);
    throw error;
  }
};

export const uploadAvatar = async (file) => {
  try {
    const formData = new FormData();
    formData.append('avatar', file);

    const response = await axiosInstance.post('/user/avatar', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data.data.avatar_url;
  } catch (error) {
    console.error('Failed to upload avatar:', error);
    throw error;
  }
};

export const deleteAvatar = async () => {
  try {
    await axiosInstance.delete('/user/avatar');
  } catch (error) {
    console.error('Failed to delete avatar:', error);
    throw error;
  }
};

export default axiosInstance;