import { useCallback, useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { BellRing, CircleCheck, Stethoscope, Ticket, XCircle } from 'lucide-react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Skeleton from '../components/ui/Skeleton';
import EmptyState from '../components/ui/EmptyState';
import ConfirmDialog from '../components/ui/ConfirmDialog';
import TurnoTicket from '../components/turnos/TurnoTicket';
import SintomaSelector from '../components/turnos/SintomaSelector';
import UrgenciaBadge from '../components/turnos/UrgenciaBadge';
import LiveIndicator from '../components/turnos/LiveIndicator';
import { useFetch } from '../hooks/useFetch';
import { useAuth } from '../hooks/useAuth';
import { useColaEnVivo } from '../hooks/useColaEnVivo';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { turnoService } from '../services/turnoService';
import { triageService } from '../services/triageService';
import { getErrorMessage, isStatus } from '../utils/errorMessages';
import { codigoTurno, formatFechaHora } from '../utils/formatters';
import { ROLES } from '../utils/constants';

function TriageForm({ turnoId, onRegistrado }) {
  const sintomas = useFetch((signal) => triageService.sintomas(signal), []);
  const [seleccionados, setSeleccionados] = useState([]);
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState(null);

  const enviar = async () => {
    if (!seleccionados.length) {
      setError('Marca al menos un síntoma.');
      return;
    }
    setEnviando(true);
    setError(null);
    try {
      const triage = await triageService.registrar(turnoId, seleccionados);
      toast.success('Síntomas registrados. Ya estás en la cola.');
      onRegistrado(triage);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setEnviando(false);
    }
  };

  return (
    <Card>
      <h2 className="text-xl font-bold">¿Qué síntomas tienes?</h2>
      <p className="mt-1 mb-4 text-ink-soft">
        Hazlo cuando llegues al centro. Con esto calculamos tu urgencia y te ubicamos en la cola.
      </p>
      {sintomas.loading ? (
        <Skeleton rows={3} height="h-12" />
      ) : sintomas.error ? (
        <EmptyState title="No pudimos cargar la lista de síntomas" message={sintomas.error} actionLabel="Reintentar" onAction={sintomas.retry} tone="error" />
      ) : (
        <SintomaSelector sintomas={sintomas.data} seleccionados={seleccionados} onChange={setSeleccionados} disabled={enviando} />
      )}
      {error && (
        <p role="alert" className="mt-4 text-danger">
          {error}
        </p>
      )}
      <Button className="mt-5" onClick={enviar} loading={enviando} disabled={sintomas.loading}>
        Registrar síntomas y entrar a la cola
      </Button>
    </Card>
  );
}

TriageForm.propTypes = { turnoId: PropTypes.number.isRequired, onRegistrado: PropTypes.func.isRequired };

/** Avisa con una notificación del navegador cuando quedan pocas personas adelante. */
function useAvisoTurnoCercano(posicion) {
  const avisado = useRef(false);
  useEffect(() => {
    if (!posicion || avisado.current) return;
    if (posicion.personasAdelante <= 1) {
      avisado.current = true;
      toast('Prepárate: eres el siguiente o casi.', { icon: '🔔', duration: 6000 });
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification('TurnoYa', { body: 'Tu turno está por llegar. Acércate al consultorio.' });
      }
    }
  }, [posicion]);
}

export default function TurnoDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { hasRole } = useAuth();
  const esPaciente = hasRole(ROLES.PACIENTE);
  useDocumentTitle(`Turno ${codigoTurno(id)}`);

  const turnoFetch = useFetch((signal) => turnoService.obtener(id, signal), [id]);
  const turno = turnoFetch.data;
  const enCola = turno?.estado === 'EN_ESPERA';

  const triage = useFetch((signal) => triageService.obtener(id, signal), [id, turno?.estado], {
    enabled: !!turno && turno.estado !== 'RESERVADO' && turno.estado !== 'CANCELADO' && turno.nivelUrgencia != null,
  });
  const posicionFetch = useFetch((signal) => turnoService.posicion(id, signal), [id, turno?.estado], {
    enabled: esPaciente && enCola,
  });

  // Recarga silenciosa (sin skeleton) cuando la cola cambia.
  const { setData: setTurno } = turnoFetch;
  const { setData: setPosicion } = posicionFetch;
  const refrescar = useCallback(async () => {
    try {
      const nuevo = await turnoService.obtener(id);
      setTurno(nuevo);
      if (esPaciente && nuevo.estado === 'EN_ESPERA') setPosicion(await turnoService.posicion(id));
    } catch {
      /* el siguiente aviso lo vuelve a intentar */
    }
  }, [id, esPaciente, setTurno, setPosicion]);

  const modoVivo = useColaEnVivo(enCola ? turno.centroId : null, enCola ? turno.especialidadId : null, refrescar);
  useAvisoTurnoCercano(posicionFetch.data);

  const [confirmar, setConfirmar] = useState(false);
  const [accion, setAccion] = useState(null);

  const cancelar = async () => {
    setAccion('cancelar');
    try {
      setTurno(await turnoService.cancelar(id));
      toast.success('Turno cancelado');
      setConfirmar(false);
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setAccion(null);
    }
  };

  const cambiarEstado = async (estado) => {
    setAccion(estado);
    try {
      setTurno(await turnoService.cambiarEstado(id, estado));
      toast.success(estado === 'ATENDIDO' ? 'Atención finalizada' : 'Paciente en atención');
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setAccion(null);
    }
  };

  const pedirPermisoNotificaciones = async () => {
    if (!('Notification' in window)) {
      toast.error('Tu navegador no permite notificaciones.');
      return;
    }
    const permiso = await Notification.requestPermission();
    toast(permiso === 'granted' ? 'Te avisaremos cuando te toque.' : 'Sin permiso no podemos avisarte. Mantén esta página abierta.');
  };

  if (turnoFetch.loading) return <Skeleton rows={2} height="h-56" />;
  if (turnoFetch.error) {
    return (
      <EmptyState
        icon={Ticket}
        tone="error"
        title={isStatus(turnoFetch.errorObj, 404) ? 'Este turno no existe' : isStatus(turnoFetch.errorObj, 403) ? 'Este turno no es tuyo' : 'No pudimos cargar el turno'}
        message={turnoFetch.error}
        actionLabel="Ir a mis turnos"
        onAction={() => navigate(esPaciente ? '/turnos' : '/dashboard')}
      />
    );
  }

  const cancelable = esPaciente && ['RESERVADO', 'EN_ESPERA'].includes(turno.estado);

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,26rem)_1fr]">
      <div className="space-y-4">
        <TurnoTicket turno={turno} posicion={enCola && esPaciente ? posicionFetch.data : null} showQr={esPaciente} />
        {enCola && (
          <div className="flex flex-wrap items-center justify-between gap-2">
            <LiveIndicator modo={modoVivo} />
            {esPaciente && (
              <Button variant="ghost" size="sm" icon={BellRing} onClick={pedirPermisoNotificaciones}>
                Avisarme cuando me toque
              </Button>
            )}
          </div>
        )}
        {cancelable && (
          <Button variant="outline" icon={XCircle} onClick={() => setConfirmar(true)} className="w-full">
            Cancelar turno
          </Button>
        )}
      </div>

      <div className="space-y-6">
        {turno.estado === 'EN_ATENCION' && esPaciente && (
          <div role="status" className="rounded-2xl bg-brand p-5 text-brand-ink">
            <p className="font-display text-2xl font-extrabold">Es tu turno</p>
            <p className="mt-1">{turno.medico ? `${turno.medico} te está esperando.` : 'Acércate al consultorio.'}</p>
          </div>
        )}

        {turno.estado === 'RESERVADO' && esPaciente && <TriageForm turnoId={turno.id} onRegistrado={refrescar} />}

        {triage.data && (
          <Card>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2 className="text-xl font-bold">Triage</h2>
              <UrgenciaBadge nivel={triage.data.nivelUrgencia} />
            </div>
            <p className="mt-1 text-sm text-ink-soft">Registrado el {formatFechaHora(triage.data.fechaRegistro)}</p>
            <ul className="mt-4 flex flex-wrap gap-2">
              {triage.data.sintomas.map((s) => (
                <li key={s} className="rounded-lg bg-surface-2 px-3 py-1.5 text-sm">
                  {s.replaceAll('_', ' ').toLowerCase()}
                </li>
              ))}
            </ul>
          </Card>
        )}

        {!esPaciente && ['RESERVADO', 'EN_ESPERA', 'EN_ATENCION'].includes(turno.estado) && (
          <Card>
            <h2 className="text-xl font-bold">Atención</h2>
            <p className="mt-1 mb-4 text-ink-soft">Paciente: {turno.paciente}</p>
            <div className="flex flex-wrap gap-2">
              {turno.estado !== 'EN_ATENCION' && (
                <Button icon={Stethoscope} loading={accion === 'EN_ATENCION'} disabled={!!accion} onClick={() => cambiarEstado('EN_ATENCION')}>
                  Atender ahora
                </Button>
              )}
              {turno.estado === 'EN_ATENCION' && (
                <Button icon={CircleCheck} loading={accion === 'ATENDIDO'} disabled={!!accion} onClick={() => cambiarEstado('ATENDIDO')}>
                  Finalizar atención
                </Button>
              )}
            </div>
          </Card>
        )}

        {turno.estado === 'ATENDIDO' && esPaciente && (
          <EmptyState icon={CircleCheck} title="Atención terminada" message="Gracias por usar TurnoYa. Si necesitas otra cita, reserva un nuevo turno." actionLabel="Reservar otro turno" onAction={() => navigate('/centros')} />
        )}
      </div>

      <ConfirmDialog
        open={confirmar}
        title="¿Cancelar este turno?"
        message={`Liberarás tu cupo de ${turno.especialidad} en ${turno.centro}. Si lo necesitas después, tendrás que reservar de nuevo.`}
        confirmLabel="Cancelar turno"
        onConfirm={cancelar}
        onCancel={() => setConfirmar(false)}
        loading={accion === 'cancelar'}
      />
    </div>
  );
}
