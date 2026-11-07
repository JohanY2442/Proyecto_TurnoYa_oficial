import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import { useAuth } from '../hooks/useAuth';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { getErrorMessage } from '../utils/errorMessages';
import { CUENTAS_DEMO } from '../utils/constants';

export default function LoginPage() {
  useDocumentTitle('Ingresar');
  const { login } = useAuth();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const [serverError, setServerError] = useState(null);
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm({ mode: 'onTouched', defaultValues: { email: '', password: '' } });

  const onSubmit = async (datos) => {
    setServerError(null);
    try {
      const usuario = await login(datos);
      toast.success(`Hola, ${usuario.nombre.split(' ')[0]}`);
      const redirect = params.get('redirect');
      navigate(redirect?.startsWith('/') ? redirect : '/dashboard', { replace: true });
    } catch (error) {
      setServerError(error.response?.status === 401 ? 'Correo o contraseña incorrectos.' : getErrorMessage(error));
    }
  };

  const usarCuenta = (cuenta) => {
    setValue('email', cuenta.email, { shouldValidate: true });
    setValue('password', cuenta.password, { shouldValidate: true });
  };

  return (
    <div className="mx-auto max-w-md">
      <h1 className="text-4xl font-extrabold">Ingresar</h1>
      <p className="mt-2 text-ink-soft">Con tu cuenta ves tus turnos y tu lugar en la cola.</p>

      <form onSubmit={handleSubmit(onSubmit)} noValidate className="mt-8 space-y-4">
        <Input
          label="Correo electrónico"
          type="email"
          autoComplete="email"
          placeholder="tucorreo@ejemplo.com"
          error={errors.email?.message}
          {...register('email', {
            required: 'Escribe tu correo',
            pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Este correo no es válido' },
          })}
        />
        <Input
          label="Contraseña"
          type="password"
          autoComplete="current-password"
          error={errors.password?.message}
          {...register('password', { required: 'Escribe tu contraseña' })}
        />
        {serverError && (
          <p role="alert" className="rounded-[10px] bg-danger/10 px-3 py-2 text-danger">
            {serverError}
          </p>
        )}
        <Button type="submit" loading={isSubmitting} className="w-full">
          Ingresar
        </Button>
      </form>

      <p className="mt-6 text-ink-soft">
        ¿No tienes cuenta?{' '}
        <Link to="/registro" className="font-bold text-brand hover:underline">
          Crea una
        </Link>
      </p>

      <div className="mt-10 rounded-2xl border border-dashed border-line p-4">
        <p className="text-sm font-bold">Cuentas de prueba</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {CUENTAS_DEMO.map((c) => (
            <button
              key={c.email}
              type="button"
              onClick={() => usarCuenta(c)}
              className="rounded-lg bg-surface-2 px-3 py-1.5 text-sm font-bold hover:bg-line"
            >
              {c.rol}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
