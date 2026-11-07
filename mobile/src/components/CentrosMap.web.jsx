import PropTypes from 'prop-types';
import { StyleSheet, Text, View } from 'react-native';
import { colors, radius } from '../theme/colors';

/** react-native-maps no funciona en web: en la versión web solo se muestra un aviso. */
export default function CentrosMap({ centros, height = 260 }) {
  return (
    <View style={[styles.wrap, { height: Math.min(height, 120) }]}>
      <Text style={styles.text}>El mapa está disponible en la app del celular ({centros.length} centros).</Text>
    </View>
  );
}

CentrosMap.propTypes = { centros: PropTypes.array.isRequired, height: PropTypes.number };

const styles = StyleSheet.create({
  wrap: { borderRadius: radius.md, borderWidth: 1, borderColor: colors.line, backgroundColor: colors.surface2, alignItems: 'center', justifyContent: 'center', padding: 16 },
  text: { color: colors.inkSoft, textAlign: 'center' },
});
