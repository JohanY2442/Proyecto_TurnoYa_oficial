import api from './api';

export const centroService = {
  listar: ({ page = 0, size = 10, search, especialidadId } = {}, signal) =>
    api
      .get('/centros', { params: { page, size, search: search || undefined, especialidadId: especialidadId || undefined }, signal })
      .then((r) => r.data),
  cercanos: ({ latitud, longitud, especialidadId, radioKm = 15 }, signal) =>
    api
      .get('/centros/cercanos', { params: { latitud, longitud, radioKm, especialidadId: especialidadId || undefined }, signal })
      .then((r) => r.data),
  obtener: (id, signal) => api.get(`/centros/${id}`, { signal }).then((r) => r.data),
  crear: (datos) => api.post('/centros', datos).then((r) => r.data),
  actualizar: (id, datos) => api.put(`/centros/${id}`, datos).then((r) => r.data),
  eliminar: (id) => api.delete(`/centros/${id}`),
  estadisticas: (id, fecha, signal) =>
    api.get(`/centros/${id}/estadisticas`, { params: { fecha: fecha || undefined }, signal }).then((r) => r.data),
};
