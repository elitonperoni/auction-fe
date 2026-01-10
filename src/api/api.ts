"use-client"

import axios from 'axios';
import Cookies from "js-cookie";

const api = axios.create({    
  baseURL: process.env.NEXT_PUBLIC_API_URL, 
  timeout: 20000,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    debugger
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

export default api;
