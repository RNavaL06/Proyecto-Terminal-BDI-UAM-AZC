import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor de solicitud: adjuntar token JWT guardado en localStorage
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('bdi_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor de respuesta: extraer response.data y manejar 401
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('bdi_token');
      localStorage.removeItem('bdi_user');
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    const errorMsg = error.response?.data?.mensaje || error.response?.data?.error || error.message || 'Error de conexión con el servidor';
    return Promise.reject(new Error(errorMsg));
  }
);

export default api;
