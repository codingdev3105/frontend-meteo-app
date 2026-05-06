import React, { useState, useEffect } from 'react';
import { api } from '../../api';
import { 
  Bell, Plus, Settings, ShieldAlert, 
  Trash2, Clock, Filter, Calendar, 
  X, CheckCircle, ChevronRight, Activity,
  Thermometer, Info, Search
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import ConfirmModal from '../../components/common/ConfirmModal';
import '../../styles/Dashboard.css';

const UserAlerts = () => {
  const [stations, setStations] = useState([]);
  const [configs, setConfigs] = useState([]);
  const [logs, setLogs] = useState([]);
  const [unseenGrouped, setUnseenGrouped] = useState([]);
  const [sensorLibrary, setSensorLibrary] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filtres Historique
  const [filterName, setFilterName] = useState('');
  const [filterDate, setFilterDate] = useState('');

  // États des Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState(null); // Pour le modal de détail d'incident
  const [deleteConfirm, setDeleteConfirm] = useState({ isOpen: false, id: null });

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    stationId: '',
    sensorType: '', 
    operator: '>',
    thresholdValue: ''
  });

  const fetchData = async () => {
    try {
      const [sData, cData, lData, unseenData, catalogue] = await Promise.all([
        api.getUserStations(),
        api.getAlertConfigs(),
        api.getAlertLogs(),
        api.getUnseenAlerts(),
        api.getSensorsCatalogue()
      ]);
      setStations(sData);
      setConfigs(cData);
      setLogs(lData);
      setUnseenGrouped(unseenData);
      setSensorLibrary(catalogue);

      if (sData.length > 0 && !formData.stationId) {
        setFormData(prev => ({ 
          ...prev, 
          stationId: sData[0].hardwareId
        }));
      }
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  // Gestion du capteur par défaut quand la station change
  useEffect(() => {
    const selectedStation = stations.find(s => s.hardwareId === formData.stationId);
    if (selectedStation && selectedStation.sensors?.length > 0) {
      const firstSensor = sensorLibrary.find(sl => selectedStation.sensors.includes(sl.sensorId));
      if (firstSensor) {
        setFormData(prev => ({ ...prev, sensorType: firstSensor.name }));
      }
    }
  }, [formData.stationId, stations, sensorLibrary]);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.thresholdValue) return toast.error("Champs requis manquants");

    const t = toast.loading("Enregistrement...");
    try {
      await api.createAlertConfig(formData);
      toast.success("Règle de surveillance activée", { id: t });
      setIsAddModalOpen(false);
      setFormData({ ...formData, name: '', description: '', thresholdValue: '' });
      fetchData();
    } catch (err) { toast.error("Erreur lors de la création", { id: t }); }
  };

  const handleToggle = async (id) => {
    try {
      await api.toggleAlertStatus(id);
      fetchData();
    } catch (err) { toast.error("Erreur"); }
  };

  const handleMarkSeen = async (alertId) => {
    try {
      await api.markAlertAsSeen(alertId);
      setSelectedGroup(null);
      fetchData();
      toast.success("Incident traité");
    } catch (err) { console.error(err); }
  };

  const handleMarkAllSeen = async () => {
    try {
      await api.markAllAlertsSeen();
      fetchData();
      toast.success("Toutes les alertes sont traitées");
    } catch (err) { console.error(err); }
  };
  // Filtrage de l'h istorique
  const filteredLogs = logs.filter(log => {
    const matchesName = log.alertId?.name?.toLowerCase().includes(filterName.toLowerCase()) || 
                       log.message?.toLowerCase().includes(filterName.toLowerCase());
    const matchesDate = filterDate ? log.createdAt.startsWith(filterDate) : true;
    return matchesName && matchesDate;
  });

  if (loading) return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '60vh', color: '#94a3b8' }}>
       <Activity className="animate-spin" size={40} style={{ marginBottom: '20px' }} />
       <p style={{ fontWeight: '700' }}>Chargement des alertes...</p>
    </div>
  );

  return (
    <div className="animate-up">
      {/* HEADER */}
      <header className="premium-header" style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
          <div className="premium-title-group">
            <h1 style={{ fontSize: '2rem', fontWeight: '900', letterSpacing: '-1px' }}>Alertes & Seuils</h1>
            <div className="premium-subtitle">
              <span className="premium-accent-dot"></span>
              <span>Gérez vos règles de surveillance et traitez les incidents.</span>
            </div>
          </div>
          <button className="btn-primary-premium" onClick={() => setIsAddModalOpen(true)}>
            <Plus size={20} /> NOUVEAU SEUIL
          </button>
        </div>
      </header>

      {/* SECTION: SEUILS PROGRAMMÉS (Full Width) */}
      <div className="db-card" style={{ padding: '2.5rem', borderRadius: '40px', marginBottom: '2.5rem' }}>
        <h3 style={{ margin: '0 0 1.5rem 0', fontSize: '1.4rem', fontWeight: '900', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Settings size={24} color="#0070f3" /> Seuils programmés
        </h3>
        <div style={{ maxHeight: '400px', overflowY: 'auto', borderRadius: '15px' }}>
          <table className="premium-table">
            <thead style={{ position: 'sticky', top: 0, zIndex: 10 }}>
              <tr>
                <th>NOM DU SEUIL</th>
                <th>CAPTEUR</th>
                <th>CONDITION</th>
                <th>STATUT</th>
                <th>ACTION</th>
              </tr>
            </thead>
            <tbody>
              {configs.length > 0 ? configs.map(config => (
                <tr key={config._id}>
                  <td>
                    <div style={{ fontWeight: '800', color: '#1e293b' }}>{config.name}</div>
                    <div style={{ fontSize: '0.85rem', color: '#94a3b8' }}>{config.description}</div>
                  </td>
                  <td>
                    <div className="sensor-tag">{config.sensorType}</div>
                  </td>
                  <td>
                    <span style={{ fontWeight: '900', color: '#0070f3' }}>{config.operator}</span> {config.thresholdValue}
                  </td>
                  <td>
                    <label className="premium-switch">
                      <input type="checkbox" checked={config.isActive} onChange={() => handleToggle(config._id)} />
                      <span className="slider round"></span>
                    </label>
                  </td>
                  <td>
                    <button className="btn-icon-danger" onClick={() => setDeleteConfirm({ isOpen: true, id: config._id })}>
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              )) : <tr><td colSpan="5" style={{ textAlign: 'center', padding: '2rem', color: '#94a3b8' }}>Aucun seuil défini.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>

      {/* SECTION: INCIDENTS NON TRAITÉS (Full Width) */}
      <div className="db-card" style={{ padding: '2.5rem', borderRadius: '40px', marginBottom: '3rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h3 style={{ margin: 0, fontSize: '1.4rem', fontWeight: '900', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <ShieldAlert size={24} color="#ef4444" /> Incidents non traités
          </h3>
          {unseenGrouped.length > 0 && (
            <button onClick={handleMarkAllSeen} style={{ background: 'none', border: 'none', color: '#94a3b8', fontSize: '0.85rem', fontWeight: '700', textDecoration: 'underline', cursor: 'pointer' }}>
              Tout traiter
            </button>
          )}
        </div>
        <div style={{ maxHeight: '400px', overflowY: 'auto', borderRadius: '15px' }}>
          <table className="premium-table">
            <thead style={{ position: 'sticky', top: 0, zIndex: 10 }}>
              <tr>
                <th>NOM</th>
                <th>DERNIER MESSAGE</th>
                <th>ALERTES</th>
                <th>ACTION</th>
              </tr>
            </thead>
            <tbody>
              {unseenGrouped.length > 0 ? unseenGrouped.map(group => (
                <tr key={group.latestLog._id} style={{ cursor: 'pointer' }} onClick={() => setSelectedGroup(group)}>
                  <td>
                    <div style={{ fontWeight: '800', color: '#b91c1c' }}>{group.alertInfo?.name || 'Seuil supprimé'}</div>
                  </td>
                  <td style={{ maxWidth: '400px' }}>
                    <div style={{ fontSize: '0.9rem', color: '#ef4444', fontWeight: '600' }}>
                      {group.latestLog.message}
                    </div>
                  </td>
                  <td>
                    <span style={{ 
                      background: '#fee2e2', color: '#ef4444', 
                      padding: '6px 12px', borderRadius: '8px', 
                      fontSize: '0.9rem', fontWeight: '950' 
                    }}>
                      +{group.count}
                    </span>
                  </td>
                  <td>
                    <ChevronRight size={18} color="#fca5a5" />
                  </td>
                </tr>
              )) : <tr><td colSpan="4" style={{ textAlign: 'center', padding: '2.5rem', color: '#94a3b8' }}>Aucun incident non traité.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>

      {/* BOTTOM SECTION: HISTORIQUE COMPLET */}
      <div className="db-card" style={{ padding: '2.5rem', borderRadius: '40px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '20px' }}>
          <h3 style={{ margin: 0, fontSize: '1.4rem', fontWeight: '900', display: 'flex', alignItems: 'center', gap: '15px' }}>
             <Clock size={24} color="#64748b" /> Historique complet des alertes
          </h3>
          
          <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
            <div className="search-input-wrapper">
              <Search size={18} />
              <input 
                type="text" 
                placeholder="Filtrer par nom..." 
                value={filterName}
                onChange={(e) => setFilterName(e.target.value)}
              />
            </div>
            <div className="search-input-wrapper">
              <Calendar size={18} />
              <input 
                type="date" 
                value={filterDate}
                onChange={(e) => setFilterDate(e.target.value)}
              />
            </div>
          </div>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table className="premium-table">
            <thead>
              <tr>
                <th>DATE & HEURE</th>
                <th>NOM DU SEUIL</th>
                <th>VALEUR</th>
                <th>DÉTAILS</th>
                <th>STATUT</th>
              </tr>
            </thead>
            <tbody>
              {filteredLogs.length > 0 ? filteredLogs.map(log => (
                <tr key={log._id}>
                  <td style={{ whiteSpace: 'nowrap' }}>
                    <div style={{ fontWeight: '700', color: '#475569' }}>{new Date(log.createdAt).toLocaleString()}</div>
                  </td>
                  <td>
                    <div style={{ fontWeight: '800', color: '#1e293b' }}>{log.alertId?.name || 'Seuil supprimé'}</div>
                  </td>
                  <td>
                    <span style={{ color: '#ef4444', fontWeight: '900' }}>{log.triggeredValue}</span>
                    {log.alertId && (
                      <span style={{ fontSize: '0.7rem', color: '#94a3b8', marginLeft: '5px' }}>
                        ({log.alertId.operator}{log.alertId.thresholdValue})
                      </span>
                    )}
                  </td>
                  <td style={{ fontSize: '0.85rem', color: '#64748b' }}>{log.message}</td>
                  <td>
                    {log.isSeen ? (
                      <span style={{ color: '#10b981', display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.75rem', fontWeight: '800' }}>
                        <CheckCircle size={14} /> Traité
                      </span>
                    ) : (
                      <span style={{ color: '#f59e0b', fontSize: '0.75rem', fontWeight: '800' }}>En attente</span>
                    )}
                  </td>
                </tr>
              )) : <tr><td colSpan="5" style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8' }}>Aucune alerte trouvée.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL: NOUVEAU SEUIL */}
      {isAddModalOpen && (
        <div className="modal-overlay">
           <div className="db-card animate-up" style={{ width: '100%', maxWidth: '600px', padding: '2.5rem', borderRadius: '40px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h2 style={{ fontSize: '1.5rem', fontWeight: '900', color: '#1e293b' }}>Nouvelle Surveillance</h2>
                <button onClick={() => setIsAddModalOpen(false)} className="btn-icon-close"><X size={24}/></button>
              </div>

              <form onSubmit={handleCreate} style={{ display: 'grid', gap: '20px' }}>
                <div className="form-group">
                  <label>Nom de la règle</label>
                  <input 
                    type="text" required placeholder="Ex: Risque de Gel"
                    value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                  <div className="form-group">
                    <label>Station météo</label>
                    <select value={formData.stationId} onChange={(e) => setFormData({...formData, stationId: e.target.value})}>
                      {stations.map(s => <option key={s.hardwareId} value={s.hardwareId}>{s.name}</option>)}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Capteur cible</label>
                    <select value={formData.sensorType} onChange={(e) => setFormData({...formData, sensorType: e.target.value})}>
                      {sensorLibrary.map(s => <option key={s.sensorId} value={s.name}>{s.name}</option>)}
                    </select>
                  </div>
                </div>

                <div style={{ background: '#f8fafc', padding: '20px', borderRadius: '20px', display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '20px', border: '1px solid #f1f5f9' }}>
                   <div className="form-group">
                     <label>Condition</label>
                     <select value={formData.operator} onChange={(e) => setFormData({...formData, operator: e.target.value})}>
                        <option value=">">Est supérieure à</option>
                        <option value="<">Est inférieure à</option>
                     </select>
                   </div>
                   <div className="form-group">
                     <label>Valeur seuil</label>
                     <input 
                      type="number" required step="0.1"
                      value={formData.thresholdValue} onChange={(e) => setFormData({...formData, thresholdValue: e.target.value})}
                     />
                   </div>
                </div>

                <div className="form-group">
                  <label>Description (Optionnel)</label>
                  <textarea 
                    rows="3" 
                    value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})}
                    placeholder="Pourquoi surveillez-vous ce paramètre ?"
                  />
                </div>

                <button type="submit" className="btn-primary-premium" style={{ marginTop: '10px' }}>ACTIVER LA SURVEILLANCE</button>
              </form>
           </div>
        </div>
      )}

      {/* MODAL: DÉTAILS INCIDENT */}
      {selectedGroup && (
        <div className="modal-overlay">
           <div className="db-card animate-up" style={{ width: '100%', maxWidth: '500px', padding: '2.5rem', borderRadius: '40px', maxHeight: '80vh', display: 'flex', flexDirection: 'column' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                 <h2 style={{ fontSize: '1.4rem', fontWeight: '900', color: '#ef4444' }}>Détails de l'Alerte</h2>
                 <button onClick={() => setSelectedGroup(null)} className="btn-icon-close"><X size={24}/></button>
              </div>

              <div style={{ marginBottom: '2rem' }}>
                 <div style={{ fontSize: '1.1rem', fontWeight: '800', marginBottom: '5px' }}>{selectedGroup.alertInfo?.name}</div>
                 <p style={{ fontSize: '0.9rem', color: '#64748b', margin: 0 }}>{selectedGroup.alertInfo?.description || 'Aucune description fournie.'}</p>
                 <div style={{ marginTop: '10px', fontSize: '0.8rem', fontWeight: '700', color: '#94a3b8' }}>
                    Seuil: {selectedGroup.alertInfo?.sensorType} {selectedGroup.alertInfo?.operator} {selectedGroup.alertInfo?.thresholdValue}
                 </div>
              </div>

              <div style={{ flex: 1, overflowY: 'auto', marginBottom: '2rem', paddingRight: '10px' }}>
                 <h4 style={{ fontSize: '0.75rem', fontWeight: '800', color: '#94a3b8', textTransform: 'uppercase', marginBottom: '1rem' }}>Historique récent ({selectedGroup.count})</h4>
                 {selectedGroup.allLogs.map((log, i) => (
                    <div key={i} style={{ padding: '12px', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                       <span style={{ fontSize: '0.85rem', color: '#475569' }}>{new Date(log.createdAt).toLocaleString()}</span>
                       <span style={{ fontSize: '0.85rem', fontWeight: '800', color: '#ef4444' }}>{log.triggeredValue}</span>
                    </div>
                 ))}
              </div>

              <button 
                onClick={() => handleMarkSeen(selectedGroup.alertInfo?._id)}
                className="btn-primary-premium" 
                style={{ background: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}
              >
                 <CheckCircle size={20} /> MARQUER TOUT COMME TRAITÉ
              </button>
           </div>
        </div>
      )}

      <ConfirmModal 
        isOpen={deleteConfirm.isOpen}
        title="Supprimer la règle ?"
        message="Cette action arrêtera la surveillance immédiate de ce capteur."
        onConfirm={async () => {
          try {
            await api.deleteAlertConfig(deleteConfirm.id);
            setDeleteConfirm({ isOpen: false, id: null });
            fetchData();
            toast.success("Règle supprimée");
          } catch(e) { toast.error("Erreur"); }
        }}
        onCancel={() => setDeleteConfirm({ isOpen: false, id: null })}
      />
    </div>
  );
};

export default UserAlerts;
