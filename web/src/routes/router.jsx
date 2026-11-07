import { lazy } from 'react';
import { createBrowserRouter } from 'react-router-dom';
import AppLayout from '../components/layout/AppLayout';
import PrivateRoute from './PrivateRoute';
import PublicOnlyRoute from './PublicOnlyRoute';
import RouteError from './RouteError';
import { ROLES } from '../utils/constants';
import { codigoTurno } from '../utils/formatters';

// Cada página se descarga recién cuando se visita (code splitting).
const LandingPage = lazy(() => import('../pages/LandingPage'));
const LoginPage = lazy(() => import('../pages/LoginPage'));
const RegisterPage = lazy(() => import('../pages/RegisterPage'));
const DashboardPage = lazy(() => import('../pages/dashboard/DashboardPage'));
const CentrosPage = lazy(() => import('../pages/CentrosPage'));
const CentroDetailPage = lazy(() => import('../pages/CentroDetailPage'));
const TurnosPage = lazy(() => import('../pages/TurnosPage'));
const TurnoDetailPage = lazy(() => import('../pages/TurnoDetailPage'));
const PerfilPage = lazy(() => import('../pages/PerfilPage'));
const CentrosAdminPage = lazy(() => import('../pages/admin/CentrosAdminPage'));
const EspecialidadesPage = lazy(() => import('../pages/admin/EspecialidadesPage'));
const PersonasPage = lazy(() => import('../pages/admin/PersonasPage'));
const NotFoundPage = lazy(() => import('../pages/NotFoundPage'));

const TODOS = [ROLES.PACIENTE, ROLES.MEDICO, ROLES.ADMIN];
const privada = (element, roles = TODOS) => <PrivateRoute roles={roles}>{element}</PrivateRoute>;

/** Todas las rutas de la app en un solo lugar. `handle.crumb` alimenta las migas de pan. */
export const router = createBrowserRouter([
  {
    element: <AppLayout />,
    errorElement: <RouteError />,
    handle: { crumb: 'Inicio' },
    children: [
      { index: true, element: <LandingPage /> },
      { path: 'login', element: <PublicOnlyRoute><LoginPage /></PublicOnlyRoute> },
      { path: 'registro', element: <PublicOnlyRoute><RegisterPage /></PublicOnlyRoute> },
      { path: 'dashboard', element: privada(<DashboardPage />), handle: { crumb: 'Panel' } },
      {
        path: 'centros',
        handle: { crumb: 'Centros' },
        children: [
          { index: true, element: <CentrosPage /> },
          { path: ':id', element: <CentroDetailPage />, handle: { crumb: 'Detalle del centro' } },
        ],
      },
      {
        path: 'turnos',
        handle: { crumb: 'Mis turnos' },
        children: [
          { index: true, element: privada(<TurnosPage />, [ROLES.PACIENTE]) },
          { path: ':id', element: privada(<TurnoDetailPage />), handle: { crumb: (params) => codigoTurno(params.id) } },
        ],
      },
      { path: 'perfil', element: privada(<PerfilPage />), handle: { crumb: 'Mi perfil' } },
      {
        path: 'admin',
        handle: { crumb: 'Administración' },
        children: [
          { path: 'centros', element: privada(<CentrosAdminPage />, [ROLES.ADMIN]), handle: { crumb: 'Centros' } },
          { path: 'especialidades', element: privada(<EspecialidadesPage />, [ROLES.ADMIN]), handle: { crumb: 'Especialidades' } },
          { path: 'personas', element: privada(<PersonasPage />, [ROLES.ADMIN]), handle: { crumb: 'Personas' } },
        ],
      },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
]);
