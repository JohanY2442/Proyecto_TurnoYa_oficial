import api from './api';

export const turnoService = {
  reservar: (datos) => api.post('/turnos', datos).then((r) => r.data),
  misTurnos: ({ page = 0, size = 15, estado } = {}, signal) =>
    api.get('/turnos/me', { params: { page, size, estado: estado || undefined }, signal }).then((r) => r.data),
  obtener: (id, signal) => api.get(`/turnos/${id}`, { signal }).then((r) => r.data),
  posicion: (id, signal) => api.get(`/turnos/${id}/posicion`, { signal }).then((r) => r.data),
  cancelar: (id) => api.patch(`/turnos/${id}/cancelar`).then((r) => r.data),
  cambiarEstado: (id, estado) => api.patch(`/turnos/${id}/estado`, { estado }).then((r) => r.data),
};
