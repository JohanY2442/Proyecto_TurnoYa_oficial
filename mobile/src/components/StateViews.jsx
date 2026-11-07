import PropTypes from 'prop-types';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import Button from './Button';
import { colors, radius } from '../theme/colors';

export function LoadingView({ label = 'Cargando' }) {
  return (
    <View style={styles.center} accessibilityLabel={label}>
      <ActivityIndicator size="large" color={colors.brand} />
    </View>
  );
}

LoadingView.propTypes = { label: PropTypes.string };

/** Estado vacío o error, siempre con una acción para seguir. */
export function EmptyState({ icon = 'information-circle-outline', title, message, actionLabel, onAction, tone = 'neutral' }) {
  return (
    <View style={styles.empty}>
      <Ionicons name={icon} size={30} color={tone === 'error' ? colors.danger : colors.brand} />
      <Text style={styles.title}>{title}</Text>
      {message ? <Text style={styles.message}>{message}</Text> : null}
      {actionLabel && onAction ? (
        <Button title={actionLabel} onPress={onAction} variant={tone === 'error' ? 'outline' : 'primary'} style={{ marginTop: 8, alignSelf: 'flex-start' }} />
      ) : null}
    </View>
  );
}

EmptyState.propTypes = {
  icon: PropTypes.string,
  title: PropTypes.string.isRequired,
  message: PropTypes.string,
  actionLabel: PropTypes.string,
  onAction: PropTypes.func,
  tone: PropTypes.oneOf(['neutral', 'error']),
};

export function ErrorView({ message, onRetry }) {
  return <EmptyState icon="cloud-offline-outline" tone="error" title="No pudimos cargar esto" message={message} actionLabel="Reintentar" onAction={onRetry} />;
}

ErrorView.propTypes = { message: PropTypes.string, onRetry: PropTypes.func };

const styles = StyleSheet.create({
  center: { flex: 1, minHeight: 200, alignItems: 'center', justifyContent: 'center' },
  empty: {
    gap: 6,
    padding: 20,
    borderRadius: radius.md,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: colors.line,
    backgroundColor: colors.surface,
  },
  title: { fontSize: 18, fontWeight: '700', color: colors.ink },
  message: { fontSize: 15, color: colors.inkSoft, lineHeight: 21 },
});
