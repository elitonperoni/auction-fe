"use-client"

import axios from 'axios';
import Cookies from "js-cookie";
import { authApi } from '.';

const api = axios.create({    
  baseURL: process.env.NEXT_PUBLIC_API_URL, 
  timeout: 20000,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    const token = Cookies.get('auth-token'); 

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => response, 
  async (error) => {
    const originalRequest = error.config;
    debugger
   if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true; 

      const newToken = await authApi.refreshToken();

      if (newToken) {
        originalRequest.headers["Authorization"] = `Bearer ${newToken}`;
        return api(originalRequest);
      }
    }

    return Promise.reject(error);
  }
);

export default api;
