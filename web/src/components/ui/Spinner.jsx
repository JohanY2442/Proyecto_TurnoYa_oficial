import PropTypes from 'prop-types';

const SIZES = { sm: 'size-4 border-2', md: 'size-6 border-[3px]', lg: 'size-10 border-4' };

export default function Spinner({ size = 'md', label = 'Cargando' }) {
  return (
    <span
      role="status"
      aria-label={label}
      className={`inline-block animate-spin rounded-full border-current border-r-transparent ${SIZES[size]}`}
    />
  );
}

Spinner.propTypes = { size: PropTypes.oneOf(['sm', 'md', 'lg']), label: PropTypes.string };
