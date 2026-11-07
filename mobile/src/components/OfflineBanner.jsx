import { StyleSheet, Text, View } from 'react-native';
import { useSinConexion } from '../hooks/useConexion';
import { colors } from '../theme/colors';

/** Aviso fijo cuando el celular se queda sin internet. */
export default function OfflineBanner() {
  const sinConexion = useSinConexion();
  if (!sinConexion) return null;
  return (
    <View style={styles.banner} accessibilityLiveRegion="polite">
      <Text style={styles.text}>Sin conexión. Mostramos lo último que cargó; se actualizará al volver la señal.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: { backgroundColor: colors.sun, paddingVertical: 8, paddingHorizontal: 16 },
  text: { color: colors.ink, fontWeight: '700', fontSize: 13 },
});
