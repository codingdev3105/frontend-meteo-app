import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, AlertCircle, CheckCircle, Info, HelpCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Modal = ({ 
  isOpen, 
  onClose, 
  title, 
  children, 
  type = 'default', 
  confirmText = 'Confirmer',
  cancelText = 'Annuler',
  onConfirm,
  loading = false,
  showFooter = true,
  customIcon = null
}) => {
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleEsc);
      document.body.style.overflow = 'hidden'; // Prevent scrolling
    }
    return () => {
      window.removeEventListener('keydown', handleEsc);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const icons = {
    danger: <AlertCircle className="text-red-500" size={32} />,
    success: <CheckCircle className="text-emerald-500" size={32} />,
    warning: <HelpCircle className="text-amber-500" size={32} />,
    default: <Info className="text-primary" size={32} />
  };

  const modalContent = (
    <AnimatePresence>
      <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 overflow-x-hidden overflow-y-auto">
        {/* Overlay - High Z-Index and global fixed */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-[6px] z-[9999]"
        />

        {/* Modal Content */}
        <motion.div 
          initial={{ scale: 0.9, opacity: 0, y: 40 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 40 }}
          className="relative bg-white dark:bg-slate-900 w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden border border-slate-100 dark:border-slate-800 z-[10000]"
        >
          {/* Header */}
          <div className="p-8 pb-4 flex items-start justify-between">
            <div className="flex items-center space-x-4">
               <div className="bg-slate-50 dark:bg-slate-800 p-3 rounded-2xl">
                  {customIcon ? (
                    <div className="text-primary">{customIcon}</div>
                  ) : icons[type]}
               </div>
               <div>
                  <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight leading-tight">{title}</h3>
               </div>
            </div>
            <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">
              <X size={20} />
            </button>
          </div>

          <div className="px-8 py-4 text-slate-600 dark:text-slate-400 font-medium leading-relaxed">
            {children}
          </div>

          {showFooter && (
            <div className="p-8 pt-4 flex space-x-3">
              <button 
                onClick={onClose}
                className="flex-1 px-6 py-4 bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white rounded-2xl font-black uppercase text-[10px] hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
              >
                {cancelText}
              </button>
              <button 
                onClick={onConfirm}
                disabled={loading}
                className={`flex-1 px-6 py-4 rounded-2xl font-black uppercase text-[10px] text-white shadow-lg transition-all ${
                  type === 'danger' ? 'bg-red-500 shadow-red-500/20 hover:bg-red-600' : 'bg-primary shadow-primary/20 hover:bg-emerald-600'
                }`}
              >
                {loading ? '...' : confirmText}
              </button>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );

  return createPortal(modalContent, document.body);
};

export default Modal;
