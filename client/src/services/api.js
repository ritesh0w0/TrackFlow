import axios from 'axios';

const API_URL = import.meta.env.PROD
  ? '/trackflow/api'
  : (import.meta.env.VITE_API_URL || 'http://localhost:3000/api');

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to attach Bearer token if present
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('trackflow_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle session expiry
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const isAuthEndpoint =
      error.config?.url?.includes('/auth/login') ||
      error.config?.url?.includes('/auth/signup') ||
      error.config?.url?.includes('/auth/me');

    if (error.response?.status === 401 && !isAuthEndpoint) {
      localStorage.removeItem('trackflow_token');
      const baseUrl = import.meta.env.BASE_URL || '/';
      const loginPath = baseUrl.endsWith('/') ? `${baseUrl}login` : `${baseUrl}/login`;
      if (!window.location.pathname.endsWith('/login') && !window.location.pathname.endsWith('/signup')) {
        window.location.href = loginPath;
      }
    }
    return Promise.reject(error);
  }
);

export default api;
