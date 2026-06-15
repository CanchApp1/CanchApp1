import axios from 'axios';

const API_BASE_URL = '/api';

const instance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para inyectar el token desde sessionStorage
instance.interceptors.request.use(
  (config) => {
    const token = sessionStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor para manejar errores de autenticación y cuenta suspendida
instance.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;

    if (status === 401) {
      sessionStorage.clear();
      window.location.href = '/Login';
      return Promise.reject(error);
    }

    if (status === 403) {
      // axios puede devolver data como string si el Content-Type no fue reconocido
      const raw = error.response.data;
      const data = typeof raw === 'string' ? (() => { try { return JSON.parse(raw); } catch { return {}; } })() : (raw ?? {});

      if (data?.error === 'CUENTA_SUSPENDIDA') {
        window.dispatchEvent(new CustomEvent('cuenta-suspendida', {
          detail: { tipoSuspension: data.tipoSuspension ?? null, fechaReactivacion: data.fechaReactivacion ?? null }
        }));
      }
    }

    return Promise.reject(error);
  }
);

export default instance;