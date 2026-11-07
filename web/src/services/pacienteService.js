import api from './api';

export const pacienteService = {
  miPerfil: (signal) => api.get('/pacientes/me', { signal }).then((r) => r.data),
  actualizarMiPerfil: (datos) => api.patch('/pacientes/me', datos).then((r) => r.data),
  listar: ({ page = 0, size = 10 } = {}, signal) => api.get('/pacientes', { params: { page, size }, signal }).then((r) => r.data),
};
