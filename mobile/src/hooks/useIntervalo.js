import { useEffect, useRef } from 'react';
import { AppState } from 'react-native';

/** Ejecuta `callback` cada `ms` mientras la app está en primer plano. */
export function useIntervalo(callback, ms, activo = true) {
  const ref = useRef(callback);
  useEffect(() => {
    ref.current = callback;
  });

  useEffect(() => {
    if (!activo) return undefined;
    let id = setInterval(() => ref.current(), ms);
    const sub = AppState.addEventListener('change', (estado) => {
      clearInterval(id);
      if (estado === 'active') {
        ref.current();
        id = setInterval(() => ref.current(), ms);
      }
    });
    return () => {
      clearInterval(id);
      sub.remove();
    };
  }, [ms, activo]);
}
