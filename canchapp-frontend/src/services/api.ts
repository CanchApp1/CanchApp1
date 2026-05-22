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

// Interceptor para manejar cuenta suspendida en sesión activa
instance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 403) {
      // axios puede devolver data como string si el Content-Type no fue reconocido
      const raw = error.response.data;
      const data = typeof raw === 'string' ? (() => { try { return JSON.parse(raw); } catch { return {}; } })() : (raw ?? {});

      console.log('[api] 403 recibido:', data);

      if (data?.error === 'CUENTA_SUSPENDIDA') {
        console.log('[api] Disparando evento cuenta-suspendida');
        window.dispatchEvent(new CustomEvent('cuenta-suspendida', {
          detail: { tipoSuspension: data.tipoSuspension ?? null, fechaReactivacion: data.fechaReactivacion ?? null }
        }));
      }
    }
    return Promise.reject(error);
  }
);

export default instance;