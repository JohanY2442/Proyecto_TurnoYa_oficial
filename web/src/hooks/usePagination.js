import { useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { PAGE_SIZES } from '../utils/constants';

/**
 * Guarda la paginación (y otros filtros) en la URL: ?page=2&size=25&search=...
 * Así se puede compartir el enlace o volver atrás sin perder la página.
 * En la URL la página empieza en 1; para el backend se convierte a base 0.
 */
export function usePagination({ defaultSize = 10 } = {}) {
  const [searchParams, setSearchParams] = useSearchParams();

  const pageParam = Number.parseInt(searchParams.get('page') ?? '1', 10);
  const sizeParam = Number.parseInt(searchParams.get('size') ?? String(defaultSize), 10);
  const page = Number.isNaN(pageParam) || pageParam < 1 ? 0 : pageParam - 1;
  const size = PAGE_SIZES.includes(sizeParam) ? sizeParam : defaultSize;

  const update = useCallback(
    (cambios, { resetPage = false } = {}) => {
      setSearchParams((prev) => {
        const next = new URLSearchParams(prev);
        Object.entries(cambios).forEach(([key, value]) => {
          if (value === undefined || value === null || value === '') next.delete(key);
          else next.set(key, String(value));
        });
        if (resetPage) next.delete('page');
        return next;
      });
    },
    [setSearchParams],
  );

  const setPage = useCallback((p) => update({ page: p + 1 }), [update]);
  const setSize = useCallback((s) => update({ size: s }, { resetPage: true }), [update]);
  const getParam = useCallback((key) => searchParams.get(key) ?? '', [searchParams]);
  const setFilter = useCallback((key, value) => update({ [key]: value }, { resetPage: true }), [update]);

  return useMemo(
    () => ({ page, size, setPage, setSize, getParam, setFilter }),
    [page, size, setPage, setSize, getParam, setFilter],
  );
}
