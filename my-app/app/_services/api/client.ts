import axios from 'axios';
import Cookies from 'js-cookie';
import { appConfig } from '@/app/_lib/config/app.config';

const api = axios.create({
  baseURL: appConfig.apiUrl,
});

// Request interceptor to add Authorization header
api.interceptors.request.use(
  (config) => {
    const token = Cookies.get('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle token expiration
api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      Cookies.remove('token');
      window.location.href = '/signin';
    }
    return Promise.reject(error);
  }
);

export default api;
