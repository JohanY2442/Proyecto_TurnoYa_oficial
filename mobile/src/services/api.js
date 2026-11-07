import axios from 'axios';
import { tokenStorage } from './tokenStorage';

export const API_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:8080/api/v1';

/** Cliente HTTP único de la app: todo el acceso al backend pasa por aquí. */
const api = axios.create({
  baseURL: API_URL,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
});

const RUTAS_AUTH = ['/auth/login', '/auth/register', '/auth/refresh'];
const MAX_REINTENTOS = 2;

let alExpirarSesion = () => {};
export const onSesionExpirada = (handler) => {
  alExpirarSesion = handler;
};

api.interceptors.request.use(async (config) => {
  const token = await tokenStorage.getAccessToken();
  if (token && !config.headers.Authorization) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

let refreshEnCurso = null;
export const refrescarSesion = () => {
  if (!refreshEnCurso) {
    refreshEnCurso = (async () => {
      const refreshToken = await tokenStorage.getRefreshToken();
      if (!refreshToken) throw new Error('Sin refresh token');
      const { data } = await axios.post(`${API_URL}/auth/refresh`, { refreshToken }, { timeout: 15000 });
      await tokenStorage.save(data);
      return data;
    })().finally(() => {
      refreshEnCurso = null;
    });
  }
  return refreshEnCurso;
};

const esperar = (ms) => new Promise((r) => setTimeout(r, ms));

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const config = error.config;
    if (!config || axios.isCancel(error)) return Promise.reject(error);
    const status = error.response?.status;

    // 401: se renueva el token una vez y se repite el request.
    if (status === 401 && !config._reintentoAuth && !RUTAS_AUTH.some((r) => config.url?.includes(r))) {
      config._reintentoAuth = true;
      try {
        const data = await refrescarSesion();
        config.headers.Authorization = `Bearer ${data.accessToken}`;
        return api(config);
      } catch {
        await tokenStorage.clear();
        alExpirarSesion();
        return Promise.reject(error);
      }
    }

    // Errores de red o del servidor caído: se reintentan solo las lecturas (GET).
    const esLectura = (config.method ?? 'get').toLowerCase() === 'get';
    const recuperable = !error.response || [502, 503, 504].includes(status);
    config._reintentos = config._reintentos ?? 0;
    if (esLectura && recuperable && config._reintentos < MAX_REINTENTOS) {
      config._reintentos += 1;
      await esperar(700 * 2 ** (config._reintentos - 1));
      return api(config);
    }
    return Promise.reject(error);
  },
);

export default api;
