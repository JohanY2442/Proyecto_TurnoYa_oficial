# TurnoYa Mobile

App móvil de **TurnoYa** (CS2031 Desarrollo Basado en Plataformas, UTEC 2026-2) con Expo y React Native. Vive en la carpeta `mobile/` del repositorio y consume la API REST del backend (raíz del repo).

**Expo:** _(pegar aquí el enlace de EAS Update o del APK)_

## Cómo correrlo

```bash
cd mobile
npm install
cp .env.example .env     # pon en EXPO_PUBLIC_API_URL la URL del backend
npx expo start           # escanea el QR con Expo Go (SDK 57)
```

En el celular no sirve `localhost`: usa la URL HTTPS del backend desplegado o la IP de tu PC en la misma red Wi-Fi.

## Qué hace

| Rol | Pantallas |
|---|---|
| Paciente | Centros cercanos (GPS + mapa), detalle y reserva, triage, posición en la cola con notificación, mis turnos (paginado infinito), perfil |
| Médico | Escanear el QR del ticket del paciente (cámara) y atenderlo o finalizar la atención |

## Sensores y APIs externas

- **GPS** (`expo-location`): ordena los centros por distancia. Sin permiso o con el GPS apagado, muestra todos los centros y un mensaje claro.
- **Cámara** (`expo-camera`): el médico escanea el QR del ticket. Sin cámara o sin permiso, puede escribir el código del ticket.
- **Mapas** (`react-native-maps`): Google Maps en Android y Apple Maps en iOS.
- **Notificaciones locales** (`expo-notifications`): avisan cuando quedan 1 o 0 personas adelante y cuando empieza la atención.

## Estructura

```
src/
  app/          rutas de Expo Router: login, registro, (app)/ con las pestañas, centro/[id], turno/[id]
  services/     api.js (axios + interceptores), tokenStorage (SecureStore) y un servicio por recurso
  contexts/     AuthContext
  hooks/        useAuth, useFetch, useUbicacion, useNotificaciones, useIntervalo, useConexion
  components/   Button, TextField, Card, Chip, TurnoTicket, TurnoItem, CentroItem, CentrosMap, SintomaChips, StateViews, OfflineBanner
  theme/        colores compartidos con la web
  utils/        errorMessages, formatters, constants
```
