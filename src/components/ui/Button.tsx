import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  loadingText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      variant = 'primary',
      size = 'md',
      isLoading = false,
      loadingText,
      leftIcon,
      rightIcon,
      fullWidth = false,
      className = '',
      disabled,
      ...props
    },
    ref
  ) => {
    const baseStyles = 'group relative flex items-center justify-center gap-2 font-semibold transition-all focus:outline-none focus:ring-4 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-70 disabled:active:scale-100';
    
    const variants = {
      primary: 'bg-slate-900 text-white hover:bg-slate-800 focus:ring-slate-900/10',
      secondary: 'bg-indigo-100 text-indigo-700 hover:bg-indigo-200 focus:ring-indigo-500/20',
      outline: 'border border-slate-200 bg-transparent text-slate-700 hover:bg-slate-50 focus:ring-slate-900/5',
      ghost: 'bg-transparent text-slate-600 hover:bg-slate-100 hover:text-slate-900 focus:ring-slate-900/5',
      danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-600/20',
    };

    const sizes = {
      sm: 'rounded-lg px-3 py-2 text-xs',
      md: 'rounded-xl px-4 py-3.5 text-sm',
      lg: 'rounded-2xl px-6 py-4 text-base',
    };

    const styles = `${baseStyles} ${variants[variant]} ${sizes[size]} ${fullWidth ? 'w-full' : ''} ${className}`;

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={styles}
        {...props}
      >
        {isLoading ? (
          <div className="flex items-center gap-2">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent opacity-70" />
            {loadingText && <span>{loadingText}</span>}
          </div>
        ) : (
          <>
            {leftIcon && <span className="[&>svg]:w-4 [&>svg]:h-4">{leftIcon}</span>}
            <span>{children}</span>
            {rightIcon && <span className="[&>svg]:w-4 [&>svg]:h-4 transition-transform group-hover:translate-x-1">{rightIcon}</span>}
          </>
        )}
      </button>
    );
  }
);

Button.displayName = 'Button';