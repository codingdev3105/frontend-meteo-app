import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { UserPlus, User, Lock, AlertCircle, ArrowLeft, Shield, Mail, Phone } from 'lucide-react';
import { api } from '../../api';
import { toast } from 'react-hot-toast';

const Register = () => {
  const [formData, setFormData] = useState({ username: '', password: '', confirmPassword: '', email: '', phoneNumber: '' });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      toast.error("Les mots de passe ne correspondent pas.");
      return;
    }
    
    setLoading(true);
    const loadingToast = toast.loading("Création du compte...");
    try {
      await api.register(formData);
      toast.success("Compte créé avec succès !", { id: loadingToast });
      navigate('/login');
    } catch (err) {
      toast.error(err.message || "Erreur d'inscription", { id: loadingToast });
    } finally {
      setLoading(false);
    }
  };

  const inputGroupStyle = { marginBottom: '1rem' };
  const inputWrapperStyle = { position: 'relative' };
  const iconStyle = { position: 'absolute', top: '50%', left: '1rem', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' };
  const inputStyle = { 
    paddingLeft: '2.8rem' 
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      backgroundColor: 'var(--color-brand-primary)',
      padding: '2rem'
    }}>
      <div style={{
        backgroundColor: 'var(--color-surface-card)',
        borderRadius: 'var(--radius-lg)',
        boxShadow: 'var(--shadow-lg)',
        width: '100%',
        maxWidth: '480px',
        overflow: 'hidden'
      }}>
        
        {/* Header */}
        <div style={{ 
          backgroundColor: 'var(--color-background-cloud)', 
          padding: '2rem', 
          textAlign: 'center',
          borderBottom: '1px solid #E5E7EB'
        }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem' }}>
            <div style={{ backgroundColor: 'rgba(0, 112, 243, 0.1)', padding: '1rem', borderRadius: '50%' }}>
              <UserPlus size={36} color="var(--color-brand-secondary)" />
            </div>
          </div>
          <h2 style={{ fontSize: '1.5rem', margin: 0 }}>Créer un Compte</h2>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem', marginTop: '0.5rem' }}>
            Rejoignez la plateforme MétéoPro
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ padding: '2rem' }}>

          <div style={inputGroupStyle}>
            <div style={inputWrapperStyle}>
              <div style={iconStyle}><Shield size={18} /></div>
              <input 
                type="text" 
                name="username"
                value={formData.username}
                onChange={handleChange}
                placeholder="Identifiant / Nom d'utilisateur" 
                required 
                className="input-premium"
                style={inputStyle} 
              />
            </div>
          </div>

          <div style={inputGroupStyle}>
            <div style={inputWrapperStyle}>
              <div style={iconStyle}><Mail size={18} /></div>
              <input 
                type="email" 
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Adresse Email" 
                required 
                className="input-premium"
                style={inputStyle} 
              />
            </div>
          </div>

          <div style={inputGroupStyle}>
            <div style={inputWrapperStyle}>
              <div style={iconStyle}><Phone size={18} /></div>
              <input 
                type="text" 
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleChange}
                placeholder="Numéro de Téléphone" 
                required 
                className="input-premium"
                style={inputStyle} 
              />
            </div>
          </div>

          <div style={inputGroupStyle}>
            <div style={inputWrapperStyle}>
              <div style={iconStyle}><Lock size={18} /></div>
              <input 
                type="password" 
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Mot de passe" 
                required 
                className="input-premium"
                style={inputStyle} 
              />
            </div>
          </div>

          <div style={{ marginBottom: '2rem' }}>
            <div style={inputWrapperStyle}>
              <div style={iconStyle}><Lock size={18} /></div>
              <input 
                type="password" 
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Confirmer le mot de passe" 
                required 
                className="input-premium"
                style={inputStyle} 
              />
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="btn btn-primary" 
            style={{ width: '100%', padding: '0.875rem', fontSize: '1rem', opacity: loading ? 0.7 : 1 }}
          >
            {loading ? 'Création en cours...' : 'S\'inscrire'}
          </button>
        </form>

        <div style={{ textAlign: 'center', paddingBottom: '2rem' }}>
          <div style={{ marginBottom: '1.5rem', fontSize: '0.9rem' }}>
            Vous avez déjà un compte ? <Link to="/login" style={{ color: 'var(--color-brand-secondary)', fontWeight: 'bold', textDecoration: 'none' }}>Se connecter</Link>
          </div>
          <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.9rem', color: 'var(--color-text-muted)', fontWeight: '500' }}>
            <ArrowLeft size={16} /> Retour au site
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Register;
