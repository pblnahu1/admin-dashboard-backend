import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  icon?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, icon, className = '', id, ...props }, ref) => {
    // Generar un ID automático si no se provee uno para vincular con el label
    const inputId = id || `input-${label.replace(/\s+/g, '-').toLowerCase()}`;

    return (
      <div className="group">
        <label 
          htmlFor={inputId} 
          className="block text-sm font-medium text-slate-700 mb-1.5 transition-colors group-focus-within:text-indigo-600"
        >
          {label}
        </label>
        <div className="relative">
          {icon && (
            <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 transition-colors group-focus-within:text-indigo-500 [&>svg]:h-5 [&>svg]:w-5">
              {icon}
            </div>
          )}
          <input
            ref={ref}
            id={inputId}
            className={`w-full rounded-xl border border-slate-200 bg-white/50 px-4 py-3.5 ${
              icon ? 'pl-11' : ''
            } text-slate-900 placeholder:text-slate-400 outline-none transition-all hover:border-slate-300 focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 ${className}`}
            {...props}
          />
        </div>
      </div>
    );
  }
);

Input.displayName = 'Input';
