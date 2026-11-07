import { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Redirect } from 'expo-router';
import TextField from '../components/TextField';
import Button from '../components/Button';
import { useAuth } from '../hooks/useAuth';
import { getErrorMessage, getFieldErrors } from '../utils/errorMessages';
import { colors } from '../theme/colors';

// Mismas reglas que el backend (RegisterRequest).
const REGLAS = {
  nombre: (v) => (v.trim().length >= 2 ? null : 'Escribe tu nombre completo'),
  email: (v) => (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()) ? null : 'Escribe un correo válido'),
  password: (v) => (/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,64}$/.test(v) ? null : 'Usa 8 caracteres o más, con mayúscula, minúscula y número'),
  dni: (v) => (/^\d{8}$/.test(v) ? null : 'El DNI tiene 8 dígitos'),
  fechaNacimiento: (v) => {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(v)) return 'Usa el formato AAAA-MM-DD';
    const fecha = new Date(`${v}T00:00:00`);
    return !Number.isNaN(fecha.getTime()) && fecha < new Date() ? null : 'Debe ser una fecha pasada';
  },
  telefono: (v) => (!v || /^9\d{8}$/.test(v) ? null : 'Debe tener 9 dígitos y empezar con 9'),
};

export default function RegistroScreen() {
  const { register, status } = useAuth();
  const [form, setForm] = useState({ nombre: '', email: '', password: '', dni: '', fechaNacimiento: '', telefono: '' });
  const [errores, setErrores] = useState({});
  const [enviando, setEnviando] = useState(false);

  if (status === 'authenticated') return <Redirect href="/" />;

  // Validación en tiempo real: el error de un campo se actualiza mientras escribes.
  const cambiar = (campo) => (valor) => {
    setForm((f) => ({ ...f, [campo]: valor }));
    if (errores[campo]) setErrores((e) => ({ ...e, [campo]: REGLAS[campo](valor) }));
  };

  const enviar = async () => {
    const nuevos = Object.fromEntries(Object.entries(REGLAS).map(([c, regla]) => [c, regla(form[c])]).filter(([, e]) => e));
    setErrores(nuevos);
    if (Object.keys(nuevos).length) return;
    setEnviando(true);
    try {
      await register({ ...form, email: form.email.trim().toLowerCase(), telefono: form.telefono || null });
    } catch (error) {
      const campos = getFieldErrors(error);
      setErrores(Object.keys(campos).length ? campos : { general: getErrorMessage(error) });
    } finally {
      setEnviando(false);
    }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <Text style={styles.subtitle}>Necesitas tu DNI para reservar en la posta.</Text>
        <View style={{ gap: 14 }}>
          <TextField label="Nombre completo" value={form.nombre} onChangeText={cambiar('nombre')} error={errores.nombre} autoComplete="name" />
          <TextField label="Correo electrónico" value={form.email} onChangeText={cambiar('email')} error={errores.email} autoCapitalize="none" keyboardType="email-address" />
          <TextField label="Contraseña" value={form.password} onChangeText={cambiar('password')} error={errores.password} secureTextEntry hint="Mínimo 8 caracteres, con mayúscula, minúscula y número." />
          <TextField label="DNI" value={form.dni} onChangeText={cambiar('dni')} error={errores.dni} keyboardType="number-pad" maxLength={8} />
          <TextField label="Fecha de nacimiento" value={form.fechaNacimiento} onChangeText={cambiar('fechaNacimiento')} error={errores.fechaNacimiento} placeholder="1998-05-14" maxLength={10} />
          <TextField label="Celular (opcional)" value={form.telefono} onChangeText={cambiar('telefono')} error={errores.telefono} keyboardType="phone-pad" maxLength={9} />
          {errores.general && <Text style={styles.error}>{errores.general}</Text>}
          <Button title="Crear cuenta" onPress={enviar} loading={enviando} />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, paddingBottom: 48 },
  subtitle: { color: colors.inkSoft, fontSize: 15, marginBottom: 18 },
  error: { color: colors.danger },
});
