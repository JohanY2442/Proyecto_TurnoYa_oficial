import api from './api';

export const centroService = {
  listar: ({ page = 0, size = 20, search } = {}, signal) =>
    api.get('/centros', { params: { page, size, search: search || undefined }, signal }).then((r) => r.data),
  cercanos: ({ latitud, longitud, radioKm = 15 }, signal) =>
    api.get('/centros/cercanos', { params: { latitud, longitud, radioKm }, signal }).then((r) => r.data),
  obtener: (id, signal) => api.get(`/centros/${id}`, { signal }).then((r) => r.data),
};
