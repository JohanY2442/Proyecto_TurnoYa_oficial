import PropTypes from 'prop-types';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { EstadoBadge } from './Badges';
import { colors, radius, urgencia } from '../theme/colors';
import { codigoTurno, formatFechaHora } from '../utils/formatters';

export default function TurnoItem({ turno, onPress }) {
  const color = turno.nivelUrgencia ? urgencia[turno.nivelUrgencia].color : 'transparent';
  return (
    <Pressable onPress={onPress} accessibilityRole="button" style={({ pressed }) => [styles.item, pressed && { opacity: 0.8 }]}>
      <View style={[styles.franja, { backgroundColor: color }]} />
      <View style={{ flex: 1 }}>
        <Text style={styles.codigo}>
          {codigoTurno(turno.id)} <Text style={styles.esp}>{turno.especialidad}</Text>
        </Text>
        <Text style={styles.meta} numberOfLines={1}>
          {turno.centro}, {formatFechaHora(turno.fechaHora)}
        </Text>
      </View>
      <EstadoBadge estado={turno.estado} />
    </Pressable>
  );
}

TurnoItem.propTypes = {
  turno: PropTypes.shape({ id: PropTypes.number, especialidad: PropTypes.string, centro: PropTypes.string, fechaHora: PropTypes.string, estado: PropTypes.string, nivelUrgencia: PropTypes.string }).isRequired,
  onPress: PropTypes.func,
};

const styles = StyleSheet.create({
  item: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: colors.surface, borderRadius: radius.md, borderWidth: 1, borderColor: colors.line, padding: 14 },
  franja: { width: 5, height: 38, borderRadius: 3 },
  codigo: { fontSize: 17, fontWeight: '800', color: colors.ink },
  esp: { fontSize: 15, fontWeight: '400', color: colors.inkSoft },
  meta: { fontSize: 13, color: colors.inkSoft, marginTop: 2 },
});
