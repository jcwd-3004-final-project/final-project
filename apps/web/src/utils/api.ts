// utils/api.ts
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8000/v1/api/discounts', // Sesuaikan dengan URL backend Anda
  headers: {
    'Content-Type': 'application/json',
  },
});

// Jika Anda menggunakan token autentikasi, tambahkan interceptor
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token'); // Atau metode penyimpanan token Anda
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

export default api;
