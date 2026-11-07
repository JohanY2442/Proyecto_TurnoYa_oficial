import PropTypes from 'prop-types';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { PageLoader } from '../components/layout/AppLayout';

/** Login y registro: si ya hay sesión, no tiene sentido mostrarlos. */
export default function PublicOnlyRoute({ children }) {
  const { status } = useAuth();
  if (status === 'checking') return <PageLoader />;
  if (status === 'authenticated') return <Navigate to="/dashboard" replace />;
  return children;
}

PublicOnlyRoute.propTypes = { children: PropTypes.node.isRequired };
