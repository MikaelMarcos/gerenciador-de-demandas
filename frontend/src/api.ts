import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'https://gerenciador-de-demandas.onrender.com/api', // Backend production URL
  headers: {
    'Content-Type': 'application/json',
  },
});

export default api;
