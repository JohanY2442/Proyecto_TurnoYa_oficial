import { useCallback, useEffect, useRef, useState } from 'react';
import { getErrorMessage } from '../utils/errorMessages';

/**
 * Ejecuta `fetcher(signal)` cuando cambian `deps`. Cancela el request anterior
 * con AbortController. `refresh()` recarga sin mostrar el estado de carga
 * completo (para pull-to-refresh).
 */
export function useFetch(fetcher, deps = [], { enabled = true } = {}) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(enabled);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const fetcherRef = useRef(fetcher);
  useEffect(() => {
    fetcherRef.current = fetcher;
  });

  const ejecutar = useCallback(async (signal, silencioso) => {
    if (!silencioso) setLoading(true);
    setError(null);
    try {
      const resultado = await fetcherRef.current(signal);
      if (!signal?.aborted) setData(resultado);
    } catch (err) {
      const mensaje = getErrorMessage(err);
      if (mensaje && !signal?.aborted) setError(mensaje);
    } finally {
      if (!signal?.aborted) {
        setLoading(false);
        setRefreshing(false);
      }
    }
  }, []);

  useEffect(() => {
    if (!enabled) {
      setLoading(false);
      return undefined;
    }
    const controller = new AbortController();
    ejecutar(controller.signal, false);
    return () => controller.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, enabled]);

  const retry = useCallback(() => ejecutar(undefined, false), [ejecutar]);
  const refresh = useCallback(() => {
    setRefreshing(true);
    return ejecutar(undefined, true);
  }, [ejecutar]);

  return { data, setData, loading, refreshing, error, retry, refresh };
}
