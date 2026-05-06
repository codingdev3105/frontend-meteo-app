import React, { useContext, useState } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  RadioTower, LogOut, Activity, LayoutDashboard, Menu, X,
  History, Bell, Settings, ChevronLeft, ChevronRight, CloudRain, Database 
} from 'lucide-react';
import { AuthContext } from '../../context/AuthContext';
import '../../styles/Dashboard.css';

const UserLayout = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const displayUsername = user?.username || "Visiteur Démo";
  const userInitial = displayUsername.charAt(0).toUpperCase();

  const handleLogout = () => {
    if (logout) logout();
    navigate('/login');
  };

  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);

  const NavItem = ({ to, icon: Icon, label }) => {
    const isActive = location.pathname === to || (to !== '/user/dashboard' && location.pathname.startsWith(to));
    return (
      <Link 
        to={to} 
        className={`db-nav-item ${isActive ? 'active' : ''}`} 
        title={label}
        onClick={() => setIsMobileMenuOpen(false)}
      >
        <Icon size={20} />
        {(!isCollapsed || isMobileMenuOpen) && <span>{label}</span>}
      </Link>
    );
  };

  return (
    <div className="dashboard-wrapper">
      
      {/* MOBILE TOP BAR */}
      <div className="mobile-top-bar">
         <div className="db-logo">
            <CloudRain size={24} color="var(--db-secondary)" />
            <span style={{ fontSize: '1rem' }}>MétéoPro Panel</span>
         </div>
         <button onClick={toggleMobileMenu} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--db-primary)' }}>
            {isMobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
         </button>
      </div>

      {/* MOBILE MENU OVERLAY (Admin Style) */}
      {isMobileMenuOpen && (
        <div style={{ 
          position: 'fixed', top: '80px', left: 0, right: 0, bottom: 0, 
          backgroundColor: 'white', zIndex: 1100, padding: '2rem', 
          display: 'flex', flexDirection: 'column', gap: '1rem',
          animation: 'modalFadeIn 0.3s ease'
        }}>
           <h3 style={{ fontSize: '0.8rem', color: 'var(--db-text-muted)', textTransform: 'uppercase', marginBottom: '1rem', letterSpacing: '1px', fontWeight: '800' }}>Navigation</h3>
           <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <NavItem to="/user/dashboard" icon={LayoutDashboard} label="Dashboard" />
              <NavItem to="/user/stations" icon={RadioTower} label="Mes Stations" />
              <NavItem to="/user/history" icon={History} label="Historique & Analyses" />
              <NavItem to="/user/alerts" icon={Bell} label="Alertes & Seuils" />
              <NavItem to="/user/logs" icon={Database} label="Journal du Système" />
              <NavItem to="/user/settings" icon={Settings} label="Paramètres" />
           </div>
           <div style={{ marginTop: 'auto', paddingTop: '2rem', borderTop: '1px solid var(--db-border)' }}>
              <button onClick={handleLogout} className="btn-logout" style={{ padding: '1.25rem' }}>
                <LogOut size={20} /> <span style={{ fontSize: '1rem' }}>Se déconnecter</span>
              </button>
           </div>
        </div>
      )}
      
      {/* SIDEBAR (DESKTOP ONLY) */}
      <aside className="db-sidebar hide-mobile" style={{ width: isCollapsed ? '80px' : '260px' }}>
        <div className="db-sidebar-header">
          {(!isCollapsed || isMobileMenuOpen) && (
            <div className="db-logo">
              <CloudRain size={28} color="var(--db-secondary)" />
              <span>MétéoPro Panel</span>
            </div>
          )}
          <button className="hide-mobile" onClick={() => setIsCollapsed(!isCollapsed)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--db-text-muted)' }}>
            {isCollapsed ? <ChevronRight size={20} /> : <Menu size={20} />}
          </button>
        </div>

        <nav className="db-nav">
          <NavItem to="/user/dashboard" icon={LayoutDashboard} label="Dashboard" />
          <NavItem to="/user/stations" icon={RadioTower} label="Mes Stations" />
          <NavItem to="/user/history" icon={History} label="Historique & Analyses" />
          <NavItem to="/user/alerts" icon={Bell} label="Alertes & Seuils" />
          <NavItem to="/user/logs" icon={Database} label="Journal du Système" />
          <NavItem to="/user/settings" icon={Settings} label="Paramètres" />
        </nav>

        <div className="db-sidebar-footer">
          {(!isCollapsed || isMobileMenuOpen) && (
            <div className="user-profile-mini">
               <div className="user-avatar">
                 {userInitial}
               </div>
               <div>
                 <div style={{ fontWeight: '700', fontSize: '0.9rem' }}>{displayUsername}</div>
                 <div style={{ fontSize: '0.75rem', color: 'var(--db-text-muted)' }}>Compte utilisateur</div>
               </div>
            </div>
          )}
          <button onClick={handleLogout} className="btn-logout">
            <LogOut size={18} /> {(!isCollapsed || isMobileMenuOpen) && 'Déconnexion'}
          </button>
        </div>
      </aside>

      {/* CONTENT AREA */}
      <main className="db-main" style={{ paddingBottom: '100px' }}>
        <Outlet />
      </main>

      {/* MOBILE BOTTOM NAVIGATION */}
      <nav className="mobile-bottom-nav">
          <Link to="/user/dashboard" className={`bottom-nav-item ${location.pathname === '/user/dashboard' ? 'active' : ''}`}>
            <LayoutDashboard size={22} />
            <span>Accueil</span>
          </Link>
          <Link to="/user/stations" className={`bottom-nav-item ${location.pathname === '/user/stations' ? 'active' : ''}`}>
            <RadioTower size={22} />
            <span>Stations</span>
          </Link>
          <Link to="/user/history" className={`bottom-nav-item ${location.pathname === '/user/history' ? 'active' : ''}`}>
            <History size={22} />
            <span>Analyses</span>
          </Link>
          <Link to="/user/alerts" className={`bottom-nav-item ${location.pathname === '/user/alerts' ? 'active' : ''}`}>
            <Bell size={22} />
            <span>Alertes</span>
          </Link>
          <Link to="/user/logs" className={`bottom-nav-item ${location.pathname === '/user/logs' ? 'active' : ''}`}>
            <Database size={22} />
            <span>Journal</span>
          </Link>
          <Link to="/user/settings" className={`bottom-nav-item ${location.pathname === '/user/settings' ? 'active' : ''}`}>
            <Settings size={22} />
            <span>Paramètres</span>
          </Link>
      </nav>

    </div>
  );
};

export default UserLayout;
