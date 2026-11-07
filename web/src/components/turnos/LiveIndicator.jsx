import PropTypes from 'prop-types';

const TEXTOS = {
  live: 'En vivo',
  polling: 'Actualiza cada 15 s',
  off: 'Sin conexión en vivo',
};

export default function LiveIndicator({ modo }) {
  return (
    <span className="inline-flex items-center gap-2 text-sm text-ink-soft" aria-live="polite">
      <span
        aria-hidden="true"
        className={`size-2.5 rounded-full ${modo === 'live' ? 'live-dot bg-u-bajo' : modo === 'polling' ? 'bg-u-medio' : 'bg-line'}`}
      />
      {TEXTOS[modo]}
    </span>
  );
}

LiveIndicator.propTypes = { modo: PropTypes.oneOf(['live', 'polling', 'off']).isRequired };
