import PropTypes from 'prop-types';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { PAGE_SIZES } from '../../utils/constants';

/** Números de página a mostrar: 1 … 4 5 [6] 7 8 … 20 */
const paginasVisibles = (actual, total) => {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i);
  const set = new Set([0, total - 1, actual - 1, actual, actual + 1]);
  const lista = [...set].filter((p) => p >= 0 && p < total).sort((a, b) => a - b);
  const conHuecos = [];
  lista.forEach((p, i) => {
    if (i > 0 && p - lista[i - 1] > 1) conHuecos.push(`gap-${p}`);
    conHuecos.push(p);
  });
  return conHuecos;
};

export default function Pagination({ page, size, totalPages, totalElements, onPageChange, onSizeChange }) {
  if (totalElements === 0) return null;
  const desde = page * size + 1;
  const hasta = Math.min((page + 1) * size, totalElements);
  const botonBase = 'grid h-9 min-w-9 place-items-center rounded-[10px] px-2 text-sm font-bold transition-colors';

  return (
    <nav aria-label="Paginación" className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-sm text-ink-soft" aria-live="polite">
        Mostrando {desde}–{hasta} de {totalElements}
      </p>
      <div className="flex flex-wrap items-center gap-1">
        <button
          type="button"
          onClick={() => onPageChange(page - 1)}
          disabled={page === 0}
          aria-label="Página anterior"
          className={`${botonBase} text-ink hover:bg-surface-2 disabled:opacity-40`}
        >
          <ChevronLeft size={18} />
        </button>
        {paginasVisibles(page, totalPages).map((p) =>
          typeof p === 'string' ? (
            <span key={p} className="px-1 text-ink-soft">
              …
            </span>
          ) : (
            <button
              key={p}
              type="button"
              onClick={() => onPageChange(p)}
              aria-current={p === page ? 'page' : undefined}
              className={`${botonBase} ${p === page ? 'bg-brand text-brand-ink' : 'text-ink hover:bg-surface-2'}`}
            >
              {p + 1}
            </button>
          ),
        )}
        <button
          type="button"
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages - 1}
          aria-label="Página siguiente"
          className={`${botonBase} text-ink hover:bg-surface-2 disabled:opacity-40`}
        >
          <ChevronRight size={18} />
        </button>
        {onSizeChange && (
          <label className="ml-3 flex items-center gap-2 text-sm text-ink-soft">
            Por página
            <select
              value={size}
              onChange={(e) => onSizeChange(Number(e.target.value))}
              className="h-9 rounded-[10px] border border-line bg-surface px-2 text-ink"
            >
              {PAGE_SIZES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </label>
        )}
      </div>
    </nav>
  );
}

Pagination.propTypes = {
  page: PropTypes.number.isRequired,
  size: PropTypes.number.isRequired,
  totalPages: PropTypes.number.isRequired,
  totalElements: PropTypes.number.isRequired,
  onPageChange: PropTypes.func.isRequired,
  onSizeChange: PropTypes.func,
};
