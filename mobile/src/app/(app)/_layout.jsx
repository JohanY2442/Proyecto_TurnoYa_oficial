import { Redirect, Tabs } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useAuth } from '../../hooks/useAuth';
import { LoadingView } from '../../components/StateViews';
import { colors } from '../../theme/colors';
import { ROLES } from '../../utils/constants';

/** Pestañas de la app. Cada rol ve solo las que le sirven. */
export default function AppLayout() {
  const { status, user } = useAuth();
  if (status === 'checking') return <LoadingView />;
  if (status !== 'authenticated') return <Redirect href="/login" />;

  const esPaciente = user.rol === ROLES.PACIENTE;
  const esMedico = user.rol === ROLES.MEDICO;
  const icono = (name) =>
    function TabIcon({ color, size }) {
      return <Ionicons name={name} size={size} color={color} />;
    };

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.brand,
        tabBarInactiveTintColor: colors.inkSoft,
        tabBarStyle: { backgroundColor: colors.surface, borderTopColor: colors.line },
        tabBarLabelStyle: { fontWeight: '700' },
        headerStyle: { backgroundColor: colors.bg },
        headerTitleStyle: { fontWeight: '800', color: colors.ink },
        headerShadowVisible: false,
        sceneStyle: { backgroundColor: colors.bg },
      }}
    >
      <Tabs.Screen name="inicio" options={{ title: 'Inicio', tabBarIcon: icono('home-outline'), href: esMedico ? null : undefined }} />
      <Tabs.Screen name="turnos" options={{ title: 'Mis turnos', tabBarIcon: icono('ticket-outline'), href: esPaciente ? undefined : null }} />
      <Tabs.Screen name="escanear" options={{ title: 'Escanear', tabBarIcon: icono('qr-code-outline'), href: esMedico ? undefined : null }} />
      <Tabs.Screen name="perfil" options={{ title: 'Perfil', tabBarIcon: icono('person-circle-outline') }} />
    </Tabs>
  );
}
