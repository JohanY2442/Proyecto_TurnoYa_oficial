import { useState } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { Pencil, Plus, Stethoscope, Trash2 } from 'lucide-react';
import PageHeader from '../../components/ui/PageHeader';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Modal from '../../components/ui/Modal';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import Skeleton from '../../components/ui/Skeleton';
import EmptyState from '../../components/ui/EmptyState';
import { useFetch } from '../../hooks/useFetch';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { especialidadService } from '../../services/especialidadService';
import { getErrorMessage } from '../../utils/errorMessages';

export default function EspecialidadesPage() {
  useDocumentTitle('Especialidades');
  const { data, loading, error, retry, setData } = useFetch((signal) => especialidadService.listar(signal), []);
  const [editando, setEditando] = useState(null); // null | 'nueva' | especialidad
  const [borrando, setBorrando] = useState(null);
  const [borrandoLoading, setBorrandoLoading] = useState(false);
  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isSubmitting },
  } = useForm({ mode: 'onChange' });

  const abrir = (esp) => {
    setEditando(esp ?? 'nueva');
    reset({ nombre: esp?.nombre ?? '', descripcion: esp?.descripcion ?? '' });
  };

  const guardar = async (form) => {
    try {
      if (editando === 'nueva') {
        const nueva = await especialidadService.crear(form);
        setData((lista) => [...lista, nueva]);
        toast.success('Especialidad creada');
      } else {
        const actualizada = await especialidadService.actualizar(editando.id, form);
        setData((lista) => lista.map((e) => (e.id === actualizada.id ? actualizada : e)));
        toast.success('Especialidad actualizada');
      }
      setEditando(null);
    } catch (err) {
      setError('root', { message: getErrorMessage(err) });
    }
  };

  const eliminar = async () => {
    setBorrandoLoading(true);
    try {
      await especialidadService.eliminar(borrando.id);
      setData((lista) => lista.filter((e) => e.id !== borrando.id));
      toast.success('Especialidad eliminada');
      setBorrando(null);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setBorrandoLoading(false);
    }
  };

  return (
    <>
      <PageHeader
        title="Especialidades"
        description="Las áreas médicas que pueden ofrecer los centros."
        actions={
          <Button icon={Plus} onClick={() => abrir(null)}>
            Nueva especialidad
          </Button>
        }
      />
      {loading ? (
        <Skeleton rows={4} height="h-16" />
      ) : error ? (
        <EmptyState icon={Stethoscope} tone="error" title="No pudimos cargar las especialidades" message={error} actionLabel="Reintentar" onAction={retry} />
      ) : data.length === 0 ? (
        <EmptyState icon={Stethoscope} title="Aún no hay especialidades" actionLabel="Crear la primera" onAction={() => abrir(null)} />
      ) : (
        <ul className="divide-y divide-line overflow-hidden rounded-2xl border border-line bg-surface">
          {data.map((e) => (
            <li key={e.id} className="flex items-center gap-4 px-5 py-4">
              <div className="min-w-0 flex-1">
                <p className="font-bold">{e.nombre}</p>
                {e.descripcion && <p className="text-sm text-ink-soft">{e.descripcion}</p>}
              </div>
              <Button variant="ghost" size="sm" icon={Pencil} onClick={() => abrir(e)} aria-label={`Editar ${e.nombre}`}>
                Editar
              </Button>
              <Button variant="ghost" size="sm" icon={Trash2} onClick={() => setBorrando(e)} aria-label={`Eliminar ${e.nombre}`}>
                Eliminar
              </Button>
            </li>
          ))}
        </ul>
      )}

      <Modal open={editando !== null} onClose={() => setEditando(null)} title={editando === 'nueva' ? 'Nueva especialidad' : 'Editar especialidad'}>
        <form onSubmit={handleSubmit(guardar)} noValidate className="space-y-4">
          <Input label="Nombre" placeholder="Cardiología" error={errors.nombre?.message} {...register('nombre', { required: 'Escribe el nombre', maxLength: { value: 100, message: 'Máximo 100 caracteres' } })} />
          <Input label="Descripción (opcional)" placeholder="Atención del corazón" error={errors.descripcion?.message} {...register('descripcion', { maxLength: { value: 255, message: 'Máximo 255 caracteres' } })} />
          {errors.root && <p role="alert" className="text-danger">{errors.root.message}</p>}
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setEditando(null)}>
              Volver
            </Button>
            <Button type="submit" loading={isSubmitting}>
              {editando === 'nueva' ? 'Crear especialidad' : 'Guardar cambios'}
            </Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={!!borrando}
        title={`¿Eliminar ${borrando?.nombre ?? ''}?`}
        message="Si algún centro o turno usa esta especialidad, el sistema no permitirá eliminarla."
        confirmLabel="Eliminar especialidad"
        onConfirm={eliminar}
        onCancel={() => setBorrando(null)}
        loading={borrandoLoading}
      />
    </>
  );
}
