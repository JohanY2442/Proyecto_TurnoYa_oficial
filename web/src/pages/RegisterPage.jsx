import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import { useAuth } from '../hooks/useAuth';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { getErrorMessage, getFieldErrors } from '../utils/errorMessages';
import { hoyISO } from '../utils/formatters';

// Mismas reglas que valida el backend (RegisterRequest).
const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,64}$/;

export default function RegisterPage() {
  useDocumentTitle('Crear cuenta');
  const { register: registrar } = useAuth();
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm({ mode: 'onChange' });

  const onSubmit = async (datos) => {
    try {
      await registrar({ ...datos, telefono: datos.telefono || null });
      toast.success('Cuenta creada. Ya puedes reservar tu turno.');
      navigate('/centros', { replace: true });
    } catch (error) {
      const campos = getFieldErrors(error);
      Object.entries(campos).forEach(([campo, mensaje]) => setError(campo, { message: mensaje }));
      if (!Object.keys(campos).length) setError('root', { message: getErrorMessage(error) });
    }
  };

  return (
    <div className="mx-auto max-w-xl">
      <h1 className="text-4xl font-extrabold">Crear cuenta de paciente</h1>
      <p className="mt-2 text-ink-soft">Necesitas tu DNI para reservar en la posta.</p>

      <form onSubmit={handleSubmit(onSubmit)} noValidate className="mt-8 grid gap-4 sm:grid-cols-2">
        <Input
          className="sm:col-span-2"
          label="Nombre completo"
          autoComplete="name"
          placeholder="María Quispe Rojas"
          error={errors.nombre?.message}
          {...register('nombre', { required: 'Escribe tu nombre', maxLength: { value: 100, message: 'Máximo 100 caracteres' } })}
        />
        <Input
          className="sm:col-span-2"
          label="Correo electrónico"
          type="email"
          autoComplete="email"
          error={errors.email?.message}
          {...register('email', {
            required: 'Escribe tu correo',
            pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Este correo no es válido' },
          })}
        />
        <Input
          className="sm:col-span-2"
          label="Contraseña"
          type="password"
          autoComplete="new-password"
          hint="Mínimo 8 caracteres, con mayúscula, minúscula y número."
          error={errors.password?.message}
          {...register('password', {
            required: 'Crea una contraseña',
            pattern: { value: PASSWORD_REGEX, message: 'Usa 8 caracteres o más, con mayúscula, minúscula y número' },
          })}
        />
        <Input
          label="DNI"
          inputMode="numeric"
          maxLength={8}
          placeholder="12345678"
          error={errors.dni?.message}
          {...register('dni', { required: 'Escribe tu DNI', pattern: { value: /^\d{8}$/, message: 'El DNI tiene 8 dígitos' } })}
        />
        <Input
          label="Fecha de nacimiento"
          type="date"
          max={hoyISO()}
          error={errors.fechaNacimiento?.message}
          {...register('fechaNacimiento', {
            required: 'Indica tu fecha de nacimiento',
            validate: (v) => v < hoyISO() || 'Debe ser una fecha pasada',
          })}
        />
        <Input
          className="sm:col-span-2"
          label="Celular (opcional)"
          inputMode="tel"
          maxLength={9}
          placeholder="987654321"
          hint="Para avisarte de cambios en tu turno."
          error={errors.telefono?.message}
          {...register('telefono', {
            validate: (v) => !v || /^9\d{8}$/.test(v) || 'Debe tener 9 dígitos y empezar con 9',
          })}
        />
        {errors.root && (
          <p role="alert" className="rounded-[10px] bg-danger/10 px-3 py-2 text-danger sm:col-span-2">
            {errors.root.message}
          </p>
        )}
        <Button type="submit" loading={isSubmitting} className="sm:col-span-2">
          Crear cuenta
        </Button>
      </form>
      <p className="mt-6 text-ink-soft">
        ¿Ya tienes cuenta?{' '}
        <Link to="/login" className="font-bold text-brand hover:underline">
          Ingresa
        </Link>
      </p>
    </div>
  );
}
