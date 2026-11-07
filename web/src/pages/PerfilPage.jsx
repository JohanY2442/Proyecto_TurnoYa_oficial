import { useEffect } from 'react';
import PropTypes from 'prop-types';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { UserRound } from 'lucide-react';
import PageHeader from '../components/ui/PageHeader';
import Card from '../components/ui/Card';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import Skeleton from '../components/ui/Skeleton';
import EmptyState from '../components/ui/EmptyState';
import { useAuth } from '../hooks/useAuth';
import { useFetch } from '../hooks/useFetch';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { pacienteService } from '../services/pacienteService';
import { getErrorMessage, getFieldErrors } from '../utils/errorMessages';
import { formatFecha } from '../utils/formatters';
import { ROLES } from '../utils/constants';

const ROL_LABEL = { PACIENTE: 'Paciente', MEDICO: 'Médico', ADMINISTRADOR: 'Administrador' };

function Dato({ label, value }) {
  return (
    <div>
      <dt className="text-sm text-ink-soft">{label}</dt>
      <dd className="font-bold">{value || 'No registrado'}</dd>
    </div>
  );
}

Dato.propTypes = { label: PropTypes.string.isRequired, value: PropTypes.string };

function PerfilPaciente() {
  const { updateUser } = useAuth();
  const { data, loading, error, retry, setData } = useFetch((signal) => pacienteService.miPerfil(signal), []);
  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isSubmitting, isDirty },
  } = useForm({ mode: 'onChange' });

  useEffect(() => {
    if (data) reset({ nombre: data.nombre, telefono: data.telefono ?? '' });
  }, [data, reset]);

  const onSubmit = async (form) => {
    try {
      const actualizado = await pacienteService.actualizarMiPerfil({ nombre: form.nombre, telefono: form.telefono || null });
      setData(actualizado);
      updateUser({ nombre: actualizado.nombre, telefono: actualizado.telefono });
      toast.success('Datos guardados');
    } catch (err) {
      const campos = getFieldErrors(err);
      Object.entries(campos).forEach(([c, m]) => setError(c, { message: m }));
      if (!Object.keys(campos).length) toast.error(getErrorMessage(err));
    }
  };

  if (loading) return <Skeleton rows={2} height="h-40" />;
  if (error) return <EmptyState icon={UserRound} tone="error" title="No pudimos cargar tu perfil" message={error} actionLabel="Reintentar" onAction={retry} />;

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card>
        <h2 className="mb-4 text-xl font-bold">Datos personales</h2>
        <dl className="grid gap-4 sm:grid-cols-2">
          <Dato label="Correo" value={data.email} />
          <Dato label="DNI" value={data.dni} />
          <Dato label="Fecha de nacimiento" value={formatFecha(`${data.fechaNacimiento}T00:00:00`)} />
          <Dato label="Tipo de cuenta" value="Paciente" />
        </dl>
      </Card>
      <Card>
        <h2 className="mb-4 text-xl font-bold">Editar contacto</h2>
        <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
          <Input
            label="Nombre completo"
            error={errors.nombre?.message}
            {...register('nombre', {
              required: 'Escribe tu nombre',
              minLength: { value: 2, message: 'Mínimo 2 caracteres' },
              maxLength: { value: 100, message: 'Máximo 100 caracteres' },
            })}
          />
          <Input
            label="Celular"
            inputMode="tel"
            maxLength={9}
            placeholder="987654321"
            error={errors.telefono?.message}
            {...register('telefono', { validate: (v) => !v || /^9\d{8}$/.test(v) || 'Debe tener 9 dígitos y empezar con 9' })}
          />
          <Button type="submit" loading={isSubmitting} disabled={!isDirty}>
            Guardar cambios
          </Button>
        </form>
      </Card>
    </div>
  );
}

export default function PerfilPage() {
  useDocumentTitle('Mi perfil');
  const { user } = useAuth();
  return (
    <>
      <PageHeader title="Mi perfil" />
      {user.rol === ROLES.PACIENTE ? (
        <PerfilPaciente />
      ) : (
        <Card className="max-w-xl">
          <dl className="grid gap-4 sm:grid-cols-2">
            <Dato label="Nombre" value={user.nombre} />
            <Dato label="Correo" value={user.email} />
            <Dato label="Teléfono" value={user.telefono} />
            <Dato label="Tipo de cuenta" value={ROL_LABEL[user.rol]} />
          </dl>
        </Card>
      )}
    </>
  );
}
