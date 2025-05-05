import React from 'react';

const Input = ({
  label,
  error,
  className = '',
  type = 'text',
  required = false,
  disabled = false,
  helperText,
  icon,
  ...props
}) => {
  const inputId = props.id || props.name || `input-${Math.random().toString(36).substr(2, 9)}`;

  return (
    <div className="space-y-1">
      {label && (
        <label 
          htmlFor={inputId}
          className="block text-sm font-semibold text-gray-700"
        >
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <div className="relative">
        {icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            {icon}
          </div>
        )}
        <input
          id={inputId}
          type={type}
          required={required}
          disabled={disabled}
          aria-invalid={error ? 'true' : 'false'}
          aria-describedby={error ? `${inputId}-error` : helperText ? `${inputId}-helper` : undefined}
          className={`
            w-full
            border
            rounded
            p-2
            focus:outline-none
            focus:ring-2
            focus:ring-green-500
            focus:border-transparent
            disabled:bg-gray-100
            disabled:cursor-not-allowed
            ${error ? 'border-red-500' : 'border-gray-300'}
            ${icon ? 'pl-10' : ''}
            ${className}
          `}
          {...props}
        />
      </div>
      {helperText && !error && (
        <p id={`${inputId}-helper`} className="text-sm text-gray-500">
          {helperText}
        </p>
      )}
      {error && (
        <p id={`${inputId}-error`} className="text-sm text-red-500" role="alert">
          {error}
        </p>
      )}
    </div>
  );
};

export default Input; 