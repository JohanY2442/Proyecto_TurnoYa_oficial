import api from './api';

export const pacienteService = {
  miPerfil: (signal) => api.get('/pacientes/me', { signal }).then((r) => r.data),
  actualizarMiPerfil: (datos) => api.patch('/pacientes/me', datos).then((r) => r.data),
};
