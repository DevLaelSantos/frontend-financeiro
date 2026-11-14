import axios from 'axios';

const api = axios.create({
  baseURL: 'https://api-financeira-9ozz.onrender.com/api/v1',
});

// Interceptor para adicionar o token automaticamente em todas as requisições
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  console.log("Token enviado:", token); // <-- ADICIONE ISSO
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;