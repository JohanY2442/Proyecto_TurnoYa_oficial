import { useState } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { Building2, Pencil, Plus, Trash2 } from 'lucide-react';
import PageHeader from '../../components/ui/PageHeader';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Modal from '../../components/ui/Modal';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import Skeleton from '../../components/ui/Skeleton';
import EmptyState from '../../components/ui/EmptyState';
import Pagination from '../../components/ui/Pagination';
import { useFetch } from '../../hooks/useFetch';
import { usePagination } from '../../hooks/usePagination';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { centroService } from '../../services/centroService';
import { especialidadService } from '../../services/especialidadService';
import { getErrorMessage, getFieldErrors } from '../../utils/errorMessages';

const numero = (min, max, nombre) => ({
  required: `Indica ${nombre}`,
  valueAsNumber: true,
  validate: (v) => (!Number.isNaN(v) && v >= min && v <= max) || `Debe estar entre ${min} y ${max}`,
});

export default function CentrosAdminPage() {
  useDocumentTitle('Gestionar centros');
  const { page, size, setPage, setSize } = usePagination();
  const centros = useFetch((signal) => centroService.listar({ page, size }, signal), [page, size]);
  const especialidades = useFetch((signal) => especialidadService.listar(signal), []);
  const [editando, setEditando] = useState(null);
  const [borrando, setBorrando] = useState(null);
  const [borrandoLoading, setBorrandoLoading] = useState(false);
  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isSubmitting },
  } = useForm({ mode: 'onChange' });

  const abrir = (c) => {
    setEditando(c ?? 'nuevo');
    reset({
      nombre: c?.nombre ?? '',
      direccion: c?.direccion ?? '',
      latitud: c?.latitud ?? -12.1211,
      longitud: c?.longitud ?? -77.0297,
      capacidadDiaria: c?.capacidadDiaria ?? 50,
      especialidadIds: (c?.especialidades ?? []).map((e) => String(e.id)),
    });
  };

  const guardar = async (form) => {
    const datos = { ...form, especialidadIds: (form.especialidadIds || []).map(Number) };
    try {
      if (editando === 'nuevo') await centroService.crear(datos);
      else await centroService.actualizar(editando.id, datos);
      toast.success(editando === 'nuevo' ? 'Centro creado' : 'Centro actualizado');
      setEditando(null);
      centros.retry();
    } catch (err) {
      const campos = getFieldErrors(err);
      Object.entries(campos).forEach(([c, m]) => setError(c, { message: m }));
      if (!Object.keys(campos).length) setError('root', { message: getErrorMessage(err) });
    }
  };

  const eliminar = async () => {
    setBorrandoLoading(true);
    try {
      await centroService.eliminar(borrando.id);
      toast.success('Centro eliminado');
      setBorrando(null);
      centros.retry();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setBorrandoLoading(false);
    }
  };

  const data = centros.data;

  return (
    <>
      <PageHeader
        title="Gestionar centros"
        description="Crea y edita las postas, su ubicación y su capacidad diaria."
        actions={<Button icon={Plus} onClick={() => abrir(null)}>Nuevo centro</Button>}
      />
      {centros.loading ? (
        <Skeleton rows={5} height="h-16" />
      ) : centros.error ? (
        <EmptyState icon={Building2} tone="error" title="No pudimos cargar los centros" message={centros.error} actionLabel="Reintentar" onAction={centros.retry} />
      ) : data.content.length === 0 ? (
        <EmptyState icon={Building2} title="Aún no hay centros" actionLabel="Crear el primero" onAction={() => abrir(null)} />
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-line bg-surface">
          <table className="w-full min-w-[40rem] text-left">
            <thead className="border-b border-line text-sm text-ink-soft">
              <tr>
                <th className="px-5 py-3 font-bold">Centro</th>
                <th className="px-5 py-3 font-bold">Capacidad</th>
                <th className="px-5 py-3 font-bold">Especialidades</th>
                <th className="px-5 py-3"><span className="sr-only">Acciones</span></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {data.content.map((c) => (
                <tr key={c.id}>
                  <td className="px-5 py-3">
                    <p className="font-bold">{c.nombre}</p>
                    <p className="text-sm text-ink-soft">{c.direccion}</p>
                  </td>
                  <td className="px-5 py-3 tabular-nums">{c.capacidadDiaria} por día</td>
                  <td className="px-5 py-3 text-sm">{c.especialidades.map((e) => e.nombre).join(', ') || 'Ninguna'}</td>
                  <td className="px-5 py-3">
                    <div className="flex justify-end gap-1">
                      <Button variant="ghost" size="sm" icon={Pencil} onClick={() => abrir(c)} aria-label={`Editar ${c.nombre}`}>Editar</Button>
                      <Button variant="ghost" size="sm" icon={Trash2} onClick={() => setBorrando(c)} aria-label={`Eliminar ${c.nombre}`}>Eliminar</Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {data && !centros.loading && (
        <Pagination page={data.page} size={data.size} totalPages={data.totalPages} totalElements={data.totalElements} onPageChange={setPage} onSizeChange={setSize} />
      )}

      <Modal open={editando !== null} onClose={() => setEditando(null)} title={editando === 'nuevo' ? 'Nuevo centro' : 'Editar centro'}>
        <form onSubmit={handleSubmit(guardar)} noValidate className="grid gap-4 sm:grid-cols-2">
          <Input className="sm:col-span-2" label="Nombre" error={errors.nombre?.message} {...register('nombre', { required: 'Escribe el nombre', maxLength: { value: 150, message: 'Máximo 150 caracteres' } })} />
          <Input className="sm:col-span-2" label="Dirección" error={errors.direccion?.message} {...register('direccion', { required: 'Escribe la dirección' })} />
          <Input label="Latitud" type="number" step="any" error={errors.latitud?.message} {...register('latitud', numero(-90, 90, 'la latitud'))} />
          <Input label="Longitud" type="number" step="any" error={errors.longitud?.message} {...register('longitud', numero(-180, 180, 'la longitud'))} />
          <Input className="sm:col-span-2" label="Pacientes por día" type="number" error={errors.capacidadDiaria?.message} {...register('capacidadDiaria', numero(1, 2000, 'la capacidad'))} />
          <fieldset className="sm:col-span-2">
            <legend className="mb-1.5 text-sm font-bold">Especialidades que atiende</legend>
            <div className="flex flex-wrap gap-2">
              {(especialidades.data ?? []).map((e) => (
                <label key={e.id} className="flex items-center gap-2 rounded-lg border border-line px-3 py-1.5 text-sm">
                  <input type="checkbox" value={String(e.id)} {...register('especialidadIds')} className="accent-[var(--brand)]" />
                  {e.nombre}
                </label>
              ))}
            </div>
          </fieldset>
          {errors.root && <p role="alert" className="text-danger sm:col-span-2">{errors.root.message}</p>}
          <div className="flex justify-end gap-2 sm:col-span-2">
            <Button variant="outline" onClick={() => setEditando(null)}>Volver</Button>
            <Button type="submit" loading={isSubmitting}>{editando === 'nuevo' ? 'Crear centro' : 'Guardar cambios'}</Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={!!borrando}
        title={`¿Eliminar ${borrando?.nombre ?? ''}?`}
        message="Si el centro tiene turnos registrados, el sistema no permitirá eliminarlo."
        confirmLabel="Eliminar centro"
        onConfirm={eliminar}
        onCancel={() => setBorrando(null)}
        loading={borrandoLoading}
      />
    </>
  );
}
