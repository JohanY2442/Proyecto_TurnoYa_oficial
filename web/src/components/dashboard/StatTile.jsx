import PropTypes from 'prop-types';

/** Un número clave del día con su etiqueta. */
export default function StatTile({ label, value, detail }) {
  return (
    <div className="rounded-2xl border border-line bg-surface px-5 py-4">
      <p className="text-sm text-ink-soft">{label}</p>
      <p className="mt-1 font-display text-4xl font-extrabold tabular-nums">{value}</p>
      {detail && <p className="mt-1 text-sm text-ink-soft">{detail}</p>}
    </div>
  );
}

StatTile.propTypes = {
  label: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  detail: PropTypes.string,
};
