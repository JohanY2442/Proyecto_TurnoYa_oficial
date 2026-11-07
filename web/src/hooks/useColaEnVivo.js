import { useEffect, useRef, useState } from 'react';
import { colaService } from '../services/colaService';
import { POLLING_MS } from '../utils/constants';

/**
 * Avisa cuando una cola (centro + especialidad) cambia.
 * Usa Server-Sent Events; si la conexión falla, cae a polling cada 15 s.
 * Devuelve el modo actual: 'live' | 'polling' | 'off'.
 */
export function useColaEnVivo(centroId, especialidadId, onCambio) {
  const [modo, setModo] = useState('off');
  const callbackRef = useRef(onCambio);
  useEffect(() => {
    callbackRef.current = onCambio;
  });

  useEffect(() => {
    if (!centroId || !especialidadId) {
      setModo('off');
      return undefined;
    }
    let pollingId = null;
    const iniciarPolling = () => {
      if (pollingId) return;
      setModo('polling');
      pollingId = setInterval(() => callbackRef.current?.(), POLLING_MS);
    };

    if (typeof EventSource === 'undefined') {
      iniciarPolling();
      return () => clearInterval(pollingId);
    }

    const source = new EventSource(colaService.streamUrl(centroId, especialidadId));
    source.addEventListener('conectado', () => setModo('live'));
    source.addEventListener('cola-actualizada', () => callbackRef.current?.());
    source.onerror = () => {
      source.close();
      iniciarPolling();
    };

    return () => {
      source.close();
      if (pollingId) clearInterval(pollingId);
    };
  }, [centroId, especialidadId]);

  return modo;
}
