import { Link } from 'react-router-dom';
import { useDocumentTitle } from '../hooks/useDocumentTitle';

export default function NotFoundPage() {
  useDocumentTitle('Página no encontrada');
  return (
    <div className="py-16">
      <p className="font-display text-8xl font-extrabold text-brand">404</p>
      <h1 className="mt-4 text-3xl font-extrabold">Esta página no existe</h1>
      <p className="mt-2 max-w-prose text-ink-soft">Puede que el enlace esté mal escrito o que la página se haya movido.</p>
      <div className="mt-6 flex flex-wrap gap-2">
        <Link to="/" className="inline-flex h-11 items-center rounded-[10px] bg-brand px-4 font-bold text-brand-ink">
          Ir al inicio
        </Link>
        <Link to="/centros" className="inline-flex h-11 items-center rounded-[10px] border border-line px-4 font-bold">
          Buscar un centro
        </Link>
      </div>
    </div>
  );
}
