import React, { useEffect, useState, useMemo } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import { api, sensorLibrary } from '../../api/api';
import { 
  Calendar, 
  Download, 
  Filter, 
  LineChart as ChartIcon, 
  Search, 
  ChevronRight, 
  Clock, 
  Database,
  Cpu,
  Zap,
  RotateCcw,
  Activity,
  ArrowUp,
  ArrowDown,
  Info
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';
import { useToast } from '../../components/ui/Toast';

const History = () => {
  const [stations, setStations] = useState([]);
  const [historyData, setHistoryData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const { addToast } = useToast();

  // Filter State
  const [filters, setFilters] = useState({
    station: null,
    nodeId: 'HUB',
    timeType: '24h', // 'hour', 'day', 'month', 'year'
    subValue: 'all',  // e.g., specific hour number or 'all' for average
  });

  const [tempFilters, setTempFilters] = useState({ ...filters });

  useEffect(() => {
    const init = async () => {
      try {
        const res = await api.getStations();
        const userStations = Array.isArray(res) ? res : (res?.stations || []);
        setStations(userStations);
        
        if (userStations.length > 0) {
          const firstStation = userStations[0];
          setFilters(prev => ({ ...prev, station: firstStation }));
          setTempFilters(prev => ({ ...prev, station: firstStation }));
          fetchHistory(firstStation.hardwareId, 'day');
        } else {
          setLoading(false);
        }
      } catch (err) {
        setLoading(false);
      }
    };
    init();
  }, []);

  const fetchHistory = async (hwId, timeType) => {
    setLoading(true);
    try {
      let days = 1;
      if (timeType === 'month') days = 30;
      if (timeType === 'year') days = 365;
      if (timeType === 'hour') days = 0.05; // ~1 hour
      
      const res = await api.getHistory(hwId, days);
      setHistoryData(res || []);
    } catch (err) {
      addToast("Erreur de récupération", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleFilterApply = () => {
    setFilters({ ...tempFilters });
    if (tempFilters.station) {
      fetchHistory(tempFilters.station.hardwareId, tempFilters.timeType);
    }
    setShowFilterModal(false);
  };

  // Logic for aggregating data (averages)
  const aggregatedPoints = useMemo(() => {
    if (!historyData.length) return [];

    const getSource = (measure) => {
      if (filters.nodeId === 'HUB') return measure.stationData || {};
      const node = (measure.sensorNodesData || []).find(n => n.nodeId === filters.nodeId);
      return node?.sensors || {};
    };

    // Filter by specific sub-value if needed
    let filtered = historyData;
    const date = new Date();
    
    if (filters.timeType === 'hour') {
      const oneHourAgo = new Date(date.getTime() - (60 * 60 * 1000));
      filtered = historyData.filter(m => new Date(m.createdAt) >= oneHourAgo);
    }

    if (filters.subValue !== 'all') {
       // Filter by specific hour, day, etc.
       filtered = historyData.filter(m => {
          const d = new Date(m.createdAt);
          if (filters.timeType === 'day') return d.getHours() === parseInt(filters.subValue);
          if (filters.timeType === 'month') return d.getDate() === parseInt(filters.subValue);
          if (filters.timeType === 'year') return d.getMonth() === parseInt(filters.subValue);
          return true;
       });
    }

    // If subValue is 'all', we might need aggregation (Averages)
    if (filters.subValue === 'all' && filters.timeType !== 'hour') {
       const groups = {};
       filtered.forEach(m => {
          const d = new Date(m.createdAt);
          let groupKey = '';
          if (filters.timeType === 'day') groupKey = `${d.getHours()}h`;
          if (filters.timeType === 'month') groupKey = `Jour ${d.getDate()}`;
          if (filters.timeType === 'year') groupKey = d.toLocaleString('default', { month: 'short' });

          if (!groups[groupKey]) groups[groupKey] = { label: groupKey, count: 0, sensors: {} };
          
          const source = getSource(m);
          Object.entries(source).forEach(([abbr, val]) => {
             const k = abbr.toLowerCase();
             const v = parseFloat(val);
             if (!isNaN(v)) {
                groups[groupKey].sensors[k] = (groups[groupKey].sensors[k] || 0) + v;
                groups[groupKey].count_sensor = (groups[groupKey].count_sensor || {});
                groups[groupKey].count_sensor[k] = (groups[groupKey].count_sensor[k] || 0) + 1;
             }
          });
          groups[groupKey].count++;
          groups[groupKey].fullDate = groupKey;
       });

       return Object.values(groups).map(g => {
          const point = { time: g.label, fullDate: g.label };
          Object.entries(g.sensors).forEach(([k, sum]) => {
             point[k] = parseFloat((sum / g.count_sensor[k]).toFixed(1));
          });
          return point;
       });
    }

    // Default: Return raw points
    return filtered.map(m => {
      const d = new Date(m.createdAt);
      const point = { 
        time: d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        fullDate: d.toLocaleString(),
        rawDate: m.createdAt
      };
      const source = getSource(m);
      Object.entries(source).forEach(([abbr, val]) => {
        const k = abbr.toLowerCase();
        const v = parseFloat(val);
        if (!isNaN(v)) point[k] = v;
      });
      return point;
    });
  }, [historyData, filters]);

  const chartKeys = useMemo(() => {
    const keys = new Set();
    aggregatedPoints.forEach(p => {
      Object.keys(p).forEach(k => {
        if (k !== 'time' && k !== 'fullDate' && k !== 'rawDate') keys.add(k);
      });
    });
    return Array.from(keys);
  }, [aggregatedPoints]);

  const getSensorMeta = (abbr) => {
    return sensorLibrary[abbr] || { name: abbr.toUpperCase(), unit: '', color: '#64748b', icon: 'Activity' };
  };

  return (
    <DashboardLayout title="Historiques & Analyses">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-10">
        <div className="flex items-center space-x-6">
           <div className="p-4 bg-primary/10 rounded-2xl">
              <ChartIcon className="text-primary" size={28} />
           </div>
           <div>
              <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Analyse Temporelle</h1>
              <p className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-widest mt-1 flex items-center">
                 <Database size={12} className="mr-2" />
                 {filters.station?.name || '---'} — {filters.nodeId === 'HUB' ? 'Hub Central' : `Nœud ${filters.nodeId}`}
              </p>
           </div>
        </div>

        <div className="flex items-center space-x-3 w-full lg:w-auto">
          {/* Node Selector (Extracted from modal) */}
          <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-2xl border border-slate-200 dark:border-slate-700">
             <button 
                onClick={() => setFilters({...filters, nodeId: 'HUB'})}
                className={`px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                  filters.nodeId === 'HUB' ? 'bg-white dark:bg-slate-700 text-primary shadow-sm' : 'text-slate-500'
                }`}
             >
                Hub Central
             </button>
             {filters.station?.sensorNodes?.map(nodeId => (
                <button 
                  key={nodeId}
                  onClick={() => setFilters({...filters, nodeId})}
                  className={`px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                    filters.nodeId === nodeId ? 'bg-white dark:bg-slate-700 text-primary shadow-sm' : 'text-slate-500'
                  }`}
                >
                  Nœud {nodeId}
                </button>
             ))}
          </div>

          <button 
            onClick={() => setShowFilterModal(true)}
            className="flex items-center space-x-3 px-6 py-3.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl hover:border-primary transition-all shadow-xl shadow-slate-200/50 dark:shadow-none"
          >
            <Filter size={18} className="text-primary" />
            <span className="text-xs font-black text-slate-700 dark:text-slate-200 uppercase tracking-widest">Filtrer</span>
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-40 space-y-4">
           <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
           <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Calcul des agrégats...</p>
        </div>
      ) : chartKeys.length > 0 ? (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 mb-10">
          {chartKeys.map(abbr => {
            const meta = getSensorMeta(abbr);
            const values = aggregatedPoints.map(p => p[abbr]).filter(v => v !== undefined);
            const avg = (values.reduce((a, b) => a + b, 0) / values.length).toFixed(1);
            
            return (
              <Card key={abbr} noPadding className="overflow-hidden border-slate-200 dark:border-slate-800 shadow-2xl shadow-slate-100/50 dark:shadow-none bg-white dark:bg-slate-900/40 group">
                <div className="p-8 pb-0">
                   <div className="flex justify-between items-start mb-6">
                      <div className="flex items-center space-x-4">
                         <div className="p-3 rounded-xl transition-transform group-hover:scale-110 duration-500" style={{ backgroundColor: `${meta.color}15`, color: meta.color }}>
                            <Activity size={24} />
                         </div>
                         <div>
                            <h3 className="font-black text-slate-900 dark:text-white text-lg tracking-tight leading-none">{meta.name}</h3>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">
                               {filters.subValue === 'all' ? `Moyenne : ${avg} ${meta.unit}` : `Données Live`}
                            </p>
                         </div>
                      </div>
                   </div>
                </div>

                <div className="h-80 w-full pr-4 pb-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={aggregatedPoints}>
                      <defs>
                        <linearGradient id={`grad-${abbr}`} x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor={meta.color} stopOpacity={0.3}/>
                          <stop offset="95%" stopColor={meta.color} stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(148, 163, 184, 0.1)" />
                      <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 'bold'}} />
                      <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 'bold'}} unit={meta.unit} />
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#0f172a', borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.3)', padding: '12px' }}
                        itemStyle={{ color: '#fff', fontSize: '12px', fontWeight: 'bold' }}
                        labelStyle={{ color: '#64748b', fontSize: '10px', marginBottom: '4px', textTransform: 'uppercase' }}
                      />
                      <Area type="monotone" dataKey={abbr} stroke={meta.color} strokeWidth={4} fillOpacity={1} fill={`url(#grad-${abbr})`} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </Card>
            );
          })}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-40 text-center">
           <div className="w-24 h-24 bg-slate-50 dark:bg-slate-900/50 rounded-full flex items-center justify-center mb-8">
              <Info size={48} className="text-slate-300 dark:text-slate-700" />
           </div>
           <h3 className="text-xl font-black text-slate-900 dark:text-white mb-2">Aucune donnée trouvée</h3>
           <Button className="mt-8" onClick={() => setShowFilterModal(true)}>Ajuster les filtres</Button>
        </div>
      )}

      {/* Filter Modal */}
      <Modal isOpen={showFilterModal} onClose={() => setShowFilterModal(false)} title="Filtrer l'Analyse" showFooter={false}>
        <div className="space-y-8">
          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 ml-1">Station</label>
            <div className="grid grid-cols-1 gap-2">
              {stations.map(s => (
                <button 
                  key={s.hardwareId}
                  onClick={() => setTempFilters({...tempFilters, station: s})}
                  className={`flex items-center justify-between p-4 rounded-2xl border transition-all ${
                    tempFilters.station?.hardwareId === s.hardwareId ? 'bg-primary border-primary text-white' : 'bg-slate-50 dark:bg-slate-800 border-slate-100 dark:border-slate-700 text-slate-600'
                  }`}
                >
                  <span className="font-bold">{s.name}</span>
                  <ChevronRight size={16} />
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 ml-1">Niveau d'Analyse</label>
            <div className="grid grid-cols-2 gap-3">
              {[
                { id: 'hour', label: 'Dernière Heure' },
                { id: 'day', label: 'Dernier Jour' },
                { id: 'month', label: 'Dernier Mois' },
                { id: 'year', label: 'Dernière Année' }
              ].map(t => (
                <button 
                  key={t.id}
                  onClick={() => setTempFilters({...tempFilters, timeType: t.id, subValue: 'all'})}
                  className={`py-3 rounded-xl border text-[10px] font-black uppercase tracking-widest transition-all ${
                    tempFilters.timeType === t.id ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 border-slate-900 dark:border-white' : 'bg-slate-50 dark:bg-slate-800 border-slate-100 dark:border-slate-700 text-slate-500'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {tempFilters.timeType !== 'hour' && (
            <div className="animate-fade-in">
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 ml-1">Précision</label>
              <select 
                value={tempFilters.subValue}
                onChange={(e) => setTempFilters({...tempFilters, subValue: e.target.value})}
                className="w-full p-4 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl text-xs font-bold text-slate-600 dark:text-slate-300 outline-none focus:border-primary"
              >
                <option value="all">Moyenne Globale ({tempFilters.timeType})</option>
                {tempFilters.timeType === 'day' && Array.from({length: 24}).map((_, i) => <option key={i} value={i}>{i}h:00</option>)}
                {tempFilters.timeType === 'month' && Array.from({length: 30}).map((_, i) => <option key={i+1} value={i+1}>Jour {i+1}</option>)}
                {tempFilters.timeType === 'year' && ['Jan', 'Fev', 'Mar', 'Avr', 'Mai', 'Jun', 'Jul', 'Aou', 'Sep', 'Oct', 'Nov', 'Dec'].map((m, i) => <option key={i} value={i}>{m}</option>)}
              </select>
            </div>
          )}

          <div className="pt-4 flex space-x-4">
             <Button variant="secondary" className="flex-1 py-4" onClick={() => setShowFilterModal(false)}>Annuler</Button>
             <Button className="flex-[2] py-4 shadow-xl shadow-primary/20" onClick={handleFilterApply}>Générer l'Analyse</Button>
          </div>
        </div>
      </Modal>
    </DashboardLayout>
  );
};

export default History;
