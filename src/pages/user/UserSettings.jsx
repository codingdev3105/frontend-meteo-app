import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../api';
import { User, Mail, Shield, Lock, Bell, CheckCircle, AlertCircle, RefreshCw, KeyRound } from 'lucide-react';
import '../../styles/Dashboard.css';

const UserSettings = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [profileData, setProfileData] = useState({
    username: user?.username || '',
    email: user?.email || ''
  });
  
  const [passwordData, setPasswordData] = useState({
    newPassword: '',
    confirmPassword: ''
  });

  const [status, setStatus] = useState({ type: null, message: '' });

  React.useEffect(() => {
    if (user) {
      setProfileData({
        username: user.username || '',
        email: user.email || ''
      });
    }
  }, [user]);

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const updated = await api.updateProfile(profileData);
      const currentUser = JSON.parse(localStorage.getItem('user'));
      localStorage.setItem('user', JSON.stringify({ ...currentUser, ...updated }));
      setStatus({ type: 'success', message: 'Profil mis à jour avec succès !' });
    } catch (err) {
      setStatus({ type: 'error', message: err.response?.data?.message || 'Erreur lors de la mise à jour.' });
    } finally {
      setLoading(false);
      setTimeout(() => setStatus({ type: null, message: '' }), 3000);
    }
  };

  const handlePasswordUpdate = async (e) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setStatus({ type: 'error', message: 'Les nouveaux mots de passe ne correspondent pas.' });
      return;
    }
    
    setLoading(true);
    try {
      await api.updatePassword({
        newPassword: passwordData.newPassword
      });
      setStatus({ type: 'success', message: 'Mot de passe modifié avec succès.' });
      setPasswordData({ newPassword: '', confirmPassword: '' });
    } catch (err) {
      setStatus({ type: 'error', message: err.response?.data?.message || 'Erreur.' });
    } finally {
      setLoading(false);
      setTimeout(() => setStatus({ type: null, message: '' }), 3000);
    }
  };

  return (
    <div className="animate-up" style={{ maxWidth: '1100px' }}>
      
      <div className="db-header" style={{ marginBottom: '2.5rem' }}>
        <div className="db-title">
          <h1 style={{ fontSize: '2rem', fontWeight: '900', letterSpacing: '-1px' }}>Paramètres de Compte</h1>
          <p style={{ color: '#64748b' }}>Gérez votre identité numérique et la sécurité de vos stations.</p>
        </div>
      </div>

      {status.message && (
        <div style={{ 
          display: 'flex', alignItems: 'center', gap: '12px', padding: '1rem 1.5rem', 
          borderRadius: '16px', background: status.type === 'success' ? '#ecfdf5' : '#fef2f2', 
          color: status.type === 'success' ? '#059669' : '#dc2626', 
          marginBottom: '2.5rem', border: `1px solid ${status.type === 'success' ? '#d1fae5' : '#fee2e2'}`,
          animation: 'modalFadeIn 0.3s ease'
        }}>
          {status.type === 'success' ? <CheckCircle size={20}/> : <AlertCircle size={20}/>}
          <span style={{ fontWeight: '700', fontSize: '0.9rem' }}>{status.message}</span>
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '3rem', maxWidth: '850px' }}>
        
        {/* SECTION PROFIL */}
        <div className="db-card" style={{ padding: '3rem', borderRadius: '40px', boxShadow: '0 10px 40px rgba(0,0,0,0.03)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '3rem' }}>
             <div style={{ padding: '15px', background: '#f0f7ff', borderRadius: '18px' }}><User size={26} color="#0070f3" /></div>
             <h3 style={{ margin: 0, fontSize: '1.5rem', fontWeight: '950', letterSpacing: '-0.5px' }}>Informations Profil</h3>
          </div>

          <form onSubmit={handleProfileUpdate} style={{ display: 'grid', gap: '2.2rem' }}>
            <div className="form-group-premium">
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '950', color: '#1e293b', textTransform: 'uppercase', marginBottom: '12px', letterSpacing: '1px' }}>Nom d'utilisateur</label>
              <div style={{ position: 'relative' }}>
                <User size={20} style={{ position: 'absolute', left: '20px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                <input 
                  type="text" className="input-premium-styled" value={profileData.username}
                  onChange={(e) => setProfileData({...profileData, username: e.target.value})}
                  style={{ paddingLeft: '55px', height: '60px', fontSize: '1rem' }} required
                />
              </div>
            </div>

            <div className="form-group-premium">
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '950', color: '#1e293b', textTransform: 'uppercase', marginBottom: '12px', letterSpacing: '1px' }}>Adresse Email</label>
              <div style={{ position: 'relative' }}>
                <Mail size={20} style={{ position: 'absolute', left: '20px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                <input 
                  type="email" className="input-premium-styled" value={profileData.email}
                  onChange={(e) => setProfileData({...profileData, email: e.target.value})}
                  style={{ paddingLeft: '55px', height: '60px', fontSize: '1rem' }} required
                />
              </div>
            </div>

            <button type="submit" disabled={loading} className="btn-primary-premium" style={{ marginTop: '1.5rem', padding: '1.5rem', fontSize: '1.1rem', fontWeight: '800' }}>
              {loading ? <RefreshCw className="animate-spin" size={24} /> : 'Enregistrer les modifications'}
            </button>
          </form>
        </div>

        {/* SECTION SÉCURITÉ */}
        <div className="db-card" style={{ padding: '3rem', borderRadius: '40px', boxShadow: '0 10px 40px rgba(0,0,0,0.03)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '3rem' }}>
             <div style={{ padding: '15px', background: '#fff5f5', borderRadius: '18px' }}><Shield size={26} color="#ef4444" /></div>
             <h3 style={{ margin: 0, fontSize: '1.5rem', fontWeight: '950', letterSpacing: '-0.5px' }}>Sécurité du Compte</h3>
          </div>

          <form onSubmit={handlePasswordUpdate} style={{ display: 'grid', gap: '2.2rem' }}>
            <div className="form-group-premium">
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '950', color: '#1e293b', textTransform: 'uppercase', marginBottom: '12px', letterSpacing: '1px' }}>Nouveau mot de passe</label>
              <div style={{ position: 'relative' }}>
                <Lock size={20} style={{ position: 'absolute', left: '20px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                <input 
                  type="password" className="input-premium-styled" placeholder="Minimum 6 caractères"
                  value={passwordData.newPassword} required
                  onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
                  style={{ paddingLeft: '55px', height: '60px', fontSize: '1rem' }}
                />
              </div>
            </div>

            <div className="form-group-premium">
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '950', color: '#1e293b', textTransform: 'uppercase', marginBottom: '12px', letterSpacing: '1px' }}>Confirmer le mot de passe</label>
              <div style={{ position: 'relative' }}>
                <KeyRound size={20} style={{ position: 'absolute', left: '20px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                <input 
                  type="password" className="input-premium-styled" placeholder="••••••••"
                  value={passwordData.confirmPassword} required
                  onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                  style={{ paddingLeft: '55px', height: '60px', fontSize: '1rem' }}
                />
              </div>
            </div>

            <button type="submit" disabled={loading} className="btn-primary-premium" style={{ background: '#1e293b', marginTop: '1.5rem', padding: '1.5rem', fontSize: '1.1rem', fontWeight: '800' }}>
               {loading ? <RefreshCw className="animate-spin" size={24} /> : 'Mettre à jour le mot de passe'}
            </button>
          </form>
        </div>

      </div>

    </div>
  );
};

export default UserSettings;
