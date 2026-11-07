import api from './api';

export const medicoService = {
  miPerfil: (signal) => api.get('/medicos/me', { signal }).then((r) => r.data),
  enAtencion: (signal) => api.get('/medicos/me/en-atencion', { signal }).then((r) => r.data),
  listar: ({ page = 0, size = 10, especialidadId } = {}, signal) =>
    api.get('/medicos', { params: { page, size, especialidadId: especialidadId || undefined }, signal }).then((r) => r.data),
  crear: (datos) => api.post('/medicos', datos).then((r) => r.data),
};
