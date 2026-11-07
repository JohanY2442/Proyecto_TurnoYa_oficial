/**
 * El access token vive solo en memoria (no se puede leer desde otra pestaña ni
 * persiste en disco). El refresh token se guarda en sessionStorage para
 * sobrevivir a un F5, y se borra al cerrar la pestaña.
 */
const REFRESH_KEY = 'turnoya.refresh';

let accessToken = null;

export const tokenStorage = {
  getAccessToken: () => accessToken,
  setAccessToken: (token) => {
    accessToken = token;
  },
  getRefreshToken: () => {
    try {
      return sessionStorage.getItem(REFRESH_KEY);
    } catch {
      return null;
    }
  },
  setRefreshToken: (token) => {
    try {
      if (token) sessionStorage.setItem(REFRESH_KEY, token);
      else sessionStorage.removeItem(REFRESH_KEY);
    } catch {
      /* almacenamiento no disponible: la sesión dura lo que la pestaña */
    }
  },
  clear: () => {
    accessToken = null;
    try {
      sessionStorage.removeItem(REFRESH_KEY);
    } catch {
      /* nada que limpiar */
    }
  },
};
