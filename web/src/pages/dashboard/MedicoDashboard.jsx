import { useCallback, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { CircleCheck, Megaphone, UsersRound } from 'lucide-react';
import PageHeader from '../../components/ui/PageHeader';
import Select from '../../components/ui/Select';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import Skeleton from '../../components/ui/Skeleton';
import EmptyState from '../../components/ui/EmptyState';
import ColaList from '../../components/turnos/ColaList';
import LiveIndicator from '../../components/turnos/LiveIndicator';
import UrgenciaBadge from '../../components/turnos/UrgenciaBadge';
import { useFetch } from '../../hooks/useFetch';
import { useColaEnVivo } from '../../hooks/useColaEnVivo';
import { centroService } from '../../services/centroService';
import { colaService } from '../../services/colaService';
import { medicoService } from '../../services/medicoService';
import { turnoService } from '../../services/turnoService';
import { getErrorMessage } from '../../utils/errorMessages';
import { codigoTurno } from '../../utils/formatters';

export default function MedicoDashboard() {
  const [params, setParams] = useSearchParams();
  const centroId = params.get('centro') ?? '';
  const especialidadId = params.get('especialidad') ?? '';

  const perfil = useFetch((signal) => medicoService.miPerfil(signal), []);
  const centros = useFetch((signal) => centroService.listar({ page: 0, size: 100 }, signal), []);
  const enAtencion = useFetch((signal) => medicoService.enAtencion(signal), []);
  const cola = useFetch((signal) => colaService.obtener(centroId, especialidadId, signal), [centroId, especialidadId], {
    enabled: !!centroId && !!especialidadId,
  });

  const { setData: setCola } = cola;
  const refrescarCola = useCallback(async () => {
    try {
      setCola(await colaService.obtener(centroId, especialidadId));
    } catch {
      /* se reintenta con el próximo aviso */
    }
  }, [centroId, especialidadId, setCola]);
  const modo = useColaEnVivo(centroId, especialidadId, refrescarCola);

  const [llamando, setLlamando] = useState(false);
  const [finalizando, setFinalizando] = useState(null);

  const elegir = (key, value) =>
    setParams((prev) => {
      const next = new URLSearchParams(prev);
      if (value) next.set(key, value);
      else next.delete(key);
      return next;
    });

  const llamarSiguiente = async () => {
    setLlamando(true);
    try {
      const turno = await colaService.llamarSiguiente(centroId, especialidadId);
      toast.success(`Llamaste a ${turno.paciente}`);
      enAtencion.setData((lista) => [...(lista ?? []), turno]);
      refrescarCola();
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setLlamando(false);
    }
  };

  const finalizar = async (turno) => {
    setFinalizando(turno.id);
    try {
      await turnoService.cambiarEstado(turno.id, 'ATENDIDO');
      enAtencion.setData((lista) => lista.filter((t) => t.id !== turno.id));
      toast.success(`Atención de ${turno.paciente} finalizada`);
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setFinalizando(null);
    }
  };

  const especialidades = perfil.data?.especialidades ?? [];
  const items = cola.data ?? [];

  return (
    <>
      <PageHeader title={perfil.data ? perfil.data.nombre : 'Panel del médico'} description="Elige tu consultorio para ver la cola ordenada por urgencia." />

      <div className="mb-6 grid gap-3 sm:grid-cols-2">
        <Select
          label="Centro"
          placeholder="Elige un centro"
          value={centroId}
          onChange={(e) => elegir('centro', e.target.value)}
          options={(centros.data?.content ?? []).map((c) => ({ value: String(c.id), label: c.nombre }))}
        />
        <Select
          label="Especialidad"
          placeholder="Elige una especialidad"
          value={especialidadId}
          onChange={(e) => elegir('especialidad', e.target.value)}
          options={especialidades.map((e) => ({ value: String(e.id), label: e.nombre }))}
        />
      </div>

      <div className="grid gap-8 lg:grid-cols-[1fr_22rem]">
        <section aria-labelledby="cola">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <h2 id="cola" className="text-xl font-bold">
                Sala de espera {cola.data && `(${items.length})`}
              </h2>
              {centroId && especialidadId && <LiveIndicator modo={modo} />}
            </div>
            <Button icon={Megaphone} onClick={llamarSiguiente} loading={llamando} disabled={!items.length}>
              Llamar al siguiente
            </Button>
          </div>
          {!centroId || !especialidadId ? (
            <EmptyState icon={UsersRound} title="Elige centro y especialidad" message="La cola aparece aquí y se actualiza sola." />
          ) : cola.loading ? (
            <Skeleton rows={4} height="h-14" />
          ) : cola.error ? (
            <EmptyState icon={UsersRound} tone="error" title="No pudimos cargar la cola" message={cola.error} actionLabel="Reintentar" onAction={cola.retry} />
          ) : items.length === 0 ? (
            <EmptyState icon={UsersRound} title="No hay pacientes esperando" message="Cuando alguien registre su triage aparecerá aquí." />
          ) : (
            <ColaList items={items} />
          )}
        </section>

        <Card as="aside" className="h-fit">
          <h2 className="text-xl font-bold">Atendiendo ahora</h2>
          {enAtencion.loading ? (
            <Skeleton rows={1} height="h-16" />
          ) : (enAtencion.data ?? []).length === 0 ? (
            <p className="mt-2 text-ink-soft">Nadie en consulta. Llama al siguiente paciente.</p>
          ) : (
            <ul className="mt-3 space-y-3">
              {enAtencion.data.map((t) => (
                <li key={t.id} className="rounded-xl border border-line p-3">
                  <Link to={`/turnos/${t.id}`} className="font-bold hover:underline">
                    {t.paciente}
                  </Link>
                  <p className="text-sm text-ink-soft">
                    {codigoTurno(t.id)}, {t.especialidad}
                  </p>
                  <div className="mt-2 flex items-center justify-between gap-2">
                    <UrgenciaBadge nivel={t.nivelUrgencia} size="sm" />
                    <Button size="sm" icon={CircleCheck} loading={finalizando === t.id} onClick={() => finalizar(t)}>
                      Finalizar
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </>
  );
}
