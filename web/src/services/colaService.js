import api, { API_URL } from './api';
import { tokenStorage } from './tokenStorage';

const base = (centroId, especialidadId) => `/centros/${centroId}/especialidades/${especialidadId}/cola`;

export const colaService = {
  obtener: (centroId, especialidadId, signal) => api.get(base(centroId, especialidadId), { signal }).then((r) => r.data),
  llamarSiguiente: (centroId, especialidadId) =>
    api.post(`${base(centroId, especialidadId)}/siguiente`).then((r) => r.data),
  /** URL del stream SSE. EventSource no manda headers, por eso el token va en la URL. */
  streamUrl: (centroId, especialidadId) =>
    `${API_URL}${base(centroId, especialidadId)}/stream?token=${encodeURIComponent(tokenStorage.getAccessToken() ?? '')}`,
};
