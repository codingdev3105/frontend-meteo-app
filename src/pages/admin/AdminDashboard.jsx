import React, { useEffect, useState } from 'react';
import { api } from '../../api';
import { useAuth } from '../../context/AuthContext';
import { 
  Users, RadioTower, Zap, AlertTriangle, 
  ShieldCheck, Activity, Clock, UserPlus, 
  ChevronRight, ArrowUpRight, Server, Database, Cpu 
} from 'lucide-react';
import '../../styles/Dashboard.css';

const AdminDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [health, setHealth] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const [statsData, healthData] = await Promise.all([
        api.getAdminStats(),
        api.getHealth()
      ]);
      setStats(statsData);
      setHealth(healthData);
    } catch (error) {
      console.error("Erreur metrics:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, []);

  if (loading) return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '60vh', color: '#94a3b8' }}>
       <Activity className="animate-spin" size={40} style={{ marginBottom: '20px' }} />
       <p style={{ fontWeight: '700' }}>Chargement de la Console Admin...</p>
    </div>
  );

  return (
    <div className="animate-up" style={{ paddingBottom: '50px' }}>
      
      <header className="premium-header">
        <div className="premium-title-group">
          <h1 style={{ fontSize: '2rem', fontWeight: '900', letterSpacing: '-1px' }}>Console Administrateur</h1>
          <div className="premium-subtitle">
            <span className="premium-accent-dot"></span>
            <span>Ravi de vous revoir, <strong>{user?.username}</strong>. Voici l'état global du réseau.</span>
          </div>
        </div>
      </header>

      {/* TOP STATS GRID */}
      <div className="stats-grid" style={{ marginBottom: '3rem' }}>
        <MiniStat label="Utilisateurs" value={stats?.users || 0} icon={<Users size={22} />} color="#0070f3" />
        <MiniStat label="Stations" value={stats?.stations || 0} icon={<RadioTower size={22} />} color="#10b981" />
        <MiniStat label="Nœuds Capteurs" value={stats?.nodes || 0} icon={<Cpu size={22} />} color="#ef4444" />
        <MiniStat label="Seuils Actifs" value={stats?.activeConfigs || 0} icon={<Zap size={22} />} color="#f59e0b" />
      </div>

      <div className="db-dashboard-grid">
        
        {/* LEFT COLUMN: RECENT USERS */}
        <div className="db-card" style={{ padding: '2.5rem', borderRadius: '40px' ,marginBottom: '2.5rem'}}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
             <h3 style={{ margin: 0, fontSize: '1.5rem', fontWeight: '950', letterSpacing: '-0.5px' }}>Nouveaux Utilisateurs</h3>
             <a href="/admin/users" style={{ padding: '8px 18px', background: '#f1f5f9', color: '#0070f3', borderRadius: '12px', fontSize: '0.8rem', fontWeight: '900', textDecoration: 'none' }}>VOIR TOUT</a>
          </div>
          
          <div style={{ display: 'grid', gap: '1.2rem' }}>
             {stats?.recentUsers?.map(u => (
               <div key={u._id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 25px', background: '#fff', borderRadius: '25px', border: '1px solid #f1f5f9', boxShadow: '0 4px 15px rgba(0,0,0,0.02)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                     <div style={{ width: '50px', height: '50px', borderRadius: '15px', background: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '950', color: '#0070f3', border: '1px solid #e2e8f0', fontSize: '1.1rem' }}>
                        {u.username.charAt(0).toUpperCase()}
                     </div>
                     <div>
                        <div style={{ fontSize: '1.05rem', fontWeight: '950', color: '#1e293b' }}>{u.username}</div>
                        <div style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: '700' }}>{u.email}</div>
                     </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                     <div style={{ fontSize: '0.9rem', fontWeight: '900', color: '#1e293b' }}>{new Date(u.createdAt).toLocaleDateString()}</div>
                     <div style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: '700' }}>Inscription</div>
                  </div>
               </div>
             ))}
          </div>
        </div>

        {/* RIGHT COLUMN: SERVICES STATUS */}
        <div style={{ display: 'grid', gap: '2rem', height: 'fit-content',marginBottom: '2.5rem' }}>
          <div className="db-card" style={{ padding: '2.5rem', borderRadius: '40px' }}>
             <h3 style={{ fontSize: '1.3rem', fontWeight: '950', marginBottom: '2.5rem', display: 'flex', alignItems: 'center', gap: '12px' }}>
               <ShieldCheck color="#10b981" size={24} /> Services Cloud
             </h3>
             
             <div style={{ display: 'grid', gap: '1.5rem' }}>
                <ServiceRow 
                  name="API SERVER" 
                  status={health?.server === 'Online' ? 'OPÉRATIONNEL' : 'HORS-LIGNE'} 
                  isOk={health?.server === 'Online'} 
                  icon={<Activity size={20} />}
                />
                <ServiceRow 
                  name="BASE DE DONNÉES" 
                  status={health?.database === 'Connecté' ? 'CONNECTÉE' : 'DÉCONNECTÉE'} 
                  isOk={health?.database === 'Connecté'} 
                  icon={<Database size={20} />}
                />
             </div>
          </div>
        </div>

      </div>
    </div>
  );
};

const MiniStat = ({ label, value, icon, color }) => (
  <div className="db-card mini-stat-premium">
     <div className="stat-icon-box" style={{ background: `${color}25`, color: color }}>{icon}</div>
     <div className="stat-info">
        <div className="label">{label}</div>
        <div className="value">{value}</div>
     </div>
  </div>
);

const ServiceRow = ({ name, status, isOk, icon }) => (
  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 25px', background: isOk ? '#f0fdf4' : '#fef2f2', borderRadius: '25px', border: `1px solid ${isOk ? '#dcfce7' : '#fee2e2'}` }}>
     <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
        <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: isOk ? '#10b981' : '#ef4444' }}>
           {icon}
        </div>
        <div style={{ fontSize: '0.95rem', fontWeight: '950', color: isOk ? '#166534' : '#991b1b' }}>{name}</div>
     </div>
     <div style={{ fontSize: '0.75rem', fontWeight: '950', color: isOk ? '#059669' : '#ef4444', letterSpacing: '0.5px' }}>{status}</div>
  </div>
);

export default AdminDashboard;
