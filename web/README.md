# TurnoYa Web

Frontend web de **TurnoYa** (CS2031 Desarrollo Basado en Plataformas, UTEC 2026-2). Vive en la carpeta `web/` del repositorio y consume la API REST del backend (raíz del repo).

**Deploy:** _(pegar aquí la URL de Vercel)_

## Cómo correrlo

```bash
cd web
npm install
cp .env.example .env      # y pon la URL del backend en VITE_API_URL
npm run dev               # http://localhost:5173
npm run build             # versión de producción en dist/
```

| Variable | Uso |
|---|---|
| `VITE_API_URL` | URL del backend con `/api/v1` (ej. `https://turnoya.duckdns.org/api/v1`) |
| `VITE_DEMO_ADMIN_PASSWORD` | Opcional. Contraseña del admin para el botón de "cuentas de prueba" del login |

## Tecnologías

React 19 + Vite, React Router (rutas lazy), axios, react-hook-form, Tailwind CSS 4, recharts (gráficos), react-leaflet + OpenStreetMap (mapa, sin API key), react-hot-toast, lucide-react, qrcode.react y PropTypes.

## Estructura

```
src/
  services/    api.js (axios + interceptores: token, refresh, reintentos) y un servicio por recurso
  contexts/    AuthContext (useReducer) y ThemeContext (modo oscuro)
  hooks/       useAuth, useFetch (AbortController), usePagination (estado en la URL),
               useDebounce, useColaEnVivo (SSE con respaldo de polling), useGeolocation
  components/  ui/ (Button, Input, Select, Card, Modal, ConfirmDialog, Pagination, Tabs, Skeleton, EmptyState...)
               layout/ (AppLayout, Navbar, Breadcrumbs, ErrorBoundary)
               turnos/, centros/, dashboard/ (componentes del dominio)
  pages/       Landing, Login, Registro, Panel (paciente/médico/admin), Centros, Detalle de centro,
               Mis turnos, Detalle de turno, Perfil, Admin (centros, especialidades, personas), 404
  routes/      router.jsx (todas las rutas), PrivateRoute, PublicOnlyRoute
  utils/       errorMessages, formatters, constants
```

## Decisiones

- **Token:** el access token vive solo en memoria y el refresh token en `sessionStorage` (se borra al cerrar la pestaña). Ante un 401 el interceptor renueva el token una sola vez y repite el request.
- **Paginación:** la página, el tamaño y los filtros viven en la URL (`/centros?page=2&size=25&search=barranco`), así un enlace se puede compartir.
- **Cola en tiempo real:** el médico y el paciente se suscriben por Server-Sent Events. Si la conexión falla, la app cambia sola a consultar cada 15 segundos.
- **Errores:** cada código HTTP tiene un mensaje entendible; las lecturas se reintentan ante errores de red; los botones se deshabilitan mientras se envía.
