const LOCALE = 'es-PE';

export const codigoTurno = (id) => `T-${String(id).padStart(5, '0')}`;

export const formatFechaHora = (iso) => {
  if (!iso) return '';
  const d = new Date(iso);
  return `${d.toLocaleDateString(LOCALE, { day: 'numeric', month: 'short' })}, ${formatHora(iso)}`;
};

export const formatHora = (iso) => {
  if (!iso) return '';
  const d = new Date(iso);
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
};

export const formatMinutos = (min) => {
  if (min == null) return '';
  if (min < 1) return 'Ya casi';
  if (min < 60) return `${min} min`;
  const h = Math.floor(min / 60);
  const m = min % 60;
  return m ? `${h} h ${m} min` : `${h} h`;
};

/** LocalDateTime para el backend (hora local, sin zona): 2026-11-10T09:30:00 */
export const toLocalDateTime = (date) => {
  const p = (n) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${p(date.getMonth() + 1)}-${p(date.getDate())}T${p(date.getHours())}:${p(date.getMinutes())}:00`;
};
