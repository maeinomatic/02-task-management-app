import axios from 'axios';

// Create axios instance with base configuration
const api = axios.create({
  // Vite exposes env vars via import.meta.env and variables prefixed with VITE_
  baseURL: (import.meta.env.VITE_API_URL as string) || 'http://localhost:5000',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for adding auth tokens
api.interceptors.request.use(
  (config) => {
    // Add auth token if available
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for handling common errors
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized access
      if (localStorage.getItem('authToken')) {
        localStorage.setItem('authNotice', 'Your session expired. Please sign in again.');
      }
      localStorage.removeItem('authToken');
      window.location.href = '/';
    }
    return Promise.reject(error);
  }
);

export default api;