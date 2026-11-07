import { Link, useRouteError } from 'react-router-dom';

export default function RouteError() {
  const error = useRouteError();
  console.error(error);
  return (
    <div role="alert" className="mx-auto max-w-lg px-6 py-20">
      <h1 className="text-3xl font-extrabold">No pudimos abrir esta página</h1>
      <p className="mt-3 text-ink-soft">
        Puede ser una actualización reciente de la app. Recarga la página para traer la versión nueva.
      </p>
      <div className="mt-6 flex gap-2">
        <button type="button" onClick={() => window.location.reload()} className="h-11 rounded-[10px] bg-brand px-4 font-bold text-brand-ink">
          Recargar página
        </button>
        <Link to="/" className="grid h-11 place-items-center rounded-[10px] border border-line px-4 font-bold">
          Ir al inicio
        </Link>
      </div>
    </div>
  );
}
