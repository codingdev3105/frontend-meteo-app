import React from 'react';

const Card = ({ children, title, subtitle, footer, className = '', noPadding = false }) => {
  return (
    <div className={`bg-white dark:bg-slate-900/40 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col transition-colors duration-500 ${className}`}>
      {(title || subtitle) && (
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
          {title && <h3 className="font-bold text-slate-800 dark:text-white text-lg">{title}</h3>}
          {subtitle && <p className="text-slate-500 dark:text-slate-400 text-sm">{subtitle}</p>}
        </div>
      )}
      <div className={`${noPadding ? '' : 'p-6'} flex-grow`}>
        {children}
      </div>
      {footer && (
        <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
          {footer}
        </div>
      )}
    </div>
  );
};

export default Card;
