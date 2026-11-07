const LOCALE = 'es-PE';

export const formatFechaHora = (iso) =>
  iso
    ? new Intl.DateTimeFormat(LOCALE, { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(iso))
    : '';

export const formatFecha = (iso) =>
  iso ? new Intl.DateTimeFormat(LOCALE, { dateStyle: 'long' }).format(new Date(iso)) : '';

export const formatHora = (iso) =>
  iso ? new Intl.DateTimeFormat(LOCALE, { timeStyle: 'short' }).format(new Date(iso)) : '';

/** Código visible del turno, igual al que llega en los correos (T-00012). */
export const codigoTurno = (id) => `T-${String(id).padStart(5, '0')}`;

export const formatMinutos = (min) => {
  if (min == null) return '';
  if (min < 1) return 'Ya casi';
  if (min < 60) return `${min} min`;
  const h = Math.floor(min / 60);
  const m = min % 60;
  return m ? `${h} h ${m} min` : `${h} h`;
};

/** Valor para <input type="datetime-local"> en hora local. */
export const toDateTimeLocal = (date) => {
  const pad = (n) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
};

export const hoyISO = () => toDateTimeLocal(new Date()).slice(0, 10);
