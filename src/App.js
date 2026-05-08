import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import ProtectedRoute from './components/auth/ProtectedRoute';

// Public Pages
import Home from './pages/public/Home';
import Contact from './pages/public/Contact';
import Documentation from './pages/public/Documentation';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';

// User Pages
import UserDashboard from './pages/user/Dashboard';
import Stations from './pages/user/Stations';
import Monitoring from './pages/user/Monitoring';
import Alerts from './pages/user/Alerts';
import History from './pages/user/History';
import Logs from './pages/user/Logs';

// Admin Pages
import AdminDashboard from './pages/admin/Dashboard';
import AdminUsers from './pages/admin/Users';
import AdminStations from './pages/admin/Stations';
import AdminDocs from './pages/admin/Docs';

// Shared Pages
import Profile from './pages/common/Profile';

import { ThemeProvider } from './contexts/ThemeContext';
import { ToastProvider } from './components/ui/Toast';

function App() {
  return (
    <ThemeProvider>
      <ToastProvider>
        <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/documentation" element={<Documentation />} />

          {/* User Routes (Prefixed with /user) */}
          <Route path="/user" element={<ProtectedRoute allowedRoles={['user', 'admin']}><Outlet /></ProtectedRoute>}>
            <Route index path="dashboard" element={<UserDashboard />} />
            <Route path="stations" element={<Stations />} />
            <Route path="stations/:id" element={<Monitoring />} />
            <Route path="history" element={<History />} />
            <Route path="alerts" element={<Alerts />} />
            <Route path="logs" element={<Logs />} />
            <Route path="profile" element={<Profile />} />
          </Route>

          {/* Admin Routes (Prefixed with /admin) */}
          <Route path="/admin" element={<ProtectedRoute allowedRoles={['admin']}><Outlet /></ProtectedRoute>}>
            <Route index path="dashboard" element={<AdminDashboard />} />
            <Route path="users" element={<AdminUsers />} />
            <Route path="stations" element={<AdminStations />} />
            <Route path="docs" element={<AdminDocs />} />
            <Route path="profile" element={<Profile />} />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </ToastProvider>
    </ThemeProvider>
  );
}

export default App;
