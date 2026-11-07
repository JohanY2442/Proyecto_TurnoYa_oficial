export const ROLES = { PACIENTE: 'PACIENTE', MEDICO: 'MEDICO', ADMIN: 'ADMINISTRADOR' };

export const ESTADOS_TURNO = {
  RESERVADO: 'Reservado',
  EN_ESPERA: 'En espera',
  EN_ATENCION: 'En atención',
  ATENDIDO: 'Atendido',
  CANCELADO: 'Cancelado',
};

export const ESTADOS_ACTIVOS = ['RESERVADO', 'EN_ESPERA', 'EN_ATENCION'];
export const GRAVEDAD_A_NIVEL = { 1: 'BAJO', 2: 'MEDIO', 3: 'ALTO', 4: 'CRITICO' };
export const POLLING_MS = 15000;
export const PREFIJO_QR = 'turnoya:turno:';
