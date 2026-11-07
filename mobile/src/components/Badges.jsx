import PropTypes from 'prop-types';
import { StyleSheet, Text, View } from 'react-native';
import { colors, urgencia } from '../theme/colors';
import { ESTADOS_TURNO } from '../utils/constants';

export function UrgenciaBadge({ nivel }) {
  if (!nivel) return <Text style={{ color: colors.inkSoft }}>Sin triage</Text>;
  const { label, color } = urgencia[nivel];
  return (
    <View style={[styles.badge, { backgroundColor: `${color}2E` }]}>
      <View style={[styles.dot, { backgroundColor: color }]} />
      <Text style={styles.text}>Urgencia {label.toLowerCase()}</Text>
    </View>
  );
}

UrgenciaBadge.propTypes = { nivel: PropTypes.oneOf(Object.keys(urgencia)) };

const ESTILO_ESTADO = {
  RESERVADO: { bg: colors.surface2, fg: colors.ink },
  EN_ESPERA: { bg: '#F2C14E55', fg: colors.ink },
  EN_ATENCION: { bg: colors.brand, fg: colors.brandInk },
  ATENDIDO: { bg: colors.brandSoft, fg: colors.brandStrong },
  CANCELADO: { bg: colors.surface2, fg: colors.inkSoft },
};

export function EstadoBadge({ estado }) {
  const e = ESTILO_ESTADO[estado];
  return (
    <View style={[styles.badge, { backgroundColor: e.bg }]}>
      <Text style={[styles.text, { color: e.fg }]}>{ESTADOS_TURNO[estado]}</Text>
    </View>
  );
}

EstadoBadge.propTypes = { estado: PropTypes.oneOf(Object.keys(ESTADOS_TURNO)).isRequired };

const styles = StyleSheet.create({
  badge: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999, alignSelf: 'flex-start' },
  dot: { width: 8, height: 8, borderRadius: 4 },
  text: { fontSize: 12, fontWeight: '700', color: colors.ink },
});
