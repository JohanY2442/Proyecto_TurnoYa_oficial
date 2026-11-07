import api from './api';

export const authService = {
  login: (credenciales) => api.post('/auth/login', credenciales).then((r) => r.data),
  register: (datos) => api.post('/auth/register', datos).then((r) => r.data),
  me: () => api.get('/usuarios/me').then((r) => r.data),
};
