import React, { useEffect, useState } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import { useToast } from '../../components/ui/Toast';
import { api, sensorLibrary } from '../../api/api';
import { 
  Search, 
  Plus, 
  Radio, 
  User, 
  Clock, 
  Layers, 
  Cpu, 
  Trash2, 
  Edit, 
  ChevronRight,
  Database,
  Loader2,
  Mail,
  Phone,
  Wifi,
  Calendar,
  Activity,
  Shield
} from 'lucide-react';

const AdminStations = () => {
  const [stations, setStations] = useState([]);
  const [sensors, setSensors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('stations'); 
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isOwnerModalOpen, setIsOwnerModalOpen] = useState(false);
  const [isNodeModalOpen, setIsNodeModalOpen] = useState(false);
  const [isSensorsModalOpen, setIsSensorsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [sensorToDelete, setSensorToDelete] = useState(null);
  const [selectedOwner, setSelectedOwner] = useState(null);
  const [selectedNode, setSelectedNode] = useState(null);
  const [selectedStationSensors, setSelectedStationSensors] = useState([]);
  const [opLoading, setOpLoading] = useState(false);
  const { addToast } = useToast();

  const [formData, setFormData] = useState({
    sensorId: '',
    abbreviation: '',
    name: '',
    description: ''
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const [sData, semData] = await Promise.all([
        api.adminGetStations(),
        api.adminGetSensors()
      ]);
      setStations(sData);
      setSensors(semData);
    } catch (err) {
      console.error("Error fetching data:", err);
      addToast("Erreur lors de la récupération des données", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateSensor = async (e) => {
    e.preventDefault();
    setOpLoading(true);
    try {
      if (isEditMode) {
        await api.adminUpdateSensor(editingId, formData);
        addToast("Capteur mis à jour", "success");
      } else {
        await api.adminCreateSensor(formData);
        addToast("Capteur ajouté à la bibliothèque", "success");
      }
      setIsModalOpen(false);
      resetForm();
      fetchData();
    } catch (err) {
      addToast(err.response?.data?.message || "Erreur lors de l'opération", "error");
    } finally {
      setOpLoading(false);
    }
  };

  const confirmDelete = async () => {
    if (!sensorToDelete) return;
    setOpLoading(true);
    try {
      await api.adminDeleteSensor(sensorToDelete._id);
      addToast("Capteur supprimé", "success");
      setIsDeleteModalOpen(false);
      setSensorToDelete(null);
      fetchData();
    } catch (err) {
      addToast("Erreur lors de la suppression", "error");
    } finally {
      setOpLoading(false);
    }
  };

  const handleDeleteClick = (sensor) => {
    setSensorToDelete(sensor);
    setIsDeleteModalOpen(true);
  };

  const handleOwnerClick = (owner) => {
    setSelectedOwner(owner);
    setIsOwnerModalOpen(true);
  };

  const handleNodeClick = async (nodeId) => {
    setOpLoading(true);
    try {
      const nodeData = await api.getNodeDetails(nodeId);
      setSelectedNode(nodeData);
      setIsNodeModalOpen(true);
    } catch (err) {
      addToast("Erreur lors de la récupération des détails du nœud", "error");
    } finally {
      setOpLoading(false);
    }
  };

  const handleStationSensorsClick = (stationSensors) => {
    setSelectedStationSensors(stationSensors || []);
    setIsSensorsModalOpen(true);
  };

  const handleEditClick = (sensor) => {
    setEditingId(sensor._id);
    setFormData({
      sensorId: sensor.sensorId,
      abbreviation: sensor.abbreviation,
      name: sensor.name,
      description: sensor.description
    });
    setIsEditMode(true);
    setIsModalOpen(true);
  };

  const resetForm = () => {
    setFormData({ sensorId: '', abbreviation: '', name: '', description: '' });
    setIsEditMode(false);
    setEditingId(null);
  };

  return (
    <DashboardLayout title="Stations Météo" isAdmin={true}>
      {/* Modal Capteur */}
      <Modal 
        isOpen={isModalOpen} 
        onClose={() => { setIsModalOpen(false); resetForm(); }}
        title={isEditMode ? "Modifier le capteur" : "Ajouter un capteur"}
        showFooter={false}
        customIcon={isEditMode ? <Edit size={28} /> : <Plus size={28} />}
      >
        <form onSubmit={handleCreateSensor} className="space-y-4 p-2">
          <div className="grid grid-cols-2 gap-4">
            <input 
              type="text" 
              placeholder="ID (ex: DHT11)"
              required
              className="input-premium"
              value={formData.sensorId}
              onChange={(e) => setFormData({...formData, sensorId: e.target.value})}
            />
            <input 
              type="text" 
              placeholder="Abréviation (ex: t)"
              required
              className="input-premium"
              value={formData.abbreviation}
              onChange={(e) => setFormData({...formData, abbreviation: e.target.value})}
            />
          </div>

          <input 
            type="text" 
            placeholder="Désignation du capteur"
            required
            className="input-premium"
            value={formData.name}
            onChange={(e) => setFormData({...formData, name: e.target.value})}
          />

          <textarea 
            placeholder="Description technique du capteur..."
            rows="6" 
            className="input-premium py-4"
            value={formData.description}
            onChange={(e) => setFormData({...formData, description: e.target.value})}
          ></textarea>

          <div className="flex items-center space-x-3 pt-6">
            <Button 
              type="button" 
              variant="secondary"
              onClick={() => { setIsModalOpen(false); resetForm(); }}
              className="flex-1 py-4"
            >
              Annuler
            </Button>
            <Button 
              type="submit" 
              disabled={opLoading}
              className="flex-[2] py-4 shadow-xl shadow-primary/20"
            >
              {opLoading ? <Loader2 className="animate-spin mx-auto" size={18} /> : (isEditMode ? "Enregistrer" : "Confirmer l'ajout")}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal Confirmation Suppression */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Confirmer la suppression"
        showFooter={false}
        customIcon={<Trash2 size={28} className="text-rose-500" />}
      >
        <div className="p-4 space-y-8 text-center">
          <div className="w-16 h-16 bg-rose-50 dark:bg-rose-500/10 rounded-full flex items-center justify-center mx-auto">
             <Trash2 className="text-rose-500" size={32} />
          </div>
          <p className="text-slate-600 dark:text-slate-400 font-bold">
            Voulez-vous vraiment supprimer le capteur <span className="text-slate-900 dark:text-white font-black">"{sensorToDelete?.name}"</span> ? 
            <br/><span className="text-rose-500 text-xs font-black uppercase tracking-widest mt-2 block">Cette action est irréversible</span>
          </p>
          <div className="flex items-center space-x-3 pt-4">
            <Button 
              variant="secondary" 
              onClick={() => setIsDeleteModalOpen(false)}
              className="flex-1 py-4"
            >
              Annuler
            </Button>
            <Button 
              onClick={confirmDelete}
              disabled={opLoading}
              className="flex-1 py-4 bg-rose-500 hover:bg-rose-600 border-rose-500 shadow-xl shadow-rose-500/20"
            >
              {opLoading ? <Loader2 className="animate-spin mx-auto" size={18} /> : "Supprimer"}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Modal Détails Propriétaire */}
      <Modal
        isOpen={isOwnerModalOpen}
        onClose={() => setIsOwnerModalOpen(false)}
        title="Détails du Propriétaire"
        showFooter={false}
        customIcon={<User size={28} className="text-primary" />}
      >
        <div className="p-4 space-y-6">
          <div className="flex items-center space-x-5 p-6 bg-slate-50 dark:bg-slate-800/40 rounded-[2rem] border border-slate-100 dark:border-slate-800">
            <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center text-white text-2xl font-black shadow-xl shadow-primary/20">
              {selectedOwner?.username?.charAt(0).toUpperCase()}
            </div>
            <div>
              <h3 className="text-xl font-black text-slate-900 dark:text-white">{selectedOwner?.username || 'Yahia Han'}</h3>
              <div className="flex items-center space-x-2 mt-1">
                 <Shield size={12} className="text-primary" />
                 <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Client Vérifié</p>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 gap-4">
            {[
              { label: 'Contact Email', value: selectedOwner?.email, icon: <Mail size={18} /> },
              { label: 'Ligne Téléphonique', value: selectedOwner?.phoneNumber || '---', icon: <Phone size={18} /> },
              { label: 'Dernière Connexion', value: selectedOwner?.lastAccess ? new Date(selectedOwner.lastAccess).toLocaleString('fr-FR') : '---', icon: <Clock size={18} /> },
              { label: 'Inscription Système', value: selectedOwner?.createdAt ? new Date(selectedOwner.createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }) : '---', icon: <Calendar size={18} /> }
            ].map((item, i) => (
              <div key={i} className="flex items-center space-x-4 p-5 border border-slate-100 dark:border-slate-800 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800/20 transition-all group">
                <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800 shadow-sm text-slate-400 group-hover:text-primary transition-colors">
                  {item.icon}
                </div>
                <div className="flex-1">
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5">{item.label}</p>
                  <p className="text-[13px] font-black text-slate-900 dark:text-slate-200">{item.value}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Modal>

      {/* Modal Détails Nœud */}
      <Modal
        isOpen={isNodeModalOpen}
        onClose={() => setIsNodeModalOpen(false)}
        title={`Nœud #${selectedNode?.nodeHardwareId}`}
        showFooter={false}
        customIcon={<Cpu size={28} className="text-slate-900 dark:text-white" />}
      >
        <div className="p-4 space-y-6">
          <div className="px-2">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6">Les capteurs détectés sur ce nœud</p>
            
            <div className="space-y-3">
              {selectedNode?.sensors && (Array.isArray(selectedNode.sensors) ? selectedNode.sensors : Object.keys(selectedNode.sensors)).length > 0 ? (
                (Array.isArray(selectedNode.sensors) ? selectedNode.sensors : Object.keys(selectedNode.sensors)).map((sKey, index) => {
                  const sensorInfo = sensors.find(s => s.sensorId === sKey || s.abbreviation === sKey);
                  return (
                    <div key={index} className="flex items-center justify-between p-5 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[1.5rem] shadow-sm hover:border-primary transition-all group">
                      <div className="flex items-center space-x-4">
                         <div className="w-10 h-10 bg-slate-50 dark:bg-slate-800 rounded-xl flex items-center justify-center text-slate-400 group-hover:text-primary transition-colors">
                            <Activity size={18} />
                         </div>
                         <p className="font-black text-slate-900 dark:text-slate-200 text-sm">
                           {sensorInfo ? sensorInfo.name : sKey} 
                         </p>
                      </div>
                      <span className="px-4 py-1.5 bg-primary/10 text-primary rounded-lg text-[10px] font-black border border-primary/20 uppercase tracking-wider">
                        {sKey}
                      </span>
                    </div>
                  );
                })
              ) : (
                <div className="p-12 text-center bg-slate-50 dark:bg-slate-800/20 rounded-[2.5rem] border-2 border-dashed border-slate-100 dark:border-slate-800">
                  <p className="text-slate-400 font-bold italic text-sm">Aucun capteur détecté sur ce nœud.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </Modal>

      {/* Modal Liste des Capteurs Station */}
      <Modal
        isOpen={isSensorsModalOpen}
        onClose={() => setIsSensorsModalOpen(false)}
        title="Configuration des Capteurs"
        showFooter={false}
        customIcon={<Layers size={28} className="text-primary" />}
      >
        <div className="p-4">
          <div className="grid grid-cols-1 gap-3">
             {selectedStationSensors && (Array.isArray(selectedStationSensors) ? selectedStationSensors : Object.keys(selectedStationSensors)).length > 0 ? (
               (Array.isArray(selectedStationSensors) ? selectedStationSensors : Object.keys(selectedStationSensors)).map((sensorKey, index) => {
                 const sensorInfo = sensors.find(s => s.sensorId === sensorKey || s.abbreviation === sensorKey);
                 const reading = Array.isArray(selectedStationSensors) ? null : selectedStationSensors[sensorKey];

                 return (
                  <div key={index} className="flex items-center justify-between p-4 border border-slate-100 dark:border-slate-800 rounded-2xl bg-white dark:bg-slate-900 hover:border-primary transition-all group shadow-sm">
                     <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 bg-primary/5 border border-primary/10 rounded-xl flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all">
                           <Activity size={18} />
                        </div>
                        <div>
                           <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Désignation</p>
                           <p className="font-black text-slate-900 dark:text-white text-sm leading-none">
                             {sensorInfo ? sensorInfo.name : sensorKey}
                           </p>
                        </div>
                     </div>
                     <div className="text-right">
                        <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Référence / Abr.</p>
                        <div className="flex items-center justify-end space-x-2">
                           <span className="px-2.5 py-1 bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 rounded-lg text-[10px] font-black border border-slate-100 dark:border-slate-700">
                              {sensorInfo ? sensorInfo.sensorId : sensorKey}
                           </span>
                           {reading !== null && (
                             <p className="font-black text-primary text-xl tracking-tighter ml-2">{reading}</p>
                           )}
                        </div>
                     </div>
                  </div>
                 );
               })
             ) : (
               <div className="text-center py-16 bg-slate-50 dark:bg-slate-800/20 rounded-[2.5rem] border-2 border-dashed border-slate-100 dark:border-slate-800">
                  <p className="text-slate-400 font-bold italic">Aucun capteur configuré.</p>
               </div>
             )}
          </div>
        </div>
      </Modal>

      <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-8 mb-12">
        <div className="flex items-center space-x-6">
           <div className="bg-primary/10 p-5 rounded-2xl">
              <Database className="text-primary" size={32} />
           </div>
           <div>
              <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Stations Météo</h1>
              <p className="text-xs font-bold text-slate-500 dark:text-slate-400 mt-1 uppercase tracking-widest">Supervision et configuration technique</p>
           </div>
        </div>

        <div className="flex flex-col md:flex-row items-center gap-4 w-full lg:w-auto">
          <div className="relative group w-full md:w-auto">
            <div className="absolute top-1/2 left-5 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors">
              <Search size={18} />
            </div>
            <input 
              type="text" 
              placeholder="Rechercher une station..."
              className="input-premium pl-14 w-full md:w-80"
            />
          </div>
          
          {activeTab === 'sensors' && (
            <Button 
              onClick={() => { setIsEditMode(false); setIsModalOpen(true); }}
              className="w-full md:w-auto flex items-center justify-center space-x-3 py-4 px-10 shadow-xl shadow-primary/20"
            >
              <Plus size={20} strokeWidth={3} />
              <span className="font-black uppercase tracking-widest text-[11px]">Nouveau Capteur</span>
            </Button>
          )}
        </div>
      </div>

      <div className="flex items-center space-x-12 border-b border-slate-100 dark:border-slate-800 mb-8">
        {[
          { id: 'stations', label: 'Stations Météo' },
          { id: 'sensors', label: 'Bibliothèque des Capteurs' }
        ].map(tab => (
          <button 
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`pb-5 text-[12px] font-black tracking-[0.2em] uppercase transition-all relative ${
              activeTab === tab.id ? 'text-primary' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
            }`}
          >
            {tab.label}
            {activeTab === tab.id && (
              <div className="absolute bottom-[-1px] left-0 w-full h-[3px] bg-primary rounded-full shadow-[0_-2px_8px_rgba(16,185,129,0.5)]"></div>
            )}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center min-h-[40vh] space-y-6">
          <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] animate-pulse">Initialisation du système...</p>
        </div>
      ) : activeTab === 'stations' ? (
        <div className="bg-white dark:bg-slate-900/40 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-2xl shadow-slate-100/40 dark:shadow-none p-2 overflow-hidden transition-colors duration-500">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800/50">
                  <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Station Météo</th>
                  <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Propriétaire</th>
                  <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Nœuds Réseau</th>
                  <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Capteurs Hub</th>
                  <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Statut Data</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 dark:divide-slate-800/30">
                {stations.map(station => (
                  <tr key={station._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors group">
                    <td className="px-8 py-6">
                      <div className="flex items-center space-x-5">
                        <div className="w-12 h-12 rounded-2xl bg-rose-500/10 flex items-center justify-center text-rose-500 group-hover:scale-110 transition-transform">
                          <Radio size={24} />
                        </div>
                        <div>
                          <p className="font-black text-slate-900 dark:text-white text-[15px] leading-tight mb-1">{station.name}</p>
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">ID: {station.hardwareId}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <button 
                        onClick={() => handleOwnerClick(station.owner)}
                        className="flex items-center space-x-3 px-5 py-3 rounded-2xl bg-primary/5 text-primary border border-primary/10 hover:bg-primary hover:text-white transition-all duration-300"
                      >
                        <User size={14} />
                        <span className="text-[11px] font-black uppercase tracking-widest">{station.owner?.username || 'Yahia Han'}</span>
                      </button>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex flex-wrap gap-2 max-w-[280px]">
                        {station.sensorNodes?.length > 0 ? station.sensorNodes.map((node, i) => (
                          <button 
                            key={i} 
                            onClick={() => handleNodeClick(node)}
                            className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[9px] font-black text-slate-500 dark:text-slate-400 uppercase hover:bg-slate-900 dark:hover:bg-white hover:text-white dark:hover:text-slate-900 transition-all"
                          >
                            #{node}
                          </button>
                        )) : (
                          <span className="text-[10px] font-bold text-slate-300 italic uppercase">Aucun nœud</span>
                        )}
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <button 
                        onClick={() => handleStationSensorsClick(station.sensors)}
                        className="inline-flex items-center space-x-3 px-6 py-3 rounded-2xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-800 shadow-sm hover:border-primary transition-all group/btn"
                      >
                        <Layers size={14} className="text-primary group-hover/btn:scale-110 transition-transform" />
                        <span className="text-[11px] font-black text-slate-700 dark:text-slate-200 uppercase tracking-widest">{station.sensors ? Object.keys(station.sensors).length : 0} Capteurs</span>
                      </button>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center space-x-3">
                        <div className="w-1.5 h-1.5 rounded-full bg-primary animate-ping"></div>
                        <div className="flex flex-col">
                          <span className="text-[11px] font-black text-slate-900 dark:text-white leading-none mb-1">Actif</span>
                          <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Flux OK</span>
                        </div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-900/40 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-2xl shadow-slate-100/40 dark:shadow-none p-2 overflow-hidden transition-colors duration-500">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800/50">
                  <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Référence / Abr.</th>
                  <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Désignation du capteur</th>
                  <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Spécifications Techniques</th>
                  <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 dark:divide-slate-800/30">
                {sensors.map(sensor => (
                  <tr key={sensor._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors group">
                    <td className="px-8 py-6">
                      <div className="flex items-center space-x-3">
                        <div className="px-4 py-2 rounded-xl bg-primary/10 text-primary text-[11px] font-black border border-primary/20 tracking-widest">
                          {sensor.sensorId}
                        </div>
                        <div className="px-3 py-2 rounded-xl bg-indigo-500/10 text-indigo-500 text-[11px] font-black border border-indigo-500/20 uppercase tracking-widest">
                          {sensor.abbreviation}
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <p className="font-black text-slate-900 dark:text-white text-[15px] tracking-tight">{sensor.name}</p>
                    </td>
                    <td className="px-8 py-6">
                      <p className="text-[13px] font-bold text-slate-500 dark:text-slate-400 italic max-w-sm line-clamp-2">{sensor.description}</p>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center justify-center space-x-3">
                        <button 
                          onClick={() => handleEditClick(sensor)}
                          className="p-3 bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 hover:bg-primary hover:text-white rounded-2xl transition-all border border-transparent hover:shadow-lg hover:shadow-primary/20"
                        >
                          <Edit size={18} />
                        </button>
                        <button 
                          onClick={() => handleDeleteClick(sensor)}
                          className="p-3 bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 hover:bg-rose-500 hover:text-white rounded-2xl transition-all border border-transparent hover:shadow-lg hover:shadow-rose-500/20"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default AdminStations;
