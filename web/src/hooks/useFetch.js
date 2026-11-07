import { useCallback, useEffect, useRef, useState } from 'react';
import { getErrorMessage } from '../utils/errorMessages';

/**
 * Ejecuta `fetcher(signal)` cada vez que cambian `deps`.
 * Cancela el request anterior con AbortController (evita actualizar el estado
 * de un componente que ya se desmontó o mostrar datos de una búsqueda vieja).
 *
 * @param {(signal: AbortSignal) => Promise<any>} fetcher
 * @param {Array} deps
 * @param {{ enabled?: boolean }} options
 */
export function useFetch(fetcher, deps = [], { enabled = true } = {}) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(enabled);
  const [error, setError] = useState(null);
  const [errorObj, setErrorObj] = useState(null);
  const [version, setVersion] = useState(0);
  const fetcherRef = useRef(fetcher);
  useEffect(() => {
    fetcherRef.current = fetcher;
  });

  useEffect(() => {
    if (!enabled) {
      setLoading(false);
      return undefined;
    }
    const controller = new AbortController();
    setLoading(true);
    setError(null);
    fetcherRef
      .current(controller.signal)
      .then((resultado) => {
        if (!controller.signal.aborted) setData(resultado);
      })
      .catch((err) => {
        const mensaje = getErrorMessage(err);
        if (mensaje && !controller.signal.aborted) {
          setError(mensaje);
          setErrorObj(err);
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, enabled, version]);

  const retry = useCallback(() => setVersion((v) => v + 1), []);

  return { data, setData, loading, error, errorObj, retry };
}
