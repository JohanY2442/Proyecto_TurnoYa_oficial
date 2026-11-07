import PropTypes from 'prop-types';
import { formatHora } from '../../utils/formatters';
import { NIVELES_URGENCIA } from '../../utils/constants';
import UrgenciaBadge from './UrgenciaBadge';

/** Cola de atención ordenada por urgencia y hora de llegada (vista del médico). */
export default function ColaList({ items }) {
  return (
    <ol className="divide-y divide-line overflow-hidden rounded-2xl border border-line bg-surface">
      {items.map((item) => (
        <li key={item.turnoId} className="flex items-center gap-4 px-4 py-3">
          <span
            className="grid size-10 shrink-0 place-items-center rounded-full border-[3px] font-display text-lg font-extrabold text-ink"
            style={{ borderColor: item.nivelUrgencia ? NIVELES_URGENCIA[item.nivelUrgencia].color : 'var(--line)' }}
          >
            {item.posicion}
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate font-bold">{item.paciente}</p>
            <p className="text-sm text-ink-soft">Reservó para las {formatHora(item.fechaHora)}</p>
          </div>
          <UrgenciaBadge nivel={item.nivelUrgencia} size="sm" />
        </li>
      ))}
    </ol>
  );
}

ColaList.propTypes = {
  items: PropTypes.arrayOf(
    PropTypes.shape({
      posicion: PropTypes.number.isRequired,
      turnoId: PropTypes.number.isRequired,
      paciente: PropTypes.string.isRequired,
      nivelUrgencia: PropTypes.string,
      fechaHora: PropTypes.string,
    }),
  ).isRequired,
};
