import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../../api';
import { 
  ChevronLeft, Cpu, Share2, Thermometer, Droplets, 
  Zap, Clock, Layout, Activity, Calendar, ShieldCheck,
  Wind, Sun, Battery, Gauge
} from 'lucide-react';
import '../../styles/Dashboard.css';


const StationMonitoring = () => {
  const { hardwareId } = useParams();
  const [station, setStation] = useState(null);
  const [liveState, setLiveState] = useState({ station: {}, nodes: {}, lastUpdate: null });
  const [loading, setLoading] = useState(true);
  const [selectedNodeId, setSelectedNodeId] = useState(null);

  const fetchData = async () => {
    try {
      // 1. Infos de base de la station
      const sData = await api.getStationByHardwareId(hardwareId);
      setStation(sData);
      console.log(sData);
      // 2. État fusionné (Hub + Nœuds) via le nouvel endpoint
      const status = await api.getStationStatus(hardwareId);
      setLiveState(status);
    } catch (err) {
      console.error("Erreur Sync:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 3000);
    return () => clearInterval(interval);
  }, [hardwareId]);

  if (loading) return <div className="db-main">Initialisation...</div>;
  if (!station) return <div className="db-main">Station introuvable.</div>;

  // Calcul du hors-ligne basé sur le dernier update du serveur
  const isOffline = liveState.lastUpdate 
    ? (new Date().getTime() - new Date(liveState.lastUpdate).getTime() > 35000) 
    : true;

  const getFormattedMeasures = () => {
    if (!station || !liveState.sensorLibrary) return [];

    const sourceData = !selectedNodeId ? liveState.station : (liveState.nodes[selectedNodeId] || {});
    const library = liveState.sensorLibrary;

    // On n'affiche QUE les capteurs présents dans les données reçues (sourceData)
    const currentAbbrs = Object.keys(sourceData).filter(k => k !== 'rtcTimestamp');

    return currentAbbrs.map(abbr => {
      const lowAbbr = abbr.toLowerCase();
      const info = library[lowAbbr];

      // Configuration visuelle par défaut ou basée sur le nom/abbrev
      let config = { 
        name: info ? info.name : abbr, 
        abbrev: abbr, 
        icon: <Gauge />, 
        color: '#64748b',
        unit: ''
      };

      // Mapping visuel intelligent
      const nameLower = config.name.toLowerCase();
      const abbrLower = lowAbbr;

      if (nameLower.includes('sol') || abbrLower === 'sol') { config.icon = <Droplets />; config.color = '#8b5cf6'; config.unit = '%'; }
      else if (nameLower.includes('temp') || abbrLower === 't') { config.icon = <Thermometer />; config.color = '#ef4444'; config.unit = '°C'; }
      else if (nameLower.includes('hum') || abbrLower === 'h') { config.icon = <Droplets />; config.color = '#0ea5e9'; config.unit = '%'; }
      else if (nameLower.includes('gaz') || nameLower.includes('air') || nameLower.includes('smoke') || abbrLower === 'g') { config.icon = <Wind />; config.color = '#10b981'; config.unit = 'ppm'; }
      else if (nameLower.includes('lum') || nameLower.includes('light') || abbrLower === 'lum') { config.icon = <Sun />; config.color = '#f59e0b'; config.unit = 'lux'; }
      else if (nameLower.includes('pres')) { config.icon = <Gauge />; config.color = '#6366f1'; config.unit = 'hPa'; }
      else if (nameLower.includes('bat')) { config.icon = <Battery />; config.color = '#10b981'; config.unit = 'V'; }
      else if (nameLower.includes('eau') || nameLower.includes('water') || nameLower.includes('pluie') || abbrLower === 'w') { config.icon = <Activity />; config.color = '#0ea5e9'; config.unit = 'DÉTECT'; }

      return {
        ...config,
        value: (sourceData[abbr] && typeof sourceData[abbr] === 'object') 
          ? sourceData[abbr].value 
          : sourceData[abbr]
      };
    });
  };

  const measures = getFormattedMeasures();
  const selectedName = selectedNodeId ? `Nœud : ${selectedNodeId}` : "Hub Central";

  return (
    <div className="animate-up" style={{ padding: '0 20px 40px 20px' }}>
      
      <header className="premium-header" style={{ marginBottom: '2.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '25px' }}>
          <Link to="/user/stations" className="btn-secondary-premium" style={{ width: '45px', height: '45px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '15px' }}>
            <ChevronLeft size={22} />
          </Link>
          <div className="premium-title-group">
            <h1 className="premium-title" style={{ fontSize: '2.8rem' }}>{station.name}</h1>
            <div className="premium-subtitle">
              <div className={isOffline ? "" : "premium-accent-dot"} style={{ background: isOffline ? '#ef4444' : '#10b981', boxShadow: isOffline ? '0 0 10px rgba(239, 68, 68, 0.4)' : '0 0 10px rgba(16, 185, 129, 0.4)' }}></div>
              <span style={{ fontWeight: '800', color: isOffline ? '#ef4444' : '#10b981', textTransform: 'uppercase', fontSize: '0.8rem', letterSpacing: '1px' }}>
                {isOffline ? 'Station Hors-Ligne' : 'Flux de données en direct'}
              </span>
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
           <div style={{ padding: '10px 20px', background: '#fff', border: '1px solid #f1f5f9', borderRadius: '15px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Clock size={16} color="#64748b" />
              <span style={{ fontSize: '0.8rem', fontWeight: '700', color: '#1e293b' }}>
                {liveState.lastUpdate ? new Date(liveState.lastUpdate).toLocaleTimeString() : '--:--'}
              </span>
           </div>
        </div>
      </header>

      <div className="monitoring-hero-grid db-card" style={{ padding: 0, marginBottom: '2rem', overflow: 'hidden' }}>
        <div style={{ background: '#f8fafc', borderRight: '1px solid #e2e8f0', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ position: 'absolute', top: '20px', left: '20px', fontSize: '0.7rem', fontWeight: '800', color: '#64748b' }}>TOPOLOGIE RÉSEAU</div>
          
          <div style={{ position: 'relative', width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
             <div onClick={() => setSelectedNodeId(null)} className="hub-pulse" style={{ width: '90px', height: '90px', background: !selectedNodeId ? '#0f172a' : '#fff', borderRadius: '22px', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10, cursor: 'pointer', border: !selectedNodeId ? '3px solid #0070f3' : '1px solid #e2e8f0', transition: 'all 0.3s', transform: !selectedNodeId ? 'scale(1.1)' : 'scale(1)' }}>
                <Cpu size={30} color={!selectedNodeId ? '#fff' : '#0070f3'} />
             </div>

             {station.sensorNodes.map((nodeId, index) => {
                const angle = (index * (360 / station.sensorNodes.length)) * (Math.PI / 180);
                const radius = 130;
                const x = Math.cos(angle) * radius;
                const y = Math.sin(angle) * radius;
                return (
                  <React.Fragment key={nodeId}>
                    <div style={{ position: 'absolute', width: `${radius}px`, height: '1px', background: selectedNodeId === nodeId ? '#059669' : '#cbd5e1', transform: `rotate(${angle * (180 / Math.PI)}deg)`, transformOrigin: 'left center', left: '50%', zIndex: 1 }}></div>
                    <div onClick={() => setSelectedNodeId(nodeId)} className="floating-node" style={{ position: 'absolute', transform: `translate(${x}px, ${y}px)`, width: '60px', height: '60px', background: '#fff', borderRadius: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 11, cursor: 'pointer', border: selectedNodeId === nodeId ? '3px solid #059669' : '1px solid #e2e8f0', transition: 'all 0.3s' }}>
                       <Share2 size={20} color={selectedNodeId === nodeId ? '#059669' : '#64748b'} />
                    </div>
                  </React.Fragment>
                );
             })}
          </div>
        </div>

        <div style={{ padding: '2rem' }}>
           <h3 style={{ fontSize: '0.7rem', fontWeight: '800', color: '#94a3b8', textTransform: 'uppercase', marginBottom: '1.2rem' }}>Détails Sélection</h3>
           <div style={{ display: 'grid', gap: '1.2rem' }}>
              <InfoRow label="Appareil" value={selectedName} />
              <InfoRow label="ID Matériel" value={selectedNodeId || hardwareId} />
              <InfoRow label="Dernière Synchro" value={liveState.lastUpdate ? new Date(liveState.lastUpdate).toLocaleTimeString() : '--'} />
              <InfoRow label="Statut" value={isOffline ? "Hors Ligne" : "Connecté"} color={isOffline ? "#ef4444" : "#10b981"} />
           </div>
        </div>
      </div>

      <div>
        <h2 style={{ fontSize: '1.2rem', fontWeight: '800', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Activity size={20} color="#0070f3" /> Flux de données actuel
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '20px' }}>
          {measures.length > 0 ? (
            measures.map((m, i) => (
              <div key={i} className="db-card" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '20px', borderBottom: `4px solid ${m.color}` }}>
                <div style={{ padding: '12px', background: `${m.color}15`, borderRadius: '12px', color: m.color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {m.icon}
                </div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}> 
                    <span style={{ fontSize: '0.65rem', fontWeight: '700', color: '#64748b' }}>{m.name}</span>
                  </div>
                  <div style={{ fontSize: '1.8rem', fontWeight: '950', color: '#0f172a', marginTop: '4px' }}>
                    {m.value || '--'} <span style={{ fontSize: '0.8rem', opacity: 0.3 }}>{m.unit}</span>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="db-card" style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '3rem', color: '#94a3b8' }}>
               En attente de transmission...
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const InfoRow = ({ label, value, color }) => (
  <div style={{ display: 'flex', flexDirection: 'column' }}>
    <span style={{ fontSize: '0.6rem', fontWeight: '800', color: '#94a3b8', textTransform: 'uppercase' }}>{label}</span>
    <span style={{ fontSize: '0.95rem', fontWeight: '700', color: color || '#1e293b' }}>{value}</span>
  </div>
);

export default StationMonitoring;
