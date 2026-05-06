import React, { useEffect, useState } from 'react';
import { api } from '../../api';
import { useAuth } from '../../context/AuthContext';
import { MapPin, Cpu, Plus, Signal, Power, X, Save, Activity, LayoutGrid, Trash2, Settings, LineChart } from 'lucide-react';
import { toast } from 'react-hot-toast';
import ConfirmModal from '../../components/common/ConfirmModal';
import '../../styles/Dashboard.css';

const StationCard = ({ station, onEdit, onDelete }) => {
  const [status, setStatus] = useState(null);

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const res = await api.getStationStatus(station.hardwareId);
        setStatus(res);
      } catch (e) {}
    };
    fetchStatus();
    const interval = setInterval(fetchStatus, 5000);
    return () => clearInterval(interval);
  }, [station.hardwareId]);

  const isOnline = status?.lastUpdate 
    ? (new Date().getTime() - new Date(status.lastUpdate).getTime() < 180000) 
    : false;

  return (
    <div className="db-card card-hover animate-up" style={{ padding: '2.2rem', borderRadius: '35px', position: 'relative', overflow: 'hidden', border: '1px solid #f1f5f9' }}>
       <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '6px', background: isOnline ? '#10b981' : '#94a3b8' }}></div>
       <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '1.8rem' }}>
          <div style={{ padding: '14px', background: isOnline ? '#f0fdf4' : '#f8fafc', borderRadius: '18px', transition: 'all 0.3s' }}>
            <Cpu size={26} color={isOnline ? "#10b981" : "#64748b"} />
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
             <a 
               href={`/user/stations/${station.hardwareId}`} 
               title="Ouvrir le Monitoring"
               style={{ width: '40px', height: '40px', background: isOnline ? '#f0fdf4' : '#f1f5f9', color: isOnline ? '#059669' : '#64748b', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s' }}
               onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
               onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
             >
                <LineChart size={20} />
             </a>
             <button 
               onClick={() => onEdit(station)} 
               title="Paramètres de la station"
               style={{ width: '40px', height: '40px', background: '#f8fafc', color: '#64748b', borderRadius: '12px', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s' }}
               onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
               onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
             >
                <Settings size={20} />
             </button>
             <button 
               onClick={() => onDelete(station)} 
               title="Supprimer la station"
               style={{ width: '40px', height: '40px', background: '#fef2f2', color: '#ef4444', borderRadius: '12px', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s' }}
               onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
               onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
             >
                <Trash2 size={20} />
             </button>
          </div>
       </div>
       
       <h3 style={{ fontSize: '1.4rem', fontWeight: '900', color: '#1e293b', marginBottom: '0.6rem' }}>{station.name}</h3>
       <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <p style={{ fontSize: '0.85rem', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
            <Signal size={14} /> <span style={{ fontWeight: '600' }}>ID Matériel :</span> <span style={{ color: '#1e293b', fontWeight: '800' }}>{station.hardwareId}</span>
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: isOnline ? '#ecfdf5' : '#f1f5f9', padding: '6px 14px', borderRadius: '25px', width: 'fit-content', marginTop: '5px' }}>
            <div className={isOnline ? "status-dot-active" : ""} style={{ width: '8px', height: '8px', borderRadius: '50%', background: isOnline ? '#10b981' : '#94a3b8' }}></div>
            <span style={{ fontSize: '0.7rem', fontWeight: '900', color: isOnline ? '#059669' : '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              {isOnline ? 'Active' : 'Hors-Ligne'}
            </span>
          </div>
          <p style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '8px', margin: '8px 0 0 0', fontWeight: '700' }}>
            <Activity size={12} /> 
            {status?.lastUpdate ? `Dernier flux: ${new Date(status.lastUpdate).toLocaleString()}` : "Aucune donnée reçue"}
          </p>
       </div>
    </div>
  );
};

const UserStations = () => {
  const { user } = useAuth();
  const [stations, setStations] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // États des Modals
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editModal, setEditModal] = useState({ isOpen: false, station: null });
  const [deleteConfirm, setDeleteConfirm] = useState({ isOpen: false, stationId: null });
  
  const [formData, setFormData] = useState({ name: '', location: '', hardwareId: '' });
  const [editName, setEditName] = useState('');

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await api.getUserStations();
      setStations(data || []);
    } catch (err) {
      console.error(err);
      toast.error("Erreur de chargement.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleAddStation = async (e) => {
    e.preventDefault();
    const t = toast.loading("Création de la station...");
    try {
      await api.registerStation(formData.hardwareId, formData.name);
      toast.success("Station ajoutée !", { id: t });
      setIsModalOpen(false);
      setFormData({ name: '', location: '', hardwareId: '' });
      loadData();
    } catch (err) {
      toast.error(err.response?.data?.message || "Erreur lors de la création.", { id: t });
    }
  };

  const handleUpdateStation = async (e) => {
    e.preventDefault();
    const t = toast.loading("Mise à jour...");
    try {
      await api.updateStation(editModal.station._id, { name: editName });
      toast.success("Modifié avec succès !", { id: t });
      setEditModal({ isOpen: false, station: null });
      loadData();
    } catch (err) {
      toast.error("Erreur lors de la modification.", { id: t });
    }
  };

  const handleDeleteStation = async () => {
    const t = toast.loading("Suppression...");
    try {
      await api.deleteStation(deleteConfirm.stationId);
      toast.success("Station supprimée avec succès", { id: t });
      setDeleteConfirm({ isOpen: false, stationId: null });
      loadData();
    } catch (err) {
      toast.error("Erreur lors de la suppression.", { id: t });
    }
  };

  const openEdit = (station) => {
    setEditModal({ isOpen: true, station });
    setEditName(station.name);
  };

  const openDelete = (station) => {
    setDeleteConfirm({ isOpen: true, stationId: station._id });
  };

  return (
    <div className="animate-up" style={{ paddingBottom: '50px' }}>
      <header className="premium-header">
        <div className="premium-title-group">
          <h1 style={{ fontSize: '2rem', fontWeight: '900', letterSpacing: '-1px' }}>Mes Stations</h1>
          <div className="premium-subtitle">
            <span className="premium-accent-dot"></span>
            <span>Gérez votre parc de stations météo connectées et surveillez leur état.</span>
          </div>
        </div>
        <button onClick={() => setIsModalOpen(true)} className="btn-primary-premium" style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 25px' }}>
          <Plus size={20} /> Nouvelle Station
        </button>
      </header>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '5rem', color: '#94a3b8' }}>Chargement...</div>
      ) : stations.length > 0 ? (
        <div className="db-grid">
          {stations.map(station => (
            <StationCard key={station._id} station={station} onEdit={openEdit} onDelete={openDelete} />
          ))}
        </div>
      ) : (
        <div className="db-card" style={{ padding: '5rem', textAlign: 'center', borderRadius: '32px', color: '#94a3b8', border: '2px dashed #e2e8f0' }}>
          <LayoutGrid size={60} style={{ opacity: 0.1, marginBottom: '20px' }} />
          <p style={{ fontWeight: '700', fontSize: '1.1rem' }}>Vous n'avez pas encore de station enregistrée.</p>
        </div>
      )}

      {/* MODAL AJOUT */}
      {isModalOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.7)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}>
          <div className="db-card animate-up" style={{ width: '100%', maxWidth: '500px', padding: '3rem', borderRadius: '40px', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)' }}>
             <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
                <h2 style={{ fontSize: '1.8rem', fontWeight: '900', letterSpacing: '-1px' }}>Nouvelle Station</h2>
                <button onClick={() => setIsModalOpen(false)} style={{ background: '#f1f5f9', border: 'none', borderRadius: '50%', padding: '10px', cursor: 'pointer', color: '#64748b' }}><X size={20}/></button>
             </div>
             <form onSubmit={handleAddStation} style={{ display: 'grid', gap: '1.8rem' }}>
                <div className="form-group-premium">
                  <label className="label-premium">Nom de la station</label>
                  <input type="text" className="input-premium-styled" placeholder="Ex: Jardin Sud" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} required />
                </div>
                <div className="form-group-premium">
                  <label className="label-premium">ID Matériel (Hardware ID)</label>
                  <input type="text" className="input-premium-styled" placeholder="Ex: HUB-X1-STATION" value={formData.hardwareId} onChange={(e) => setFormData({...formData, hardwareId: e.target.value})} required />
                </div>
                <button type="submit" className="btn-primary-premium" style={{ padding: '18px', fontSize: '1.1rem' }}>Enregistrer la station</button>
             </form>
          </div>
        </div>
      )}

      {/* MODAL ÉDITION DÉTAILS */}
      {editModal.isOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.7)', backdropFilter: 'blur(10px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}>
          <div className="db-card animate-up" style={{ width: '100%', maxWidth: '500px', padding: '3rem', borderRadius: '40px' }}>
             <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                   <div style={{ padding: '10px', background: '#f0f7ff', borderRadius: '12px' }}><Cpu size={24} color="#0070f3" /></div>
                   <h2 style={{ fontSize: '1.5rem', fontWeight: '900', margin: 0 }}>Détails de la Station</h2>
                </div>
                <button onClick={() => setEditModal({ isOpen: false, station: null })} style={{ background: '#f1f5f9', border: 'none', borderRadius: '50%', padding: '10px', cursor: 'pointer', color: '#64748b' }}><X size={20}/></button>
             </div>
             
             <form onSubmit={handleUpdateStation} style={{ display: 'grid', gap: '1.8rem' }}>
                <div className="form-group-premium">
                  <label className="label-premium">Identifiant Unique (Hardware ID)</label>
                  <div style={{ padding: '15px', background: '#f8fafc', borderRadius: '15px', border: '1px solid #e2e8f0', color: '#64748b', fontSize: '0.95rem', fontWeight: '700' }}>
                    {editModal.station.hardwareId}
                  </div>
                  <p style={{ margin: '8px 0 0', fontSize: '0.65rem', color: '#94a3b8', fontWeight: '600' }}>* L'identifiant matériel ne peut pas être modifié après l'enregistrement.</p>
                </div>

                <div className="form-group-premium">
                  <label className="label-premium">Nom de la station</label>
                  <input type="text" className="input-premium-styled" value={editName} onChange={(e) => setEditName(e.target.value)} required />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginTop: '1rem' }}>
                   <button type="button" onClick={() => setEditModal({ isOpen: false, station: null })} className="btn-secondary-premium" style={{ padding: '15px' }}>Annuler</button>
                   <button type="submit" className="btn-primary-premium" style={{ padding: '15px' }}>Sauvegarder</button>
                </div>
             </form>
          </div>
        </div>
      )}
      {/* MODAL SUPPRESSION */}
      <ConfirmModal 
        isOpen={deleteConfirm.isOpen}
        title="Supprimer la station ?"
        message="Attention : Cette action supprimera définitivement la station et tout son historique de données."
        onConfirm={handleDeleteStation}
        onCancel={() => setDeleteConfirm({ isOpen: false, stationId: null })}
      />
    </div>
  );
};

export default UserStations;
