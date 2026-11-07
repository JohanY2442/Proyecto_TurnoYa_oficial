import { useCallback, useState } from 'react';
import * as Location from 'expo-location';

/**
 * GPS del celular. Si el permiso se niega o el GPS está apagado, devuelve un
 * mensaje claro y la pantalla sigue funcionando con la lista normal de centros.
 */
export function useUbicacion() {
  const [coords, setCoords] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const solicitar = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setError('Sin permiso de ubicación. Te mostramos todos los centros; puedes activarlo en Ajustes.');
        return null;
      }
      if (!(await Location.hasServicesEnabledAsync())) {
        setError('Tu GPS está apagado. Actívalo para ver los centros más cercanos.');
        return null;
      }
      const ultima = await Location.getLastKnownPositionAsync();
      const pos = ultima ?? (await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced }));
      const nuevas = { latitud: pos.coords.latitude, longitud: pos.coords.longitude };
      setCoords(nuevas);
      return nuevas;
    } catch {
      setError('No pudimos obtener tu ubicación. Te mostramos todos los centros.');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return { coords, loading, error, solicitar, limpiar: () => setCoords(null) };
}
