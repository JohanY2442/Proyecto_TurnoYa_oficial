import { forwardRef, useId } from 'react';
import PropTypes from 'prop-types';

const Select = forwardRef(function Select({ label, error, options, placeholder, className = '', id, ...rest }, ref) {
  const autoId = useId();
  const selectId = id ?? autoId;
  return (
    <div className={className}>
      {label && (
        <label htmlFor={selectId} className="mb-1.5 block text-sm font-bold text-ink">
          {label}
        </label>
      )}
      <select
        ref={ref}
        id={selectId}
        aria-invalid={!!error}
        className={`h-11 w-full rounded-[10px] border bg-surface px-3 text-ink focus:border-brand focus:outline-none ${
          error ? 'border-danger' : 'border-line'
        }`}
        {...rest}
      >
        {placeholder !== undefined && <option value="">{placeholder}</option>}
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      {error && <p className="mt-1 text-sm text-danger">{error}</p>}
    </div>
  );
});

Select.propTypes = {
  label: PropTypes.string,
  error: PropTypes.string,
  placeholder: PropTypes.string,
  className: PropTypes.string,
  id: PropTypes.string,
  options: PropTypes.arrayOf(
    PropTypes.shape({ value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired, label: PropTypes.string.isRequired }),
  ).isRequired,
};

export default Select;
