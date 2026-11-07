import api from './api';

export const especialidadService = {
  listar: (signal) => api.get('/especialidades', { signal }).then((r) => r.data),
  crear: (datos) => api.post('/especialidades', datos).then((r) => r.data),
  actualizar: (id, datos) => api.put(`/especialidades/${id}`, datos).then((r) => r.data),
  eliminar: (id) => api.delete(`/especialidades/${id}`),
};
