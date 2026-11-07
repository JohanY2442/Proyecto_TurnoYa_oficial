import axios from 'axios';
import { tokenStorage } from './tokenStorage';

export const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8080/api/v1';

/** Cliente HTTP único de la app: todas las llamadas al backend pasan por aquí. */
const api = axios.create({
  baseURL: API_URL,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
});

const RUTAS_PUBLICAS_AUTH = ['/auth/login', '/auth/register', '/auth/refresh'];
const MAX_REINTENTOS = 2;
const ESTADOS_REINTENTABLES = [502, 503, 504];

let sesionExpiradaHandler = () => {};
/** El AuthContext registra aquí qué hacer cuando la sesión ya no se puede renovar. */
export const onSesionExpirada = (handler) => {
  sesionExpiradaHandler = handler;
};

// --- Request: agrega el token ---
api.interceptors.request.use((config) => {
  const token = tokenStorage.getAccessToken();
  if (token && !config.headers.Authorization) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// --- Refresh token: una sola renovación aunque fallen varios requests a la vez ---
let refreshEnCurso = null;

const renovarToken = async () => {
  const refreshToken = tokenStorage.getRefreshToken();
  if (!refreshToken) throw new Error('Sin refresh token');
  const { data } = await axios.post(`${API_URL}/auth/refresh`, { refreshToken });
  tokenStorage.setAccessToken(data.accessToken);
  tokenStorage.setRefreshToken(data.refreshToken);
  return data;
};

export const refrescarSesion = () => {
  if (!refreshEnCurso) {
    refreshEnCurso = renovarToken().finally(() => {
      refreshEnCurso = null;
    });
  }
  return refreshEnCurso;
};

const esperar = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// --- Response: renueva el token ante un 401 y reintenta errores de red recuperables ---
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const config = error.config;
    if (!config || axios.isCancel(error)) return Promise.reject(error);

    const status = error.response?.status;
    const esRutaAuth = RUTAS_PUBLICAS_AUTH.some((ruta) => config.url?.includes(ruta));

    if (status === 401 && !config._reintentoAuth && !esRutaAuth) {
      config._reintentoAuth = true;
      try {
        await refrescarSesion();
        config.headers.Authorization = `Bearer ${tokenStorage.getAccessToken()}`;
        return api(config);
      } catch {
        tokenStorage.clear();
        sesionExpiradaHandler();
        return Promise.reject(error);
      }
    }

    // Solo se reintentan lecturas: repetir un POST podría duplicar una reserva.
    const esLectura = (config.method ?? 'get').toLowerCase() === 'get';
    const esRecuperable = !error.response || ESTADOS_REINTENTABLES.includes(status);
    config._reintentos = config._reintentos ?? 0;
    if (esLectura && esRecuperable && config._reintentos < MAX_REINTENTOS) {
      config._reintentos += 1;
      await esperar(600 * 2 ** (config._reintentos - 1));
      return api(config);
    }

    return Promise.reject(error);
  },
);

export default api;
