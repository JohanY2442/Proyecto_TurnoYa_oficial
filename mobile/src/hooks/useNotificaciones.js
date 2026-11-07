import { useCallback, useEffect } from 'react';
import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';

// Mostrar la notificación aunque la app esté abierta.
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

/** Notificaciones locales para avisar que el turno está cerca. */
export function useNotificaciones() {
  useEffect(() => {
    if (Platform.OS === 'android') {
      Notifications.setNotificationChannelAsync('turnos', {
        name: 'Avisos de turno',
        importance: Notifications.AndroidImportance.HIGH,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#0B6E5F',
      }).catch(() => {});
    }
  }, []);

  const pedirPermiso = useCallback(async () => {
    if (Platform.OS === 'web') return false;
    const actual = await Notifications.getPermissionsAsync();
    if (actual.granted) return true;
    const nuevo = await Notifications.requestPermissionsAsync({ ios: { allowAlert: true, allowSound: true } });
    return nuevo.granted;
  }, []);

  const avisar = useCallback(async (title, body) => {
    if (Platform.OS === 'web') return;
    try {
      await Notifications.scheduleNotificationAsync({ content: { title, body, sound: true }, trigger: null });
    } catch {
      /* sin permiso: la pantalla ya muestra el aviso */
    }
  }, []);

  return { pedirPermiso, avisar };
}
