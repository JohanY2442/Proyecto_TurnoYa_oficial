import { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';
import Card from '../../components/Card';
import Chip from '../../components/Chip';
import Button from '../../components/Button';
import CentrosMap from '../../components/CentrosMap';
import { ErrorView, LoadingView } from '../../components/StateViews';
import { useAuth } from '../../hooks/useAuth';
import { useFetch } from '../../hooks/useFetch';
import { centroService } from '../../services/centroService';
import { turnoService } from '../../services/turnoService';
import { getErrorMessage } from '../../utils/errorMessages';
import { toLocalDateTime } from '../../utils/formatters';
import { colors } from '../../theme/colors';
import { ROLES } from '../../utils/constants';

const DIAS = ['Hoy', 'Mañana', 'Pasado mañana'];
const HORA_INICIO = 7;
const HORA_FIN = 19;

/** Horarios cada 30 min de 7:00 a 19:00; para hoy, solo los que aún no pasan. */
const horariosDelDia = (offsetDias) => {
  const ahora = new Date();
  const lista = [];
  for (let h = HORA_INICIO; h < HORA_FIN; h++) {
    for (const m of [0, 30]) {
      const d = new Date();
      d.setDate(d.getDate() + offsetDias);
      d.setHours(h, m, 0, 0);
      if (d > new Date(ahora.getTime() + 10 * 60000)) lista.push(d);
    }
  }
  return lista;
};

export default function CentroScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { isAuthenticated, user } = useAuth();
  const centro = useFetch((signal) => centroService.obtener(id, signal), [id]);
  const [especialidadId, setEspecialidadId] = useState(null);
  const [dia, setDia] = useState(0);
  const [hora, setHora] = useState(null);
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState(null);

  const horarios = useMemo(() => horariosDelDia(dia), [dia]);

  if (centro.loading) return <LoadingView />;
  if (centro.error) return <View style={{ padding: 16 }}><ErrorView message={centro.error} onRetry={centro.retry} /></View>;

  const c = centro.data;
  const espElegida = especialidadId ?? c.especialidades[0]?.id;
  const puedeReservar = isAuthenticated && user.rol === ROLES.PACIENTE;

  const reservar = async () => {
    if (!hora) {
      setError('Elige una hora.');
      return;
    }
    setError(null);
    setEnviando(true);
    try {
      const turno = await turnoService.reservar({ centroId: c.id, especialidadId: espElegida, fechaHora: toLocalDateTime(hora) });
      router.replace(`/turno/${turno.id}`);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setEnviando(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={{ padding: 16, gap: 14, paddingBottom: 40 }}>
      <Stack.Screen options={{ title: c.nombre }} />
      <View style={{ gap: 4 }}>
        <Text style={styles.nombre}>{c.nombre}</Text>
        <View style={styles.row}>
          <Ionicons name="location-outline" size={16} color={colors.inkSoft} />
          <Text style={styles.soft}>{c.direccion}</Text>
        </View>
        <View style={styles.row}>
          <Ionicons name="people-outline" size={16} color={colors.inkSoft} />
          <Text style={styles.soft}>Atiende hasta {c.capacidadDiaria} pacientes por día</Text>
        </View>
      </View>
      <CentrosMap centros={[c]} ubicacion={{ latitud: c.latitud, longitud: c.longitud }} height={180} />

      {!puedeReservar ? (
        <Card>
          <Text style={styles.soft}>{isAuthenticated ? 'Solo los pacientes pueden reservar turnos.' : 'Ingresa con tu cuenta para reservar.'}</Text>
        </Card>
      ) : c.especialidades.length === 0 ? (
        <Card>
          <Text style={styles.soft}>Este centro aún no tiene especialidades disponibles.</Text>
        </Card>
      ) : (
        <Card style={{ gap: 14 }}>
          <Text style={styles.titulo}>Reservar turno</Text>
          <Text style={styles.label}>Especialidad</Text>
          <View style={styles.chips}>
            {c.especialidades.map((e) => (
              <Chip key={e.id} label={e.nombre} selected={espElegida === e.id} onPress={() => setEspecialidadId(e.id)} />
            ))}
          </View>
          <Text style={styles.label}>Día</Text>
          <View style={styles.chips}>
            {DIAS.map((d, i) => (
              <Chip
                key={d}
                label={d}
                selected={dia === i}
                onPress={() => {
                  setDia(i);
                  setHora(null);
                }}
              />
            ))}
          </View>
          <Text style={styles.label}>Hora</Text>
          {horarios.length === 0 ? (
            <Text style={styles.soft}>Ya no hay horarios hoy. Elige mañana.</Text>
          ) : (
            <View style={styles.chips}>
              {horarios.map((h) => {
                const etiqueta = `${String(h.getHours()).padStart(2, '0')}:${String(h.getMinutes()).padStart(2, '0')}`;
                return <Chip key={etiqueta} label={etiqueta} selected={hora?.getTime() === h.getTime()} onPress={() => setHora(h)} />;
              })}
            </View>
          )}
          {error && <Text style={styles.error}>{error}</Text>}
          <Button title="Reservar turno" icon="calendar-outline" onPress={reservar} loading={enviando} />
        </Card>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  nombre: { fontSize: 26, fontWeight: '800', color: colors.ink },
  row: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  soft: { color: colors.inkSoft, fontSize: 15, flexShrink: 1 },
  titulo: { fontSize: 20, fontWeight: '800', color: colors.ink },
  label: { fontWeight: '700', color: colors.ink },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  error: { color: colors.danger, fontWeight: '700' },
});
