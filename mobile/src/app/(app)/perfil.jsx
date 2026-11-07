import { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';
import Card from '../../components/Card';
import Button from '../../components/Button';
import TextField from '../../components/TextField';
import { useAuth } from '../../hooks/useAuth';
import { useNotificaciones } from '../../hooks/useNotificaciones';
import { pacienteService } from '../../services/pacienteService';
import { getErrorMessage } from '../../utils/errorMessages';
import { colors } from '../../theme/colors';
import { ROLES } from '../../utils/constants';
import { API_URL } from '../../services/api';

const ROL = { PACIENTE: 'Paciente', MEDICO: 'Médico', ADMINISTRADOR: 'Administrador' };

function Dato({ label, value }) {
  return (
    <View style={{ gap: 2 }}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{value || 'No registrado'}</Text>
    </View>
  );
}

Dato.propTypes = { label: PropTypes.string.isRequired, value: PropTypes.string };

export default function PerfilScreen() {
  const { user, logout, updateUser } = useAuth();
  const { pedirPermiso } = useNotificaciones();
  const esPaciente = user.rol === ROLES.PACIENTE;
  const [perfil, setPerfil] = useState(null);
  const [telefono, setTelefono] = useState(user.telefono ?? '');
  const [error, setError] = useState(null);
  const [guardando, setGuardando] = useState(false);

  useEffect(() => {
    if (!esPaciente) return;
    pacienteService
      .miPerfil()
      .then((p) => {
        setPerfil(p);
        setTelefono(p.telefono ?? '');
      })
      .catch(() => {});
  }, [esPaciente]);

  const guardar = async () => {
    if (telefono && !/^9\d{8}$/.test(telefono)) {
      setError('Debe tener 9 dígitos y empezar con 9');
      return;
    }
    setError(null);
    setGuardando(true);
    try {
      const p = await pacienteService.actualizarMiPerfil({ telefono: telefono || null });
      setPerfil(p);
      updateUser({ telefono: p.telefono });
      Alert.alert('Listo', 'Guardamos tu celular.');
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setGuardando(false);
    }
  };

  const activarAvisos = async () => {
    const ok = await pedirPermiso();
    Alert.alert(ok ? 'Avisos activados' : 'Sin permiso', ok ? 'Te avisaremos cuando tu turno esté cerca.' : 'Puedes activarlos en los ajustes del celular.');
  };

  const salir = () =>
    Alert.alert('¿Cerrar sesión?', 'Tendrás que volver a ingresar con tu correo.', [
      { text: 'Volver', style: 'cancel' },
      { text: 'Cerrar sesión', style: 'destructive', onPress: logout },
    ]);

  return (
    <ScrollView contentContainerStyle={{ padding: 16, gap: 14 }}>
      <Card style={{ gap: 14 }}>
        <Text style={styles.nombre}>{user.nombre}</Text>
        <Dato label="Correo" value={user.email} />
        <Dato label="Tipo de cuenta" value={ROL[user.rol]} />
        {perfil && <Dato label="DNI" value={perfil.dni} />}
      </Card>
      {esPaciente && (
        <Card style={{ gap: 12 }}>
          <TextField label="Celular" value={telefono} onChangeText={setTelefono} keyboardType="phone-pad" maxLength={9} error={error} placeholder="987654321" />
          <Button title="Guardar celular" onPress={guardar} loading={guardando} disabled={telefono === (perfil?.telefono ?? '')} />
          <Button title="Activar avisos de turno" variant="outline" icon="notifications-outline" onPress={activarAvisos} />
        </Card>
      )}
      {user.rol === ROLES.ADMIN && <Text style={styles.label}>Las estadísticas y la gestión de centros están en la versión web.</Text>}
      <Button title="Cerrar sesión" variant="ghost" icon="log-out-outline" onPress={salir} />
      <Text style={styles.api}>Servidor: {API_URL}</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  nombre: { fontSize: 24, fontWeight: '800', color: colors.ink },
  label: { color: colors.inkSoft, fontSize: 13 },
  value: { color: colors.ink, fontSize: 16, fontWeight: '700' },
  api: { color: colors.inkSoft, fontSize: 11, textAlign: 'center', marginTop: 8 },
});
