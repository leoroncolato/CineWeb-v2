import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3000',
});

// Request interceptor to potentially add tokens later
api.interceptors.request.use((config) => {
  return config;
});

// Response interceptor to format errors seamlessly
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // We can handle global 400/409 errors here if we want or just pass them down
    return Promise.reject(error);
  }
);

export default api;
