export const ROLES = {
  PACIENTE: 'PACIENTE',
  MEDICO: 'MEDICO',
  ADMIN: 'ADMINISTRADOR',
};

export const ESTADOS_TURNO = {
  RESERVADO: { label: 'Reservado', hint: 'Registra tus síntomas al llegar' },
  EN_ESPERA: { label: 'En espera', hint: 'Estás en la cola' },
  EN_ATENCION: { label: 'En atención', hint: 'Te están atendiendo' },
  ATENDIDO: { label: 'Atendido', hint: 'Atención terminada' },
  CANCELADO: { label: 'Cancelado', hint: 'Turno anulado' },
};

export const ESTADOS_ACTIVOS = ['RESERVADO', 'EN_ESPERA', 'EN_ATENCION'];

export const NIVELES_URGENCIA = {
  BAJO: { label: 'Baja', color: 'var(--u-bajo)' },
  MEDIO: { label: 'Media', color: 'var(--u-medio)' },
  ALTO: { label: 'Alta', color: 'var(--u-alto)' },
  CRITICO: { label: 'Crítica', color: 'var(--u-critico)' },
};

export const GRAVEDAD_A_NIVEL = { 1: 'BAJO', 2: 'MEDIO', 3: 'ALTO', 4: 'CRITICO' };

export const PAGE_SIZES = [10, 25, 50, 100];

/** Cuentas que crea el backend con DEMO_DATA=true, para la demo en vivo. */
export const CUENTAS_DEMO = [
  { rol: 'Paciente', email: 'paciente@turnoya.com', password: 'Paciente123' },
  { rol: 'Médico', email: 'medico@turnoya.com', password: 'Medico12345' },
  { rol: 'Admin', email: 'admin@turnoya.com', password: import.meta.env.VITE_DEMO_ADMIN_PASSWORD ?? 'Admin12345' },
];

export const POLLING_MS = 15000;
