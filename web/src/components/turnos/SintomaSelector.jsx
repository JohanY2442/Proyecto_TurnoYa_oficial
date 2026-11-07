import PropTypes from 'prop-types';
import { Check } from 'lucide-react';
import { GRAVEDAD_A_NIVEL, NIVELES_URGENCIA } from '../../utils/constants';

/** Lista de síntomas para marcar, ordenada de más grave a más leve. */
export default function SintomaSelector({ sintomas, seleccionados, onChange, disabled = false }) {
  const toggle = (codigo) =>
    onChange(seleccionados.includes(codigo) ? seleccionados.filter((s) => s !== codigo) : [...seleccionados, codigo]);

  const ordenados = [...sintomas].sort((a, b) => b.gravedad - a.gravedad);

  return (
    <fieldset disabled={disabled}>
      <legend className="sr-only">Síntomas</legend>
      <div className="grid gap-2 sm:grid-cols-2">
        {ordenados.map((s) => {
          const activo = seleccionados.includes(s.codigo);
          const color = NIVELES_URGENCIA[GRAVEDAD_A_NIVEL[s.gravedad]].color;
          return (
            <label
              key={s.codigo}
              className={`flex cursor-pointer items-center gap-3 rounded-xl border px-4 py-3 transition-colors ${
                activo ? 'border-brand bg-brand-soft' : 'border-line bg-surface hover:bg-surface-2'
              }`}
            >
              <input type="checkbox" className="sr-only" checked={activo} onChange={() => toggle(s.codigo)} />
              <span
                aria-hidden="true"
                className={`grid size-5 place-items-center rounded-md border ${activo ? 'border-brand bg-brand text-brand-ink' : 'border-line'}`}
              >
                {activo && <Check size={14} strokeWidth={3} />}
              </span>
              <span className="flex-1">{s.etiqueta}</span>
              <span aria-hidden="true" className="size-2.5 rounded-full" style={{ backgroundColor: color }} />
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}

SintomaSelector.propTypes = {
  sintomas: PropTypes.arrayOf(
    PropTypes.shape({ codigo: PropTypes.string.isRequired, etiqueta: PropTypes.string.isRequired, gravedad: PropTypes.number.isRequired }),
  ).isRequired,
  seleccionados: PropTypes.arrayOf(PropTypes.string).isRequired,
  onChange: PropTypes.func.isRequired,
  disabled: PropTypes.bool,
};
