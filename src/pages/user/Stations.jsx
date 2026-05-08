import React, { useEffect, useState } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { api } from '../../api/api';
import { 
  Search, 
  Plus, 
  Settings, 
  Trash2, 
  Activity, 
  Clock, 
  Server, 
  AlertCircle,
  X
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../../components/ui/Toast';
import Modal from '../../components/ui/Modal';

const Stations = () => {
  const [stations, setStations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStation, setSelectedStation] = useState(null);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editName, setEditName] = useState('');
  const [newStation, setNewStation] = useState({ name: '', hardwareId: '' });
  
  const navigate = useNavigate();
  const { addToast } = useToast();

  const fetchStations = async () => {
    try {
      const res = await api.getStations();
      setStations(Array.isArray(res) ? res : (res?.stations || []));
    } catch (err) {
      addToast("Erreur lors de la récupération des stations", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStations();
  }, []);

  const handleDelete = async () => {
    try {
      await api.deleteStation(selectedStation._id);
      addToast("Station supprimée avec succès", "success");
      setShowDeleteModal(false);
      fetchStations();
    } catch (err) {
      addToast("Erreur lors de la suppression", "error");
    }
  };

  const handleUpdate = async () => {
    try {
      await api.updateStation(selectedStation._id, { name: editName });
      addToast("Station mise à jour", "success");
      setShowSettingsModal(false);
      fetchStations();
    } catch (err) {
      addToast("Erreur lors de la mise à jour", "error");
    }
  };

  const handleAdd = async () => {
    if (!newStation.name || !newStation.hardwareId) {
      return addToast("Veuillez remplir tous les champs", "warning");
    }
    try {
      await api.registerStation(newStation);
      addToast("Nouvelle station enregistrée", "success");
      setShowAddModal(false);
      setNewStation({ name: '', hardwareId: '' });
      fetchStations();
    } catch (err) {
      addToast(err.response?.data?.message || "Erreur lors de l'ajout", "error");
    }
  };

  const openSettings = (station) => {
    setSelectedStation(station);
    setEditName(station.name);
    setShowSettingsModal(true);
  };

  const openDelete = (station) => {
    setSelectedStation(station);
    setShowDeleteModal(true);
  };

  const filteredStations = stations.filter(s => 
    s.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <DashboardLayout title="Mes Stations">
      {/* Header Actions */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 mb-12">
        <div className="relative w-full lg:w-[500px] group">
          <div className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors duration-300">
            <Search size={22} />
          </div>
          <input 
            type="text" 
            placeholder="Rechercher parmi vos stations..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input-premium pl-16 w-full shadow-2xl shadow-slate-100/50 dark:shadow-none py-5"
          />
        </div>
        <Button 
          onClick={() => setShowAddModal(true)}
          className="flex items-center justify-center space-x-3 py-5 px-10 shadow-2xl shadow-primary/20 hover:scale-105 active:scale-95 transition-all"
        >
          <Plus size={24} strokeWidth={3} />
          <span className="font-black uppercase tracking-widest text-[11px]">Enregistrer une Station</span>
        </Button>
      </div>

      {/* Stations Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-[300px] rounded-[3rem] bg-white dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800 animate-pulse"></div>
          ))}
        </div>
      ) : filteredStations.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
          {filteredStations.map(station => (
            <div key={station._id || station.id} className="bg-white dark:bg-slate-900/40 rounded-[3rem] border border-slate-100 dark:border-slate-800 shadow-2xl shadow-slate-100/30 dark:shadow-none hover:border-primary/40 transition-all duration-500 group overflow-hidden relative">
              {/* Background accent */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 blur-3xl group-hover:bg-primary/10 transition-colors"></div>
              
              <div className="p-10 relative z-10">
                {/* Status & Name */}
                <div className="flex justify-between items-start mb-10">
                  <div className="flex items-start space-x-5">
                    <div className="relative mt-1">
                      <div className={`w-3.5 h-3.5 rounded-full ${
                        station.status === 'active' || station.status === 'online' 
                          ? 'bg-primary shadow-[0_0_15px_rgba(16,185,129,0.8)]' 
                          : 'bg-slate-300 dark:bg-slate-700'
                      }`}></div>
                      {(station.status === 'active' || station.status === 'online') && (
                        <div className="absolute inset-0 rounded-full bg-primary animate-ping opacity-30"></div>
                      )}
                    </div>
                    <div>
                      <h3 className="font-black text-slate-900 dark:text-white text-2xl tracking-tight leading-tight group-hover:text-primary transition-colors">{station.name}</h3>
                      <div className="flex items-center text-slate-400 dark:text-slate-500 text-[10px] font-black uppercase tracking-[0.2em] mt-2">
                        <Server size={12} className="mr-2" />
                        ID: {station.hardwareId || 'ST-000'}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Info Area */}
                <div className="space-y-4 mb-12">
                   <div className="flex items-center text-[12px] text-slate-500 dark:text-slate-400 font-bold">
                    <Clock size={16} className="mr-3 text-slate-300 dark:text-slate-600" />
                    <span>Mise à jour: {new Date(station.updatedAt || Date.now()).toLocaleString()}</span>
                  </div>
                  <div className="flex items-center text-[12px] text-slate-500 dark:text-slate-400 font-bold">
                    <Activity size={16} className="mr-3 text-slate-300 dark:text-slate-600" />
                    <span>Statut: <span className={station.status === 'active' || station.status === 'online' ? 'text-primary' : 'text-slate-400'}>{station.status === 'active' || station.status === 'online' ? 'Opérationnel' : 'Hors-ligne'}</span></span>
                  </div>
                </div>

                {/* Actions Footer */}
                <div className="flex items-center justify-between pt-8 border-t border-slate-50 dark:border-slate-800/50">
                   <div className="flex items-center space-x-3">
                      <button 
                        onClick={() => openDelete(station)}
                        className="p-4 bg-rose-50 dark:bg-rose-500/10 text-rose-500 dark:text-rose-400 rounded-2xl hover:bg-rose-500 hover:text-white transition-all duration-300 hover:shadow-lg hover:shadow-rose-500/20"
                        title="Supprimer la station"
                      >
                        <Trash2 size={20} />
                      </button>
                      <button 
                        onClick={() => openSettings(station)}
                        className="p-4 bg-slate-50 dark:bg-slate-800 text-slate-400 dark:text-slate-500 rounded-2xl hover:bg-primary hover:text-white transition-all duration-300 hover:shadow-lg hover:shadow-primary/20"
                        title="Paramètres de la station"
                      >
                        <Settings size={20} />
                      </button>
                   </div>
                   
                   <button 
                     onClick={() => navigate(`/user/stations/${station.hardwareId}`)}
                     className="flex items-center space-x-3 py-4 px-8 bg-primary text-white rounded-2xl font-black text-[11px] uppercase tracking-widest transition-all duration-300 shadow-xl shadow-primary/20 group/btn"
                   >
                     <Activity size={20} className="group-hover/btn:scale-110 transition-transform" />
                     <span>Monitorer</span>
                   </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-32 text-center bg-white dark:bg-slate-900/40 rounded-[4rem] border-2 border-dashed border-slate-100 dark:border-slate-800">
           <div className="w-24 h-24 bg-slate-50 dark:bg-slate-900/50 rounded-full flex items-center justify-center mb-8 border border-slate-100 dark:border-slate-800 shadow-inner">
              <Server size={48} className="text-slate-200 dark:text-slate-700" />
           </div>
           <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-3">Aucune station enregistrée</h3>
           <p className="text-slate-500 dark:text-slate-400 font-medium max-w-sm">Commencez par ajouter votre premier Hub Central pour visualiser vos données.</p>
           <Button onClick={() => setShowAddModal(true)} variant="secondary" className="mt-10 px-8">Ajouter ma première station</Button>
        </div>
      )}

      {/* Settings Modal - Refined */}
      <Modal
        isOpen={showSettingsModal}
        onClose={() => setShowSettingsModal(false)}
        title="Configuration Station"
        showFooter={false}
        customIcon={<Settings size={28} className="text-primary" />}
      >
        <div className="space-y-8 p-2">
          <div className="relative">
            <label className="block text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] mb-3 ml-1">Identifiant Physique</label>
            <div className="relative">
               <Server className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
               <input 
                 type="text" 
                 value={selectedStation?.hardwareId} 
                 readOnly 
                 className="w-full pl-14 pr-5 py-5 bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 rounded-2xl text-slate-400 font-bold outline-none cursor-not-allowed text-sm"
               />
            </div>
            <p className="text-[10px] text-slate-400 mt-2 ml-1 italic">* Cet ID ne peut pas être modifié</p>
          </div>

          <div className="relative">
            <label className="block text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] mb-3 ml-1">Nom Personnalisé</label>
            <input 
              type="text" 
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              placeholder="Ex: Station Potager"
              className="input-premium w-full py-5"
            />
          </div>

          <div className="flex space-x-4 pt-4">
            <Button variant="secondary" className="flex-1 py-4" onClick={() => setShowSettingsModal(false)}>Annuler</Button>
            <Button className="flex-1 py-4 shadow-xl shadow-primary/20" onClick={handleUpdate}>Mettre à jour</Button>
          </div>
        </div>
      </Modal>

      {/* Delete Confirmation Modal - Refined */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Suppression Station"
        showFooter={false}
        customIcon={<AlertCircle size={28} className="text-rose-500" />}
      >
        <div className="text-center p-4">
          <div className="w-20 h-20 bg-rose-50 dark:bg-rose-500/10 rounded-full flex items-center justify-center mx-auto mb-8">
            <Trash2 size={40} className="text-rose-500" />
          </div>
          <h3 className="text-xl font-black text-slate-900 dark:text-white mb-3">Confirmation requise</h3>
          <p className="text-slate-500 dark:text-slate-400 font-bold mb-10 leading-relaxed text-sm">
            Toutes les données historiques de la station <span className="text-slate-900 dark:text-white font-black underline decoration-rose-500/30">{selectedStation?.name}</span> seront définitivement purgées.
          </p>

          <div className="flex space-x-4">
            <Button variant="secondary" className="flex-1 py-4" onClick={() => setShowDeleteModal(false)}>Annuler</Button>
            <button 
              onClick={handleDelete}
              className="flex-1 py-4 bg-rose-500 hover:bg-rose-600 text-white font-black uppercase tracking-widest text-[11px] rounded-2xl transition-all shadow-xl shadow-rose-500/30"
            >
              Supprimer
            </button>
          </div>
        </div>
      </Modal>

      {/* Add Station Modal - Refined */}
      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Ajouter une Station"
        showFooter={false}
        customIcon={<Plus size={28} className="text-primary" />}
      >
        <div className="space-y-8 p-2">
           <div className="p-5 bg-primary/5 border border-primary/10 rounded-2xl">
              <div className="flex items-start space-x-3">
                 <AlertCircle size={18} className="text-primary mt-0.5 shrink-0" />
                 <p className="text-[11px] font-bold text-primary leading-relaxed">
                    Assurez-vous que l'ID matériel correspond exactement à celui programmé dans votre matériel Central.
                 </p>
              </div>
           </div>

           <div className="relative">
              <label className="block text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] mb-3 ml-1">Nom de la station</label>
              <input 
                type="text" 
                placeholder="Ex: Station Toiture Nord"
                className="input-premium w-full py-5"
                value={newStation.name}
                onChange={(e) => setNewStation({...newStation, name: e.target.value})}
              />
           </div>

           <div className="relative">
              <label className="block text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] mb-3 ml-1">Hardware ID (Code Unique)</label>
              <div className="relative">
                <Server size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" />
                <input 
                  type="text" 
                  placeholder="Ex: METEO-HB-01"
                  className="input-premium pl-14 w-full py-5"
                  value={newStation.hardwareId}
                  onChange={(e) => setNewStation({...newStation, hardwareId: e.target.value})}
                />
              </div>
           </div>

           <div className="pt-4 flex space-x-4">
              <Button variant="secondary" className="flex-1 py-4" onClick={() => setShowAddModal(false)}>Annuler</Button>
              <Button className="flex-1 py-4 shadow-2xl shadow-primary/30" onClick={handleAdd}>Enregistrer</Button>
           </div>
        </div>
      </Modal>
    </DashboardLayout>
  );
};

export default Stations;
