import { useNavigate } from 'react-router-dom';
import { CalendarX, Ticket } from 'lucide-react';
import PageHeader from '../components/ui/PageHeader';
import Tabs from '../components/ui/Tabs';
import Skeleton from '../components/ui/Skeleton';
import EmptyState from '../components/ui/EmptyState';
import Pagination from '../components/ui/Pagination';
import TurnoCard from '../components/turnos/TurnoCard';
import { useFetch } from '../hooks/useFetch';
import { usePagination } from '../hooks/usePagination';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { turnoService } from '../services/turnoService';
import { ESTADOS_TURNO } from '../utils/constants';

const FILTROS = [{ value: '', label: 'Todos' }, ...Object.entries(ESTADOS_TURNO).map(([value, e]) => ({ value, label: e.label }))];

export default function TurnosPage() {
  useDocumentTitle('Mis turnos');
  const navigate = useNavigate();
  const { page, size, setPage, setSize, getParam, setFilter } = usePagination();
  const estado = getParam('estado');

  const { data, loading, error, retry } = useFetch(
    (signal) => turnoService.misTurnos({ page, size, estado }, signal),
    [page, size, estado],
  );

  return (
    <>
      <PageHeader title="Mis turnos" description="Tus reservas, de la más reciente a la más antigua." />
      <div className="mb-6 overflow-x-auto">
        <Tabs label="Filtrar por estado" options={FILTROS} value={estado} onChange={(v) => setFilter('estado', v)} />
      </div>

      {loading ? (
        <Skeleton rows={5} />
      ) : error ? (
        <EmptyState icon={CalendarX} tone="error" title="No pudimos cargar tus turnos" message={error} actionLabel="Reintentar" onAction={retry} />
      ) : data.content.length === 0 ? (
        estado ? (
          <EmptyState icon={Ticket} title="No tienes turnos en este estado" actionLabel="Ver todos" onAction={() => setFilter('estado', '')} />
        ) : (
          <EmptyState
            icon={Ticket}
            title="Aún no tienes turnos"
            message="Busca un centro cerca de ti y reserva en un minuto."
            actionLabel="Buscar un centro"
            onAction={() => navigate('/centros')}
          />
        )
      ) : (
        <div className="space-y-3">
          {data.content.map((t) => (
            <TurnoCard key={t.id} turno={t} />
          ))}
        </div>
      )}

      {data && !loading && (
        <Pagination
          page={data.page}
          size={data.size}
          totalPages={data.totalPages}
          totalElements={data.totalElements}
          onPageChange={setPage}
          onSizeChange={setSize}
        />
      )}
    </>
  );
}
