import PropTypes from 'prop-types';
import { Pressable, StyleSheet, Text } from 'react-native';
import { colors } from '../theme/colors';

/** Opción seleccionable (filtros, día y hora de la reserva). */
export default function Chip({ label, selected, onPress }) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected }}
      style={[styles.chip, selected && styles.selected]}
    >
      <Text style={[styles.text, selected && { color: colors.brandInk }]}>{label}</Text>
    </Pressable>
  );
}

Chip.propTypes = { label: PropTypes.string.isRequired, selected: PropTypes.bool, onPress: PropTypes.func };

const styles = StyleSheet.create({
  chip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 999, borderWidth: 1, borderColor: colors.line, backgroundColor: colors.surface },
  selected: { backgroundColor: colors.brand, borderColor: colors.brand },
  text: { color: colors.ink, fontWeight: '700', fontSize: 14 },
});
