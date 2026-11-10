/**
 * El access token vive solo en memoria de JavaScript.
 * El refresh token se guarda en localStorage para recuperar
 * la sesión después de recargar o cerrar el navegador.
 *
 * Nota: localStorage es accesible desde JavaScript, por lo que 
 * una futura mejora seria migrar el refresh token a cokkies HttpOnly para reducir su exposicion ante ataques XSS
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
      return localStorage.getItem(REFRESH_KEY);
    } catch {
      return null;
    }
  },
  setRefreshToken: (token) => {
    try {
      if (token) localStorage.setItem(REFRESH_KEY, token);
      else localStorage.removeItem(REFRESH_KEY);
    } catch {
      /* almacenamiento no disponible: la sesión dura lo que la pestaña */
    }
  },
  clear: () => {
    accessToken = null;
    try {
      localStorage.removeItem(REFRESH_KEY);
    } catch {
      /* nada que limpiar */
    }
  },
};
