import { View } from 'react-native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import { AuthProvider } from '../contexts/AuthContext';
import OfflineBanner from '../components/OfflineBanner';
import { useSinConexion } from '../hooks/useConexion';
import { colors } from '../theme/colors';

function Contenido() {
  const insets = useSafeAreaInsets();
  const sinConexion = useSinConexion();
  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      {sinConexion && <View style={{ height: insets.top, backgroundColor: colors.sun }} />}
      <OfflineBanner />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: colors.bg },
          headerTintColor: colors.ink,
          headerTitleStyle: { fontWeight: '800' },
          headerShadowVisible: false,
          contentStyle: { backgroundColor: colors.bg },
          headerBackButtonDisplayMode: 'minimal',
        }}
      >
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="login" options={{ headerShown: false }} />
        <Stack.Screen name="registro" options={{ title: 'Crear cuenta' }} />
        <Stack.Screen name="(app)" options={{ headerShown: false }} />
        <Stack.Screen name="centro/[id]" options={{ title: 'Centro de salud' }} />
        <Stack.Screen name="turno/[id]" options={{ title: 'Mi turno' }} />
      </Stack>
    </View>
  );
}

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <StatusBar style="dark" />
        <Contenido />
      </AuthProvider>
    </SafeAreaProvider>
  );
}
