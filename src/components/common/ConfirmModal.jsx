import React from 'react';
import { AlertTriangle, X } from 'lucide-react';

const ConfirmModal = ({ isOpen, title, message, onConfirm, onCancel, type = 'danger' }) => {
  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(5, 5, 5, 0.6)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 2000,
      backdropFilter: 'blur(8px)',
      animation: 'fadeIn 0.2s ease-out'
    }}>
      <div style={{
        backgroundColor: 'white',
        padding: '2.5rem',
        borderRadius: 'var(--radius-lg)',
        width: '100%',
        maxWidth: '400px',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        textAlign: 'center'
      }}>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.5rem' }}>
          <div style={{
            backgroundColor: type === 'danger' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(245, 158, 11, 0.1)',
            padding: '1rem',
            borderRadius: '50%'
          }}>
            <AlertTriangle size={36} color={type === 'danger' ? '#EF4444' : '#F59E0B'} />
          </div>
        </div>

        <h3 style={{ fontSize: '1.4rem', color: 'var(--color-brand-primary)', margin: '0 0 0.75rem 0', fontWeight: 'bold' }}>
          {title}
        </h3>
        
        <p style={{ color: 'var(--color-text-muted)', fontSize: '0.95rem', margin: '0 0 2rem 0', lineHeight: '1.6' }}>
          {message}
        </p>

        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
          <button 
            onClick={onCancel}
            style={{
              padding: '0.75rem 1.5rem',
              borderRadius: 'var(--radius-md)',
              border: '1px solid #E5E7EB',
              backgroundColor: 'white',
              cursor: 'pointer',
              fontWeight: '600',
              fontSize: '0.9rem',
              color: 'var(--color-text-muted)',
              transition: 'all 0.2s'
            }}
            onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#F9FAFB'}
            onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'white'}
          >
            Annuler
          </button>
          
          <button 
            onClick={onConfirm}
            style={{
              padding: '0.75rem 1.5rem',
              borderRadius: 'var(--radius-md)',
              border: 'none',
              backgroundColor: type === 'danger' ? '#EF4444' : 'var(--color-brand-secondary)',
              color: 'white',
              cursor: 'pointer',
              fontWeight: '600',
              fontSize: '0.9rem',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
              transition: 'all 0.2s'
            }}
            onMouseOver={(e) => e.currentTarget.style.backgroundColor = type === 'danger' ? '#DC2626' : '#005edb'}
            onMouseOut={(e) => e.currentTarget.style.backgroundColor = type === 'danger' ? '#EF4444' : 'var(--color-brand-secondary)'}
          >
            Confirmer
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
