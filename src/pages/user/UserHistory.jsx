import React, { useState, useEffect, useMemo } from 'react';
import { api } from '../../api';
import { 
  XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, AreaChart, Area 
} from 'recharts';
import { 
  Database, Filter, 
  Activity, Download,
  Thermometer, Droplets, Wind, Sun, Gauge,
  RotateCcw, X
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import '../../styles/Dashboard.css';

const UserHistory = () => {
  const [stations, setStations] = useState([]);
  const [selectedStation, setSelectedStation] = useState(null);
  const [selectedContext, setSelectedContext] = useState('hub');
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [library, setLibrary] = useState({});
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filterType, setFilterType] = useState('1h'); // Default to 1h
  const [filterConfig, setFilterConfig] = useState({
    year: new Date().getFullYear(),
    month: 'all',
    day: 'all',
    hour: 'all'
  });

  const loadInitialData = async (isManual = false) => {
    if (isManual) setRefreshing(true);
    else setLoading(true);
    try {
      const [sData, sensors] = await Promise.all([
        api.getUserStations(),
        api.getSensorsCatalogue()
      ]);
      setStations(sData);
      const dict = {};
      sensors.forEach(s => { dict[s.abbreviation.toLowerCase()] = { name: s.name, id: s.sensorId }; });
      setLibrary(dict);
      if (sData.length > 0 && !selectedStation) setSelectedStation(sData[0]);
      
      // Si c'est un rafraîchissement manuel, on force aussi l'historique
      if (isManual) await fetchHistory();
    } catch (err) { 
      toast.error("Erreur de synchronisation.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { loadInitialData(); }, []);

  const fetchHistory = async () => {
    if (!selectedStation) return;
    try {
      let days = 1;
      if (filterType === '30j' || filterType === 'month') days = 31;
      if (filterType === 'year') days = 365;
      const data = await api.getStationHistory(selectedStation.hardwareId, days);
      setHistory(data);
    } catch (err) {
      toast.error("Erreur de récupération.");
    }
  };

  useEffect(() => { fetchHistory(); }, [selectedStation, filterType, filterConfig.year]);

  const options = useMemo(() => {
    const years = [...new Set(history.map(m => new Date(m.createdAt).getFullYear()))].sort();
    const months = [...new Set(history.map(m => new Date(m.createdAt).getMonth() + 1))].sort((a,b) => a-b);
    const days = [...new Set(history.map(m => new Date(m.createdAt).toDateString()))].sort();
    const hours = [...new Set(history.map(m => new Date(m.createdAt).getHours()))].sort((a,b) => a-b);
    return { years, months, days, hours };
  }, [history]);

  const chartData = useMemo(() => {
    if (!history.length) return [];

    let filtered = history.map(m => ({
        ...m,
        dateObj: new Date(m.createdAt),
        rawValues: selectedContext === 'hub' ? (m.stationData || {}) : (m.sensorNodesData?.find(n => n.nodeId === selectedContext)?.sensors || {})
    }));

    const groupData = (data, getGroupKey, getDisplayLabel) => {
        const groups = {};
        data.forEach(m => {
            const key = getGroupKey(m.dateObj);
            if (!groups[key]) groups[key] = { label: getDisplayLabel(m.dateObj), counts: {}, sums: {}, fullTime: m.dateObj.toLocaleString() };
            Object.entries(m.rawValues).forEach(([k, v]) => {
                if (k === 'rtcTimestamp') return;
                const lowK = k.toLowerCase();
                const val = typeof v === 'object' ? v.value : v;
                if (val === null || isNaN(val)) return;
                groups[key].sums[lowK] = (groups[key].sums[lowK] || 0) + parseFloat(val);
                groups[key].counts[lowK] = (groups[key].counts[lowK] || 0) + 1;
            });
        });
        return Object.values(groups).map(g => {
            const result = { displayTime: g.label, fullTime: g.fullTime };
            Object.keys(g.sums).forEach(k => {
                result[k] = (g.sums[k] / g.counts[k]).toFixed(1);
            });
            return result;
        });
    };

    if (filterType === '1h') {
        const limit = new Date(Date.now() - 3600000);
        filtered = filtered.filter(m => m.dateObj > limit);
    } 
    else if (filterType === '24h') {
        if (filterConfig.hour !== 'all') {
            filtered = filtered.filter(m => m.dateObj.getHours() === parseInt(filterConfig.hour));
        } else {
            return groupData(filtered, d => d.getHours(), d => `${d.getHours()}h`);
        }
    }
    else if (filterType === '30j') {
        if (filterConfig.day !== 'all') {
            filtered = filtered.filter(m => m.dateObj.toDateString() === filterConfig.day);
            if (filterConfig.hour !== 'all') {
                filtered = filtered.filter(m => m.dateObj.getHours() === parseInt(filterConfig.hour));
            } else {
                return groupData(filtered, d => d.getHours(), d => `${d.getHours()}h`);
            }
        } else {
            return groupData(filtered, d => d.toDateString(), d => d.toLocaleDateString([], { day: '2-digit', month: '2-digit' }));
        }
    }
    else if (filterType === 'archive') {
        filtered = filtered.filter(m => m.dateObj.getFullYear() === parseInt(filterConfig.year));
        
        if (filterConfig.month !== 'all') {
            filtered = filtered.filter(m => m.dateObj.getMonth() + 1 === parseInt(filterConfig.month));
            
            if (filterConfig.day !== 'all') {
                filtered = filtered.filter(m => m.dateObj.toDateString() === filterConfig.day);
                
                if (filterConfig.hour !== 'all') {
                    filtered = filtered.filter(m => m.dateObj.getHours() === parseInt(filterConfig.hour));
                } else {
                    return groupData(filtered, d => d.getHours(), d => `${d.getHours()}h`);
                }
            } else {
                return groupData(filtered, d => d.toDateString(), d => d.toLocaleDateString([], { day: '2-digit' }));
            }
        } else {
            return groupData(filtered, d => d.getMonth(), d => d.toLocaleDateString([], { month: 'short' }));
        }
    }

    return filtered.map(m => {
        const res = { 
            displayTime: m.dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), 
            fullTime: m.dateObj.toLocaleString() 
        };
        Object.entries(m.rawValues).forEach(([k, v]) => {
            if (k === 'rtcTimestamp') return;
            res[k.toLowerCase()] = typeof v === 'object' ? v.value : v;
        });
        return res;
    });
  }, [history, selectedContext, filterType, filterConfig]);

  const detectedSensors = [...new Set(chartData.flatMap(d => 
    Object.keys(d).filter(k => !['fullTime', 'displayTime'].includes(k))
  ))];

  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [exportSettings, setExportSettings] = useState({});
  const [exportTarget, setExportTarget] = useState(null); // null = all, string = specific sensorKey

  const openExportModal = (sensorKey = null) => {
    setExportTarget(sensorKey);
    const settings = {};
    const targets = sensorKey ? [sensorKey] : detectedSensors;
    
    targets.forEach(s => {
      settings[s] = getSensorConfig(s).name;
    });
    
    setExportSettings(settings);
    setIsExportModalOpen(true);
  };

  const exportToCSV = () => {
    if (chartData.length === 0) return;
    
    const cleanStr = (str) => str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    const targets = exportTarget ? [exportTarget] : detectedSensors;

    const headers = ["Date", "Heure", ...targets.map(s => cleanStr(exportSettings[s] || getSensorConfig(s).name))];
    
    const rows = chartData.map(d => {
        const [date, time] = d.fullTime.includes(' ') ? d.fullTime.split(' ') : [d.fullTime, ""];
        return [
            date.replace(',', ''),
            time,
            ...targets.map(s => d[s] || "")
        ];
    });
    
    const csvContent = "sep=;\n" 
      + headers.join(";") + "\n"
      + rows.map(r => r.join(";")).join("\n");
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const encodedUri = URL.createObjectURL(blob);
    
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    const fileName = exportTarget ? `export_${exportTarget}_${new Date().toLocaleDateString().replace(/\//g, '-')}.csv` : `export_global_${new Date().toLocaleDateString().replace(/\//g, '-')}.csv`;
    link.setAttribute("download", fileName);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setIsExportModalOpen(false);
    toast.success(exportTarget ? "Export du capteur réussi !" : "Rapport global exporté !");
  };

  const getSensorConfig = (abbr) => {
    const info = library[abbr.toLowerCase()];
    const name = info ? info.name : abbr;
    const nameLower = name.toLowerCase();
    let config = { name, icon: <Gauge size={18}/>, color: '#64748b', unit: '' };
    if (nameLower.includes('sol')) { config.icon = <Droplets size={18}/>; config.color = '#8b5cf6'; config.unit = '%'; }
    else if (nameLower.includes('temp')) { config.icon = <Thermometer size={18}/>; config.color = '#ef4444'; config.unit = '°C'; }
    else if (nameLower.includes('hum')) { config.icon = <Droplets size={18}/>; config.color = '#0ea5e9'; config.unit = '%'; }
    else if (nameLower.includes('gaz') || nameLower.includes('air')) { config.icon = <Wind size={18}/>; config.color = '#10b981'; config.unit = 'ppm'; }
    else if (nameLower.includes('lum')) { config.icon = <Sun size={18}/>; config.color = '#f59e0b'; config.unit = 'lux'; }
    return config;
  };

  return (
    <div className="animate-up" style={{ paddingBottom: '50px' }}>
      
      {/* LIGNE 1: TITRE ET PHRASE */}
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2.5rem', fontWeight: '950', letterSpacing: '-1.5px', marginBottom: '8px', color: '#1e293b' }}>
          Analyses <span style={{ color: '#0070f3' }}>Expert</span>
        </h1>
        <p style={{ color: '#64748b', fontWeight: '600', fontSize: '1.1rem' }}>
          Filtrage intelligent et forage de données pour un suivi précis.
        </p>
      </div>

      {/* LIGNE 2: ACTIONS (BOUTONS) */}
      <div style={{ display: 'flex', gap: '15px', marginBottom: '2.5rem' }}>
        <button onClick={openExportModal} className="btn-secondary-premium" style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '14px 25px', background: '#fff', borderRadius: '15px', border: '1px solid #e2e8f0', fontWeight: '800' }}>
           <Download size={20} /> EXPORTER LES DONNÉES CSV
        </button>
        <button onClick={() => loadInitialData(true)} className="btn-secondary-premium" style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '14px 25px', background: '#fff', borderRadius: '15px', border: '1px solid #e2e8f0', fontWeight: '800' }}>
           <RotateCcw size={20} className={refreshing ? "animate-spin" : ""} /> ACTUALISER LA VUE
        </button>
      </div>

      {/* LIGNE 3: BARRE DE FILTRAGE */}
      <div className="db-header-actions" style={{ marginBottom: '3rem', padding: '30px', background: '#fff', borderRadius: '30px', border: '1px solid #f1f5f9', boxShadow: '0 10px 30px rgba(0,0,0,0.02)' }}>
          
          {/* SÉLECTEUR DE STATION */}
          <div style={{ flex: 1 }}>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#94a3b8', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Station de surveillance
              </label>
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                  <Database size={16} style={{ position: 'absolute', left: '16px', color: '#4f46e5' }} />
                  <select 
                    style={{ 
                      width: '100%', padding: '12px 16px 12px 44px', borderRadius: '12px', border: '1px solid #e2e8f0',
                      background: '#fff', color: '#1e293b', fontWeight: '700', fontSize: '0.95rem',
                      appearance: 'none', cursor: 'pointer', outline: 'none', transition: 'border-color 0.2s'
                    }}
                    onFocus={(e) => e.target.style.borderColor = '#4f46e5'}
                    onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
                    value={selectedStation?.hardwareId || ''} 
                    onChange={(e) => setSelectedStation(stations.find(s => s.hardwareId === e.target.value))}
                  >
                    {stations.map(s => <option key={s.hardwareId} value={s.hardwareId}>{s.name}</option>)}
                  </select>
                  <div style={{ position: 'absolute', right: '16px', pointerEvents: 'none', borderTop: '5px solid #94a3b8', borderLeft: '4px solid transparent', borderRight: '4px solid transparent' }}></div>
              </div>
          </div>

          {/* SÉLECTEUR DE SOURCE (NODE) */}
          <div style={{ flex: 1 }}>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#94a3b8', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Point de mesure
              </label>
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                  <Activity size={16} style={{ position: 'absolute', left: '16px', color: '#16a34a' }} />
                  <select 
                    style={{ 
                      width: '100%', padding: '12px 16px 12px 44px', borderRadius: '12px', border: '1px solid #e2e8f0',
                      background: '#fff', color: '#1e293b', fontWeight: '700', fontSize: '0.95rem',
                      appearance: 'none', cursor: 'pointer', outline: 'none', transition: 'border-color 0.2s'
                    }}
                    onFocus={(e) => e.target.style.borderColor = '#16a34a'}
                    onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
                    value={selectedContext} 
                    onChange={(e) => setSelectedContext(e.target.value)}
                  >
                    <option value="hub">Unité Centrale (Hub)</option>
                    {selectedStation?.sensorNodes.map(id => <option key={id} value={id}>Capteur déporté: {id}</option>)}
                  </select>
                  <div style={{ position: 'absolute', right: '16px', pointerEvents: 'none', borderTop: '5px solid #94a3b8', borderLeft: '4px solid transparent', borderRight: '4px solid transparent' }}></div>
              </div>
          </div>

          {/* BOUTON FILTRER */}
          <button 
            onClick={() => setIsModalOpen(true)} 
            className="btn-primary-premium" 
            style={{ 
              display: 'flex', alignItems: 'center', gap: '10px', padding: '13px 30px', 
              borderRadius: '12px', height: '48px', fontWeight: '800'
            }}
          >
             <Filter size={18} /> FILTRER LES DONNÉES
          </button>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '100px' }}><Activity className="animate-spin" size={40} color="#0070f3" /></div>
      ) : chartData.length > 0 ? (
        <div style={{ display: 'grid', gap: '2.5rem' }}>
          {detectedSensors.map(s => (
            <ChartSection key={s} title={getSensorConfig(s).name} icon={getSensorConfig(s).icon} data={chartData} dataKey={s} color={getSensorConfig(s).color} unit={getSensorConfig(s).unit} syncId="meteoSync" onExport={() => openExportModal(s)} />
          ))}
        </div>
      ) : (
        <div className="db-card" style={{ padding: '6rem', textAlign: 'center', color: '#94a3b8' }}>
          <Activity size={50} style={{ opacity: 0.1, marginBottom: '20px' }} />
          <h3>Aucune donnée trouvée</h3>
          <p>Essayez de modifier vos filtres.</p>
        </div>
      )}

      {/* EXPORT CONFIGURATION MODAL */}
      {isExportModalOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.8)', backdropFilter: 'blur(8px)', zIndex: 3000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div className="db-card animate-up" style={{ width: '100%', maxWidth: '600px', padding: '2.5rem', borderRadius: '35px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ padding: '10px', background: '#0070f315', borderRadius: '12px', color: '#0070f3' }}><Download size={20}/></div>
                <h2 style={{ fontWeight: '950', fontSize: '1.4rem' }}>{exportTarget ? "Exporter le capteur" : "Exporter les données"}</h2>
              </div>
              <button onClick={() => setIsExportModalOpen(false)} style={{ background: '#f1f5f9', border: 'none', borderRadius: '50%', padding: '10px', cursor: 'pointer' }}><X size={20}/></button>
            </div>

            <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '1.5rem', fontWeight: '600' }}>
              {exportTarget ? "Personnalisez le nom de l'en-tête pour ce capteur :" : "Vérifiez les noms des colonnes qui apparaîtront dans votre fichier Excel :"}
            </p>

            <div style={{ maxHeight: '300px', overflowY: 'auto', display: 'grid', gap: '12px', paddingRight: '10px' }}>
              {(exportTarget ? [exportTarget] : detectedSensors).map(s => (
                <div key={s} style={{ background: '#f8fafc', padding: '15px', borderRadius: '18px', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '15px' }}>
                  <div style={{ color: getSensorConfig(s).color }}>{getSensorConfig(s).icon}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '0.65rem', fontWeight: '800', color: '#94a3b8', marginBottom: '4px' }}>NOM DE LA COLONNE ({s.toUpperCase()})</div>
                    <input 
                      type="text" 
                      className="input-premium-styled" 
                      style={{ padding: '8px 12px', background: '#fff' }}
                      value={exportSettings[s] || ''} 
                      onChange={(e) => setExportSettings({...exportSettings, [s]: e.target.value})}
                    />
                  </div>
                </div>
              ))}
            </div>

            <div style={{ marginTop: '2rem', display: 'flex', gap: '15px' }}>
              <button onClick={() => setIsExportModalOpen(false)} className="btn-secondary-premium" style={{ flex: 1, padding: '15px' }}>ANNULER</button>
              <button onClick={exportToCSV} className="btn-primary-premium" style={{ flex: 2, padding: '15px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
                <Download size={18} /> CONFIRMER L'EXPORTATION
              </button>
            </div>
          </div>
        </div>
      )}

      {isModalOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.8)', backdropFilter: 'blur(8px)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div className="db-card animate-up" style={{ width: '100%', maxWidth: '550px', padding: '2.5rem', borderRadius: '35px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
              <h2 style={{ fontWeight: '950', fontSize: '1.4rem' }}>Configuration du Filtre</h2>
              <button onClick={() => setIsModalOpen(false)} style={{ background: '#f1f5f9', border: 'none', borderRadius: '50%', padding: '10px', cursor: 'pointer' }}><X size={20}/></button>
            </div>

            <div style={{ display: 'grid', gap: '20px' }}>
              <div className="form-group-premium">
                <label className="label-premium">Type de filtre</label>
                <select className="input-premium-styled" value={filterType} onChange={(e) => {
                  setFilterType(e.target.value);
                  setFilterConfig({ year: new Date().getFullYear(), month: 'all', day: 'all', hour: 'all' });
                }}>
                  <option value="1h">Dernière Heure (Détails)</option>
                  <option value="24h">Dernier Jour (Moyenne/H)</option>
                  <option value="30j">Derniers 30 Jours (Moyenne/J)</option>
                  <option value="archive">Archives (Année/Mois/Jour/H)</option>
                </select>
              </div>

              {filterType === 'archive' && (
                <div className="form-group-premium">
                  <label className="label-premium">Année</label>
                  <select className="input-premium-styled" value={filterConfig.year} onChange={(e) => setFilterConfig({...filterConfig, year: e.target.value, month: 'all', day: 'all', hour: 'all'})}>
                    {options.years.map(y => <option key={y} value={y}>{y}</option>)}
                  </select>
                </div>
              )}

              {filterType === 'archive' && filterConfig.year !== 'all' && (
                <div className="form-group-premium">
                  <label className="label-premium">Mois</label>
                  <select className="input-premium-styled" value={filterConfig.month} onChange={(e) => setFilterConfig({...filterConfig, month: e.target.value, day: 'all', hour: 'all'})}>
                    <option value="all">Tous les mois (Moyenne mensuelle)</option>
                    {options.months.map(m => <option key={m} value={m}>{new Date(0, m-1).toLocaleString('default', {month: 'long'})}</option>)}
                  </select>
                </div>
              )}

              {(filterType === '30j' || (filterType === 'archive' && filterConfig.month !== 'all')) && (
                <div className="form-group-premium">
                  <label className="label-premium">Jour</label>
                  <select className="input-premium-styled" value={filterConfig.day} onChange={(e) => setFilterConfig({...filterConfig, day: e.target.value, hour: 'all'})}>
                    <option value="all">Tous les jours (Moyenne journalière)</option>
                    {options.days.filter(d => filterType !== 'archive' || new Date(d).getMonth() + 1 === parseInt(filterConfig.month)).map(d => (
                      <option key={d} value={d}>{new Date(d).toLocaleDateString()}</option>
                    ))}
                  </select>
                </div>
              )}

              {(filterType === '24h' || filterConfig.day !== 'all') && (
                <div className="form-group-premium">
                  <label className="label-premium">Heure précise</label>
                  <select className="input-premium-styled" value={filterConfig.hour} onChange={(e) => setFilterConfig({...filterConfig, hour: e.target.value})}>
                    <option value="all">Toutes les heures (Moyenne)</option>
                    {options.hours.map(h => <option key={h} value={h}>{h}h:00</option>)}
                  </select>
                </div>
              )}
            </div>
            <button onClick={() => setIsModalOpen(false)} className="btn-primary-premium" style={{ width: '100%', marginTop: '2.5rem', padding: '18px' }}>APPLIQUER LE FILTRE</button>
          </div>
        </div>
      )}
    </div>
  );
};

const ChartSection = ({ title, icon, data, dataKey, color, unit, syncId, onExport }) => {
    const values = data.map(d => parseFloat(d[dataKey])).filter(v => !isNaN(v));
    const hasData = values.length > 0;
    const max = hasData ? Math.max(...values).toFixed(1) : '--';
    const min = hasData ? Math.min(...values).toFixed(1) : '--';
    const avg = hasData ? (values.reduce((a, b) => a + b, 0) / values.length).toFixed(1) : '--';

    return (
        <div className="db-card" style={{ padding: '2.5rem', borderRadius: '35px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                    <div style={{ width: '45px', height: '45px', background: `${color}15`, borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: color }}>{icon}</div>
                    <div>
                        <h3 style={{ margin: 0, fontSize: '1.3rem', fontWeight: '900' }}>{title}</h3>
                        <div style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: '700' }}>{unit} • Moyennes calculées</div>
                    </div>
                </div>
                <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
                    <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '0.6rem', fontWeight: '800', color: '#94a3b8' }}>MOY.</div>
                        <div style={{ fontSize: '1.1rem', fontWeight: '900' }}>{avg}{unit}</div>
                    </div>
                    <div style={{ textAlign: 'right', borderLeft: '1px solid #f1f5f9', paddingLeft: '20px' }}>
                        <div style={{ fontSize: '0.6rem', fontWeight: '800', color: '#ef4444' }}>MAX.</div>
                        <div style={{ fontSize: '1.1rem', fontWeight: '900' }}>{max}{unit}</div>
                    </div>
                    <div style={{ textAlign: 'right', borderLeft: '1px solid #f1f5f9', paddingLeft: '20px' }}>
                        <div style={{ fontSize: '0.6rem', fontWeight: '800', color: '#0ea5e9' }}>MIN.</div>
                        <div style={{ fontSize: '1.1rem', fontWeight: '900' }}>{min}{unit}</div>
                    </div>
                    
                    <button onClick={onExport} title="Exporter ce capteur" style={{ marginLeft: '15px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '8px', cursor: 'pointer', color: '#64748b', display: 'flex', alignItems: 'center', transition: 'all 0.2s' }}>
                        <Download size={16} />
                    </button>
                </div>
            </div>

            <div style={{ width: '100%', height: '320px' }}>
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={data} syncId={syncId}>
                        <defs>
                            <linearGradient id={`color${dataKey}`} x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor={color} stopOpacity={0.3} />
                                <stop offset="95%" stopColor={color} stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="8 8" vertical={false} stroke="#f1f5f9" />
                        <XAxis dataKey="displayTime" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#94a3b8', fontWeight: '700' }} dy={15} />
                        <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#94a3b8', fontWeight: '600' }} dx={-10} />
                        <Tooltip
                            cursor={{ stroke: color, strokeWidth: 2 }}
                            content={({ active, payload }) => {
                                if (active && payload && payload.length) {
                                    const d = payload[0].payload;
                                    return (
                                        <div style={{ background: '#fff', padding: '15px', borderRadius: '20px', boxShadow: '0 20px 40px rgba(0,0,0,0.15)' }}>
                                            <div style={{ fontSize: '0.7rem', fontWeight: '800', color: '#94a3b8', marginBottom: '8px' }}>{d.fullTime}</div>
                                            <div style={{ fontSize: '1.2rem', fontWeight: '950', color: '#1e293b' }}>{payload[0].value} {unit}</div>
                                        </div>
                                    );
                                }
                                return null;
                            }}
                        />
                        <Area type="monotone" dataKey={dataKey} stroke={color} strokeWidth={4} fillOpacity={1} fill={`url(#color${dataKey})`} />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

export default UserHistory;
