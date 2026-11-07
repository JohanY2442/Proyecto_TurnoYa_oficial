import PropTypes from 'prop-types';
import { ESTADOS_TURNO } from '../../utils/constants';

const ESTILOS = {
  RESERVADO: 'bg-surface-2 text-ink',
  EN_ESPERA: 'bg-sun/25 text-ink',
  EN_ATENCION: 'bg-brand text-brand-ink',
  ATENDIDO: 'bg-brand-soft text-brand-strong',
  CANCELADO: 'bg-surface-2 text-ink-soft line-through',
};

export default function EstadoBadge({ estado }) {
  return (
    <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-bold ${ESTILOS[estado]}`}>
      {ESTADOS_TURNO[estado].label}
    </span>
  );
}

EstadoBadge.propTypes = { estado: PropTypes.oneOf(Object.keys(ESTADOS_TURNO)).isRequired };
