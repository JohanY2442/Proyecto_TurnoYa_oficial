import { Link, useMatches } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';

/** Migas de pan a partir del `handle.crumb` de cada ruta. */
export default function Breadcrumbs() {
  const matches = useMatches();
  const crumbs = matches
    .filter((m) => m.handle?.crumb)
    .map((m) => ({ path: m.pathname, label: typeof m.handle.crumb === 'function' ? m.handle.crumb(m.params) : m.handle.crumb }));

  if (crumbs.length < 2) return null;

  return (
    <nav aria-label="Ubicación" className="mb-4">
      <ol className="flex flex-wrap items-center gap-1 text-sm text-ink-soft">
        {crumbs.map((c, i) => (
          <li key={c.path} className="flex items-center gap-1">
            {i > 0 && <ChevronRight aria-hidden="true" size={14} />}
            {i === crumbs.length - 1 ? (
              <span aria-current="page" className="font-bold text-ink">
                {c.label}
              </span>
            ) : (
              <Link to={c.path} className="hover:text-ink hover:underline">
                {c.label}
              </Link>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
