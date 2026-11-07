import PropTypes from 'prop-types';
import { QRCodeSVG } from 'qrcode.react';
import { codigoTurno, formatFechaHora, formatMinutos } from '../../utils/formatters';
import { NIVELES_URGENCIA } from '../../utils/constants';
import EstadoBadge from './EstadoBadge';

/**
 * El ticket del turno, como el papelito que te dan en la posta: código grande,
 * franja con el color de la urgencia y, si está en cola, tu posición.
 */
export default function TurnoTicket({ turno, posicion, showQr = false }) {
  const color = turno.nivelUrgencia ? NIVELES_URGENCIA[turno.nivelUrgencia].color : 'var(--line)';

  return (
    <article
      className="ticket ticket-enter relative overflow-hidden rounded-[20px] border border-line bg-surface"
      aria-label={`Turno ${codigoTurno(turno.id)}`}
    >
      <div aria-hidden="true" className="absolute inset-y-0 left-0 w-2" style={{ backgroundColor: color }} />
      <div className="px-7 pt-6 pb-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm text-ink-soft">{turno.centro}</p>
            <p className="font-bold">{turno.especialidad}</p>
          </div>
          <EstadoBadge estado={turno.estado} />
        </div>
        <p className="mt-4 font-display text-5xl font-extrabold tracking-tight sm:text-6xl">{codigoTurno(turno.id)}</p>
        <p className="mt-1 text-ink-soft">{formatFechaHora(turno.fechaHora)}</p>
      </div>

      <div className="ticket-cut mx-5" />

      <div className="flex items-end justify-between gap-4 px-7 pt-5 pb-6">
        {posicion ? (
          <dl className="flex gap-8">
            <div>
              <dt className="text-sm text-ink-soft">Tu lugar</dt>
              <dd className="font-display text-4xl font-extrabold">{posicion.posicion}°</dd>
            </div>
            <div>
              <dt className="text-sm text-ink-soft">Espera aprox.</dt>
              <dd className="font-display text-4xl font-extrabold">{formatMinutos(posicion.minutosEstimados)}</dd>
            </div>
          </dl>
        ) : (
          <p className="max-w-[18rem] text-sm text-ink-soft">
            {turno.medico ? `Te atiende: ${turno.medico}` : 'Muestra este código en ventanilla.'}
          </p>
        )}
        {showQr && (
          <div className="rounded-lg bg-white p-2">
            <QRCodeSVG value={`turnoya:turno:${turno.id}`} size={76} aria-label="Código QR del turno" />
          </div>
        )}
      </div>
    </article>
  );
}

TurnoTicket.propTypes = {
  turno: PropTypes.shape({
    id: PropTypes.number.isRequired,
    centro: PropTypes.string,
    especialidad: PropTypes.string,
    fechaHora: PropTypes.string,
    estado: PropTypes.string.isRequired,
    nivelUrgencia: PropTypes.string,
    medico: PropTypes.string,
  }).isRequired,
  posicion: PropTypes.shape({ posicion: PropTypes.number, minutosEstimados: PropTypes.number }),
  showQr: PropTypes.bool,
};
