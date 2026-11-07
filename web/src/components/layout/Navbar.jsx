import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { LogOut, Menu, Moon, Sun, X } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useTheme } from '../../hooks/useTheme';
import { ROLES } from '../../utils/constants';

const LINKS = [
  { to: '/dashboard', label: 'Inicio', roles: [ROLES.PACIENTE, ROLES.MEDICO, ROLES.ADMIN] },
  { to: '/centros', label: 'Centros', roles: null },
  { to: '/turnos', label: 'Mis turnos', roles: [ROLES.PACIENTE] },
  { to: '/admin/centros', label: 'Gestionar centros', roles: [ROLES.ADMIN] },
  { to: '/admin/especialidades', label: 'Especialidades', roles: [ROLES.ADMIN] },
  { to: '/admin/personas', label: 'Personas', roles: [ROLES.ADMIN] },
  { to: '/perfil', label: 'Mi perfil', roles: [ROLES.PACIENTE, ROLES.MEDICO, ROLES.ADMIN] },
];

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  const visibles = LINKS.filter((l) => (l.roles === null ? true : isAuthenticated && l.roles.includes(user.rol)));

  const salir = () => {
    logout();
    setOpen(false);
    navigate('/login');
  };

  const linkClass = ({ isActive }) =>
    `rounded-lg px-3 py-2 font-bold transition-colors ${isActive ? 'bg-brand-soft text-brand-strong' : 'text-ink-soft hover:text-ink'}`;

  return (
    <header className="sticky top-0 z-20 border-b border-line bg-bg/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center gap-4 px-4 sm:px-6">
        <Link to={isAuthenticated ? '/dashboard' : '/'} className="flex items-center gap-2 font-display text-xl font-extrabold">
          <img src="/favicon.svg" alt="" className="size-8" />
          TurnoYa
        </Link>

        <nav aria-label="Principal" className="ml-4 hidden flex-1 items-center gap-1 lg:flex">
          {visibles.map((l) => (
            <NavLink key={l.to} to={l.to} className={linkClass}>
              {l.label}
            </NavLink>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-1">
          <button
            type="button"
            onClick={toggleTheme}
            aria-label={theme === 'dark' ? 'Usar tema claro' : 'Usar tema oscuro'}
            title={theme === 'dark' ? 'Tema claro' : 'Tema oscuro'}
            className="grid size-10 place-items-center rounded-lg text-ink-soft hover:bg-surface-2 hover:text-ink"
          >
            {theme === 'dark' ? <Sun size={19} /> : <Moon size={19} />}
          </button>
          {isAuthenticated ? (
            <button
              type="button"
              onClick={salir}
              className="hidden h-10 items-center gap-2 rounded-lg px-3 font-bold text-ink-soft hover:bg-surface-2 hover:text-ink lg:inline-flex"
            >
              <LogOut aria-hidden="true" size={17} /> Salir
            </button>
          ) : (
            <Link to="/login" className="hidden h-10 items-center rounded-lg bg-brand px-4 font-bold text-brand-ink lg:inline-flex">
              Ingresar
            </Link>
          )}
          <button
            type="button"
            onClick={() => setOpen((o) => !o)}
            aria-expanded={open}
            aria-controls="menu-movil"
            aria-label="Menú"
            className="grid size-10 place-items-center rounded-lg text-ink hover:bg-surface-2 lg:hidden"
          >
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {open && (
        <nav id="menu-movil" aria-label="Menú móvil" className="border-t border-line bg-surface px-4 py-3 lg:hidden">
          <div className="flex flex-col gap-1">
            {visibles.map((l) => (
              <NavLink key={l.to} to={l.to} className={linkClass} onClick={() => setOpen(false)}>
                {l.label}
              </NavLink>
            ))}
            {isAuthenticated ? (
              <button type="button" onClick={salir} className="rounded-lg px-3 py-2 text-left font-bold text-danger">
                Cerrar sesión
              </button>
            ) : (
              <NavLink to="/login" className={linkClass} onClick={() => setOpen(false)}>
                Ingresar
              </NavLink>
            )}
          </div>
        </nav>
      )}
    </header>
  );
}
