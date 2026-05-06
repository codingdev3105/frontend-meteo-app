import React, { useState, useContext } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { Shield, Lock, User, AlertCircle, ArrowLeft } from 'lucide-react';
import { AuthContext } from '../../context/AuthContext';
import { toast } from 'react-hot-toast';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  // Afficher un potentiel message de succès venu de la page Register
  const successMessage = location.state?.message;

  const handleLogin = async (e) => {
    e.preventDefault();
    const loadingToast = toast.loading("Identification...");
    setIsLoading(true);

    try {
      const user = await login(username, password);
      toast.success(`Bienvenue, ${user.username}`, { id: loadingToast });
      // Redirection après succès selon le rôle
      if (user.role === 'admin') {
        navigate('/admin/dashboard');
      } else {
        navigate('/user/dashboard');
      }
    } catch (err) {
      toast.error(err.message || "Identifiants invalides", { id: loadingToast });
    } finally {
      setIsLoading(false);
    }
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
      
      {/* Conteneur principal */}
      <div style={{
        backgroundColor: 'var(--color-surface-card)',
        borderRadius: 'var(--radius-lg)',
        boxShadow: 'var(--shadow-lg)',
        width: '100%',
        maxWidth: '450px',
        overflow: 'hidden',
        position: 'relative'
      }}>
        
        {/* En-tête de la carte */}
        <div style={{ 
          backgroundColor: 'var(--color-background-cloud)', 
          padding: '2rem', 
          textAlign: 'center',
          borderBottom: '1px solid #E5E7EB'
        }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem' }}>
            <div style={{ backgroundColor: 'rgba(0, 212, 255, 0.1)', padding: '1rem', borderRadius: '50%' }}>
              <Shield size={36} color="var(--color-brand-secondary)" />
            </div>
          </div>
          <h2 style={{ fontSize: '1.5rem', margin: 0 }}>Accès Sécurisé</h2>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem', marginTop: '0.5rem' }}>
            Connectez-vous à votre plateforme MétéoPro
          </p>
        </div>

        {/* Corps du formulaire */}
        <form onSubmit={handleLogin} style={{ padding: '2rem' }}>
          
          {successMessage && (
            <div style={{ backgroundColor: 'var(--bg-success)', color: 'var(--color-success)', padding: '1rem', borderRadius: 'var(--radius-sm)', marginBottom: '1.5rem', textAlign: 'center', fontWeight: '500' }}>
              {successMessage}
            </div>
          )}

          <div style={{ marginBottom: '1.25rem' }}>
            <div style={{ position: 'relative' }}>
              <div style={{ position: 'absolute', top: '50%', left: '1rem', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }}>
                <User size={18} />
              </div>
              <input 
                type="text" 
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Nom d'utilisateur"
                required
                className="input-premium"
                style={{ paddingLeft: '2.8rem' }}
              />
            </div>
          </div>

          <div style={{ marginBottom: '2rem' }}>
            <div style={{ position: 'relative' }}>
              <div style={{ position: 'absolute', top: '50%', left: '1rem', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }}>
                <Lock size={18} />
              </div>
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Mot de passe"
                required
                className="input-premium"
                style={{ paddingLeft: '2.8rem' }}
              />
            </div>
          </div>

          <button 
            type="submit" 
            disabled={isLoading}
            className="btn btn-primary" 
            style={{ width: '100%', padding: '0.875rem', fontSize: '1rem', opacity: isLoading ? 0.7 : 1 }}
          >
            {isLoading ? 'Connexion en cours...' : 'Se connecter'}
          </button>
        </form>

        <div style={{ textAlign: 'center', paddingBottom: '2rem' }}>
          <div style={{ marginBottom: '1.5rem', fontSize: '0.9rem' }}>
            Vous n'avez pas de compte ? <Link to="/register" style={{ color: 'var(--color-brand-secondary)', fontWeight: 'bold', textDecoration: 'none' }}>S'inscrire</Link>
          </div>
          <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.9rem', color: 'var(--color-text-muted)', fontWeight: '500' }}>
            <ArrowLeft size={16} /> Retour au site
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
