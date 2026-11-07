import { forwardRef } from 'react';
import PropTypes from 'prop-types';
import { StyleSheet, Text, TextInput, View } from 'react-native';
import { colors, radius } from '../theme/colors';

const TextField = forwardRef(function TextField({ label, error, hint, style, ...rest }, ref) {
  return (
    <View style={style}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        ref={ref}
        accessibilityLabel={label}
        placeholderTextColor="#8AA19C"
        style={[styles.input, error && { borderColor: colors.danger }]}
        {...rest}
      />
      {error ? <Text style={styles.error}>{error}</Text> : hint ? <Text style={styles.hint}>{hint}</Text> : null}
    </View>
  );
});

TextField.propTypes = { label: PropTypes.string.isRequired, error: PropTypes.string, hint: PropTypes.string, style: PropTypes.any };

const styles = StyleSheet.create({
  label: { fontSize: 14, fontWeight: '700', color: colors.ink, marginBottom: 6 },
  input: {
    minHeight: 50,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: radius.sm,
    backgroundColor: colors.surface,
    paddingHorizontal: 14,
    fontSize: 16,
    color: colors.ink,
  },
  error: { color: colors.danger, marginTop: 4, fontSize: 13 },
  hint: { color: colors.inkSoft, marginTop: 4, fontSize: 13 },
});

export default TextField;
