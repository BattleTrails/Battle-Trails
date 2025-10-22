import clsx from 'clsx';
import React, { forwardRef } from 'react';

interface Props {
  label?: string;
  placeholder?: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  type?: 'text' | 'number' | 'email';
  disabled?: boolean;
  textarea?: boolean;
  rows?: number;
  maxLength?: number;
  className?: string;
  autoComplete?: string;
  errorMessage?: string;
}

// Usamos forwardRef para que Autocomplete pueda acceder al <input>
const ForgeInput = forwardRef<HTMLInputElement, Props>(
  (
    {
      label,
      placeholder,
      name,
      value,
      onChange,
      type = 'text',
      disabled = false,
      textarea = false,
      rows = 3,
      maxLength,
      autoComplete,
      className = '',
      errorMessage,
    },
    ref
  ) => {
    return (
      <div className={clsx(className)}>
        {label && (
          <label htmlFor={name} className="block font-semibold mb-1">
            {label}
          </label>
        )}

        {textarea ? (
          <>
            <textarea
              id={name}
              name={name}
              placeholder={placeholder}
              className={clsx(
                'textarea textarea-bordered w-full resize-none focus:outline-none',
                errorMessage ? 'border-error focus:border-error' : 'focus:border-secondary'
              )}
              rows={rows}
              maxLength={maxLength}
              value={value}
              onChange={onChange}
              disabled={disabled}
            />
            {errorMessage && <div className="mt-1 text-xs text-error">{errorMessage}</div>}
            {maxLength && (
              <div className="text-right text-xs text-neutral/60 mt-1">
                {value.length}/{maxLength}
              </div>
            )}
          </>
        ) : (
          <input
            ref={ref} // <-- aquí el cambio clave
            id={name}
            name={name}
            type={type}
            placeholder={placeholder}
            className={clsx(
              'input input-bordered focus:outline-none w-full',
              errorMessage ? 'border-error focus:border-error' : 'focus:border-secondary'
            )}
            value={value}
            autoComplete={autoComplete}
            onChange={onChange}
            disabled={disabled}
          />
        )}
        {!textarea && errorMessage && <div className="mt-1 text-xs text-error">{errorMessage}</div>}
      </div>
    );
  }
);

export default ForgeInput;
