import React, { useEffect, useState } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import { api, sensorLibrary } from '../../api/api';
import { useToast } from '../../components/ui/Toast';
import { 
  Bell, 
  AlertCircle, 
  CheckCircle, 
  Clock, 
  Filter, 
  Sliders, 
  Plus, 
  Trash2, 
  Power,
  ChevronRight,
  ShieldAlert,
  Search
} from 'lucide-react';

const Alerts = () => {
  const [alertLogs, setAlertLogs] = useState([]);
  const [thresholds, setThresholds] = useState([]);
  const [stations, setStations] = useState([]);
  const [dbSensors, setDbSensors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('unseen'); // 'unseen' | 'seen' | 'all'
  const [showThresholdsModal, setShowThresholdsModal] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const { addToast } = useToast();

  const [newThreshold, setNewThreshold] = useState({
    name: '',
    stationId: '',
    sensorType: 'Température',
    operator: '>',
    thresholdValue: 0,
    description: ''
  });

  const fetchData = async () => {
    try {
      const [logsRes, thresholdsRes, stationsRes, sensorsRes] = await Promise.all([
        api.getAlertLogs(),
        api.getAlerts(),
        api.getStations(),
        api.getSensors()
      ]);
      setAlertLogs(logsRes);
      setThresholds(thresholdsRes);
      setStations(stationsRes);
      setDbSensors(sensorsRes || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Filter raw logs first based on selection
  const filteredLogs = alertLogs.filter(log => {
    if (filter === 'unseen') return !log.isSeen;
    if (filter === 'seen') return log.isSeen;
    return true;
  });

  // Grouping logic for filtered alerts
  const groupedAlerts = filteredLogs.reduce((acc, log) => {
    const thresholdId = typeof log.alertId === 'object' ? log.alertId?._id : log.alertId;
    
    if (!thresholdId) {
      acc.push({ ...log, count: 1 });
      return acc;
    }

    const existing = acc.find(a => (typeof a.alertId === 'object' ? a.alertId?._id : a.alertId) === thresholdId);
    
    if (existing) {
      existing.count += 1;
      if (new Date(log.createdAt) > new Date(existing.createdAt)) {
        existing.createdAt = log.createdAt;
        existing.isSeen = log.isSeen;
      }
    } else {
      acc.push({ ...log, count: 1 });
    }
    return acc;
  }, []);

  const sortedGroups = groupedAlerts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  const handleMarkAsSeen = async (group) => {
    try {
      const thresholdId = typeof group.alertId === 'object' ? group.alertId?._id : group.alertId;
      await api.markAlertAsSeen(thresholdId);
      fetchData();
      addToast('Alertes marquées comme lues', 'success');
    } catch (err) {
      addToast('Erreur lors du marquage', 'error');
    }
  };

  const handleMarkAllSeen = async () => {
    try {
      await api.markAllAlertsAsSeen();
      fetchData();
      addToast('Toutes les alertes ont été archivées', 'success');
    } catch (err) {
      addToast('Erreur', 'error');
    }
  };

  const handleCreateThreshold = async (e) => {
    e.preventDefault();
    try {
      await api.createAlert(newThreshold);
      fetchData();
      setIsCreating(false);
      addToast('Nouveau seuil configuré avec succès', 'success');
      setNewThreshold({
        name: '',
        stationId: stations[0]?.hardwareId || '',
        sensorType: 'Température',
        operator: '>',
        thresholdValue: 0,
        description: ''
      });
    } catch (err) {
      addToast('Erreur lors de la création', 'error');
    }
  };

  const handleDeleteThreshold = async (id) => {
    if (!window.confirm('Supprimer ce seuil définitivement ?')) return;
    try {
      await api.deleteAlert(id);
      fetchData();
      addToast('Seuil supprimé', 'success');
    } catch (err) {
      addToast('Erreur lors de la suppression', 'error');
    }
  };

  const handleToggleThreshold = async (id) => {
    try {
      await api.toggleAlertStatus(id);
      fetchData();
    } catch (err) {
      addToast('Erreur de changement d\'état', 'error');
    }
  };

  const getStationName = (id) => {
    return stations.find(s => s.hardwareId === id || s._id === id)?.name || id;
  };

  return (
    <DashboardLayout title="Centre d'Alertes">
      {/* Header Actions */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-12">
        <div className="flex flex-wrap items-center gap-4 w-full lg:w-auto">
          <div className="relative group w-full sm:w-64">
            <Filter size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors" />
            <select 
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl pl-12 pr-4 py-3 text-sm font-bold text-slate-700 dark:text-slate-300 outline-none focus:ring-2 focus:ring-primary/20 appearance-none cursor-pointer transition-all shadow-sm"
            >
              <option value="unseen">Alertes Non Lues</option>
              <option value="seen">Alertes Archivées</option>
              <option value="all">Toutes les Alertes</option>
            </select>
          </div>

          <Button 
            variant="secondary" 
            onClick={() => setShowThresholdsModal(true)}
            className="w-full sm:w-auto flex items-center justify-center bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800"
          >
            <Sliders size={16} className="mr-2 text-primary" /> 
            Seuils
          </Button>
        </div>

        <div className="w-full lg:w-auto">
          <Button 
            variant="outline" 
            className="w-full sm:w-auto border-slate-200 dark:border-slate-800 text-slate-500 hover:text-rose-500 hover:border-rose-200"
            onClick={handleMarkAllSeen}
          >
            <CheckCircle size={16} className="mr-2" /> 
            Archiver tout
          </Button>
        </div>
      </div>

      {/* Main Content: Alert Logs */}
      <div className="grid grid-cols-1 gap-4">
        {loading ? (
          <div className="p-20 flex justify-center">
             <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
          </div>
        ) : sortedGroups.length > 0 ? (
          sortedGroups.map(log => (
            <Card key={log._id} className={`group border transition-all duration-500 ${
              !log.isSeen 
                ? 'border-rose-100 dark:border-rose-500/20 bg-white dark:bg-slate-900 ring-1 ring-rose-500/5 shadow-xl shadow-rose-500/5' 
                : 'border-slate-100 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-900/40 opacity-70 grayscale-[0.5]'
            }`}>
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex items-start space-x-4">
                  <div className={`p-4 rounded-2xl transition-colors duration-500 ${
                    !log.isSeen 
                      ? 'bg-rose-50 dark:bg-rose-500/10 text-rose-600' 
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-400'
                  }`}>
                    <AlertCircle size={24} />
                  </div>
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className={`font-bold text-lg transition-colors ${
                        !log.isSeen ? 'text-slate-900 dark:text-white' : 'text-slate-500 dark:text-slate-400'
                      }`}>
                        {log.message}
                      </h3>
                      {!log.isSeen && <Badge variant="danger" className="animate-pulse">Nouveau</Badge>}
                      {log.count > 1 && (
                        <Badge variant="secondary" className="bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-none font-black">
                          +{log.count - 1} répétitions
                        </Badge>
                      )}
                    </div>
                    <div className="flex flex-wrap items-center gap-y-2 gap-x-4 text-[11px] font-medium text-slate-400">
                      <span className="flex items-center">
                        <ShieldAlert size={14} className="mr-1.5" />
                        Station: <b className={`ml-1 ${!log.isSeen ? 'text-slate-700 dark:text-slate-300' : 'text-slate-500'}`}>{getStationName(log.stationId)}</b>
                      </span>
                      <span className="flex items-center">
                        <Clock size={14} className="mr-1.5" />
                        {new Date(log.createdAt).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {!log.isSeen ? (
                    <Button 
                      size="sm" 
                      variant="primary" 
                      onClick={() => handleMarkAsSeen(log)}
                      className="rounded-xl shadow-lg shadow-primary/20"
                    >
                      <CheckCircle size={16} className="mr-2" /> Marquer comme lu
                    </Button>
                  ) : (
                    <Badge variant="outline" className="px-4 py-2 border-slate-200 dark:border-slate-800 text-slate-400">Archivé</Badge>
                  )}
                  <Button variant="ghost" size="icon" className="rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800">
                    <ChevronRight size={20} />
                  </Button>
                </div>
              </div>
            </Card>
          ))
        ) : (
          <div className="p-32 text-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-[40px] bg-slate-50/50 dark:bg-slate-900/20">
            <div className="w-20 h-20 bg-white dark:bg-slate-900 rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl shadow-slate-200/50 dark:shadow-none border border-slate-100 dark:border-slate-800">
              <Bell size={40} className="text-slate-200 dark:text-slate-700" />
            </div>
            <h3 className="text-lg font-black text-slate-900 dark:text-white mb-2">Tout est calme ici</h3>
            <p className="text-slate-500 dark:text-slate-400 text-sm max-w-xs mx-auto">
              {filter === 'unseen' ? "Vous n'avez aucune nouvelle alerte non lue." : "Aucune alerte ne correspond à vos filtres."}
            </p>
          </div>
        )}
      </div>

      {/* Threshold Management Modal */}
      <Modal 
        isOpen={showThresholdsModal} 
        onClose={() => {
          setShowThresholdsModal(false);
          setIsCreating(false);
        }}
        title="Gestion des Seuils de Surveillance"
        size="lg"
        showFooter={false}
      >
        {!isCreating ? (
          <div className="space-y-6">
            <div className="flex justify-between items-center bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-100 dark:border-slate-800">
              <span className="text-sm font-medium text-slate-600 dark:text-slate-400">Total: {thresholds.length} seuil(s)</span>
              <Button size="sm" className="flex items-center" onClick={() => setIsCreating(true)}>
                <Plus size={16} className="mr-2" /> Ajouter un seuil
              </Button>
            </div>

            <div className="max-h-[50vh] overflow-y-auto space-y-3 pr-2 custom-scrollbar">
              {thresholds.length > 0 ? thresholds.map(t => (
                <div key={t._id} className="p-4 bg-white dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 rounded-2xl flex items-center justify-between group transition-all hover:border-primary/20">
                  <div className="flex items-center space-x-4">
                    <div className={`p-2.5 rounded-xl ${t.isActive ? 'bg-primary/10 text-primary' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'}`}>
                      <Sliders size={18} />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-800 dark:text-white flex items-center">
                        {t.name || `${t.sensorType} ${t.operator} ${t.thresholdValue}`}
                        {!t.isActive && <span className="ml-2 text-[10px] uppercase font-black text-slate-400 italic">(Désactivé)</span>}
                      </h4>
                      <p className="text-[10px] text-slate-400 uppercase tracking-widest font-black mt-0.5">
                        {getStationName(t.stationId)} • {t.sensorType}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => handleToggleThreshold(t._id)}
                      className={`rounded-xl ${t.isActive ? 'text-primary' : 'text-slate-400'}`}
                    >
                      <Power size={18} />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => handleDeleteThreshold(t._id)}
                      className="text-slate-400 hover:text-rose-500 rounded-xl"
                    >
                      <Trash2 size={18} />
                    </Button>
                  </div>
                </div>
              )) : (
                <p className="text-center py-10 text-slate-400 italic">Aucun seuil configuré.</p>
              )}
            </div>

            <Button variant="secondary" className="w-full py-4 rounded-2xl" onClick={() => setShowThresholdsModal(false)}>
              Fermer
            </Button>
          </div>
        ) : (
          <form onSubmit={handleCreateThreshold} className="space-y-5 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">Nom de l'alerte</label>
                <input 
                  type="text" 
                  required
                  placeholder="Ex: Alerte Température Haute"
                  className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl px-5 py-4 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary/20 outline-none transition-all placeholder:text-slate-400/50"
                  value={newThreshold.name}
                  onChange={(e) => setNewThreshold({...newThreshold, name: e.target.value})}
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">Station cible</label>
                <select 
                  className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl px-5 py-4 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary/20 outline-none transition-all cursor-pointer appearance-none"
                  value={newThreshold.stationId}
                  onChange={(e) => setNewThreshold({...newThreshold, stationId: e.target.value})}
                  required
                >
                  <option value="">Sélectionner une station</option>
                  {stations.map(s => (
                    <option key={s._id} value={s.hardwareId}>{s.name} ({s.hardwareId})</option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">Type de Capteur</label>
                <select 
                  className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl px-5 py-4 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary/20 outline-none transition-all cursor-pointer appearance-none"
                  value={newThreshold.sensorType}
                  onChange={(e) => setNewThreshold({...newThreshold, sensorType: e.target.value})}
                >
                  {/* Priorité aux capteurs de la DB, fallback sur sensorLibrary */}
                  {dbSensors.length > 0 ? dbSensors.map(s => (
                    <option key={s._id} value={s.name}>{s.name} ({s.abbreviation})</option>
                  )) : Object.entries(sensorLibrary).map(([key, data]) => (
                    <option key={key} value={data.name}>{data.name}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">Opérateur</label>
                  <select 
                    className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl px-5 py-4 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary/20 outline-none transition-all cursor-pointer appearance-none"
                    value={newThreshold.operator}
                    onChange={(e) => setNewThreshold({...newThreshold, operator: e.target.value})}
                  >
                    <option value=">">Supérieur à (&gt;)</option>
                    <option value="<">Inférieur à (&lt;)</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">Valeur Seuil</label>
                  <input 
                    type="number" 
                    step="0.1"
                    className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl px-5 py-4 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                    value={newThreshold.thresholdValue}
                    onChange={(e) => setNewThreshold({...newThreshold, thresholdValue: e.target.value})}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">Description (Optionnel)</label>
                <textarea 
                  rows="2"
                  className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl px-5 py-4 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary/20 outline-none transition-all resize-none"
                  value={newThreshold.description}
                  onChange={(e) => setNewThreshold({...newThreshold, description: e.target.value})}
                ></textarea>
              </div>
            </div>

            <div className="flex flex-col space-y-3 pt-2">
              <Button type="submit" variant="primary" className="w-full py-4 rounded-2xl shadow-xl shadow-primary/30 text-xs font-black uppercase">
                Enregistrer le Seuil
              </Button>
              <Button type="button" variant="ghost" className="w-full py-4 rounded-2xl text-slate-500 text-xs font-bold" onClick={() => setIsCreating(false)}>
                Retour à la liste
              </Button>
            </div>
          </form>
        )}
      </Modal>
    </DashboardLayout>
  );
};

export default Alerts;
