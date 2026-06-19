import axios from 'axios';

const api = axios.create({
  baseURL: '/',
  timeout: 15000, // 15s — prevents hung requests from freezing the UI
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth interceptor if needed
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      if (!window.location.pathname.startsWith('/login')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;

// Reactive auth check — reads from localStorage each call so expiry is detected promptly
export function isAuthenticated() {
  return Boolean(localStorage.getItem('token'));
}
