import { useEffect, useState } from 'react';
import { Building2, LocateFixed, SearchX, X } from 'lucide-react';
import PageHeader from '../components/ui/PageHeader';
import Select from '../components/ui/Select';
import Button from '../components/ui/Button';
import Skeleton from '../components/ui/Skeleton';
import EmptyState from '../components/ui/EmptyState';
import Pagination from '../components/ui/Pagination';
import Tabs from '../components/ui/Tabs';
import CentroCard from '../components/centros/CentroCard';
import CentrosMap from '../components/centros/CentrosMap';
import { useFetch } from '../hooks/useFetch';
import { useDebounce } from '../hooks/useDebounce';
import { usePagination } from '../hooks/usePagination';
import { useGeolocation } from '../hooks/useGeolocation';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { centroService } from '../services/centroService';
import { especialidadService } from '../services/especialidadService';

export default function CentrosPage() {
  useDocumentTitle('Centros de salud');
  const { page, size, setPage, setSize, getParam, setFilter } = usePagination();
  const search = getParam('search');
  const especialidadId = getParam('especialidad');
  const vista = getParam('vista') || 'lista';

  // El texto se escribe en un estado local y llega a la URL con debounce.
  const [texto, setTexto] = useState(search);
  const textoDebounced = useDebounce(texto, 400);
  useEffect(() => {
    if (textoDebounced !== search) setFilter('search', textoDebounced);
  }, [textoDebounced, search, setFilter]);

  const geo = useGeolocation();
  const cercanos = !!geo.coords;

  const especialidades = useFetch((signal) => especialidadService.listar(signal), []);

  const centros = useFetch(
    (signal) =>
      cercanos
        ? centroService.cercanos({ ...geo.coords, especialidadId }, signal)
        : centroService.listar({ page, size, search, especialidadId }, signal),
    [page, size, search, especialidadId, cercanos, geo.coords?.latitud, geo.coords?.longitud],
  );

  // Al cambiar entre "cerca de mí" (lista) y la búsqueda (página), por un render
  // pueden quedar los datos del modo anterior: se normalizan los dos formatos.
  const lista = Array.isArray(centros.data) ? centros.data : centros.data?.content ?? [];
  const pagina = !cercanos && centros.data && !Array.isArray(centros.data) ? centros.data : null;

  const limpiarFiltros = () => {
    setTexto('');
    setFilter('search', '');
    setFilter('especialidad', '');
    geo.limpiar();
  };

  return (
    <>
      <PageHeader
        title="Centros de salud"
        description="Busca una posta por nombre o encuentra la más cercana a ti."
        actions={
          cercanos ? (
            <Button variant="outline" icon={X} onClick={geo.limpiar}>
              Quitar ubicación
            </Button>
          ) : (
            <Button variant="outline" icon={LocateFixed} loading={geo.loading} onClick={geo.solicitar}>
              Cerca de mí
            </Button>
          )
        }
      />

      <div className="mb-6 grid gap-3 sm:grid-cols-[1fr_16rem_auto] sm:items-end">
        <div>
          <label htmlFor="buscar-centro" className="mb-1.5 block text-sm font-bold">
            Buscar por nombre
          </label>
          <input
            id="buscar-centro"
            type="search"
            value={texto}
            onChange={(e) => setTexto(e.target.value)}
            disabled={cercanos}
            placeholder="Por ejemplo: Barranco"
            className="h-11 w-full rounded-[10px] border border-line bg-surface px-3 focus:border-brand focus:outline-none disabled:opacity-50"
          />
        </div>
        <Select
          label="Especialidad"
          placeholder="Todas"
          value={especialidadId}
          onChange={(e) => setFilter('especialidad', e.target.value)}
          options={(especialidades.data ?? []).map((e) => ({ value: String(e.id), label: e.nombre }))}
        />
        <Tabs
          label="Vista"
          value={vista}
          onChange={(v) => setFilter('vista', v === 'lista' ? '' : v)}
          options={[
            { value: 'lista', label: 'Lista' },
            { value: 'mapa', label: 'Mapa' },
          ]}
        />
      </div>

      {geo.error && (
        <p role="alert" className="mb-4 rounded-[10px] bg-sun/20 px-3 py-2">
          {geo.error}
        </p>
      )}
      {cercanos && <p className="mb-4 text-ink-soft">Centros a menos de 15 km, del más cercano al más lejano.</p>}

      {centros.loading ? (
        <Skeleton rows={4} height="h-28" />
      ) : centros.error ? (
        <EmptyState icon={Building2} tone="error" title="No pudimos cargar los centros" message={centros.error} actionLabel="Reintentar" onAction={centros.retry} />
      ) : lista.length === 0 ? (
        <EmptyState
          icon={SearchX}
          title={cercanos ? 'No hay centros cerca de ti' : 'Ningún centro coincide con tu búsqueda'}
          message="Prueba con otro nombre o quita los filtros."
          actionLabel="Quitar filtros"
          onAction={limpiarFiltros}
        />
      ) : vista === 'mapa' ? (
        <CentrosMap centros={lista} ubicacion={geo.coords} height={480} />
      ) : (
        <div className="grid gap-3 md:grid-cols-2">
          {lista.map((c) => (
            <CentroCard key={c.id} centro={c} distanciaKm={c.distanciaKm} />
          ))}
        </div>
      )}

      {pagina && !centros.loading && (
        <Pagination
          page={pagina.page}
          size={pagina.size}
          totalPages={pagina.totalPages}
          totalElements={pagina.totalElements}
          onPageChange={setPage}
          onSizeChange={setSize}
        />
      )}
    </>
  );
}
