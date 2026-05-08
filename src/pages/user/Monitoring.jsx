import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { api } from '../../api/api';
import { 
  Thermometer, 
  Droplets, 
  Wind, 
  Gauge, 
  Activity, 
  Clock,
  RefreshCw,
  Cpu,
  Share2,
  Sun,
  Battery,
  ChevronLeft,
  Zap,
  Globe,
  Database,
  AlertCircle,
  Server,
  Network
} from 'lucide-react';

const Monitoring = () => {
  const { id } = useParams();
  const [station, setStation] = useState(null);
  const [liveState, setLiveState] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedNodeId, setSelectedNodeId] = useState(null);

  const fetchData = async () => {
    try {
      const s = await api.getStationByHardwareId(id);
      const status = await api.getStationStatus(id);
      setStation(s);
      setLiveState(status);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 3000);
    return () => clearInterval(interval);
  }, [id]);

  const isOffline = liveState?.lastUpdate 
    ? (new Date().getTime() - new Date(liveState.lastUpdate).getTime() > 35000) 
    : true;

  const sourceData = !selectedNodeId ? liveState?.station : (liveState?.nodes[selectedNodeId] || {});
  const library = liveState?.sensorLibrary || {};
  const currentAbbrs = sourceData ? Object.keys(sourceData) : [];

  const iconMap = {
    Thermometer: <Thermometer size={24} />,
    Droplets: <Droplets size={24} />,
    Wind: <Wind size={24} />,
    Sun: <Sun size={24} />,
    Battery: <Battery size={24} />,
    Gauge: <Gauge size={24} />,
    Activity: <Activity size={24} />
  };

  return (
    <DashboardLayout title={loading ? "Monitoring..." : station ? `Monitoring : ${station.name}` : "Monitoring"}>
      {loading ? (
        <div className="min-h-[70vh] flex flex-col items-center justify-center space-y-4 transition-colors duration-500">
          <RefreshCw className="w-12 h-12 animate-spin text-primary/30" />
          <p className="text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest animate-pulse">Flux IoT en cours d'initialisation...</p>
        </div>
      ) : !station ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
           <AlertCircle size={60} className="text-rose-500 mb-6" />
           <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-2">Station introuvable</h3>
           <Link to="/user/stations">
              <Button className="mt-6">Retour aux stations</Button>
           </Link>
        </div>
      ) : (
        <>
          {/* Header Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-6">
        <div className="flex items-center space-x-6">
          <Link to="/user/stations">
            <button className="p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-all shadow-sm">
              <ChevronLeft size={24} className="text-slate-600 dark:text-slate-400" />
            </button>
          </Link>
          <div>
            <div className="flex items-center space-x-3">
               <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">{station.name}</h1>
               <div className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center border ${
                  isOffline 
                  ? 'bg-rose-50 dark:bg-rose-500/10 text-rose-500 border-rose-100 dark:border-rose-500/20' 
                  : 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-500 border-emerald-100 dark:border-emerald-500/20 animate-pulse'
               }`}>
                  <span className={`w-2 h-2 rounded-full mr-2 ${isOffline ? 'bg-rose-500' : 'bg-emerald-500 shadow-[0_0_8px_#10b981]'}`}></span>
                  {isOffline ? 'HORS LIGNE' : 'EN DIRECT'}
               </div>
            </div>
            <p className="text-slate-500 dark:text-slate-400 text-xs font-bold mt-1 uppercase tracking-widest flex items-center">
               <Globe size={12} className="mr-2" />
               ID MATÉRIEL: {station.hardwareId}
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-8 px-6 py-3 bg-white dark:bg-slate-900/40 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-xl shadow-slate-100/50 dark:shadow-none">
          <div className="flex items-center text-slate-600 dark:text-slate-300 text-xs font-black uppercase tracking-widest">
            <Clock size={16} className="mr-2 text-primary" />
            {liveState.lastUpdate ? new Date(liveState.lastUpdate).toLocaleString() : '--/--/---- --:--:--'}
          </div>
          <div className="w-px h-6 bg-slate-200 dark:bg-slate-800"></div>
          <div className="flex items-center text-primary text-xs font-black uppercase tracking-widest">
            <RefreshCw size={16} className="mr-2 animate-spin-slow" />
            SYNCHRO 3S
          </div>
        </div>
      </div>

      {/* Parallel View: Topology Left | Details Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-10 items-stretch">
        
        {/* Topology Explorer (Left) */}
        <div className="lg:col-span-8 flex">
           <div className="bg-white dark:bg-slate-900/40 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-xl shadow-slate-100/40 dark:shadow-none p-8 flex-1 transition-colors duration-500">
              <div className="flex items-center justify-between mb-10">
                 <div>
                    <h2 className="text-2xl font-black text-slate-900 dark:text-white flex items-center tracking-tight">
                       <Network size={28} className="mr-3 text-primary" />
                       Architecture Réseau
                    </h2>
                 </div>
                 <div className="flex space-x-2">
                    <div className="w-3 h-3 bg-primary rounded-full shadow-[0_0_8px_#3b82f6]"></div>
                    <div className="w-3 h-3 bg-emerald-500 rounded-full shadow-[0_0_8px_#10b981]"></div>
                 </div>
              </div>

              <div className="flex flex-col items-center justify-center min-h-[400px]">
                 {/* Hub */}
                 <div className="relative mb-16">
                    <button 
                       onClick={() => setSelectedNodeId(null)}
                       className={`relative z-20 px-10 py-6 rounded-3xl flex flex-col items-center justify-center transition-all duration-500 shadow-2xl border-4 ${
                         !selectedNodeId 
                           ? 'bg-primary text-white border-white/20 scale-110 ring-[10px] ring-primary/10' 
                           : 'bg-white dark:bg-slate-950/80 text-slate-400 dark:text-slate-500 hover:text-primary border-slate-200 dark:border-slate-800'
                       }`}
                    >
                       <Cpu size={32} strokeWidth={2.5} className="mb-2" />
                       <span className={`text-[10px] font-black uppercase tracking-widest ${!selectedNodeId ? 'text-white' : 'text-slate-900 dark:text-white'}`}>Gateway</span>
                       <span className={`text-[9px] font-black mt-1 px-2 py-0.5 rounded ${!selectedNodeId ? 'bg-black/20' : 'bg-slate-100 dark:bg-slate-900'}`}>{station.hardwareId}</span>
                    </button>
                    <div className="absolute top-full left-1/2 -translate-x-1/2 w-1 h-16 bg-gradient-to-b from-primary to-slate-200 dark:to-slate-800"></div>
                 </div>

                 {/* Nodes */}
                 <div className="relative w-full">
                    {station.sensorNodes.length > 1 && (
                       <div className="absolute top-0 left-1/2 -translate-x-1/2 h-1 bg-slate-200 dark:bg-slate-800" style={{ width: `calc(100% - ${100 / station.sensorNodes.length}%)` }}></div>
                    )}
                    <div className="flex justify-around items-start">
                       {station.sensorNodes.map((nodeId) => {
                          const isSelected = selectedNodeId === nodeId;
                          return (
                             <div key={nodeId} className="relative pt-10 flex flex-col items-center flex-1">
                                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1 h-10 bg-slate-200 dark:bg-slate-800"></div>
                                <button 
                                   onClick={() => setSelectedNodeId(nodeId)}
                                   className={`relative z-20 w-32 p-4 rounded-2xl flex flex-col items-center justify-center transition-all duration-500 shadow-lg border-4 ${
                                      isSelected 
                                      ? 'bg-emerald-500 text-white border-white/20 scale-110 ring-[10px] ring-emerald-500/10' 
                                      : 'bg-white dark:bg-slate-950/80 text-slate-400 dark:text-slate-500 hover:text-emerald-500 border-slate-200 dark:border-slate-800'
                                   }`}
                                >
                                   <Zap size={24} strokeWidth={2.5} className="mb-2" />
                                   <span className={`text-[9px] font-black uppercase tracking-widest ${isSelected ? 'text-white' : 'text-slate-900 dark:text-white'}`}>Node</span>
                                   <span className={`text-[8px] font-black mt-1 px-2 py-0.5 rounded ${isSelected ? 'bg-black/20' : 'bg-slate-100 dark:bg-slate-900'}`}>{nodeId}</span>
                                </button>
                             </div>
                          );
                       })}
                    </div>
                 </div>
              </div>
           </div>
        </div>

        {/* Selected Device Details (Right) */}
        <div className="lg:col-span-4 flex">
           <div className="bg-white dark:bg-slate-900/40 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-xl shadow-slate-100/40 dark:shadow-none p-8 flex-1 flex flex-col transition-colors duration-500">
              <h2 className="text-xl font-black text-slate-900 dark:text-white flex items-center tracking-tight mb-8">
                 <Database size={24} className="mr-3 text-primary" />
                 Infos Matériel
              </h2>

              <div className="space-y-8 flex-1">
                 <VerticalDetail label="Dénomination" value={selectedNodeId ? `Nœud : ${selectedNodeId}` : "Hub Central (Gateway)"} icon={selectedNodeId ? <Zap size={16} /> : <Cpu size={16} />} />
                 <VerticalDetail label="Type de Contrôleur" value={selectedNodeId ? "ESP32 (End Node)" : "STM32 (Central)"} />
                 <VerticalDetail label="Hardware ID" value={selectedNodeId || station.hardwareId} />
                 <VerticalDetail label="Statut Réseau" value={isOffline ? "HORS LIGNE" : "ACTIF"} status={!isOffline} />
                                   <VerticalDetail 
                    label="Dernière Synchro" 
                    value={
                      selectedNodeId 
                        ? (liveState?.lastUpdates?.nodes[selectedNodeId] ? new Date(liveState.lastUpdates.nodes[selectedNodeId]).toLocaleString() : 'En attente...')
                        : (liveState?.lastUpdates?.hub ? new Date(liveState.lastUpdates.hub).toLocaleString() : 'En attente...')
                    } 
                  />
              </div>

              <div className="mt-8 px-6 py-4 bg-primary/10 dark:bg-primary/5 border border-primary/10 rounded-2xl">
                 <p className="text-[10px] font-black text-primary uppercase tracking-widest mb-1 text-center">Capteurs Détectés</p>
                 <p className="text-3xl font-black text-primary text-center tracking-tight">{currentAbbrs.length}</p>
              </div>
           </div>
        </div>

      </div>

      {/* Realtime Sensor Grid */}
      <div className="flex items-center justify-between mb-8">
         <h3 className="text-2xl font-black text-slate-900 dark:text-white flex items-center tracking-tight">
            <Activity size={24} className="mr-3 text-primary" />
            Supervision : {selectedNodeId ? `Nœud ${selectedNodeId}` : "Hub Central"}
         </h3>
         <div className="flex items-center space-x-3 text-[11px] font-black text-emerald-500 uppercase tracking-widest bg-emerald-500/10 px-4 py-2 rounded-full border border-emerald-500/20">
            <RefreshCw size={14} className="animate-spin-slow" />
            <span>Mise à jour Live</span>
         </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {currentAbbrs.length > 0 ? currentAbbrs.map((abbr) => {
          const info = library[abbr] || { name: abbr, unit: '', icon: 'Gauge', color: '#64748b' };
          return (
            <div key={abbr} className="card-premium group hover:translate-y-[-8px] transition-all duration-500 overflow-hidden">
              <div className="p-8">
                <div className="flex items-center justify-between mb-6">
                  <div className="p-4 rounded-[1.25rem] transition-all duration-500 group-hover:scale-110 shadow-lg" style={{ backgroundColor: `${info.color}15`, color: info.color, boxShadow: `0 8px 20px -5px ${info.color}40` }}>
                    {iconMap[info.icon] || <Gauge size={24} />}
                  </div>
                  <div className="px-3 py-1 bg-slate-50 dark:bg-slate-950/50 text-slate-600 dark:text-slate-300 text-[11px] font-black rounded-lg border border-slate-200 dark:border-slate-800">
                    {abbr}
                  </div>
                </div>
                <p className="text-slate-500 dark:text-slate-400 text-[11px] font-black uppercase tracking-widest mb-2">{info.name}</p>
                <div className="flex items-baseline space-x-2">
                  <h4 className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter">
                    {sourceData[abbr]}
                  </h4>
                  <span className="text-slate-400 dark:text-slate-500 font-black text-base italic">{info.unit}</span>
                </div>
              </div>
              <div className="h-2.5 w-full bg-slate-50 dark:bg-slate-950/50 overflow-hidden">
                <div className="h-full transition-all duration-1000 shadow-[0_0_10px]" style={{ width: '65%', backgroundColor: info.color, boxShadow: `0 0 12px ${info.color}90` }}></div>
              </div>
            </div>
          );
        }) : (
          <div className="col-span-full py-20 bg-slate-50 dark:bg-slate-900/20 rounded-[3rem] border border-dashed border-slate-200 dark:border-slate-800 flex flex-col items-center">
             <Activity size={48} className="text-slate-200 dark:text-slate-800 mb-4" />
             <p className="text-slate-400 dark:text-slate-600 font-bold italic text-lg">Aucune donnée télémétrique disponible pour cet appareil.</p>
          </div>
        )}
      </div>
        </>
      )}
    </DashboardLayout>
  );
};

const VerticalDetail = ({ label, value, status, icon }) => (
  <div className="flex items-start space-x-4">
     <div className="p-2.5 bg-slate-50 dark:bg-slate-950/50 border border-slate-100 dark:border-slate-800 rounded-xl text-slate-400 dark:text-slate-500">
        {icon || <Server size={16} />}
     </div>
     <div className="space-y-0.5">
        <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">{label}</p>
        <p className={`text-sm font-black tracking-tight ${
           status === true ? 'text-emerald-500' : status === false ? 'text-rose-500' : 'text-slate-900 dark:text-slate-100'
        }`}>
           {value}
        </p>
     </div>
  </div>
);

export default Monitoring;
