import clsx from "clsx";
import React, { forwardRef } from "react";

interface Props {
  label?: string;
  placeholder?: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  type?: "text" | "number" | "email";
  disabled?: boolean;
  textarea?: boolean;
  rows?: number;
  maxLength?: number;
  className?: string;
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
      type = "text",
      disabled = false,
      textarea = false,
      rows = 3,
      maxLength,
      className = "",
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
              className="textarea textarea-bordered w-full resize-none focus:border-secondary focus:outline-none"
              rows={rows}
              maxLength={maxLength}
              value={value}
              onChange={onChange}
              disabled={disabled}
            />
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
            className="input input-bordered focus:border-secondary focus:outline-none w-full"
            value={value}
            onChange={onChange}
            disabled={disabled}
          />
        )}
      </div>
    );
  }
);

export default ForgeInput;
