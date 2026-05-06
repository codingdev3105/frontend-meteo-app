import React, { useState, useEffect } from 'react';
import { api } from '../../api';
import { useAuth } from '../../context/AuthContext';
import { 
  Activity, AlertCircle, Clock, Database, 
  ShieldAlert, Radio, ArrowUpRight, Zap, 
  Thermometer, Droplets, Server, Eye, X, CheckCircle2,
  Cpu, LayoutDashboard, ChevronRight
} from 'lucide-react';
import '../../styles/Dashboard.css';

const UserDashboard = () => {
  const { user } = useAuth();
  const [stations, setStations] = useState([]);
  const [unseenAlerts, setUnseenAlerts] = useState([]);
  const [systemLogs, setSystemLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedAlertGroup, setSelectedAlertGroup] = useState(null); // Pour le Modal

  const loadDashboard = async () => {
    try {
      const [sData, aData, lData] = await Promise.all([
        api.getUserStations(),
        api.getUnseenAlerts(),
        api.getSystemLogs()
      ]);
      setStations(sData);
      setUnseenAlerts(aData);
      setSystemLogs(lData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
    const interval = setInterval(loadDashboard, 15000);
    return () => clearInterval(interval);
  }, []);

  const handleMarkAsSeen = async (alertId) => {
    try {
      await api.markAlertAsSeen(alertId);
      setSelectedAlertGroup(null);
      loadDashboard();
    } catch (err) {
      console.error(err);
    }
  };

  // Calcul des noeuds totaux
  const totalNodes = stations.reduce((acc, s) => acc + (s.sensorNodes?.length || 0), 0);

  if (loading) return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '60vh', color: '#94a3b8' }}>
       <Activity className="animate-spin" size={40} style={{ marginBottom: '20px' }} />
       <p style={{ fontWeight: '700' }}>Synchronisation du Dashboard...</p>
    </div>
  );

  return (
    <div className="animate-up" style={{ paddingBottom: '50px' }}>
      
      <header className="premium-header">
        <div className="premium-title-group">
          <h1 style={{ fontSize: '2rem', fontWeight: '900', letterSpacing: '-1px' }}>Dashboard</h1>
        </div>
      </header>

      {/* TOP STATS GRID */}
      <div className="stats-grid" style={{ marginBottom: '1rem' }}>
        <MiniStat label="Stations Enregistrées" value={stations.length} icon={<Server size={18} />} color="#0070f3" />
        <MiniStat label="Nœuds Capteurs" value={totalNodes} icon={<Cpu size={18} />} color="#10b981" />
        <MiniStat label="Alertes Non Vues" value={unseenAlerts.length} icon={<AlertCircle size={18} />} color="#ef4444" />
        <MiniStat label="Nouveaux Événements" value={systemLogs.filter(l => !l.isSeen).length} icon={<Database size={18} />} color="#6366f1" />
      </div>

      <div className="db-dashboard-grid" style={{ display: 'grid', gridTemplateColumns: '1.8fr 1fr', gap: '2rem' }}>
        
        {/* LEFT COLUMN: ACTIVITY & CONNECTION STATUS */}
        <div style={{ display: 'grid', gap: '2rem' }}>
          
          <div className="db-card" style={{ padding: '2rem', borderRadius: '40px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
              <h3 style={{ margin: 0, fontSize: '1.4rem', fontWeight: '900' }}>État de connexion des stations</h3>
              <div style={{ padding: '6px 15px', background: '#f1f5f9', color: '#64748b', borderRadius: '12px', fontSize: '0.7rem', fontWeight: '800' }}>LIVE</div>
            </div>

            <div style={{ display: 'grid', gap: '1.2rem' }}>
               {stations.length > 0 ? stations.map(s => (
                 <StationStatusRow key={s._id} station={s} />
               )) : <p style={{ textAlign: 'center', color: '#94a3b8' }}>Aucune station configurée.</p>}
            </div>
          </div>

          {/* JOURNAL TECHNIQUE DU SYSTÈME */}
          <div className="db-card" style={{ padding: '2rem', borderRadius: '40px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
              <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: '900', display: 'flex', alignItems: 'center', gap: '12px' }}>
                <Database size={20} color="#0070f3" /> Journal technique du système
              </h3>
              <button 
                onClick={async () => {
                  await api.markSystemLogsSeen();
                  loadDashboard();
                }}
                style={{ 
                  background: 'none', border: 'none', color: '#94a3b8', 
                  fontSize: '0.75rem', fontWeight: '700', textDecoration: 'underline', 
                  cursor: 'pointer' 
                }}
              >
                Tout marquer comme vu
              </button>
            </div>
            
            <div style={{ display: 'grid', gap: '1rem' }}>
              {systemLogs.filter(l => !l.isSeen).length > 0 ? systemLogs.filter(l => !l.isSeen).map((log, idx, filteredArray) => (
                <div key={log._id} style={{ 
                  display: 'flex', gap: '15px', padding: '12px 0', 
                  borderBottom: idx === filteredArray.length - 1 ? 'none' : '1px solid #f1f5f9' 
                }}>
                  <div style={{ 
                    width: '36px', height: '36px', borderRadius: '10px', 
                    background: log.type === 'CRITICAL' ? '#fee2e2' : log.type === 'STATION' ? '#eff6ff' : '#f1f5f9',
                    color: log.type === 'CRITICAL' ? '#ef4444' : log.type === 'STATION' ? '#0070f3' : '#64748b',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
                  }}>
                    {log.event === 'STATION_CONNECTED' ? <Zap size={18} /> : 
                     log.event === 'STATION_OFFLINE' ? <Radio size={18} className="animate-pulse" /> : <Clock size={18} />}
                  </div>
                  <div>
                    <div style={{ fontSize: '0.85rem', fontWeight: '700', color: '#1e293b' }}>{log.message}</div>
                    <div style={{ fontSize: '0.7rem', color: '#94a3b8', fontWeight: '600', marginTop: '3px' }}>
                      {new Date(log.createdAt).toLocaleString()}
                    </div>
                  </div>
                </div>
              )) : <p style={{ textAlign: 'center', color: '#94a3b8', fontSize: '0.9rem' }}>Aucun événement enregistré.</p>}
            </div>
          </div>

        </div>

        {/* RIGHT COLUMN: RECENT ALERTS (UNSEEN ONLY) */}
        <div style={{ display: 'grid', gap: '2rem' }}>
          
          <div className="db-card" style={{ padding: '2rem', borderRadius: '35px', minHeight: '400px' }}>
             <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
               <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: '900', display: 'flex', alignItems: 'center', gap: '10px' }}>
                 <ShieldAlert color="#ef4444" size={20} /> Alertes Récentes
               </h3>
               <button 
                onClick={async () => {
                  await api.markAllAlertsSeen();
                  loadDashboard();
                }}
                style={{ 
                  background: 'none', border: 'none', color: '#94a3b8', 
                  fontSize: '0.75rem', fontWeight: '700', textDecoration: 'underline', 
                  cursor: 'pointer' 
                }}
               >
                 Tout marquer comme vu
               </button>
             </div>
             
             <div style={{ display: 'grid', gap: '1rem' }}>
                {unseenAlerts.length > 0 ? unseenAlerts.map(group => (
                   <div 
                    key={group.latestLog._id} 
                    onClick={() => setSelectedAlertGroup(group)}
                    style={{ 
                        display: 'flex', gap: '12px', padding: '15px', background: '#fef2f2', 
                        borderRadius: '22px', border: '1px solid #fee2e2', cursor: 'pointer',
                        transition: 'transform 0.2s'
                    }}
                    onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.02)'}
                    onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
                   >
                      <div style={{ width: '45px', height: '45px', borderRadius: '12px', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                         <AlertCircle color="#ef4444" size={20} />
                      </div>
                      <div style={{ flex: 1 }}>
                         <div style={{ fontSize: '0.85rem', fontWeight: '900', color: '#991b1b' }}>
                            {group.alertInfo?.name || 'Alerte Inconnue'}
                         </div>
                         <div style={{ fontSize: '0.7rem', color: '#f87171', fontWeight: '700' }}>
                            {group.latestLog.stationId} • {new Date(group.latestLog.createdAt).toLocaleTimeString()}
                         </div>
                         {group.count > 1 && (
                            <div style={{ marginTop: '5px', fontSize: '0.65rem', background: '#dc2626', color: '#fff', padding: '2px 8px', borderRadius: '10px', display: 'inline-block' }}>
                                +{group.count - 1} répétitions
                            </div>
                         )}
                      </div>
                      <ChevronRight size={18} color="#fca5a5" />
                   </div>
                )) : (
                  <div style={{ textAlign: 'center', padding: '4rem 0', color: '#94a3b8' }}>
                    <CheckCircle2 size={40} style={{ opacity: 0.1, marginBottom: '15px' }} />
                    <div style={{ fontSize: '0.85rem' }}>Tout est sous contrôle. Aucune alerte non vue.</div>
                  </div>
                )}
             </div>
          </div>
        </div>

      </div>

      {/* MODAL DETAIL ALERTE */}
      {selectedAlertGroup && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.8)', backdropFilter: 'blur(10px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}>
           <div className="db-card animate-up" style={{ width: '100%', maxWidth: '500px', padding: '2.5rem', borderRadius: '35px', maxHeight: '80vh', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                 <h2 style={{ fontSize: '1.4rem', fontWeight: '900', color: '#ef4444' }}>Détails de l'Alerte</h2>
                 <button onClick={() => setSelectedAlertGroup(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}><X size={24}/></button>
              </div>

              <div style={{ marginBottom: '2rem' }}>
                 <div style={{ fontSize: '1.1rem', fontWeight: '800', marginBottom: '5px' }}>{selectedAlertGroup.alertInfo?.name}</div>
                 <p style={{ fontSize: '0.9rem', color: '#64748b', margin: 0 }}>{selectedAlertGroup.alertInfo?.description || 'Aucune description fournie.'}</p>
                 <div style={{ marginTop: '10px', fontSize: '0.8rem', fontWeight: '700', color: '#94a3b8' }}>
                    Seuil: {selectedAlertGroup.alertInfo?.sensorType} {selectedAlertGroup.alertInfo?.operator} {selectedAlertGroup.alertInfo?.thresholdValue}
                 </div>
              </div>

              <div style={{ flex: 1, overflowY: 'auto', marginBottom: '2rem', paddingRight: '10px' }}>
                 <h4 style={{ fontSize: '0.75rem', fontWeight: '800', color: '#94a3b8', textTransform: 'uppercase', marginBottom: '1rem' }}>Historique récent ({selectedAlertGroup.count})</h4>
                 {selectedAlertGroup.allLogs.map((log, i) => (
                    <div key={i} style={{ padding: '12px', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                       <span style={{ fontSize: '0.85rem', color: '#475569' }}>{new Date(log.createdAt).toLocaleString()}</span>
                       <span style={{ fontSize: '0.85rem', fontWeight: '800', color: '#ef4444' }}>{log.triggeredValue}</span>
                    </div>
                 ))}
              </div>

              <button 
                onClick={() => handleMarkAsSeen(selectedAlertGroup.alertInfo._id)}
                className="btn-primary-premium" 
                style={{ background: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', padding: '15px' }}
              >
                 <CheckCircle2 size={20} /> MARQUER COMME VU (SORTIR)
              </button>
           </div>
        </div>
      )}

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

const StationStatusRow = ({ station }) => {
  const [lastData, setLastData] = useState(null);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await api.getStationStatus(station.hardwareId);
        setLastData(res);
      } catch (e) {}
    };
    fetch();
  }, [station.hardwareId]);

  const lastSeen = station.lastOnline ? new Date(station.lastOnline).toLocaleString() : 'Jamais connecté';
  
  // Calcul du "Live" (Online)
  const isOnline = lastData?.lastUpdate 
    ? (new Date().getTime() - new Date(lastData.lastUpdate).getTime() < 180000) 
    : false;

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 25px', background: '#fff', borderRadius: '25px', border: '1px solid #f1f5f9', boxShadow: '0 4px 15px rgba(0,0,0,0.02)' }}>
       <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div style={{ width: '50px', height: '50px', borderRadius: '16px', background: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
             <Server size={22} color={isOnline ? "#10b981" : "#64748b"} />
          </div>
          <div>
             <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ fontSize: '1rem', fontWeight: '900', color: '#1e293b' }}>{station.name}</div>
                {isOnline && <span className="badge badge-success" style={{ fontSize: '0.6rem', padding: '2px 8px' }}>LIVE</span>}
             </div>
             <div style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: '600' }}>
                <Clock size={12} style={{ marginRight: '6px', verticalAlign: 'middle' }} /> 
                Dernière connexion : <span style={{ color: isOnline ? '#10b981' : '#0070f3', fontWeight: '800' }}>{lastSeen}</span>
             </div>
          </div>
       </div>
       <a 
        href={`/user/stations/${station.hardwareId}`} 
        className={isOnline ? "blinking-green-btn" : ""}
        style={{ 
            display: 'flex', alignItems: 'center', justifyContent: 'center', 
            width: '35px', height: '35px', borderRadius: '50%', 
            background: isOnline ? '#10b981' : '#f1f5f9', 
            color: isOnline ? '#fff' : '#1e293b',
            transition: 'all 0.3s'
        }}
       >
          <ArrowUpRight size={18} />
       </a>
    </div>
  );
};

export default UserDashboard;
