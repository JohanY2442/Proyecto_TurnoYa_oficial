import PropTypes from 'prop-types';
import { useForm } from 'react-hook-form';
import { Link, useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Building2, CalendarPlus, MapPin, Users } from 'lucide-react';
import Card from '../components/ui/Card';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';
import Button from '../components/ui/Button';
import Skeleton from '../components/ui/Skeleton';
import EmptyState from '../components/ui/EmptyState';
import CentrosMap from '../components/centros/CentrosMap';
import { useFetch } from '../hooks/useFetch';
import { useAuth } from '../hooks/useAuth';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { centroService } from '../services/centroService';
import { turnoService } from '../services/turnoService';
import { getErrorMessage, isStatus } from '../utils/errorMessages';
import { toDateTimeLocal } from '../utils/formatters';
import { ROLES } from '../utils/constants';

/** Próxima media hora, para proponer una hora razonable al reservar. */
const proximaMediaHora = () => {
  const d = new Date(Date.now() + 30 * 60000);
  d.setMinutes(d.getMinutes() < 30 ? 30 : 60, 0, 0);
  return toDateTimeLocal(d);
};

function ReservaForm({ centro }) {
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm({
    mode: 'onChange',
    defaultValues: { especialidadId: centro.especialidades[0]?.id ? String(centro.especialidades[0].id) : '', fechaHora: proximaMediaHora() },
  });

  const onSubmit = async ({ especialidadId, fechaHora }) => {
    try {
      const turno = await turnoService.reservar({ centroId: centro.id, especialidadId: Number(especialidadId), fechaHora });
      toast.success('Turno reservado');
      navigate(`/turnos/${turno.id}`);
    } catch (error) {
      setError('root', { message: getErrorMessage(error) });
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
      <Select
        label="Especialidad"
        error={errors.especialidadId?.message}
        options={centro.especialidades.map((e) => ({ value: String(e.id), label: e.nombre }))}
        {...register('especialidadId', { required: 'Elige una especialidad' })}
      />
      <Input
        label="Día y hora"
        type="datetime-local"
        min={toDateTimeLocal(new Date())}
        hint="Llega unos minutos antes para registrar tus síntomas."
        error={errors.fechaHora?.message}
        {...register('fechaHora', {
          required: 'Elige el día y la hora',
          validate: (v) => new Date(v) >= new Date(Date.now() - 60000) || 'Elige una hora que no haya pasado',
        })}
      />
      {errors.root && (
        <p role="alert" className="rounded-[10px] bg-danger/10 px-3 py-2 text-danger">
          {errors.root.message}
        </p>
      )}
      <Button type="submit" icon={CalendarPlus} loading={isSubmitting} className="w-full">
        Reservar turno
      </Button>
    </form>
  );
}

ReservaForm.propTypes = {
  centro: PropTypes.shape({
    id: PropTypes.number.isRequired,
    especialidades: PropTypes.arrayOf(PropTypes.shape({ id: PropTypes.number, nombre: PropTypes.string })).isRequired,
  }).isRequired,
};

export default function CentroDetailPage() {
  const { id } = useParams();
  const { isAuthenticated, hasRole } = useAuth();
  const navigate = useNavigate();
  const { data: centro, loading, error, errorObj, retry } = useFetch((signal) => centroService.obtener(id, signal), [id]);
  useDocumentTitle(centro?.nombre ?? 'Centro');

  if (loading) return <Skeleton rows={2} height="h-48" />;
  if (error) {
    return isStatus(errorObj, 404) ? (
      <EmptyState icon={Building2} title="Este centro no existe" message="Puede que lo hayan dado de baja." actionLabel="Ver todos los centros" onAction={() => navigate('/centros')} />
    ) : (
      <EmptyState icon={Building2} tone="error" title="No pudimos cargar el centro" message={error} actionLabel="Reintentar" onAction={retry} />
    );
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_24rem]">
      <div>
        <h1 className="text-4xl font-extrabold">{centro.nombre}</h1>
        <p className="mt-2 flex items-center gap-2 text-ink-soft">
          <MapPin aria-hidden="true" size={18} /> {centro.direccion}
        </p>
        <p className="mt-1 flex items-center gap-2 text-ink-soft">
          <Users aria-hidden="true" size={18} /> Atiende hasta {centro.capacidadDiaria} pacientes por día
        </p>

        <h2 className="mt-8 mb-3 text-xl font-bold">Especialidades</h2>
        <ul className="flex flex-wrap gap-2">
          {centro.especialidades.map((e) => (
            <li key={e.id} className="rounded-xl border border-line bg-surface px-3 py-2">
              <span className="font-bold">{e.nombre}</span>
              {e.descripcion && <span className="block text-sm text-ink-soft">{e.descripcion}</span>}
            </li>
          ))}
        </ul>

        <div className="mt-8">
          <CentrosMap centros={[centro]} height={300} />
        </div>
      </div>

      <Card as="aside" className="h-fit lg:sticky lg:top-24">
        <h2 className="mb-4 text-xl font-bold">Reservar turno</h2>
        {!isAuthenticated ? (
          <div className="space-y-3">
            <p className="text-ink-soft">Ingresa con tu cuenta de paciente para reservar.</p>
            <Link
              to={`/login?redirect=/centros/${centro.id}`}
              className="flex h-11 items-center justify-center rounded-[10px] bg-brand font-bold text-brand-ink"
            >
              Ingresar para reservar
            </Link>
          </div>
        ) : hasRole(ROLES.PACIENTE) ? (
          centro.especialidades.length ? (
            <ReservaForm centro={centro} />
          ) : (
            <p className="text-ink-soft">Este centro aún no tiene especialidades disponibles.</p>
          )
        ) : (
          <p className="text-ink-soft">Solo los pacientes pueden reservar turnos.</p>
        )}
      </Card>
    </div>
  );
}
