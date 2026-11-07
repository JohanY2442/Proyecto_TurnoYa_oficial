import { useEffect, useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { BarChart3 } from 'lucide-react';
import PageHeader from '../../components/ui/PageHeader';
import Select from '../../components/ui/Select';
import Skeleton from '../../components/ui/Skeleton';
import EmptyState from '../../components/ui/EmptyState';
import StatTile from '../../components/dashboard/StatTile';
import BarChartCard from '../../components/dashboard/BarChartCard';
import { useFetch } from '../../hooks/useFetch';
import { centroService } from '../../services/centroService';
import { ESTADOS_TURNO, NIVELES_URGENCIA } from '../../utils/constants';
import { formatFecha, formatMinutos, hoyISO } from '../../utils/formatters';

export default function AdminDashboard() {
  const [params, setParams] = useSearchParams();
  const fecha = params.get('fecha') || hoyISO();
  const centros = useFetch((signal) => centroService.listar({ page: 0, size: 100 }, signal), []);
  const listaCentros = useMemo(() => centros.data?.content ?? [], [centros.data]);
  const centroId = params.get('centro') || (listaCentros[0] ? String(listaCentros[0].id) : '');

  const set = (key, value) =>
    setParams((prev) => {
      const next = new URLSearchParams(prev);
      next.set(key, value);
      return next;
    });

  // Si no viene un centro en la URL, se fija el primero para que el enlace sea compartible.
  useEffect(() => {
    if (!params.get('centro') && listaCentros[0]) set('centro', String(listaCentros[0].id));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [listaCentros]);

  const stats = useFetch((signal) => centroService.estadisticas(centroId, fecha, signal), [centroId, fecha], { enabled: !!centroId });
  const s = stats.data;

  const porEstado = s ? Object.entries(s.porEstado).map(([k, v]) => ({ label: ESTADOS_TURNO[k].label, value: v })) : [];
  const porUrgencia = s
    ? Object.entries(s.porUrgencia).map(([k, v]) => ({ label: NIVELES_URGENCIA[k].label, value: v, color: NIVELES_URGENCIA[k].color }))
    : [];
  const porEspecialidad = s ? Object.entries(s.porEspecialidad).map(([k, v]) => ({ label: k, value: v })) : [];

  return (
    <>
      <PageHeader
        title="Panel de administración"
        description={s ? `${s.centro}, ${formatFecha(`${s.fecha}T00:00:00`)}` : 'Resumen del día por centro de salud.'}
        actions={
          <>
            <Link to="/admin/centros" className="inline-flex h-11 items-center rounded-[10px] border border-line bg-surface px-4 font-bold hover:bg-surface-2">
              Gestionar centros
            </Link>
            <Link to="/admin/personas" className="inline-flex h-11 items-center rounded-[10px] border border-line bg-surface px-4 font-bold hover:bg-surface-2">
              Pacientes y médicos
            </Link>
          </>
        }
      />

      <div className="mb-6 grid gap-3 sm:grid-cols-[1fr_14rem]">
        <Select
          label="Centro"
          value={centroId}
          onChange={(e) => set('centro', e.target.value)}
          options={listaCentros.map((c) => ({ value: String(c.id), label: c.nombre }))}
        />
        <div>
          <label htmlFor="fecha-stats" className="mb-1.5 block text-sm font-bold">
            Día
          </label>
          <input
            id="fecha-stats"
            type="date"
            value={fecha}
            onChange={(e) => e.target.value && set('fecha', e.target.value)}
            className="h-11 w-full rounded-[10px] border border-line bg-surface px-3"
          />
        </div>
      </div>

      {centros.loading || stats.loading ? (
        <Skeleton rows={3} height="h-32" />
      ) : centros.error || stats.error ? (
        <EmptyState icon={BarChart3} tone="error" title="No pudimos cargar las estadísticas" message={centros.error || stats.error} actionLabel="Reintentar" onAction={() => (centros.error ? centros.retry() : stats.retry())} />
      ) : !s ? (
        <EmptyState icon={BarChart3} title="Aún no hay centros" message="Crea el primer centro para ver sus estadísticas." />
      ) : (
        <div className="space-y-6">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <StatTile label="Turnos del día" value={s.totalTurnos} detail={`de ${s.capacidadDiaria} cupos`} />
            <StatTile label="En sala de espera" value={s.enEspera} />
            <StatTile label="Cupos libres" value={s.cuposDisponibles} />
            <StatTile label="Espera promedio" value={s.esperaEstimadaPromedioMin ? formatMinutos(s.esperaEstimadaPromedioMin) : '0 min'} detail="estimada para quienes esperan" />
          </div>
          <div className="grid gap-6 lg:grid-cols-2">
            <BarChartCard title="Turnos por estado" data={porEstado} />
            <BarChartCard title="Pacientes por urgencia del triage" data={porUrgencia} unidad="pacientes" />
          </div>
          <BarChartCard title="Turnos por especialidad" data={porEspecialidad} horizontal height={Math.max(160, porEspecialidad.length * 48)} />
        </div>
      )}
    </>
  );
}
