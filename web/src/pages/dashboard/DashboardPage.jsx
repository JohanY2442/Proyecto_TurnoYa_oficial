import { useAuth } from '../../hooks/useAuth';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { ROLES } from '../../utils/constants';
import PacienteDashboard from './PacienteDashboard';
import MedicoDashboard from './MedicoDashboard';
import AdminDashboard from './AdminDashboard';

/** Cada rol ve un panel distinto con lo que necesita hacer primero. */
export default function DashboardPage() {
  useDocumentTitle('Panel');
  const { user } = useAuth();
  if (user.rol === ROLES.MEDICO) return <MedicoDashboard />;
  if (user.rol === ROLES.ADMIN) return <AdminDashboard />;
  return <PacienteDashboard />;
}
