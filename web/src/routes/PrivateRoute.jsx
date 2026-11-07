import PropTypes from 'prop-types';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { PageLoader } from '../components/layout/AppLayout';

/**
 * Protege una ruta: sin sesión manda al login (y vuelve después);
 * con sesión pero sin el rol permitido, manda al inicio.
 */
export default function PrivateRoute({ children, roles }) {
  const { status, user } = useAuth();
  const location = useLocation();

  if (status === 'checking') return <PageLoader />;
  if (status !== 'authenticated') {
    return <Navigate to={`/login?redirect=${encodeURIComponent(location.pathname + location.search)}`} replace />;
  }
  if (roles && !roles.includes(user.rol)) return <Navigate to="/dashboard" replace />;
  return children;
}

PrivateRoute.propTypes = { children: PropTypes.node.isRequired, roles: PropTypes.arrayOf(PropTypes.string) };
