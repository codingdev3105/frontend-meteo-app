import React, { useEffect, useState } from 'react';
import { api } from '../../api';
import { 
  Trash2, Cpu, X, Activity, Plus, Save, 
  AlertTriangle, Signal, Settings, Clock, 
  Microchip, Edit, Info, BookOpen, Layers, 
  CheckCircle2, ChevronRight, User, Database, Search, Server, Mail, Phone, Calendar,
  RadioTower
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import ConfirmModal from '../../components/common/ConfirmModal';

const StationsManager = () => {
  const [stations, setStations] = useState([]);
  const [catalogue, setCatalogue] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('stations'); // 'stations', 'catalogue'
  
  // Modals States
  const [isCatalogueModal, setIsCatalogueModal] = useState({ isOpen: false, mode: 'add', sensor: null });
  const [confirmDelete, setConfirmDelete] = useState({ isOpen: false, id: null });
  const [ownerModal, setOwnerModal] = useState({ isOpen: false, user: null });
  const [nodeModal, setNodeModal] = useState({ isOpen: false, nodeId: null, station: null });
  const [nodeDetails, setNodeDetails] = useState(null);
  const [nodeLoading, setNodeLoading] = useState(false);
  const [sensorListModal, setSensorListModal] = useState({ isOpen: false, sensors: [], stationName: '' });
  const [searchTerm, setSearchTerm] = useState('');
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 1024);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [stationsData, catalogueData] = await Promise.all([
        api.getAllStations(),
        api.getSensorsCatalogue()
      ]);
      setStations(stationsData);
      setCatalogue(catalogueData);
    } catch (error) {
      toast.error("Échec de la synchronisation des données.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 60000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const fetchNode = async () => {
      if (nodeModal.isOpen && nodeModal.nodeId) {
        setNodeLoading(true);
        try {
          const data = await api.getNodeDetails(nodeModal.nodeId);
          setNodeDetails(data);
        } catch (err) {
          console.error("Erreur chargement nœud:", err);
          setNodeDetails(null);
        } finally {
          setNodeLoading(false);
        }
      } else {
        setNodeDetails(null);
      }
    };
    fetchNode();
  }, [nodeModal.isOpen, nodeModal.nodeId]);

  const handleSaveCatalogueSensor = async (e) => {
    e.preventDefault();
    const t = toast.loading("Enregistrement...");
    const data = { 
      sensorId: e.target.sensorId.value, 
      abbreviation: e.target.abbreviation.value,
      name: e.target.name.value, 
      description: e.target.description.value
    };
    try {
      if (isCatalogueModal.mode === 'add') {
        await api.addSensorToCatalogue(data);
        toast.success("Capteur ajouté au catalogue", { id: t });
      } else {
        await api.updateSensorCatalogue(isCatalogueModal.sensor._id, data);
        toast.success("Capteur mis à jour", { id: t });
      }
      setIsCatalogueModal({ isOpen: false });
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || "Une erreur est survenue", { id: t });
    }
  };

  const handleDeleteSensor = async () => {
    const t = toast.loading("Suppression...");
    try {
      await api.deleteSensorFromCatalogue(confirmDelete.id);
      toast.success("Capteur retiré du catalogue", { id: t });
      setConfirmDelete({ isOpen: false, id: null });
      fetchData();
    } catch (err) {
      toast.error("Échec de la suppression", { id: t });
    }
  };

  if (loading && stations.length === 0) return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '60vh', color: '#94a3b8' }}>
       <Activity className="animate-spin" size={40} style={{ marginBottom: '20px' }} />
       <p style={{ fontWeight: '700' }}>Chargement du parc matériel...</p>
    </div>
  );

  return (
    <div className="animate-up" style={{ paddingBottom: '50px' }}>
      
      <header className="premium-header">
        <div className="premium-title-group">
          <h1 style={{ fontSize: '2rem', fontWeight: '900', letterSpacing: '-1px' }}>Stations Météo</h1>
          <div className="premium-subtitle">
            <span className="premium-accent-dot"></span>
            <span>Supervision globale du réseau et gestion de la bibliothèque technique des capteurs.</span>
          </div>
        </div>
        {activeTab === 'catalogue' && (
          <button onClick={() => setIsCatalogueModal({ isOpen: true, mode: 'add' })} className="btn-primary-premium" style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 25px' }}>
            <Plus size={20} /> Nouveau Capteur
          </button>
        )}
      </header>

      {/* SEARCH BAR - NORMAL & CLEAN */}
      <div style={{ position: 'relative', marginBottom: '2.5rem' }}>
         <Search 
           size={20} 
           color="#94a3b8" 
           style={{ position: 'absolute', left: '20px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} 
         />
         <input 
           type="text" 
           placeholder="Rechercher une station par nom ou propriétaire..." 
           value={searchTerm}
           onChange={(e) => setSearchTerm(e.target.value)}
           style={{ 
             width: '100%', 
             padding: '15px 15px 15px 55px', 
             borderRadius: '15px', 
             border: '1px solid #e2e8f0', 
             background: '#fff',
             outline: 'none',
             fontSize: '1rem',
             fontWeight: '600',
             color: '#1e293b',
             transition: 'all 0.2s',
             boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
           }}
           onFocus={(e) => e.target.style.borderColor = '#0070f3'}
           onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
         />
      </div>

      {/* TABS */}
      <div style={{ display: 'flex', gap: '2rem', marginBottom: '2.5rem', borderBottom: '1px solid #e2e8f0' }}>
        <button onClick={() => setActiveTab('stations')} style={{ padding: '1rem 0.5rem', background: 'none', border: 'none', cursor: 'pointer', fontWeight: '900', fontSize: '0.9rem', color: activeTab === 'stations' ? '#0070f3' : '#94a3b8', borderBottom: activeTab === 'stations' ? '3px solid #0070f3' : '3px solid transparent', transition: 'all 0.3s' }}>
          Stations Météo
        </button>
        <button onClick={() => setActiveTab('catalogue')} style={{ padding: '1rem 0.5rem', background: 'none', border: 'none', cursor: 'pointer', fontWeight: '900', fontSize: '0.9rem', color: activeTab === 'catalogue' ? '#0070f3' : '#94a3b8', borderBottom: activeTab === 'catalogue' ? '3px solid #0070f3' : '3px solid transparent', transition: 'all 0.3s' }}>
          Les capteurs environnementaux
        </button>
      </div>

      <div className="db-card" style={{ padding: 0, borderRadius: '40px', overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          
          {/* TAB 1: STATIONS VIEW */}
          {activeTab === 'stations' && (
            <div style={{ width: '100%' }}>
              {!isMobile ? (
                /* DESKTOP TABLE VIEW */
                <table className="premium-table" style={{ width: '100%', borderCollapse: 'collapse', minWidth: '1200px' }}>
                  <thead>
                    <tr>
                      <th style={{ padding: '20px 40px' }}>Station Météo</th>
                      <th style={{ padding: '20px 40px' }}>Propriétaire</th>
                      <th style={{ padding: '20px 40px' }}>Nœuds Capteurs</th>
                      <th style={{ padding: '20px 40px' }}>Capteurs</th>
                      <th style={{ padding: '20px 40px' }}>Dernière M.A.J</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stations.filter(st => 
                      st.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                      st.owner?.username.toLowerCase().includes(searchTerm.toLowerCase())
                    ).length === 0 ? (
                      <tr>
                        <td colSpan="5" style={{ padding: '100px', textAlign: 'center', color: '#94a3b8' }}>
                           <Signal size={40} style={{ opacity: 0.1, marginBottom: '20px' }} />
                           <p>Aucune station ne correspond à votre recherche.</p>
                        </td>
                      </tr>
                    ) : (
                      stations.filter(st => 
                        st.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                        st.owner?.username.toLowerCase().includes(searchTerm.toLowerCase())
                      ).map((st) => (
                        <tr key={st._id}>
                          <td style={{ padding: '25px 40px' }}>
                             <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                                <div style={{ 
                                  width: '45px', height: '45px', borderRadius: '12px', 
                                  background: st.status === 'active' ? '#f0fdf4' : '#fef2f2',
                                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                                  color: st.status === 'active' ? '#10b981' : '#ef4444',
                                  border: `1px solid ${st.status === 'active' ? '#dcfce7' : '#fee2e2'}`
                                }}>
                                   <RadioTower size={20} />
                                </div>
                                <div>
                                   <div style={{ fontSize: '1rem', fontWeight: '950', color: '#1e293b' }}>{st.name}</div>
                                   <div style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: '800' }}>ID: {st.hardwareId}</div>
                                </div>
                             </div>
                          </td>
                          <td style={{ padding: '25px 40px' }}>
                             {st.owner ? (
                               <div 
                                onClick={() => setOwnerModal({ isOpen: true, user: st.owner })}
                                style={{ 
                                  display: 'inline-flex', alignItems: 'center', gap: '10px', cursor: 'pointer', 
                                  padding: '8px 16px', background: '#eff6ff', borderRadius: '12px', border: '1px solid #dbeafe'
                                }}
                                className="hover-scale"
                               >
                                  <User size={14} color="#0070f3" />
                                  <span style={{ fontSize: '0.9rem', fontWeight: '900', color: '#0070f3' }}>
                                     {st.owner.username}
                                  </span>
                               </div>
                             ) : <span style={{ fontSize: '0.85rem', color: '#94a3b8', fontStyle: 'italic' }}>Non assignée</span>}
                          </td>
                          <td style={{ padding: '25px 40px' }}>
                             <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                                {st.sensorNodes && st.sensorNodes.length > 0 ? st.sensorNodes.map((nodeId, idx) => (
                                  <div 
                                    key={idx} 
                                    onClick={() => setNodeModal({ isOpen: true, nodeId, station: st })}
                                    style={{ 
                                      display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 12px', 
                                      background: st.status === 'active' ? '#f0fdf4' : '#f1f5f9', 
                                      borderRadius: '10px', border: `1px solid ${st.status === 'active' ? '#dcfce7' : '#e2e8f0'}`,
                                      cursor: 'pointer'
                                    }}
                                    className="hover-scale"
                                  >
                                     <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: st.status === 'active' ? '#10b981' : '#94a3b8' }}></div>
                                     <span style={{ fontSize: '0.75rem', fontWeight: '900', color: st.status === 'active' ? '#166534' : '#64748b' }}>#{nodeId}</span>
                                  </div>
                                )) : (
                                  <span style={{ fontSize: '0.8rem', color: '#94a3b8', fontStyle: 'italic' }}>Aucun nœud</span>
                                )}
                             </div>
                          </td>
                          <td style={{ padding: '25px 40px' }}>
                             {st.sensors && st.sensors.length > 0 ? (
                               <button 
                                 onClick={() => setSensorListModal({ isOpen: true, sensors: st.sensors, stationName: st.name })}
                                 style={{ 
                                   display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', 
                                   background: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0',
                                   cursor: 'pointer', transition: '0.2s', boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
                                 }}
                                 className="hover-scale"
                               >
                                  <Layers size={16} color="#0070f3" />
                                  <span style={{ fontSize: '0.85rem', color: '#1e293b', fontWeight: '800' }}>
                                     {st.sensors.length} {st.sensors.length > 1 ? 'Capteurs' : 'Capteur'}
                                  </span>
                               </button>
                             ) : (
                               <span style={{ fontSize: '0.75rem', color: '#94a3b8', fontStyle: 'italic' }}>Aucun capteur</span>
                             )}
                          </td>
                          <td style={{ padding: '25px 40px' }}>
                             <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <Clock size={14} color="#94a3b8" />
                                <div>
                                   <div style={{ fontSize: '0.85rem', fontWeight: '800', color: '#475569' }}>{st.lastOnline ? new Date(st.lastOnline).toLocaleDateString() : 'Jamais'}</div>
                                   {st.lastOnline && <div style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: '600' }}>{new Date(st.lastOnline).toLocaleTimeString()}</div>}
                                </div>
                             </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              ) : (
                /* MOBILE CARD VIEW */
                <div style={{ display: 'grid', gap: '1.5rem', padding: '1.5rem' }}>
                  {stations.filter(st => 
                    st.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                    st.owner?.username.toLowerCase().includes(searchTerm.toLowerCase())
                  ).length === 0 ? (
                    <div style={{ padding: '4rem 2rem', textAlign: 'center', color: '#94a3b8', background: '#f8fafc', borderRadius: '30px' }}>
                       <Signal size={40} style={{ opacity: 0.1, marginBottom: '20px' }} />
                       <p>Aucune station trouvée.</p>
                    </div>
                  ) : (
                    stations.filter(st => 
                      st.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                      st.owner?.username.toLowerCase().includes(searchTerm.toLowerCase())
                    ).map((st) => (
                      <div key={st._id} className="db-card" style={{ padding: '2rem', borderRadius: '35px', border: '1px solid #f1f5f9', background: '#fff' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
                           <div style={{ display: 'flex', gap: '15px' }}>
                              <div style={{ 
                                width: '50px', height: '50px', borderRadius: '15px', 
                                background: st.status === 'active' ? '#f0fdf4' : '#fef2f2',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                color: st.status === 'active' ? '#10b981' : '#ef4444'
                              }}>
                                 <RadioTower size={24} />
                              </div>
                              <div>
                                 <div style={{ fontSize: '1.2rem', fontWeight: '950', color: '#1e293b' }}>{st.name}</div>
                                 <div style={{ fontSize: '0.85rem', color: '#94a3b8', fontWeight: '800' }}>{st.hardwareId}</div>
                              </div>
                           </div>
                           <div style={{ 
                             padding: '6px 12px', borderRadius: '8px', fontSize: '0.7rem', fontWeight: '950',
                             background: st.status === 'active' ? '#dcfce7' : '#fee2e2',
                             color: st.status === 'active' ? '#166534' : '#991b1b'
                           }}>
                             {st.status === 'active' ? 'ACTIF' : 'HORS-LIGNE'}
                           </div>
                        </div>

                        <div style={{ display: 'grid', gap: '1.2rem', padding: '1.5rem', background: '#f8fafc', borderRadius: '25px' }}>
                           <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <span style={{ fontSize: '0.8rem', fontWeight: '800', color: '#94a3b8', letterSpacing: '0.5px' }}>PROPRIÉTAIRE</span>
                              {st.owner ? (
                                <span onClick={() => setOwnerModal({ isOpen: true, user: st.owner })} style={{ fontSize: '0.95rem', fontWeight: '950', color: '#0070f3', textDecoration: 'underline', cursor: 'pointer' }}>{st.owner.username}</span>
                              ) : <span style={{ fontSize: '0.85rem', color: '#94a3b8', fontStyle: 'italic' }}>Non assignée</span>}
                           </div>
                           <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <span style={{ fontSize: '0.8rem', fontWeight: '800', color: '#94a3b8', letterSpacing: '0.5px' }}>NŒUDS LIÉS</span>
                              <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                                 {st.sensorNodes && st.sensorNodes.length > 0 ? st.sensorNodes.map((nodeId, idx) => (
                                   <span key={idx} onClick={() => setNodeModal({ isOpen: true, nodeId, station: st })} style={{ padding: '4px 8px', background: '#fff', border: '1px solid #e2e8f0', borderRadius: '6px', fontSize: '0.7rem', fontWeight: '900', color: '#64748b', cursor: 'pointer' }}>#{nodeId}</span>
                                 )) : <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Aucun</span>}
                              </div>
                           </div>
                           <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <span style={{ fontSize: '0.8rem', fontWeight: '800', color: '#94a3b8', letterSpacing: '0.5px' }}>CAPTEURS</span>
                              <button 
                                onClick={() => setSensorListModal({ isOpen: true, sensors: st.sensors, stationName: st.name })}
                                style={{ background: '#fff', border: '1px solid #e2e8f0', padding: '8px 15px', borderRadius: '10px', fontSize: '0.85rem', fontWeight: '950', color: '#1e293b', boxShadow: '0 2px 5px rgba(0,0,0,0.03)' }}
                              >
                                {st.sensors?.length || 0} capteurs
                              </button>
                           </div>
                           <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <span style={{ fontSize: '0.8rem', fontWeight: '800', color: '#94a3b8', letterSpacing: '0.5px' }}>DERNIÈRE M.A.J</span>
                              <div style={{ textAlign: 'right' }}>
                                 <div style={{ fontSize: '0.9rem', fontWeight: '950', color: '#475569' }}>
                                   {st.lastOnline ? new Date(st.lastOnline).toLocaleDateString() : 'Jamais'}
                                 </div>
                                 {st.lastOnline && <div style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: '700' }}>{new Date(st.lastOnline).toLocaleTimeString()}</div>}
                              </div>
                           </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: CATALOGUE TABLE */}
          {activeTab === 'catalogue' && (
            <table className="premium-table" style={{ width: '100%', borderCollapse: 'collapse', minWidth: '1000px' }}>
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '1px solid #f1f5f9' }}>
                  <th style={{ padding: '20px 40px', textAlign: 'left', fontSize: '0.8rem', fontWeight: '900', color: '#1e293b', textTransform: 'uppercase', letterSpacing: '1px' }}>Référence / Abr.</th>
                  <th style={{ padding: '20px 40px', textAlign: 'left', fontSize: '0.8rem', fontWeight: '900', color: '#1e293b', textTransform: 'uppercase', letterSpacing: '1px' }}>Désignation du Capteur</th>
                  <th style={{ padding: '20px 40px', textAlign: 'left', fontSize: '0.8rem', fontWeight: '900', color: '#1e293b', textTransform: 'uppercase', letterSpacing: '1px' }}>Description Technique</th>
                  <th style={{ padding: '20px 40px', textAlign: 'center', fontSize: '0.8rem', fontWeight: '900', color: '#1e293b', textTransform: 'uppercase', letterSpacing: '1px' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {catalogue.map((cat) => (
                  <tr key={cat._id} className="table-row-hover" style={{ borderBottom: '1px solid #f8fafc' }}>
                    <td style={{ padding: '20px 40px' }}>
                       <div style={{ display: 'flex', gap: '8px' }}>
                          <span style={{ background: '#eff6ff', color: '#1e40af', padding: '5px 12px', borderRadius: '8px', fontSize: '0.75rem', fontWeight: '900' }}>
                            {cat.sensorId}
                          </span>
                          {cat.abbreviation && (
                            <span style={{ background: '#f0fdf4', color: '#166534', padding: '5px 12px', borderRadius: '8px', fontSize: '0.75rem', fontWeight: '900', border: '1px solid #dcfce7' }}>
                              {cat.abbreviation}
                            </span>
                          )}
                       </div>
                    </td>
                    <td style={{ padding: '20px 40px' }}>
                       <div style={{ fontWeight: '900', color: '#1e293b', fontSize: '0.95rem' }}>{cat.name}</div>
                    </td>
                    <td style={{ padding: '20px 40px', maxWidth: '300px' }}>
                       <p style={{ margin: 0, fontSize: '0.85rem', color: '#64748b', fontWeight: '600', lineHeight: '1.4' }}>{cat.description}</p>
                    </td>
                    <td style={{ padding: '20px 40px', textAlign: 'center' }}>
                       <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
                          <button onClick={() => setIsCatalogueModal({ isOpen: true, mode: 'edit', sensor: cat })} className="btn-action-premium" style={{ padding: '10px', background: '#f8fafc', color: '#64748b', border: 'none', borderRadius: '12px', cursor: 'pointer' }}>
                             <Edit size={18} />
                          </button>
                          <button onClick={() => setConfirmDelete({ isOpen: true, id: cat._id })} className="btn-action-premium" style={{ padding: '10px', background: '#fef2f2', color: '#ef4444', border: 'none', borderRadius: '12px', cursor: 'pointer' }}>
                             <Trash2 size={18} />
                          </button>
                       </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>


      {/* OWNER PROFILE MODAL */}
      {ownerModal.isOpen && ownerModal.user && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.7)', backdropFilter: 'blur(10px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}>
           <div className="db-card animate-up" style={{ width: '100%', maxWidth: '450px', padding: '3rem', borderRadius: '40px', textAlign: 'center' }}>
              <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: '#0070f3', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem auto', fontSize: '2rem', fontWeight: '900' }}>
                 {ownerModal.user.username.charAt(0).toUpperCase()}
              </div>
              <h2 style={{ fontSize: '1.6rem', fontWeight: '950', margin: '0 0 10px 0' }}>{ownerModal.user.username}</h2>
              <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '2.5rem' }}>Fiche détaillée du propriétaire</p>
              
              <div style={{ display: 'grid', gap: '1.2rem', textAlign: 'left', marginBottom: '2.5rem' }}>
                 <div style={{ display: 'flex', alignItems: 'center', gap: '15px', padding: '15px', background: '#f8fafc', borderRadius: '20px' }}>
                    <Mail size={18} color="#94a3b8" />
                    <div>
                       <div style={{ fontSize: '0.7rem', fontWeight: '800', color: '#94a3b8', textTransform: 'uppercase' }}>Email</div>
                       <div style={{ fontWeight: '700', color: '#1e293b' }}>{ownerModal.user.email}</div>
                    </div>
                 </div>
                 <div style={{ display: 'flex', alignItems: 'center', gap: '15px', padding: '15px', background: '#f8fafc', borderRadius: '20px' }}>
                    <Phone size={18} color="#94a3b8" />
                    <div>
                       <div style={{ fontSize: '0.7rem', fontWeight: '800', color: '#94a3b8', textTransform: 'uppercase' }}>Téléphone</div>
                       <div style={{ fontWeight: '700', color: '#1e293b' }}>{ownerModal.user.phoneNumber || '—'}</div>
                    </div>
                 </div>
                 <div style={{ display: 'flex', alignItems: 'center', gap: '15px', padding: '15px', background: '#f0fdf4', borderRadius: '20px', border: '1px solid #dcfce7' }}>
                    <Clock size={18} color="#10b981" />
                    <div>
                       <div style={{ fontSize: '0.7rem', fontWeight: '800', color: '#10b981', textTransform: 'uppercase' }}>Dernière Connexion</div>
                       <div style={{ fontWeight: '700', color: '#166534' }}>{ownerModal.user.lastAccess ? new Date(ownerModal.user.lastAccess).toLocaleString() : 'Inconnue'}</div>
                    </div>
                 </div>
              </div>
              <button onClick={() => setOwnerModal({ isOpen: false })} className="btn-primary-premium" style={{ width: '100%', padding: '15px' }}>Fermer</button>
           </div>
        </div>
      )}

      {/* NODE INFO MODAL */}
      {nodeModal.isOpen && nodeModal.station && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.7)', backdropFilter: 'blur(10px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}>
           <div className="db-card animate-up" style={{ width: '100%', maxWidth: '500px', padding: '3rem', borderRadius: '40px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
                 <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                    <div style={{ width: '50px', height: '50px', borderRadius: '15px', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                       <Microchip size={24} color="#64748b" />
                    </div>
                    <div>
                       <h2 style={{ fontSize: '1.4rem', fontWeight: '950', margin: 0 }}>Nœud #{nodeModal.nodeId}</h2>
                       <div style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: '700' }}>Station: {nodeModal.station.name}</div>
                    </div>
                 </div>
                 <button onClick={() => setNodeModal({ isOpen: false })} style={{ background: '#f1f5f9', border: 'none', borderRadius: '50%', padding: '10px', cursor: 'pointer' }}><X size={20}/></button>
              </div>

              <div style={{ background: '#f8fafc', padding: '20px', borderRadius: '25px', marginBottom: '2rem' }}>
                 <h4 style={{ fontSize: '0.75rem', fontWeight: '900', color: '#94a3b8', textTransform: 'uppercase', marginBottom: '15px', letterSpacing: '1px' }}>Sondes Détectées</h4>
                 <div style={{ display: 'grid', gap: '10px' }}>
                    {nodeLoading ? (
                      <div style={{ textAlign: 'center', padding: '20px', color: '#94a3b8' }}>
                         <Activity className="animate-spin" size={24} style={{ margin: '0 auto 10px auto' }} />
                         <p style={{ fontSize: '0.8rem', fontWeight: '700' }}>Analyse des composants...</p>
                      </div>
                    ) : nodeDetails && nodeDetails.sensors && nodeDetails.sensors.length > 0 ? (
                      nodeDetails.sensors.map((sId, idx) => {
                        const sensorInfo = catalogue.find(c => c.sensorId === sId);
                        return (
                          <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 20px', background: '#fff', borderRadius: '15px', border: '1px solid #e2e8f0' }}>
                             <span style={{ fontWeight: '800', color: '#1e293b' }}>{sensorInfo ? sensorInfo.name : 'Capteur Inconnu'}</span>
                             <span style={{ fontSize: '0.7rem', background: '#eff6ff', color: '#1e40af', padding: '4px 10px', borderRadius: '6px', fontWeight: '900' }}>{sId}</span>
                          </div>
                        );
                      })
                    ) : (
                      <p style={{ textAlign: 'center', padding: '20px', color: '#94a3b8', fontSize: '0.85rem', fontStyle: 'italic' }}>Aucune sonde détectée sur ce nœud.</p>
                    )}
                 </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.85rem' }}>
                 <span style={{ color: '#64748b', fontWeight: '700' }}>État de fonctionnement</span>
                 <span style={{ color: nodeModal.station.status === 'active' ? '#10b981' : '#ef4444', fontWeight: '900' }}>
                    {nodeModal.station.status === 'active' ? 'OPÉRATIONNEL' : 'HORS-LIGNE'}
                 </span>
              </div>
              
              <button onClick={() => setNodeModal({ isOpen: false })} className="btn-primary-premium" style={{ width: '100%', padding: '15px', marginTop: '2rem' }}>Fermer</button>
           </div>
        </div>
      )}

      {/* CATALOGUE MODAL */}
      {isCatalogueModal.isOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.7)', backdropFilter: 'blur(10px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}>
           <div className="db-card animate-up" style={{ width: '100%', maxWidth: '500px', padding: '3rem', borderRadius: '40px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
                 <div>
                    <h2 style={{ fontSize: '1.6rem', fontWeight: '950', margin: 0 }}>{isCatalogueModal.mode === 'add' ? 'Ajouter un Capteur' : 'Modifier le Capteur'}</h2>
                    <p style={{ margin: '5px 0 0', fontSize: '0.85rem', color: '#64748b' }}>Définissez les spécifications techniques de la sonde.</p>
                 </div>
                 <button onClick={() => setIsCatalogueModal({ isOpen: false })} style={{ background: '#f1f5f9', border: 'none', borderRadius: '50%', padding: '10px', cursor: 'pointer', color: '#64748b' }}><X size={20}/></button>
              </div>

              <form onSubmit={handleSaveCatalogueSensor} style={{ display: 'grid', gap: '1.8rem' }}>
                 <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                    <div className="form-group-premium">
                       <label className="label-premium">ID Modèle</label>
                       <input name="sensorId" type="text" defaultValue={isCatalogueModal.sensor?.sensorId || ""} placeholder="Ex: DHT22" className="input-premium-styled" required />
                    </div>
                    <div className="form-group-premium">
                       <label className="label-premium">Abréviation (Clé Packet)</label>
                       <input name="abbreviation" type="text" defaultValue={isCatalogueModal.sensor?.abbreviation || ""} placeholder="Ex: T" className="input-premium-styled" required />
                    </div>
                 </div>

                 <div className="form-group-premium">
                    <label className="label-premium">Nom Complet</label>
                    <input name="name" type="text" defaultValue={isCatalogueModal.sensor?.name || ""} placeholder="Ex: Capteur de Température & Humidité" className="input-premium-styled" required />
                 </div>

                 <div className="form-group-premium">
                    <label className="label-premium">Description</label>
                    <textarea name="description" defaultValue={isCatalogueModal.sensor?.description || ""} placeholder="Précisez les caractéristiques techniques..." className="input-premium-styled" style={{ minHeight: '100px', resize: 'none' }} required />
                 </div>

                 <button type="submit" className="btn-primary-premium" style={{ padding: '18px', fontSize: '1.1rem' }}>
                    {isCatalogueModal.mode === 'add' ? 'Ajouter au catalogue' : 'Sauvegarder les modifications'}
                 </button>
              </form>
           </div>
        </div>
      )}

      <ConfirmModal 
        isOpen={confirmDelete.isOpen}
        title="Retirer du catalogue ?"
        message="Attention : La suppression d'un modèle de capteur peut affecter l'affichage des nœuds qui l'utilisent."
        onConfirm={handleDeleteSensor}
        onCancel={() => setConfirmDelete({ isOpen: false, id: null })}
        type="danger"
      />

      {/* SENSORS LIST MODAL */}
      {sensorListModal.isOpen && sensorListModal.sensors && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.7)', backdropFilter: 'blur(10px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}>
           <div className="db-card animate-up" style={{ width: '100%', maxWidth: '450px', padding: '2.5rem', borderRadius: '40px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                 <div>
                    <h2 style={{ fontSize: '1.4rem', fontWeight: '950', margin: 0 }}>Les capteurs environnementaux</h2>
                    <p style={{ margin: '5px 0 0', fontSize: '0.85rem', color: '#64748b' }}>Station : <strong>{sensorListModal.stationName}</strong></p>
                 </div>
                 <button onClick={() => setSensorListModal({ isOpen: false, sensors: [], stationName: '' })} style={{ background: '#f1f5f9', border: 'none', borderRadius: '50%', padding: '10px', cursor: 'pointer', color: '#64748b' }}><X size={20}/></button>
              </div>

              <div style={{ display: 'grid', gap: '10px', maxHeight: '350px', overflowY: 'auto', paddingRight: '5px' }}>
                 {sensorListModal.sensors.map((sensor, idx) => (
                    <div key={idx} style={{ 
                      display: 'flex', alignItems: 'center', gap: '15px', padding: '15px 20px', 
                      background: '#f8fafc', borderRadius: '20px', border: '1px solid #f1f5f9'
                    }}>
                       <div style={{ width: '40px', height: '40px', background: '#fff', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #e2e8f0' }}>
                          <Layers size={18} color="#0070f3" />
                       </div>
                       <div>
                          <div style={{ fontSize: '1rem', fontWeight: '900', color: '#1e293b' }}>{sensor.trim()}</div>
                       </div>
                    </div>
                 ))}
              </div>

              <button onClick={() => setSensorListModal({ isOpen: false, sensors: [], stationName: '' })} className="btn-primary-premium" style={{ width: '100%', padding: '15px', marginTop: '2rem' }}>Fermer</button>
           </div>
        </div>
      )}

    </div>
  );
};

export default StationsManager;
