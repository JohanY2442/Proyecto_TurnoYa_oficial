import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import TurnoItem from '../../components/TurnoItem';
import Chip from '../../components/Chip';
import { EmptyState, ErrorView, LoadingView } from '../../components/StateViews';
import { turnoService } from '../../services/turnoService';
import { getErrorMessage } from '../../utils/errorMessages';
import { colors } from '../../theme/colors';
import { ESTADOS_TURNO } from '../../utils/constants';

const FILTROS = [['', 'Todos'], ...Object.entries(ESTADOS_TURNO)];
const SIZE = 10;

/** Historial con paginación infinita: carga la siguiente página al llegar al final. */
export default function TurnosScreen() {
  const router = useRouter();
  const [estado, setEstado] = useState('');
  const [items, setItems] = useState([]);
  const [pagina, setPagina] = useState({ page: -1, last: false, totalElements: 0 });
  const [loading, setLoading] = useState(true);
  const [cargandoMas, setCargandoMas] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const cargar = useCallback(
      async (page, modo) => {
        setError(null);
        try {
          const data = await turnoService.misTurnos({ page, size: SIZE, estado });
          setItems((prev) => (page === 0 ? data.content : [...prev, ...data.content]));
          setPagina({ page: data.page, last: data.last, totalElements: data.totalElements });
        } catch (err) {
          setError(getErrorMessage(err));
        } finally {
          if (modo === 'inicial') setLoading(false);
          if (modo === 'mas') setCargandoMas(false);
          if (modo === 'refresh') setRefreshing(false);
        }
      },
      [estado],
  );

  useEffect(() => {
    setLoading(true);
    cargar(0, 'inicial');
  }, [cargar]);

  const cargarMas = () => {
    if (cargandoMas || pagina.last || loading) return;
    setCargandoMas(true);
    cargar(pagina.page + 1, 'mas');
  };

  return (
      <View style={{ flex: 1 }}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filtros} style={{ flexGrow: 0 }}>
          {FILTROS.map(([valor, label]) => (
              <Chip key={valor || 'todos'} label={label} selected={estado === valor} onPress={() => setEstado(valor)} />
          ))}
        </ScrollView>
        {loading ? (
            <LoadingView />
        ) : (
            <FlatList
                data={items}
                keyExtractor={(t) => String(t.id)}
                contentContainerStyle={{ padding: 16, gap: 10 }}
                renderItem={({ item }) => <TurnoItem turno={item} onPress={() => router.push(`/turno/${item.id}`)} />}
                onEndReached={cargarMas}
                onEndReachedThreshold={0.4}
                refreshControl={
                  <RefreshControl
                      refreshing={refreshing}
                      tintColor={colors.brand}
                      onRefresh={() => {
                        setRefreshing(true);
                        cargar(0, 'refresh');
                      }}
                  />
                }
                ListHeaderComponent={items.length ? <Text style={styles.total}>{pagina.totalElements} turnos</Text> : null}
                ListFooterComponent={cargandoMas ? <ActivityIndicator color={colors.brand} style={{ margin: 16 }} /> : null}
                ListEmptyComponent={
                  error ? (
                      <ErrorView message={error} onRetry={() => cargar(0, 'inicial')} />
                  ) : (
                      <EmptyState
                          icon="ticket-outline"
                          title={estado ? 'No tienes turnos en este estado' : 'Aún no tienes turnos'}
                          message={estado ? undefined : 'Busca un centro cerca de ti y reserva en un minuto.'}
                          actionLabel={estado ? 'Ver todos' : 'Buscar un centro'}
                          onAction={() => (estado ? setEstado('') : router.push('/inicio'))}
                      />
                  )
                }
            />
        )}
      </View>
  );
}

const styles = StyleSheet.create({
  filtros: { gap: 8, paddingHorizontal: 16, paddingTop: 12, paddingBottom: 4 },
  total: { color: colors.inkSoft, marginBottom: 2 },
});