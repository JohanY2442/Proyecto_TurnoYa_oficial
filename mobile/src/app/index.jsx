import { Redirect } from 'expo-router';
import { useAuth } from '../hooks/useAuth';
import { LoadingView } from '../components/StateViews';
import { ROLES } from '../utils/constants';

/** Punto de entrada: decide a dónde ir según la sesión y el rol. */
export default function Index() {
  const { status, user } = useAuth();
  if (status === 'checking') return <LoadingView />;
  if (status !== 'authenticated') return <Redirect href="/login" />;
  return <Redirect href={user.rol === ROLES.MEDICO ? '/escanear' : '/inicio'} />;
}
