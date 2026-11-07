import PropTypes from 'prop-types';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { colors, radius } from '../theme/colors';

export default function CentroItem({ centro, onPress }) {
  return (
    <Pressable onPress={onPress} accessibilityRole="button" style={({ pressed }) => [styles.item, pressed && { opacity: 0.8 }]}>
      <View style={{ flex: 1 }}>
        <Text style={styles.nombre}>{centro.nombre}</Text>
        <View style={styles.row}>
          <Ionicons name="location-outline" size={14} color={colors.inkSoft} />
          <Text style={styles.dir} numberOfLines={1}>
            {centro.direccion}
          </Text>
        </View>
      </View>
      {centro.distanciaKm != null ? (
        <View style={styles.km}>
          <Text style={styles.kmText}>{centro.distanciaKm.toFixed(1)} km</Text>
        </View>
      ) : (
        <Ionicons name="chevron-forward" size={20} color={colors.inkSoft} />
      )}
    </Pressable>
  );
}

CentroItem.propTypes = {
  centro: PropTypes.shape({ id: PropTypes.number, nombre: PropTypes.string, direccion: PropTypes.string, distanciaKm: PropTypes.number }).isRequired,
  onPress: PropTypes.func,
};

const styles = StyleSheet.create({
  item: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: colors.surface, borderRadius: radius.md, borderWidth: 1, borderColor: colors.line, padding: 14 },
  nombre: { fontSize: 16, fontWeight: '700', color: colors.ink },
  row: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 },
  dir: { flex: 1, fontSize: 13, color: colors.inkSoft },
  km: { backgroundColor: colors.brandSoft, borderRadius: 999, paddingHorizontal: 10, paddingVertical: 4 },
  kmText: { color: colors.brandStrong, fontWeight: '700', fontSize: 13 },
});
