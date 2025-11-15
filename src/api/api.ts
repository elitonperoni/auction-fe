import axios from 'axios';

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
    const token = sessionStorage.getItem('userToken');

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
