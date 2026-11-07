import PropTypes from 'prop-types';
import { StyleSheet, View } from 'react-native';
import { colors, radius } from '../theme/colors';

export default function Card({ children, style }) {
  return <View style={[styles.card, style]}>{children}</View>;
}

Card.propTypes = { children: PropTypes.node, style: PropTypes.any };

const styles = StyleSheet.create({
  card: { backgroundColor: colors.surface, borderRadius: radius.md, borderWidth: 1, borderColor: colors.line, padding: 16 },
});
