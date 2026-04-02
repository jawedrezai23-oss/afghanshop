import axios from 'axios';

// WICHTIG: Wir nutzen hier eine Umgebungsvariable (Environment Variable).
// Wenn 'VITE_API_URL' in der .env Datei steht, nimmt er die (für den Live-Gang).
// Ansonsten nimmt er standardmäßig dein lokales Backend (für die Entwicklung).
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

const api = axios.create({
  baseURL: API_URL,
});

api.interceptors.request.use(
  (config) => {
    const userInfo = localStorage.getItem('userInfo') 
      ? JSON.parse(localStorage.getItem('userInfo')) 
      : null;

    if (userInfo && userInfo.token) {
      config.headers.Authorization = `Bearer ${userInfo.token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;