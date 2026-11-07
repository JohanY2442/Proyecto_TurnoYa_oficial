import { useCallback, useState } from 'react';

const MENSAJES = {
  1: 'Permiso de ubicación denegado. Puedes buscar el centro por nombre.',
  2: 'No pudimos obtener tu ubicación. Intenta de nuevo.',
  3: 'La ubicación tardó demasiado. Intenta de nuevo.',
};

export function useGeolocation() {
  const [coords, setCoords] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const solicitar = useCallback(() => {
    if (!('geolocation' in navigator)) {
      setError('Tu navegador no permite obtener la ubicación.');
      return;
    }
    setLoading(true);
    setError(null);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCoords({ latitud: pos.coords.latitude, longitud: pos.coords.longitude });
        setLoading(false);
      },
      (err) => {
        setError(MENSAJES[err.code] ?? MENSAJES[2]);
        setLoading(false);
      },
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 60000 },
    );
  }, []);

  const limpiar = useCallback(() => {
    setCoords(null);
    setError(null);
  }, []);

  return { coords, loading, error, solicitar, limpiar };
}
