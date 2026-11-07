import { useState } from 'react';
import PropTypes from 'prop-types';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { UserPlus, UsersRound } from 'lucide-react';
import PageHeader from '../../components/ui/PageHeader';
import Tabs from '../../components/ui/Tabs';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Modal from '../../components/ui/Modal';
import Skeleton from '../../components/ui/Skeleton';
import EmptyState from '../../components/ui/EmptyState';
import Pagination from '../../components/ui/Pagination';
import { useFetch } from '../../hooks/useFetch';
import { usePagination } from '../../hooks/usePagination';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { pacienteService } from '../../services/pacienteService';
import { medicoService } from '../../services/medicoService';
import { especialidadService } from '../../services/especialidadService';
import { getErrorMessage, getFieldErrors } from '../../utils/errorMessages';

const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,64}$/;

function NuevoMedicoModal({ open, onClose, onCreado }) {
  const especialidades = useFetch((signal) => especialidadService.listar(signal), [], { enabled: open });
  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isSubmitting },
  } = useForm({ mode: 'onChange', defaultValues: { especialidadIds: [] } });

  const cerrar = () => {
    reset();
    onClose();
  };

  const onSubmit = async (form) => {
    try {
      await medicoService.crear({ ...form, telefono: form.telefono || null, especialidadIds: form.especialidadIds.map(Number) });
      toast.success('Médico registrado');
      reset();
      onCreado();
    } catch (err) {
      const campos = getFieldErrors(err);
      Object.entries(campos).forEach(([c, m]) => setError(c, { message: m }));
      if (!Object.keys(campos).length) setError('root', { message: getErrorMessage(err) });
    }
  };

  return (
    <Modal open={open} onClose={cerrar} title="Registrar médico">
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="grid gap-4 sm:grid-cols-2">
        <Input className="sm:col-span-2" label="Nombre completo" error={errors.nombre?.message} {...register('nombre', { required: 'Escribe el nombre' })} />
        <Input className="sm:col-span-2" label="Correo" type="email" error={errors.email?.message} {...register('email', { required: 'Escribe el correo', pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Correo no válido' } })} />
        <Input className="sm:col-span-2" label="Contraseña inicial" type="password" hint="8 caracteres o más, con mayúscula, minúscula y número." error={errors.password?.message} {...register('password', { required: 'Crea una contraseña', pattern: { value: PASSWORD_REGEX, message: 'No cumple las reglas de seguridad' } })} />
        <Input label="Colegiatura (CMP)" placeholder="CMP-12345" error={errors.colegiatura?.message} {...register('colegiatura', { required: 'Escribe la colegiatura', maxLength: { value: 20, message: 'Máximo 20 caracteres' } })} />
        <Input label="Celular (opcional)" inputMode="tel" maxLength={9} error={errors.telefono?.message} {...register('telefono', { validate: (v) => !v || /^9\d{8}$/.test(v) || '9 dígitos, empieza con 9' })} />
        <fieldset className="sm:col-span-2">
          <legend className="mb-1.5 text-sm font-bold">Especialidades</legend>
          <div className="flex flex-wrap gap-2">
            {(especialidades.data ?? []).map((e) => (
              <label key={e.id} className="flex items-center gap-2 rounded-lg border border-line px-3 py-1.5 text-sm">
                <input type="checkbox" value={String(e.id)} {...register('especialidadIds', { validate: (v) => v.length > 0 || 'Elige al menos una' })} className="accent-[var(--brand)]" />
                {e.nombre}
              </label>
            ))}
          </div>
          {errors.especialidadIds && <p className="mt-1 text-sm text-danger">{errors.especialidadIds.message}</p>}
        </fieldset>
        {errors.root && <p role="alert" className="text-danger sm:col-span-2">{errors.root.message}</p>}
        <div className="flex justify-end gap-2 sm:col-span-2">
          <Button variant="outline" onClick={cerrar}>Volver</Button>
          <Button type="submit" loading={isSubmitting}>Registrar médico</Button>
        </div>
      </form>
    </Modal>
  );
}

NuevoMedicoModal.propTypes = { open: PropTypes.bool.isRequired, onClose: PropTypes.func.isRequired, onCreado: PropTypes.func.isRequired };

export default function PersonasPage() {
  useDocumentTitle('Personas');
  const { page, size, setPage, setSize, getParam, setFilter } = usePagination();
  const tipo = getParam('tipo') || 'pacientes';
  const [modal, setModal] = useState(false);

  const { data, loading, error, retry } = useFetch(
    (signal) => (tipo === 'medicos' ? medicoService.listar({ page, size }, signal) : pacienteService.listar({ page, size }, signal)),
    [tipo, page, size],
  );

  return (
    <>
      <PageHeader
        title="Pacientes y médicos"
        description="Cuentas registradas en TurnoYa."
        actions={tipo === 'medicos' && <Button icon={UserPlus} onClick={() => setModal(true)}>Registrar médico</Button>}
      />
      <div className="mb-6">
        <Tabs
          label="Tipo de cuenta"
          value={tipo}
          onChange={(v) => setFilter('tipo', v === 'pacientes' ? '' : v)}
          options={[
            { value: 'pacientes', label: 'Pacientes' },
            { value: 'medicos', label: 'Médicos' },
          ]}
        />
      </div>

      {loading ? (
        <Skeleton rows={5} height="h-12" />
      ) : error ? (
        <EmptyState icon={UsersRound} tone="error" title="No pudimos cargar la lista" message={error} actionLabel="Reintentar" onAction={retry} />
      ) : data.content.length === 0 ? (
        <EmptyState icon={UsersRound} title={tipo === 'medicos' ? 'Aún no hay médicos' : 'Aún no hay pacientes'} />
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-line bg-surface">
          <table className="w-full min-w-[36rem] text-left">
            <thead className="border-b border-line text-sm text-ink-soft">
              <tr>
                <th className="px-5 py-3 font-bold">Nombre</th>
                <th className="px-5 py-3 font-bold">Correo</th>
                <th className="px-5 py-3 font-bold">{tipo === 'medicos' ? 'Colegiatura' : 'DNI'}</th>
                {tipo === 'medicos' && <th className="px-5 py-3 font-bold">Especialidades</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {data.content.map((p) => (
                <tr key={p.id}>
                  <td className="px-5 py-3 font-bold">{p.nombre}</td>
                  <td className="px-5 py-3">{p.email}</td>
                  <td className="px-5 py-3 tabular-nums">{tipo === 'medicos' ? p.colegiatura : p.dni}</td>
                  {tipo === 'medicos' && <td className="px-5 py-3 text-sm">{p.especialidades.map((e) => e.nombre).join(', ')}</td>}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {data && !loading && (
        <Pagination page={data.page} size={data.size} totalPages={data.totalPages} totalElements={data.totalElements} onPageChange={setPage} onSizeChange={setSize} />
      )}

      <NuevoMedicoModal
        open={modal}
        onClose={() => setModal(false)}
        onCreado={() => {
          setModal(false);
          retry();
        }}
      />
    </>
  );
}
