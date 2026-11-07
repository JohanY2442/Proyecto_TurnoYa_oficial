import api from './api';

export const triageService = {
  sintomas: (signal) => api.get('/triage/sintomas', { signal }).then((r) => r.data),
  registrar: (turnoId, sintomas) => api.post(`/turnos/${turnoId}/triage`, { sintomas }).then((r) => r.data),
  obtener: (turnoId, signal) => api.get(`/turnos/${turnoId}/triage`, { signal }).then((r) => r.data),
};
