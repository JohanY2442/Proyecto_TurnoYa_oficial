import PropTypes from 'prop-types';
import { NIVELES_URGENCIA } from '../../utils/constants';

/** Nivel de urgencia con la escala de color del triage. */
export default function UrgenciaBadge({ nivel, size = 'md' }) {
  if (!nivel) return <span className="text-sm text-ink-soft">Sin triage</span>;
  const { label, color } = NIVELES_URGENCIA[nivel];
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full font-bold text-ink ${size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-sm'}`}
      style={{ backgroundColor: `color-mix(in srgb, ${color} 18%, transparent)` }}
    >
      <span aria-hidden="true" className="size-2 rounded-full" style={{ backgroundColor: color }} />
      Urgencia {label.toLowerCase()}
    </span>
  );
}

UrgenciaBadge.propTypes = {
  nivel: PropTypes.oneOf(Object.keys(NIVELES_URGENCIA)),
  size: PropTypes.oneOf(['sm', 'md']),
};
