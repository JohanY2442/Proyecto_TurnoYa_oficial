import { Link, useNavigate } from 'react-router-dom';
import { CalendarPlus, Ticket } from 'lucide-react';
import PageHeader from '../../components/ui/PageHeader';
import Skeleton from '../../components/ui/Skeleton';
import EmptyState from '../../components/ui/EmptyState';
import TurnoTicket from '../../components/turnos/TurnoTicket';
import TurnoCard from '../../components/turnos/TurnoCard';
import { useAuth } from '../../hooks/useAuth';
import { useFetch } from '../../hooks/useFetch';
import { turnoService } from '../../services/turnoService';
import { ESTADOS_ACTIVOS, ESTADOS_TURNO } from '../../utils/constants';

export default function PacienteDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { data, loading, error, retry } = useFetch((signal) => turnoService.misTurnos({ page: 0, size: 25 }, signal), []);

  const turnos = data?.content ?? [];
  const activo = turnos.find((t) => ESTADOS_ACTIVOS.includes(t.estado));
  const recientes = turnos.filter((t) => t !== activo).slice(0, 3);

  return (
    <>
      <PageHeader title={`Hola, ${user.nombre.split(' ')[0]}`} description={activo ? ESTADOS_TURNO[activo.estado].hint + '.' : 'No tienes turnos activos.'} />

      {loading ? (
        <Skeleton rows={2} height="h-40" />
      ) : error ? (
        <EmptyState icon={Ticket} tone="error" title="No pudimos cargar tus turnos" message={error} actionLabel="Reintentar" onAction={retry} />
      ) : (
        <div className="grid gap-8 lg:grid-cols-[26rem_1fr]">
          <div>
            {activo ? (
              <Link to={`/turnos/${activo.id}`} className="block" aria-label="Ver tu turno activo">
                <TurnoTicket turno={activo} />
                <span className="mt-3 inline-block font-bold text-brand hover:underline">
                  {activo.estado === 'RESERVADO' ? 'Registrar mis síntomas' : 'Ver mi lugar en la cola'}
                </span>
              </Link>
            ) : (
              <EmptyState
                icon={CalendarPlus}
                title="Reserva tu próximo turno"
                message="Elige el centro y la especialidad. Te toma un minuto."
                actionLabel="Buscar un centro"
                onAction={() => navigate('/centros')}
              />
            )}
          </div>
          <section aria-labelledby="historial">
            <div className="mb-3 flex items-center justify-between">
              <h2 id="historial" className="text-xl font-bold">
                Últimos turnos
              </h2>
              {data.totalElements > 0 && (
                <Link to="/turnos" className="font-bold text-brand hover:underline">
                  Ver todos ({data.totalElements})
                </Link>
              )}
            </div>
            {recientes.length ? (
              <div className="space-y-3">
                {recientes.map((t) => (
                  <TurnoCard key={t.id} turno={t} />
                ))}
              </div>
            ) : (
              <p className="text-ink-soft">Aquí verás tu historial de atenciones.</p>
            )}
          </section>
        </div>
      )}
    </>
  );
}
