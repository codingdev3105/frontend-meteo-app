import React, { useContext, useState, useEffect } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { LayoutDashboard, Users, User, RadioTower, LogOut, Activity, Menu, X, ChevronRight, CloudRain, FileText } from 'lucide-react';
import { AuthContext } from '../../context/AuthContext';

const AdminLayout = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const [isCollapsed, setIsCollapsed] = useState(windowWidth < 1200); // Auto-collapse on medium screens
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
      if (window.innerWidth < 1200) setIsCollapsed(true);
      else setIsCollapsed(false);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItemStyle = (path) => ({
    display: 'flex',
    alignItems: 'center',
    gap: (isCollapsed && windowWidth >= 768) ? '0' : '0.8rem',
    justifyContent: (isCollapsed && windowWidth >= 768) ? 'center' : 'flex-start',
    padding: '0.8rem 1rem',
    borderRadius: 'var(--radius-md)',
    color: location.pathname === path ? 'var(--color-brand-secondary)' : 'var(--color-text-muted)',
    backgroundColor: location.pathname === path ? 'rgba(0, 112, 243, 0.08)' : 'transparent',
    fontWeight: location.pathname === path ? '600' : '500',
    transition: 'all 0.2s ease',
    marginBottom: '0.25rem',
    cursor: 'pointer'
  });

  const isMobile = windowWidth < 768;

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: 'var(--color-background-cloud)', flexDirection: 'column' }}>
      
      {/* 1. TOP NAVBAR (MOBILE & TABLET) */}
      <header style={{ 
        display: isMobile ? 'flex' : 'none', 
        backgroundColor: 'rgba(255, 255, 255, 0.9)', 
        backdropFilter: 'blur(15px)',
        padding: '0 1.5rem', 
        borderBottom: '1px solid var(--color-border)', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        position: 'sticky',
        top: 0,
        zIndex: 1000,
        height: '80px'
      }}>
         <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <CloudRain size={28} color="var(--db-secondary)" />
            <span style={{ fontSize: '1.1rem', fontWeight: '900', letterSpacing: '-0.5px' }}>MétéoPro Panel</span>
         </div>
         <button 
           onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} 
           style={{ background: 'none', border: 'none', color: 'var(--color-brand-primary)', cursor: 'pointer' }}
         >
           {isMobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
         </button>
      </header>

      <div style={{ display: 'flex', flex: 1 }}>
        
        {/* 2. SIDEBAR (TABLET & DESKTOP) */}
        {!isMobile && (
          <aside style={{
            width: isCollapsed ? '80px' : '260px',
            backgroundColor: 'var(--color-surface-card)',
            borderRight: '1px solid var(--color-border)',
            display: 'flex',
            flexDirection: 'column',
            transition: 'width 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            position: 'sticky',
            top: 0,
            height: '100vh',
            zIndex: 900
          }}>
            <div style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: isCollapsed ? 'center' : 'space-between', borderBottom: '1px solid var(--color-border)', minHeight: '70px' }}>
              {!isCollapsed && (
                <div className="db-logo">
                  <CloudRain size={28} color="var(--db-secondary)" />
                  <span>MétéoPro Panel</span>
                </div>
              )}
              <button onClick={() => setIsCollapsed(!isCollapsed)} style={{ background: 'none', border: 'none', color: '#94A3B8', cursor: 'pointer' }}>
                {isCollapsed ? <ChevronRight size={20} /> : <Menu size={20} />}
              </button>
            </div>

            <nav style={{ padding: '1.5rem 0.75rem', display: 'flex', flexDirection: 'column', flex: 1 }}>
              <Link to="/admin/dashboard" style={navItemStyle('/admin/dashboard')} title="Dashboard">
                <LayoutDashboard size={20} /> {!isCollapsed && 'Tableau de bord'}
              </Link>
              <Link to="/admin/users" style={navItemStyle('/admin/users')} title="Utilisateurs">
                <Users size={20} /> {!isCollapsed && 'Utilisateurs'}
              </Link>
              <Link to="/admin/stations" style={navItemStyle('/admin/stations')} title="Réseau IoT">
                <RadioTower size={20} /> {!isCollapsed && 'Stations Météo'}
              </Link>
              <Link to="/admin/docs" style={navItemStyle('/admin/docs')} title="Documentation">
                <FileText size={20} /> {!isCollapsed && 'Documentation'}
              </Link>
            </nav>

            <div style={{ padding: '1.25rem', borderTop: '1px solid var(--color-border)' }}>
              {!isCollapsed && (
                <div style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                   <div style={{ width: '40px', height: '40px', borderRadius: '10px', backgroundColor: '#F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #E2E8F0' }}>
                     <User size={20} color="var(--color-brand-primary)" />
                   </div>
                   <div>
                     <div style={{ fontWeight: '700', fontSize: '0.85rem' }}>{user?.username}</div>
                     <div style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)' }}>Super Admin</div>
                   </div>
                </div>
              )}
              <button 
                onClick={handleLogout}
                style={{ display: 'flex', alignItems: 'center', justifyContent: isCollapsed ? 'center' : 'flex-start', gap: '0.75rem', width: '100%', padding: '0.8rem', border: 'none', backgroundColor: '#FEF2F2', color: '#EF4444', borderRadius: 'var(--radius-md)', cursor: 'pointer', transition: '0.2s' }}>
                <LogOut size={18} /> {!isCollapsed && <span style={{ fontWeight: 'bold' }}>Sortir</span>}
              </button>
            </div>
          </aside>
        )}

        {/* 3. MOBILE MENU OVERLAY */}
        {isMobile && isMobileMenuOpen && (
          <div style={{ position: 'fixed', top: '80px', left: 0, right: 0, bottom: 0, backgroundColor: 'white', zIndex: 1100, padding: '1.5rem', animation: 'fadeIn 0.2s ease' }}>
             <h3 style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', marginBottom: '1rem', letterSpacing: '1px' }}>Menu Principal</h3>
             <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <Link onClick={() => setIsMobileMenuOpen(false)} to="/admin/dashboard" style={{ ...navItemStyle('/admin/dashboard'), padding: '1.25rem' }}>
                  <LayoutDashboard size={22} /> Tableau de bord
                </Link>
                <Link onClick={() => setIsMobileMenuOpen(false)} to="/admin/users" style={{ ...navItemStyle('/admin/users'), padding: '1.25rem' }}>
                  <Users size={22} /> Utilisateurs
                </Link>
                <Link onClick={() => setIsMobileMenuOpen(false)} to="/admin/stations" style={{ ...navItemStyle('/admin/stations'), padding: '1.25rem' }}>
                  <RadioTower size={22} /> Stations Météo
                </Link>
                <Link onClick={() => setIsMobileMenuOpen(false)} to="/admin/docs" style={{ ...navItemStyle('/admin/docs'), padding: '1.25rem' }}>
                  <FileText size={22} /> Documentation
                </Link>
             </div>
             <div style={{ marginTop: '2rem', paddingTop: '2rem', borderTop: '1px solid var(--color-border)' }}>
                <button onClick={handleLogout} style={{ width: '100%', padding: '1.25rem', borderRadius: '12px', backgroundColor: '#FEF2F2', border: 'none', color: '#EF4444', display: 'flex', alignItems: 'center', gap: '1rem', fontWeight: 'bold' }}>
                  <LogOut size={20} /> Se déconnecter
                </button>
             </div>
          </div>
        )}

        {/* 4. MAIN CONTENT AREA */}
        <main style={{ 
          flex: 1, 
          padding: isMobile ? '1.5rem' : '3rem',
          maxWidth: '100%',
          overflowX: 'hidden'
        }}>
          <Outlet />
        </main>
      </div>

      {/* 5. BOTTOM NAVIGATION BAR (ONLY MOBILE) */}
      {isMobile && (
        <nav style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          height: '65px',
          backgroundColor: 'white',
          borderTop: '1px solid var(--color-border)',
          display: 'flex',
          justifyContent: 'space-around',
          alignItems: 'center',
          zIndex: 1000,
          paddingBottom: 'env(safe-area-inset-bottom)'
        }}>
          <Link to="/admin/dashboard" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', color: location.pathname === '/admin/dashboard' ? 'var(--color-brand-secondary)' : '#94A3B8' }}>
            <LayoutDashboard size={22} />
            <span style={{ fontSize: '0.65rem', fontWeight: '700' }}>Accueil</span>
          </Link>
          <Link to="/admin/stations" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', color: location.pathname === '/admin/stations' ? 'var(--color-brand-secondary)' : '#94A3B8' }}>
            <RadioTower size={22} />
            <span style={{ fontSize: '0.65rem', fontWeight: '700' }}>Stations</span>
          </Link>
          <Link to="/admin/users" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', color: location.pathname === '/admin/users' ? 'var(--color-brand-secondary)' : '#94A3B8' }}>
            <Users size={22} />
            <span style={{ fontSize: '0.65rem', fontWeight: '700' }}>Clients</span>
          </Link>
          <Link to="/admin/docs" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', color: location.pathname === '/admin/docs' ? 'var(--color-brand-secondary)' : '#94A3B8' }}>
            <FileText size={22} />
            <span style={{ fontSize: '0.65rem', fontWeight: '700' }}>Aide</span>
          </Link>
        </nav>
      )}

    </div>
  );
};

export default AdminLayout;
