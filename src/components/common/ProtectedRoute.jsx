import React, { useContext } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';

const ProtectedRoute = ({ allowedRoles }) => {
  const { token, user, loading } = useContext(AuthContext);

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <div style={{ color: 'var(--color-text-muted)' }}>Vérification du token réseau...</div>
      </div>
    );
  }

  // 1. Vérification du Token
  if (!token) {
    // Pas de token -> retour au login
    return <Navigate to="/login" replace />;
  }

  // 2. Vérification des Rôles (Si des rôles spécifiques sont requis)
  if (allowedRoles && (!user || !allowedRoles.includes(user.role))) {
    // Token valide mais rôle non autorisé -> retour dashboard ou login
    // On peut faire plus intelligent, mais par défaut on refuse l'accès.
    return (
       <div style={{ padding: '3rem', textAlign: 'center' }}>
          <h2 style={{ color: 'var(--color-danger)' }}>Accès Non Autorisé (403)</h2>
          <p>Votre jeton de session est valide, mais vous n'avez pas les droits nécessaires (Rôle requis : {allowedRoles.join(' ou ')}).</p>
          <a href="/" className="btn btn-secondary" style={{ marginTop: '1rem' }}>Retourner à l'accueil</a>
       </div>
    );
  }

  // Tout est bon, on affiche les routes enfants
  return <Outlet />;
};

export default ProtectedRoute;
