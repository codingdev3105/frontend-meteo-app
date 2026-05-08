import React from 'react';

const Button = ({ children, variant = 'primary', size = 'md', className = '', style = {}, ...props }) => {
  const baseClass = 'btn';
  
  const variants = {
    primary: 'btn-primary',
    secondary: 'btn-secondary',
    outline: 'bg-transparent border-2 border-primary text-primary hover:bg-primary hover:text-white',
    danger: 'bg-rose-500 text-white hover:bg-rose-600 shadow-lg shadow-rose-500/20',
    ghost: 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-900 hover:text-slate-900 dark:hover:text-white',
  };

  const sizes = {
    sm: 'px-4 py-2 text-[10px]',
    md: 'px-6 py-3 text-[11px]',
    lg: 'px-10 py-4 text-[12px]',
  };

  const combinedClassName = `${baseClass} ${variants[variant] || ''} ${size ? sizes[size] : ''} ${className}`;

  return (
    <button 
      className={combinedClassName}
      style={style}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;
