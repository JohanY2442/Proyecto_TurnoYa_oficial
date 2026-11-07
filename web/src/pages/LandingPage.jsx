import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import TurnoTicket from '../components/turnos/TurnoTicket';

const TICKET_EJEMPLO = {
  id: 128,
  centro: 'Centro de Salud Barranco',
  especialidad: 'Medicina General',
  fechaHora: new Date().toISOString(),
  estado: 'EN_ESPERA',
  nivelUrgencia: 'MEDIO',
};

const PASOS = [
  { titulo: 'Reserva desde tu celular', texto: 'Elige el centro más cercano y la especialidad. Si ya no hay cupos, lo sabes antes de salir.' },
  { titulo: 'Marca tus síntomas al llegar', texto: 'El triage calcula tu urgencia. Un dolor de pecho no espera lo mismo que un resfrío.' },
  { titulo: 'Sigue tu lugar en la cola', texto: 'Ves tu posición y la espera aproximada en vivo, y te avisamos cuando te toca.' },
];

export default function LandingPage() {
  useDocumentTitle('');
  const { isAuthenticated } = useAuth();

  return (
    <div className="space-y-16">
      <section className="grid items-center gap-10 pt-4 md:grid-cols-[1.15fr_1fr]">
        <div>
          <h1 className="font-display text-5xl leading-[1.02] font-extrabold sm:text-6xl">
            Saber cuánto falta para que te atiendan.
          </h1>
          <p className="mt-5 max-w-xl text-lg text-ink-soft">
            TurnoYa ordena la cola de la posta según la urgencia de cada paciente y te muestra tu lugar en tiempo real.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link to="/centros" className="inline-flex h-12 items-center rounded-[10px] bg-brand px-6 text-lg font-bold text-brand-ink hover:bg-brand-strong">
              Buscar un centro
            </Link>
            <Link
              to={isAuthenticated ? '/dashboard' : '/registro'}
              className="inline-flex h-12 items-center rounded-[10px] border border-line bg-surface px-6 text-lg font-bold hover:bg-surface-2"
            >
              {isAuthenticated ? 'Ir a mi panel' : 'Crear cuenta'}
            </Link>
          </div>
        </div>
        <div className="mx-auto w-full max-w-sm rotate-[1.5deg]">
          <TurnoTicket turno={TICKET_EJEMPLO} posicion={{ posicion: 3, minutosEstimados: 30 }} />
        </div>
      </section>

      <section aria-labelledby="como-funciona">
        <h2 id="como-funciona" className="text-2xl font-extrabold">
          Cómo funciona
        </h2>
        <ol className="mt-6 grid gap-6 md:grid-cols-3">
          {PASOS.map((p, i) => (
            <li key={p.titulo} className="border-t-4 border-brand pt-4">
              <span className="font-display text-sm font-bold text-brand">Paso {i + 1}</span>
              <h3 className="mt-1 text-xl font-bold">{p.titulo}</h3>
              <p className="mt-2 text-ink-soft">{p.texto}</p>
            </li>
          ))}
        </ol>
      </section>
    </div>
  );
}
