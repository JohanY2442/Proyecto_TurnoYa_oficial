import PropTypes from 'prop-types';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { colors, urgencia } from '../theme/colors';
import { GRAVEDAD_A_NIVEL } from '../utils/constants';

/** Síntomas para marcar, de más grave a más leve. */
export default function SintomaChips({ sintomas, seleccionados, onChange, disabled }) {
  const toggle = (codigo) =>
    onChange(seleccionados.includes(codigo) ? seleccionados.filter((s) => s !== codigo) : [...seleccionados, codigo]);
  return (
    <View style={styles.wrap}>
      {[...sintomas]
        .sort((a, b) => b.gravedad - a.gravedad)
        .map((s) => {
          const activo = seleccionados.includes(s.codigo);
          return (
            <Pressable
              key={s.codigo}
              disabled={disabled}
              onPress={() => toggle(s.codigo)}
              accessibilityRole="checkbox"
              accessibilityState={{ checked: activo }}
              style={[styles.chip, activo && styles.activo]}
            >
              {activo ? (
                <Ionicons name="checkmark-circle" size={18} color={colors.brand} />
              ) : (
                <View style={[styles.dot, { backgroundColor: urgencia[GRAVEDAD_A_NIVEL[s.gravedad]].color }]} />
              )}
              <Text style={styles.text}>{s.etiqueta}</Text>
            </Pressable>
          );
        })}
    </View>
  );
}

SintomaChips.propTypes = {
  sintomas: PropTypes.arrayOf(PropTypes.shape({ codigo: PropTypes.string, etiqueta: PropTypes.string, gravedad: PropTypes.number })).isRequired,
  seleccionados: PropTypes.arrayOf(PropTypes.string).isRequired,
  onChange: PropTypes.func.isRequired,
  disabled: PropTypes.bool,
};

const styles = StyleSheet.create({
  wrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { flexDirection: 'row', alignItems: 'center', gap: 6, borderWidth: 1, borderColor: colors.line, backgroundColor: colors.surface, borderRadius: 999, paddingHorizontal: 12, paddingVertical: 9 },
  activo: { borderColor: colors.brand, backgroundColor: colors.brandSoft },
  dot: { width: 9, height: 9, borderRadius: 5 },
  text: { color: colors.ink, fontSize: 14 },
});
