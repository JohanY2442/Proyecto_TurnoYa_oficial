import { useCallback, useEffect, useRef, useState } from 'react';
import { Alert, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import TurnoTicket from '../../components/TurnoTicket';
import SintomaChips from '../../components/SintomaChips';
import Card from '../../components/Card';
import Button from '../../components/Button';
import { UrgenciaBadge } from '../../components/Badges';
import { ErrorView, LoadingView } from '../../components/StateViews';
import { useAuth } from '../../hooks/useAuth';
import { useFetch } from '../../hooks/useFetch';
import { useIntervalo } from '../../hooks/useIntervalo';
import { useNotificaciones } from '../../hooks/useNotificaciones';
import { turnoService } from '../../services/turnoService';
import { triageService } from '../../services/triageService';
import { getErrorMessage } from '../../utils/errorMessages';
import { codigoTurno } from '../../utils/formatters';
import { colors } from '../../theme/colors';
import { POLLING_MS, ROLES } from '../../utils/constants';

export default function TurnoScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const esPaciente = user?.rol === ROLES.PACIENTE;
  const { avisar, pedirPermiso } = useNotificaciones();

  const turnoFetch = useFetch((signal) => turnoService.obtener(id, signal), [id], { enabled: isAuthenticated });
  const turno = turnoFetch.data;
  const [posicion, setPosicion] = useState(null);
  const [sintomas, setSintomas] = useState([]);
  const [enviando, setEnviando] = useState(null);
  const [error, setError] = useState(null);
  const avisado = useRef({ cerca: false, turno: false });

  const catalogo = useFetch((signal) => triageService.sintomas(signal), [], { enabled: turno?.estado === 'RESERVADO' && esPaciente });
  const triage = useFetch((signal) => triageService.obtener(id, signal), [id, turno?.nivelUrgencia], { enabled: !!turno?.nivelUrgencia });

  // Actualiza estado y posición. Avisa con una notificación local cuando el turno se acerca.
  const { setData: setTurno } = turnoFetch;
  const actualizar = useCallback(async () => {
    try {
      const nuevo = await turnoService.obtener(id);
      setTurno(nuevo);
      if (esPaciente && nuevo.estado === 'EN_ESPERA') {
        const pos = await turnoService.posicion(id);
        setPosicion(pos);
        if (pos.personasAdelante <= 1 && !avisado.current.cerca) {
          avisado.current.cerca = true;
          avisar('Tu turno está cerca', `Eres ${pos.posicion === 1 ? 'el siguiente' : `el ${pos.posicion}°`} en la cola. Acércate al consultorio.`);
        }
      }
      if (esPaciente && nuevo.estado === 'EN_ATENCION' && !avisado.current.turno) {
        avisado.current.turno = true;
        avisar('Es tu turno', nuevo.medico ? `${nuevo.medico} te está esperando.` : 'Acércate al consultorio.');
      }
    } catch {
      /* el próximo ciclo lo vuelve a intentar */
    }
  }, [id, esPaciente, avisar, setTurno]);

  useEffect(() => {
    if (turno?.estado === 'EN_ESPERA') actualizar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [turno?.estado]);

  const enCola = turno?.estado === 'EN_ESPERA';
  useIntervalo(actualizar, POLLING_MS, esPaciente && (enCola || turno?.estado === 'RESERVADO'));

  const registrarTriage = async () => {
    if (!sintomas.length) {
      setError('Marca al menos un síntoma.');
      return;
    }
    setError(null);
    setEnviando('triage');
    try {
      await triageService.registrar(turno.id, sintomas);
      await pedirPermiso();
      await actualizar();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setEnviando(null);
    }
  };

  const cancelar = () =>
    Alert.alert('¿Cancelar este turno?', `Liberarás tu cupo de ${turno.especialidad}.`, [
      { text: 'Volver', style: 'cancel' },
      {
        text: 'Cancelar turno',
        style: 'destructive',
        onPress: async () => {
          setEnviando('cancelar');
          try {
            setTurno(await turnoService.cancelar(turno.id));
          } catch (err) {
            setError(getErrorMessage(err));
          } finally {
            setEnviando(null);
          }
        },
      },
    ]);

  const cambiarEstado = async (estado) => {
    setEnviando(estado);
    setError(null);
    try {
      setTurno(await turnoService.cambiarEstado(turno.id, estado));
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setEnviando(null);
    }
  };

  if (!isAuthenticated) return <View style={{ padding: 16 }}><ErrorView message="Ingresa para ver este turno." onRetry={() => router.replace('/login')} /></View>;
  if (turnoFetch.loading) return <LoadingView />;
  if (turnoFetch.error) return <View style={{ padding: 16 }}><ErrorView message={turnoFetch.error} onRetry={turnoFetch.retry} /></View>;

  return (
    <ScrollView
      contentContainerStyle={{ padding: 16, gap: 14, paddingBottom: 40 }}
      refreshControl={<RefreshControl refreshing={turnoFetch.refreshing} onRefresh={turnoFetch.refresh} tintColor={colors.brand} />}
    >
      <Stack.Screen options={{ title: codigoTurno(turno.id) }} />
      <TurnoTicket turno={turno} posicion={enCola && esPaciente ? posicion : null} showQr={esPaciente} />

      {enCola && esPaciente && <Text style={styles.soft}>Se actualiza cada 15 segundos. Te avisaremos cuando estés cerca.</Text>}

      {turno.estado === 'EN_ATENCION' && esPaciente && (
        <View style={styles.tuTurno} accessibilityLiveRegion="assertive">
          <Text style={styles.tuTurnoTitle}>Es tu turno</Text>
          <Text style={styles.tuTurnoText}>{turno.medico ? `${turno.medico} te está esperando.` : 'Acércate al consultorio.'}</Text>
        </View>
      )}

      {turno.estado === 'RESERVADO' && esPaciente && (
        <Card style={{ gap: 12 }}>
          <Text style={styles.titulo}>¿Qué síntomas tienes?</Text>
          <Text style={styles.soft}>Hazlo al llegar al centro. Así calculamos tu urgencia y entras a la cola.</Text>
          {catalogo.loading ? (
            <LoadingView />
          ) : catalogo.error ? (
            <ErrorView message={catalogo.error} onRetry={catalogo.retry} />
          ) : (
            <SintomaChips sintomas={catalogo.data ?? []} seleccionados={sintomas} onChange={setSintomas} disabled={enviando === 'triage'} />
          )}
          <Button title="Registrar síntomas" icon="medkit-outline" onPress={registrarTriage} loading={enviando === 'triage'} />
        </Card>
      )}

      {triage.data && (
        <Card style={{ gap: 10 }}>
          <View style={styles.rowBetween}>
            <Text style={styles.titulo}>Triage</Text>
            <UrgenciaBadge nivel={triage.data.nivelUrgencia} />
          </View>
          <Text style={styles.soft}>{triage.data.sintomas.map((s) => s.replaceAll('_', ' ').toLowerCase()).join(', ')}</Text>
        </Card>
      )}

      {!esPaciente && ['RESERVADO', 'EN_ESPERA', 'EN_ATENCION'].includes(turno.estado) && (
        <Card style={{ gap: 10 }}>
          <Text style={styles.titulo}>Paciente: {turno.paciente}</Text>
          {turno.estado !== 'EN_ATENCION' ? (
            <Button title="Atender ahora" icon="medkit-outline" onPress={() => cambiarEstado('EN_ATENCION')} loading={enviando === 'EN_ATENCION'} />
          ) : (
            <Button title="Finalizar atención" icon="checkmark-circle-outline" onPress={() => cambiarEstado('ATENDIDO')} loading={enviando === 'ATENDIDO'} />
          )}
        </Card>
      )}

      {error && <Text style={styles.error}>{error}</Text>}

      {esPaciente && ['RESERVADO', 'EN_ESPERA'].includes(turno.estado) && (
        <Button title="Cancelar turno" variant="outline" icon="close-circle-outline" onPress={cancelar} loading={enviando === 'cancelar'} />
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  soft: { color: colors.inkSoft, fontSize: 14 },
  titulo: { fontSize: 18, fontWeight: '800', color: colors.ink },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  tuTurno: { backgroundColor: colors.brand, borderRadius: 16, padding: 18 },
  tuTurnoTitle: { color: '#fff', fontSize: 24, fontWeight: '800' },
  tuTurnoText: { color: '#fff', fontSize: 15, marginTop: 2 },
  error: { color: colors.danger, fontWeight: '700' },
});
