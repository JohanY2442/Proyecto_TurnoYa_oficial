import { useEffect, useState } from 'react';
import { FlatList, Pressable, RefreshControl, StyleSheet, Text, TextInput, View } from 'react-native';
import { useRouter } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';
import TurnoTicket from '../../components/TurnoTicket';
import CentroItem from '../../components/CentroItem';
import CentrosMap from '../../components/CentrosMap';
import Button from '../../components/Button';
import { EmptyState, ErrorView, LoadingView } from '../../components/StateViews';
import { useAuth } from '../../hooks/useAuth';
import { useFetch } from '../../hooks/useFetch';
import { useUbicacion } from '../../hooks/useUbicacion';
import { centroService } from '../../services/centroService';
import { turnoService } from '../../services/turnoService';
import { colors, radius } from '../../theme/colors';
import { ESTADOS_ACTIVOS, ROLES } from '../../utils/constants';

export default function InicioScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const esPaciente = user.rol === ROLES.PACIENTE;
  const ubicacion = useUbicacion();
  const [texto, setTexto] = useState('');
  const [busqueda, setBusqueda] = useState('');

  // Debounce de la búsqueda: espera a que dejes de escribir.
  useEffect(() => {
    const id = setTimeout(() => setBusqueda(texto.trim()), 400);
    return () => clearTimeout(id);
  }, [texto]);

  // El GPS se pide una sola vez al abrir la pantalla.
  const { solicitar } = ubicacion;
  useEffect(() => {
    solicitar();
  }, [solicitar]);

  const cercanos = !!ubicacion.coords && !busqueda;
  const centros = useFetch(
    (signal) =>
      cercanos
        ? centroService.cercanos(ubicacion.coords, signal)
        : centroService.listar({ page: 0, size: 30, search: busqueda }, signal).then((p) => p.content),
    [cercanos, busqueda, ubicacion.coords?.latitud],
    { enabled: !ubicacion.loading },
  );
  const turnos = useFetch((signal) => turnoService.misTurnos({ page: 0, size: 15 }, signal), [], { enabled: esPaciente });
  const activo = turnos.data?.content.find((t) => ESTADOS_ACTIVOS.includes(t.estado));

  const refrescar = () => {
    centros.refresh();
    if (esPaciente) turnos.refresh();
  };

  const header = (
    <View style={{ gap: 16, marginBottom: 12 }}>
      <Text style={styles.hola}>Hola, {user.nombre.split(' ')[0]}</Text>
      {activo && (
        <View>
          <Text style={styles.section}>Tu turno activo</Text>
          <Pressable onPress={() => router.push(`/turno/${activo.id}`)} accessibilityRole="button" accessibilityLabel="Abrir mi turno activo">
            <TurnoTicket turno={activo} />
          </Pressable>
          <Button
            title={activo.estado === 'RESERVADO' ? 'Registrar mis síntomas' : 'Ver mi lugar en la cola'}
            onPress={() => router.push(`/turno/${activo.id}`)}
            style={{ marginTop: 10 }}
            icon="arrow-forward-circle-outline"
          />
        </View>
      )}
      <Text style={styles.section}>{cercanos ? 'Centros cerca de ti' : 'Centros de salud'}</Text>
      <View style={styles.search}>
        <Ionicons name="search" size={18} color={colors.inkSoft} />
        <TextInput
          value={texto}
          onChangeText={setTexto}
          placeholder="Buscar por nombre"
          placeholderTextColor="#8AA19C"
          style={styles.searchInput}
          accessibilityLabel="Buscar centro por nombre"
          returnKeyType="search"
        />
      </View>
      {ubicacion.error && (
        <View style={styles.aviso}>
          <Text style={styles.avisoText}>{ubicacion.error}</Text>
          <Button title="Intentar de nuevo" variant="ghost" icon="locate-outline" onPress={ubicacion.solicitar} style={{ alignSelf: 'flex-start', minHeight: 36, paddingHorizontal: 0 }} />
        </View>
      )}
      {centros.data?.length ? (
        <CentrosMap centros={centros.data} ubicacion={ubicacion.coords} onSelect={(c) => router.push(`/centro/${c.id}`)} />
      ) : null}
    </View>
  );

  if (centros.loading || ubicacion.loading) return <LoadingView label="Buscando centros" />;

  return (
    <FlatList
      data={centros.data ?? []}
      keyExtractor={(c) => String(c.id)}
      contentContainerStyle={{ padding: 16, gap: 10 }}
      ListHeaderComponent={header}
      renderItem={({ item }) => <CentroItem centro={item} onPress={() => router.push(`/centro/${item.id}`)} />}
      refreshControl={<RefreshControl refreshing={centros.refreshing} onRefresh={refrescar} tintColor={colors.brand} />}
      ListEmptyComponent={
        centros.error ? (
          <ErrorView message={centros.error} onRetry={centros.retry} />
        ) : (
          <EmptyState icon="search-outline" title={cercanos ? 'No hay centros a menos de 15 km' : 'Ningún centro coincide'} message="Prueba con otro nombre." />
        )
      }
    />
  );
}

const styles = StyleSheet.create({
  hola: { fontSize: 30, fontWeight: '800', color: colors.ink },
  section: { fontSize: 18, fontWeight: '800', color: colors.ink, marginBottom: 8 },
  search: { flexDirection: 'row', alignItems: 'center', gap: 8, borderWidth: 1, borderColor: colors.line, backgroundColor: colors.surface, borderRadius: radius.sm, paddingHorizontal: 12, minHeight: 48 },
  searchInput: { flex: 1, fontSize: 16, color: colors.ink, paddingVertical: 10 },
  aviso: { backgroundColor: '#F2C14E33', borderRadius: radius.sm, padding: 12 },
  avisoText: { color: colors.ink },
});
