import axios from 'axios';

const POR_ESTADO = {
  400: 'Revisa los datos ingresados.',
  401: 'Tu sesión expiró. Vuelve a iniciar sesión.',
  403: 'No tienes permiso para hacer esta acción.',
  404: 'No encontramos lo que buscabas.',
  409: 'Esta acción entra en conflicto con datos existentes.',
  500: 'El servidor tuvo un problema. Intenta de nuevo en unos minutos.',
};

/** Mensaje amigable para cualquier error de la API (nunca el error técnico). */
export const getErrorMessage = (error, fallback = 'Algo salió mal. Intenta de nuevo.') => {
  if (axios.isCancel(error)) return null;
  if (!error?.response) {
    if (error?.code === 'ECONNABORTED') return 'El servidor tardó demasiado. Intenta de nuevo.';
    return 'No pudimos conectar con el servidor. Revisa tu conexión a internet.';
  }
  const { status, data } = error.response;
  if (status >= 500) return POR_ESTADO[500];
  return data?.message || POR_ESTADO[status] || fallback;
};

export const getFieldErrors = (error) => error?.response?.data?.errors ?? {};
