import PropTypes from 'prop-types';
import Spinner from './Spinner';

const VARIANTS = {
  primary: 'bg-brand text-brand-ink hover:bg-brand-strong',
  secondary: 'bg-surface-2 text-ink hover:bg-line',
  outline: 'border border-line bg-surface text-ink hover:bg-surface-2',
  danger: 'bg-danger text-white hover:opacity-90',
  ghost: 'text-ink-soft hover:bg-surface-2 hover:text-ink',
};

const SIZES = {
  sm: 'h-9 px-3 text-sm',
  md: 'h-11 px-4',
  lg: 'h-13 px-6 text-lg',
};

/** Botón base. Mientras `loading` está activo se deshabilita para evitar doble envío. */
export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  type = 'button',
  icon: Icon,
  className = '',
  ...rest
}) {
  return (
    <button
      type={type}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={`inline-flex items-center justify-center gap-2 rounded-[10px] font-bold transition-colors disabled:cursor-not-allowed disabled:opacity-55 ${VARIANTS[variant]} ${SIZES[size]} ${className}`}
      {...rest}
    >
      {loading ? <Spinner size="sm" /> : Icon && <Icon aria-hidden="true" size={size === 'sm' ? 16 : 18} />}
      {children}
    </button>
  );
}

Button.propTypes = {
  children: PropTypes.node,
  variant: PropTypes.oneOf(Object.keys(VARIANTS)),
  size: PropTypes.oneOf(Object.keys(SIZES)),
  loading: PropTypes.bool,
  disabled: PropTypes.bool,
  type: PropTypes.oneOf(['button', 'submit', 'reset']),
  icon: PropTypes.elementType,
  className: PropTypes.string,
};
