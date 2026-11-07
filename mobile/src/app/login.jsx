import { useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Link, Redirect } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import TextField from '../components/TextField';
import Button from '../components/Button';
import { useAuth } from '../hooks/useAuth';
import { getErrorMessage } from '../utils/errorMessages';
import { colors } from '../theme/colors';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const DEMO = [
  { rol: 'Paciente', email: 'paciente@turnoya.com', password: 'Paciente123' },
  { rol: 'Médico', email: 'medico@turnoya.com', password: 'Medico12345' },
];

export default function LoginScreen() {
  const { login, status } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errores, setErrores] = useState({});
  const [enviando, setEnviando] = useState(false);

  if (status === 'authenticated') return <Redirect href="/" />;

  const validar = () => {
    const e = {};
    if (!EMAIL_REGEX.test(email.trim())) e.email = 'Escribe un correo válido';
    if (!password) e.password = 'Escribe tu contraseña';
    setErrores(e);
    return Object.keys(e).length === 0;
  };

  const enviar = async () => {
    if (!validar()) return;
    setEnviando(true);
    try {
      await login({ email: email.trim().toLowerCase(), password });
    } catch (error) {
      setErrores({ general: error.response?.status === 401 ? 'Correo o contraseña incorrectos.' : getErrorMessage(error) });
    } finally {
      setEnviando(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
          <View style={styles.logo}>
            <Text style={styles.logoText}>T</Text>
          </View>
          <Text style={styles.title}>TurnoYa</Text>
          <Text style={styles.subtitle}>Tu lugar en la cola de la posta, en tu celular.</Text>

          <View style={{ gap: 14, marginTop: 28 }}>
            <TextField
              label="Correo electrónico"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
              autoComplete="email"
              placeholder="tucorreo@ejemplo.com"
              error={errores.email}
            />
            <TextField label="Contraseña" value={password} onChangeText={setPassword} secureTextEntry autoComplete="password" error={errores.password} />
            {errores.general && <Text style={styles.error}>{errores.general}</Text>}
            <Button title="Ingresar" onPress={enviar} loading={enviando} />
          </View>

          <Text style={styles.footer}>
            ¿No tienes cuenta?{' '}
            <Link href="/registro" style={styles.link}>
              Crea una
            </Link>
          </Text>

          <View style={styles.demo}>
            <Text style={styles.demoTitle}>Cuentas de prueba</Text>
            <View style={{ flexDirection: 'row', gap: 8 }}>
              {DEMO.map((c) => (
                <Pressable
                  key={c.email}
                  onPress={() => {
                    setEmail(c.email);
                    setPassword(c.password);
                  }}
                  style={styles.demoBtn}
                  accessibilityRole="button"
                >
                  <Text style={styles.demoBtnText}>{c.rol}</Text>
                </Pressable>
              ))}
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 24, paddingTop: 48 },
  logo: { width: 56, height: 56, borderRadius: 16, backgroundColor: colors.brand, alignItems: 'center', justifyContent: 'center' },
  logoText: { color: '#fff', fontSize: 32, fontWeight: '900' },
  title: { fontSize: 38, fontWeight: '800', color: colors.ink, marginTop: 16 },
  subtitle: { fontSize: 16, color: colors.inkSoft, marginTop: 4 },
  error: { color: colors.danger, backgroundColor: '#B4231815', padding: 10, borderRadius: 10 },
  footer: { marginTop: 22, color: colors.inkSoft, fontSize: 15 },
  link: { color: colors.brand, fontWeight: '700' },
  demo: { marginTop: 36, padding: 14, borderRadius: 16, borderWidth: 1, borderStyle: 'dashed', borderColor: colors.line, gap: 8 },
  demoTitle: { fontWeight: '700', color: colors.ink },
  demoBtn: { backgroundColor: colors.surface2, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10 },
  demoBtnText: { fontWeight: '700', color: colors.ink },
});
