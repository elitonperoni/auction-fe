"use-client"

import axios from 'axios';
import { authApi } from '.';

const api = axios.create({    
  baseURL: process.env.NEXT_PUBLIC_API_URL, 
  withCredentials : true,
  timeout: 120000,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      debugger
      try {
         await authApi.refreshToken();
        return api(originalRequest);
      } catch (refreshError) {
        window.location.href = "/login";
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);

export default api;
