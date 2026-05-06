import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

// Pages Vitrine & Auth
import Accueil from './pages/vitrine/Accueil';
import Contact from './pages/vitrine/Contact';
import Documentation from './pages/vitrine/Documentation';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';

// Pages Admin
import AdminLayout from './components/layout/AdminLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import UsersManager from './pages/admin/UsersManager';
import StationsManager from './pages/admin/StationsManager';
import AdminDocs from './pages/admin/AdminDocs';

// Pages User (Monitoring)
import UserLayout from './components/layout/UserLayout';
import UserDashboard from './pages/user/UserDashboard';
import UserStations from './pages/user/UserStations';
import StationMonitoring from './pages/user/StationMonitoring';
import UserHistory from './pages/user/UserHistory';
import UserAlerts from './pages/user/UserAlerts';
import UserSettings from './pages/user/UserSettings';
import UserLogs from './pages/user/UserLogs';

// Contexte et Sécurité
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/common/ProtectedRoute';

function App() {
  return (
    <AuthProvider>
      <Toaster position="top-right" reverseOrder={false} />
      <Router>
        <div className="app-container" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
          <Routes>
            {/* Routes Publiques (Vitrine) */}
            <Route path="/" element={<Accueil />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/documentation" element={<Documentation />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            
            {/* Espace Administrateur (Routes imbriquées protégées par Token) */}
            <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
              <Route path="/admin" element={<AdminLayout />}>
                <Route path="dashboard" element={<AdminDashboard />} />
                <Route path="users" element={<UsersManager />} />
                <Route path="stations" element={<StationsManager />} />
                <Route path="docs" element={<AdminDocs />} />
                {/* Redirection vers le dashboard si "/admin" est accédé directement */}
                <Route index element={<Navigate to="/admin/dashboard" replace />} />
              </Route>
            </Route>

            {/* Espace Utilisateur (Sécurisé - Uniquement pour le rôle 'user') */}
            <Route element={<ProtectedRoute allowedRoles={['user']} />}>
              <Route path="/user" element={<UserLayout />}>
                <Route path="dashboard" element={<UserDashboard />} />
                <Route path="stations" element={<UserStations />} />
                <Route path="stations/:hardwareId" element={<StationMonitoring />} />
                <Route path="history" element={<UserHistory />} />
                <Route path="alerts" element={<UserAlerts />} />
                <Route path="logs" element={<UserLogs />} />
                <Route path="settings" element={<UserSettings />} />
                <Route index element={<Navigate to="/user/dashboard" replace />} />
              </Route>
            </Route>

            {/* Redirection Catch-all */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
