import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { MapPin } from 'lucide-react';

export default function CentroCard({ centro, distanciaKm }) {
  const especialidades = centro.especialidades ?? [];
  return (
    <Link
      to={`/centros/${centro.id}`}
      className="flex flex-col gap-2 rounded-2xl border border-line bg-surface p-5 transition-colors hover:border-brand"
    >
      <div className="flex items-start justify-between gap-3">
        <h3 className="text-lg font-bold">{centro.nombre}</h3>
        {distanciaKm != null && (
          <span className="shrink-0 rounded-full bg-brand-soft px-2.5 py-0.5 text-sm font-bold text-brand-strong">
            {distanciaKm.toFixed(1)} km
          </span>
        )}
      </div>
      <p className="flex items-center gap-1.5 text-sm text-ink-soft">
        <MapPin aria-hidden="true" size={15} /> {centro.direccion}
      </p>
      {especialidades.length > 0 && (
        <ul className="mt-1 flex flex-wrap gap-1.5" aria-label="Especialidades">
          {especialidades.map((e) => (
            <li key={e.id} className="rounded-md bg-surface-2 px-2 py-0.5 text-xs">
              {e.nombre}
            </li>
          ))}
        </ul>
      )}
    </Link>
  );
}

CentroCard.propTypes = {
  centro: PropTypes.shape({
    id: PropTypes.number.isRequired,
    nombre: PropTypes.string.isRequired,
    direccion: PropTypes.string,
    especialidades: PropTypes.arrayOf(PropTypes.shape({ id: PropTypes.number, nombre: PropTypes.string })),
  }).isRequired,
  distanciaKm: PropTypes.number,
};
