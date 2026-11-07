import PropTypes from 'prop-types';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { colors, radius } from '../theme/colors';

const VARIANTES = {
  primary: { bg: colors.brand, fg: colors.brandInk, border: colors.brand },
  outline: { bg: colors.surface, fg: colors.ink, border: colors.line },
  danger: { bg: colors.danger, fg: '#fff', border: colors.danger },
  ghost: { bg: 'transparent', fg: colors.inkSoft, border: 'transparent' },
};

/** Botón base. Mientras `loading` está activo se deshabilita para evitar doble envío. */
export default function Button({ title, onPress, variant = 'primary', loading = false, disabled = false, icon, style }) {
  const v = VARIANTES[variant];
  const inactivo = disabled || loading;
  return (
    <Pressable
      onPress={onPress}
      disabled={inactivo}
      accessibilityRole="button"
      accessibilityState={{ disabled: inactivo, busy: loading }}
      style={({ pressed }) => [
        styles.base,
        { backgroundColor: v.bg, borderColor: v.border, opacity: inactivo ? 0.55 : pressed ? 0.85 : 1 },
        style,
      ]}
    >
      <View style={styles.row}>
        {loading ? <ActivityIndicator color={v.fg} /> : icon && <Ionicons name={icon} size={19} color={v.fg} />}
        <Text style={[styles.text, { color: v.fg }]}>{title}</Text>
      </View>
    </Pressable>
  );
}

Button.propTypes = {
  title: PropTypes.string.isRequired,
  onPress: PropTypes.func,
  variant: PropTypes.oneOf(Object.keys(VARIANTES)),
  loading: PropTypes.bool,
  disabled: PropTypes.bool,
  icon: PropTypes.string,
  style: PropTypes.any,
};

const styles = StyleSheet.create({
  base: { minHeight: 50, borderRadius: radius.sm, borderWidth: 1, paddingHorizontal: 18, justifyContent: 'center' },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  text: { fontSize: 16, fontWeight: '700' },
});
