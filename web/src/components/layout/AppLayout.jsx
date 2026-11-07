import { Suspense } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Navbar from './Navbar';
import Breadcrumbs from './Breadcrumbs';
import ErrorBoundary from './ErrorBoundary';
import Spinner from '../ui/Spinner';

export function PageLoader() {
  return (
    <div className="grid min-h-[40vh] place-items-center text-brand">
      <Spinner size="lg" label="Cargando página" />
    </div>
  );
}

export default function AppLayout() {
  const { pathname } = useLocation();
  return (
    <div className="flex min-h-dvh flex-col">
      <a href="#contenido" className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:rounded-lg focus:bg-surface focus:p-3">
        Saltar al contenido
      </a>
      <Navbar />
      <main id="contenido" className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-6">
        <Breadcrumbs />
        {/* key: si una página falla, al navegar a otra el error se limpia */}
        <ErrorBoundary key={pathname}>
          <Suspense fallback={<PageLoader />}>
            <Outlet />
          </Suspense>
        </ErrorBoundary>
      </main>
      <footer className="border-t border-line py-6 text-center text-sm text-ink-soft">
        TurnoYa, CS2031 Desarrollo Basado en Plataformas, UTEC 2026-2
      </footer>
    </div>
  );
}
