import { forwardRef, useId } from 'react';
import PropTypes from 'prop-types';

/** Campo de texto con label, ayuda y error. Compatible con react-hook-form (register). */
const Input = forwardRef(function Input({ label, error, hint, className = '', id, ...rest }, ref) {
  const autoId = useId();
  const inputId = id ?? autoId;
  const describedBy = error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined;

  return (
    <div className={className}>
      <label htmlFor={inputId} className="mb-1.5 block text-sm font-bold text-ink">
        {label}
      </label>
      <input
        ref={ref}
        id={inputId}
        aria-invalid={!!error}
        aria-describedby={describedBy}
        className={`h-11 w-full rounded-[10px] border bg-surface px-3 text-ink placeholder:text-ink-soft/70 transition-colors focus:border-brand focus:outline-none ${
          error ? 'border-danger' : 'border-line'
        }`}
        {...rest}
      />
      {error ? (
        <p id={`${inputId}-error`} className="mt-1 text-sm text-danger">
          {error}
        </p>
      ) : (
        hint && (
          <p id={`${inputId}-hint`} className="mt-1 text-sm text-ink-soft">
            {hint}
          </p>
        )
      )}
    </div>
  );
});

Input.propTypes = {
  label: PropTypes.string.isRequired,
  error: PropTypes.string,
  hint: PropTypes.string,
  className: PropTypes.string,
  id: PropTypes.string,
};

export default Input;
