import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Card from '../../components/ui/Card';
import { api, sensorLibrary } from '../../api/api';
import { useToast } from '../../components/ui/Toast';
import { 
  Activity, 
  Signal, 
  Cpu,
  Globe,
  Bell,
  Clock,
  Zap,
  FileText,
  Loader2,
  Server,
  ArrowUp,
  ChevronRight,
  Database,
  ShieldAlert,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';

const UserDashboard = () => {
  const [stations, setStations] = useState([]);
  const [alertLogs, setAlertLogs] = useState([]);
  const [systemLogs, setSystemLogs] = useState([]);
  const [stats, setStats] = useState({ stationsCount: 0, nodesCount: 0, unseenAlerts: 0, unseenSystemLogs: 0 });
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { addToast } = useToast();

  const fetchData = async () => {
    try {
      const [stationsRes, alertLogsRes, systemLogsRes, statsRes] = await Promise.all([
        api.getStations(),
        api.getAlertLogs(),
        api.getUserLogs(),
        api.getDashboardStats()
      ]);
      
      setStations(Array.isArray(stationsRes) ? stationsRes : (stationsRes?.stations || []));
      setAlertLogs(Array.isArray(alertLogsRes) ? alertLogsRes : (alertLogsRes?.logs || []));
      setSystemLogs(Array.isArray(systemLogsRes) ? systemLogsRes : (systemLogsRes?.logs || []));
      setStats(statsRes);
      
    } catch (err) {
      console.error("Dashboard Fetch Error:", err);
      setStations([]);
      setAlertLogs([]);
      setSystemLogs([]);
      addToast("Synchronisation impossible.", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleMarkAllAlertsSeen = async () => {
    try {
      await api.markAllAlertsAsSeen();
      addToast("Toutes les alertes ont été marquées comme vues", "success");
      fetchData();
    } catch (err) {
      addToast("Erreur lors de l'opération", "error");
    }
  };

  const handleMarkLogsSeen = async () => {
    try {
      await api.markSystemLogsSeen();
      addToast("Journal technique mis à jour", "success");
      fetchData();
    } catch (err) {
      addToast("Erreur lors de l'opération", "error");
    }
  };

  const handleMarkAlertSeen = async (id) => {
    try {
      await api.markAlertAsSeen(id);
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const getStationName = (hwId) => {
    const s = stations.find(st => st.hardwareId === hwId || st._id === hwId);
    return s ? s.name : hwId;
  };

  const totalNodes = stations.reduce((acc, s) => acc + (s.sensorNodes?.length || 0), 0);
  
  // Stats
  const unseenAlertsCount = alertLogs.filter(a => !a.isSeen).length;
  const unseenSystemLogsCount = systemLogs.filter(l => !l.isSeen).length;
  
  // Grouping logic for UNSEEN alerts only
  const groupedAlerts = alertLogs.filter(a => !a.isSeen).reduce((acc, alert) => {
    // We use alertId._id or alertId as key
    const thresholdId = typeof alert.alertId === 'object' ? alert.alertId?._id : alert.alertId;
    
    if (!thresholdId) {
      acc.push({ ...alert, count: 1 }); // Fallback if no ID
      return acc;
    }

    const existing = acc.find(a => (typeof a.alertId === 'object' ? a.alertId?._id : a.alertId) === thresholdId);
    
    if (existing) {
      existing.count += 1;
      // Keep the most recent data
      if (new Date(alert.createdAt) > new Date(existing.createdAt)) {
        const thresholdName = (typeof alert.alertId === 'object' ? alert.alertId?.name : null) || alert.sensorType || 'Alerte';
        const stationName = getStationName(alert.stationId);
        existing.message = `Alerte sur ${stationName} : ${thresholdName}`;
        existing.createdAt = alert.createdAt;
        existing.isSeen = alert.isSeen;
      }
    } else {
      const thresholdName = (typeof alert.alertId === 'object' ? alert.alertId?.name : null) || alert.sensorType || 'Alerte';
      const stationName = getStationName(alert.stationId);
      
      // Message format: Alerte sur [Station] : [Seuil]
      const customMessage = `Alerte sur ${stationName} : ${thresholdName}`;
      
      acc.push({ ...alert, message: customMessage, count: 1 });
    }
    return acc;
  }, []);

  // Sort groups by most recent
  const sortedGroups = groupedAlerts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  return (
    <DashboardLayout title="Tableau de bord">
      {loading ? (
        <div className="min-h-[70vh] flex flex-col items-center justify-center space-y-4 transition-colors duration-500">
          <Loader2 className="w-12 h-12 animate-spin text-primary/30" />
          <p className="text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest animate-pulse">Initialisation du Dashboard...</p>
        </div>
      ) : (
        <>
          {/* Stats Cards (Top) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        <Card className="bg-white dark:bg-slate-900/50 shadow-lg shadow-slate-100/50 dark:shadow-none border-slate-200 dark:border-slate-800 cursor-pointer transition-all hover:border-primary/30">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-slate-500 dark:text-slate-400 text-[10px] font-black uppercase tracking-widest">Stations Météo</p>
              <h3 className="text-3xl font-black text-slate-900 dark:text-white mt-2">{stats.stationsCount}</h3>
            </div>
            <div className="p-3 bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-2xl">
              <Globe size={24} />
            </div>
          </div>
          <div className="mt-4 flex items-center text-blue-600 dark:text-blue-400 text-[11px] font-black uppercase tracking-tighter">
            <Activity size={14} className="mr-1.5" />
            <span>Flux temps réel</span>
          </div>
        </Card>

        <Card className="bg-white dark:bg-slate-900/50 shadow-lg shadow-slate-100/50 dark:shadow-none border-slate-200 dark:border-slate-800 cursor-pointer transition-all hover:border-primary/30">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-slate-500 dark:text-slate-400 text-[10px] font-black uppercase tracking-widest">Nœuds Capteurs</p>
              <h3 className="text-3xl font-black text-slate-900 dark:text-white mt-2">{stats.nodesCount}</h3>
            </div>
            <div className="p-3 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-2xl">
              <Cpu size={24} />
            </div>
          </div>
          <div className="mt-4 flex items-center text-emerald-600 dark:text-emerald-400 text-[11px] font-black uppercase tracking-tighter">
            <Signal size={14} className="mr-1.5" />
            <span>Maillage actif</span>
          </div>
        </Card>

        <Card className={`bg-white dark:bg-slate-900/50 shadow-lg shadow-slate-100/50 dark:shadow-none border-slate-200 dark:border-slate-800 cursor-pointer transition-all ${stats.unseenAlerts > 0 ? 'ring-2 ring-rose-500/20 border-rose-500/30' : 'hover:border-primary/30'}`}>
          <div className="flex justify-between items-start">
            <div>
              <p className="text-slate-500 dark:text-slate-400 text-[10px] font-black uppercase tracking-widest">Alertes Non Vues</p>
              <h3 className={`text-3xl font-black mt-2 ${stats.unseenAlerts > 0 ? 'text-rose-600 dark:text-rose-400' : 'text-slate-900 dark:text-white'}`}>
                {stats.unseenAlerts}
              </h3>
            </div>
            <div className={`p-3 rounded-2xl ${stats.unseenAlerts > 0 ? 'bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400' : 'bg-slate-50 dark:bg-slate-800 text-slate-400'}`}>
              <ShieldAlert size={24} />
            </div>
          </div>
          <div className={`mt-4 flex items-center text-[11px] font-black uppercase tracking-tighter ${stats.unseenAlerts > 0 ? 'text-rose-600 dark:text-rose-400' : 'text-slate-500 dark:text-slate-500'}`}>
            <Zap size={14} className="mr-1.5" />
            <span>{stats.unseenAlerts > 0 ? 'Intervention requise' : 'Système stable'}</span>
          </div>
        </Card>

        <Card className={`bg-white dark:bg-slate-900/50 shadow-lg shadow-slate-100/50 dark:shadow-none border-slate-200 dark:border-slate-800 cursor-pointer transition-all ${stats.unseenSystemLogs > 0 ? 'ring-2 ring-amber-500/20 border-amber-500/30' : 'hover:border-primary/30'}`}>
          <div className="flex justify-between items-start">
            <div>
              <p className="text-slate-500 dark:text-slate-400 text-[10px] font-black uppercase tracking-widest">Nouveaux Événements</p>
              <h3 className={`text-3xl font-black mt-2 ${stats.unseenSystemLogs > 0 ? 'text-amber-600 dark:text-amber-400' : 'text-slate-900 dark:text-white'}`}>
                {stats.unseenSystemLogs}
              </h3>
            </div>
            <div className={`p-3 rounded-2xl ${stats.unseenSystemLogs > 0 ? 'bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400' : 'bg-slate-50 dark:bg-slate-800 text-slate-400'}`}>
              <Bell size={24} />
            </div>
          </div>
          <div className={`mt-4 flex items-center text-[11px] font-black uppercase tracking-tighter ${stats.unseenSystemLogs > 0 ? 'text-amber-600 dark:text-amber-400' : 'text-slate-500 dark:text-slate-500'}`}>
            <Clock size={14} className="mr-1.5" />
            <span>{stats.unseenSystemLogs > 0 ? 'Vérification nécessaire' : 'Journal à jour'}</span>
          </div>
        </Card>
      </div>

      {/* Main Grid Content */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Stations & Logs */}
        <div className="lg:col-span-8 space-y-8">
          
          {/* État de connexion des stations */}
          <div className="bg-white dark:bg-slate-900/40 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl shadow-slate-100/40 dark:shadow-none p-8 transition-colors duration-500">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-xl font-black text-slate-900 dark:text-white">État de connexion des stations</h2>
              <div className="px-4 py-1.5 bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 text-[10px] font-black rounded-full border border-blue-100 dark:border-blue-500/20 flex items-center">
                <span className="w-2 h-2 bg-emerald-500 rounded-full mr-2 animate-pulse"></span>
                LIVE MONITORING
              </div>
            </div>

            <div className="space-y-4">
              {stations.map(station => (
                <div 
                  key={station._id || station.hardwareId} 
                  onClick={() => navigate(`/user/stations/${station.hardwareId}`)}
                  className="flex items-center justify-between p-5 rounded-[2rem] border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-950/40 hover:border-primary/30 hover:shadow-lg dark:hover:shadow-none transition-all group cursor-pointer"
                >
                  <div className="flex items-center space-x-6">
                    <div className={`p-4 rounded-2xl border transition-colors ${
                      station.status === 'active' 
                      ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-100 dark:border-emerald-500/20' 
                      : 'bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700'
                    }`}>
                      <Server size={24} />
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center space-x-3">
                        <p className="text-lg font-black text-slate-900 dark:text-white group-hover:text-primary transition-colors">{station.name}</p>
                        {station.status === 'active' && (
                          <span className="px-2 py-0.5 bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-[9px] font-black rounded-md uppercase tracking-widest animate-pulse">
                            ACTIVE
                          </span>
                        )}
                      </div>
                      <div className="flex items-center text-slate-500 dark:text-slate-400 text-xs font-bold space-x-2">
                        <Clock size={14} className="text-slate-400 dark:text-slate-500" />
                        <span>
                          Dernière connexion : <span className={`ml-1 ${station.status === 'active' ? 'text-emerald-600 dark:text-emerald-400 font-black' : 'text-slate-600 dark:text-slate-500'}`}>
                            {new Date(station.updatedAt || Date.now()).toLocaleString()}
                          </span>
                        </span>
                      </div>
                    </div>
                  </div>
                  <button 
                    onClick={(e) => { e.stopPropagation(); navigate(`/user/stations/${station.hardwareId}`); }}
                    className={`p-3 rounded-full transition-all transform rotate-45 shadow-md group-hover:scale-110 ${
                    station.status === 'active'
                    ? 'bg-emerald-500 text-white shadow-emerald-200 dark:shadow-none hover:bg-emerald-600'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-900 dark:hover:bg-primary dark:hover:text-white'
                  }`}>
                    <ArrowUp size={20} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Journal technique du système */}
          <div className="bg-white dark:bg-slate-900/40 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl shadow-slate-100/40 dark:shadow-none p-8 transition-colors duration-500">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center space-x-4">
                <div className="bg-primary/10 p-2 rounded-lg">
                   <Database className="text-primary" size={24} />
                </div>
                <h2 className="text-xl font-black text-slate-900 dark:text-white">Journal technique du système</h2>
              </div>
              <button 
                onClick={handleMarkLogsSeen}
                className="text-[10px] font-black text-primary uppercase tracking-widest hover:text-primary/70 transition-colors"
              >
                Tout marquer comme vu
              </button>
            </div>

            <div className="space-y-4">
              {systemLogs.length > 0 ? (
                <div className="w-full space-y-3">
                  {systemLogs.slice(0, 5).map((log, i) => (
                     <div key={log._id || i} className="flex items-start space-x-5 p-4 rounded-2xl group transition-all hover:bg-slate-50 dark:hover:bg-slate-950/40 border border-transparent hover:border-slate-100 dark:hover:border-slate-800">
                        <div className={`p-3 rounded-xl mt-1 transition-colors ${!log.isSeen ? 'bg-primary/10 text-primary' : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-500'}`}>
                           <Zap size={18} />
                        </div>
                        <div className="space-y-1 flex-1">
                           <p className={`text-sm font-black leading-snug ${!log.isSeen ? 'text-slate-900 dark:text-white' : 'text-slate-600 dark:text-slate-400'}`}>
                             {log.message}
                           </p>
                           <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                             {new Date(log.createdAt).toLocaleString()}
                           </p>
                        </div>
                     </div>
                  ))}
                </div>
              ) : (
                <div className="min-h-[150px] flex flex-col items-center justify-center space-y-4">
                  <div className="w-12 h-12 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center">
                    <FileText size={24} className="text-slate-300 dark:text-slate-600" />
                  </div>
                  <p className="text-slate-500 dark:text-slate-500 font-bold italic text-sm">Aucun événement enregistré.</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Alerts Grouped */}
        <div className="lg:col-span-4">
          <div className="bg-white dark:bg-slate-900/40 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl shadow-slate-100/40 dark:shadow-none p-8 h-full transition-colors duration-500">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center space-x-4 text-rose-500 dark:text-rose-400">
                <ShieldAlert size={24} />
                <h2 className="text-xl font-black text-slate-900 dark:text-white">Alertes Récentes</h2>
              </div>
              {alertLogs.length > 0 && (
                <button 
                  onClick={handleMarkAllAlertsSeen}
                  className="flex items-center space-x-2 px-4 py-2 bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20 rounded-xl transition-all group"
                >
                  <CheckCircle2 size={16} className="group-hover:scale-110 transition-transform" />
                  <span className="text-[10px] font-black uppercase tracking-widest">Tout marquer comme lu</span>
                </button>
              )}
            </div>

            <div className="space-y-4">
              {sortedGroups.length > 0 ? sortedGroups.slice(0, 10).map((group, i) => (
                <div 
                  key={group._id || i} 
                  onClick={() => !group.isSeen && handleMarkAlertSeen(group._id)}
                  className={`relative p-6 rounded-3xl border transition-all duration-300 group cursor-pointer ${
                    !group.isSeen 
                      ? 'border-rose-100 dark:border-rose-500/20 bg-rose-50/30 dark:bg-rose-500/5 hover:border-rose-500/40 hover:shadow-lg hover:shadow-rose-500/5' 
                      : 'border-slate-100 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-900/20 hover:border-primary/30'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-4">
                      <div className={`p-2.5 rounded-xl shadow-sm border transition-all ${
                        !group.isSeen 
                          ? 'bg-white dark:bg-slate-900 text-rose-500 dark:text-rose-400 border-rose-100 dark:border-rose-500/20' 
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 border-slate-200 dark:border-slate-700'
                      }`}>
                        <AlertTriangle size={18} />
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                           <p className={`text-sm font-black leading-tight transition-colors ${
                              !group.isSeen ? 'text-slate-900 dark:text-white group-hover:text-rose-600 dark:group-hover:text-rose-400' : 'text-slate-600 dark:text-slate-400'
                           }`}>
                              {group.message}
                           </p>
                        </div>
                        <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 flex items-center">
                          {group.stationId} <span className="mx-2 text-slate-300 dark:text-slate-700">•</span> {new Date(group.createdAt).toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                    {!group.isSeen && (
                      <div className="w-2 h-2 bg-rose-500 rounded-full animate-pulse shadow-lg shadow-rose-500/50 mt-1"></div>
                    )}
                  </div>
                  
                  {/* Badge for repeated alerts */}
                  {group.count > 1 && (
                    <div className="mt-4 flex items-center">
                      <div className="bg-slate-900 dark:bg-primary text-white px-2.5 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-widest shadow-lg shadow-primary/20">
                        +{group.count - 1} répétitions
                      </div>
                    </div>
                  )}
                </div>
              )) : (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                  <div className="w-16 h-16 bg-emerald-50 dark:bg-emerald-500/10 rounded-full flex items-center justify-center mb-6">
                    <CheckCircle2 size={32} className="text-emerald-500/40" />
                  </div>
                  <p className="text-slate-500 dark:text-slate-400 font-bold text-xs leading-relaxed">
                    Aucune alerte enregistrée.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

      </div>
        </>
      )}
    </DashboardLayout>
  );
};

export default UserDashboard;
