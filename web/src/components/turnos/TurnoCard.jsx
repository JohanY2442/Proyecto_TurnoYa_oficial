import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { codigoTurno, formatFechaHora } from '../../utils/formatters';
import { NIVELES_URGENCIA } from '../../utils/constants';
import EstadoBadge from './EstadoBadge';

/** Fila de la lista de turnos. Toda la fila es un enlace al detalle. */
export default function TurnoCard({ turno }) {
  const color = turno.nivelUrgencia ? NIVELES_URGENCIA[turno.nivelUrgencia].color : 'transparent';
  return (
    <Link
      to={`/turnos/${turno.id}`}
      className="group grid grid-cols-[auto_1fr_auto] items-center gap-4 rounded-2xl border border-line bg-surface px-5 py-4 transition-colors hover:border-brand"
    >
      <span aria-hidden="true" className="h-10 w-1.5 rounded-full" style={{ backgroundColor: color }} />
      <div className="min-w-0">
        <p className="font-display text-lg font-bold">
          {codigoTurno(turno.id)} <span className="font-sans text-base font-normal text-ink-soft">{turno.especialidad}</span>
        </p>
        <p className="truncate text-sm text-ink-soft">
          {turno.centro}, {formatFechaHora(turno.fechaHora)}
        </p>
      </div>
      <EstadoBadge estado={turno.estado} />
    </Link>
  );
}

TurnoCard.propTypes = {
  turno: PropTypes.shape({
    id: PropTypes.number.isRequired,
    especialidad: PropTypes.string,
    centro: PropTypes.string,
    fechaHora: PropTypes.string,
    estado: PropTypes.string.isRequired,
    nivelUrgencia: PropTypes.string,
  }).isRequired,
};
