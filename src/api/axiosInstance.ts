// src/api/axiosInstance.ts
import axios from 'axios';
import { useAuthStore } from '../store/authStore';

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

// This is our existing request interceptor that adds the token
axiosInstance.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().token;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// --- Add a response interceptor to handle errors globally ---
axiosInstance.interceptors.response.use(
  (response) => {
    // If the request was successful, just return the response
    return response;
  },
  (error) => {
    // Check if the error is specifically a 401 Unauthorized error
    if (error.response && error.response.status === 401) {
      // If it is, the token is invalid or expired.
      // Call the logout action from our auth store.
      // We use getState() here because we are outside a React component.
      useAuthStore.getState().logout();
      
      // Force a redirect to the login page.
      window.location.href = '/login';
    }
    
    // For all other errors, just pass them on
    return Promise.reject(error);
  }
);


export default axiosInstance;