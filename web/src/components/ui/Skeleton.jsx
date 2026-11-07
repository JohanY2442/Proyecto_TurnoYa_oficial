import PropTypes from 'prop-types';

/** Bloques grises mientras carga una lista, para que la página no salte al llegar los datos. */
export default function Skeleton({ rows = 3, height = 'h-20' }) {
  return (
    <div className="space-y-3" aria-busy="true" aria-label="Cargando">
      {Array.from({ length: rows }, (_, i) => (
        <div key={i} className={`${height} animate-pulse rounded-2xl bg-surface-2`} />
      ))}
    </div>
  );
}

Skeleton.propTypes = { rows: PropTypes.number, height: PropTypes.string };
