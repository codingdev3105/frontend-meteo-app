import React, { useEffect, useState } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import { api } from '../../api/api';
import Modal from '../../components/ui/Modal';
import { 
  Terminal, 
  Search, 
  Clock, 
  Shield, 
  Activity, 
  Cpu, 
  Filter,
  CheckCircle2,
  AlertCircle,
  Info,
  Calendar,
  RotateCcw,
  X
} from 'lucide-react';

const Logs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [filters, setFilters] = useState({
    type: 'ALL',
    startDate: '',
    endDate: ''
  });

  useEffect(() => {
    api.getUserLogs().then(res => {
      setLogs(res || []);
      setLoading(false);
    }).catch(err => {
      console.error(err);
      setLoading(false);
    });
  }, []);

  const filteredLogs = logs.filter(log => {
    const matchesSearch = log.message?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          log.stationId?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = filters.type === 'ALL' || log.type?.toUpperCase() === filters.type;
    
    const logDate = new Date(log.createdAt);
    const matchesStart = !filters.startDate || logDate >= new Date(filters.startDate);
    const matchesEnd = !filters.endDate || logDate <= new Date(filters.endDate + 'T23:59:59');

    return matchesSearch && matchesType && matchesStart && matchesEnd;
  });

  const resetFilters = () => {
    setFilters({ type: 'ALL', startDate: '', endDate: '' });
    setSearchTerm('');
  };

  const getTypeStyle = (type) => {
    switch (type?.toUpperCase()) {
      case 'CRITICAL': return 'bg-rose-500/10 text-rose-500 border-rose-500/20';
      case 'WARNING': return 'bg-amber-500/10 text-amber-500 border-amber-500/20';
      case 'SUCCESS': return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';
      default: return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
    }
  };

  const getTypeIcon = (type) => {
    switch (type?.toUpperCase()) {
      case 'CRITICAL': return <AlertCircle size={14} />;
      case 'SUCCESS': return <CheckCircle2 size={14} />;
      default: return <Info size={14} />;
    }
  };

  return (
    <DashboardLayout title="Journal Système">
      {/* Header Info */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
        <div>
           <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Historique technique des événements de vos stations.</p>
        </div>
        <div className="flex items-center space-x-3 bg-white dark:bg-slate-900 px-4 py-2 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm">
           <Activity size={16} className="text-emerald-500 animate-pulse" />
           <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Temps Réel Actif</span>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <div className="relative flex-grow group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors" size={20} />
          <input 
            type="text" 
            placeholder="Rechercher une station, un événement..." 
            className="w-full pl-12 pr-4 py-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl focus:ring-4 focus:ring-primary/10 outline-none transition-all dark:text-white"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <button 
          onClick={() => setShowFilterModal(true)}
          className={`px-6 py-4 bg-white dark:bg-slate-900 border rounded-2xl transition-all flex items-center justify-center ${
            filters.type !== 'ALL' || filters.startDate || filters.endDate
            ? 'border-primary text-primary bg-primary/5'
            : 'border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 hover:text-primary'
          }`}
        >
          <Filter size={20} className="mr-2" />
          <span className="text-sm font-bold">Filtres</span>
          {(filters.type !== 'ALL' || filters.startDate || filters.endDate) && (
            <span className="ml-2 w-2 h-2 bg-primary rounded-full animate-pulse"></span>
          )}
        </button>
      </div>

      {(filters.type !== 'ALL' || filters.startDate || filters.endDate || searchTerm) && (
        <div className="flex items-center space-x-3 mb-6">
           <button 
            onClick={resetFilters}
            className="flex items-center space-x-2 px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 rounded-xl text-xs font-black uppercase tracking-widest hover:text-rose-500 transition-colors"
           >
              <RotateCcw size={14} />
              <span>Réinitialiser</span>
           </button>
           <div className="h-4 w-px bg-slate-200 dark:bg-slate-800"></div>
           <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
             {filteredLogs.length} résultats trouvés
           </span>
        </div>
      )}

      <Card noPadding className="overflow-hidden border-slate-200 dark:border-slate-800 shadow-2xl shadow-slate-200/50 dark:shadow-none bg-white dark:bg-slate-900/40">
        <div className="bg-slate-900 dark:bg-black p-4 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center space-x-3">
             <div className="flex space-x-1.5">
                <div className="w-3 h-3 rounded-full bg-rose-500/50"></div>
                <div className="w-3 h-3 rounded-full bg-amber-500/50"></div>
                <div className="w-3 h-3 rounded-full bg-emerald-500/50"></div>
             </div>
             <div className="w-px h-4 bg-slate-800 mx-2"></div>
             <Terminal size={18} className="text-slate-500" />
             <span className="text-[10px] font-mono text-slate-500 uppercase tracking-[0.2em] font-black">meteo_pro_kernel.log</span>
          </div>
          <span className="text-[9px] font-mono text-slate-600 uppercase tracking-widest">{filteredLogs.length} Entrées</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50/50 dark:bg-slate-900/80 text-slate-500 dark:text-slate-400 text-[10px] uppercase font-black tracking-widest border-b border-slate-100 dark:border-slate-800">
              <tr>
                <th className="px-8 py-5">Type</th>
                <th className="px-8 py-5">Message / Événement</th>
                <th className="px-8 py-5">Source</th>
                <th className="px-8 py-5 text-right">Horodatage</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50 bg-white dark:bg-transparent">
              {loading ? (
                <tr>
                  <td colSpan="4" className="px-8 py-20 text-center text-slate-400 animate-pulse font-mono text-sm">
                    Chargement du journal...
                  </td>
                </tr>
              ) : filteredLogs.length > 0 ? (
                filteredLogs.map(log => (
                  <tr key={log._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors group">
                    <td className="px-8 py-5">
                      <div className={`inline-flex items-center space-x-2 px-3 py-1 rounded-lg border text-[10px] font-black uppercase tracking-tighter ${getTypeStyle(log.type)}`}>
                        {getTypeIcon(log.type)}
                        <span>{log.type}</span>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <p className="text-sm font-bold text-slate-700 dark:text-slate-300 line-clamp-1 group-hover:text-primary transition-colors">
                        {log.message}
                      </p>
                    </td>
                    <td className="px-8 py-5">
                      <div className="flex items-center space-x-2 text-slate-500 dark:text-slate-400">
                        <Cpu size={14} className="opacity-50" />
                        <span className="text-xs font-mono font-bold tracking-tight">{log.stationId || 'SYSTEM'}</span>
                      </div>
                    </td>
                    <td className="px-8 py-5 text-right">
                      <div className="flex flex-col items-end">
                        <span className="text-xs font-mono font-bold text-slate-600 dark:text-slate-400">
                          {new Date(log.createdAt).toLocaleTimeString()}
                        </span>
                        <span className="text-[9px] text-slate-400 dark:text-slate-600 font-medium">
                          {new Date(log.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="px-8 py-32 text-center">
                    <Shield size={48} className="mx-auto mb-4 text-slate-200 dark:text-slate-800" />
                    <p className="text-slate-400 dark:text-slate-600 font-bold italic text-sm">Aucun événement ne correspond à votre recherche.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Filter Modal */}
      <Modal
        isOpen={showFilterModal}
        onClose={() => setShowFilterModal(false)}
        showFooter={false}
        title="Filtres Avancés"
      >
        <div className="space-y-6">
          {/* Severity Filter */}
          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Sévérité de l'événement</label>
            <div className="grid grid-cols-2 gap-3">
              {['ALL', 'INFO', 'SUCCESS', 'WARNING', 'CRITICAL'].map(t => (
                <button
                  key={t}
                  onClick={() => setFilters({ ...filters, type: t })}
                  className={`px-4 py-3 rounded-xl border text-xs font-bold transition-all ${
                    filters.type === t 
                      ? 'bg-primary border-primary text-white shadow-lg shadow-primary/20' 
                      : 'bg-slate-50 dark:bg-slate-800 border-slate-100 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:border-primary/50'
                  }`}
                >
                  {t === 'ALL' ? 'Tous les types' : t}
                </button>
              ))}
            </div>
          </div>

          {/* Date Range */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Depuis le</label>
              <div className="relative">
                <Calendar size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <input 
                  type="date"
                  className="w-full pl-12 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-xl text-sm font-bold text-slate-700 dark:text-slate-200 outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                  value={filters.startDate}
                  onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
                />
              </div>
            </div>
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Jusqu'au</label>
              <div className="relative">
                <Calendar size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <input 
                  type="date"
                  className="w-full pl-12 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-xl text-sm font-bold text-slate-700 dark:text-slate-200 outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                  value={filters.endDate}
                  onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
                />
              </div>
            </div>
          </div>

          <div className="pt-4 flex gap-3">
             <Button 
                className="flex-1 rounded-xl py-4 font-black uppercase tracking-widest text-xs"
                onClick={() => setShowFilterModal(false)}
             >
                Appliquer les filtres
             </Button>
             <button 
                onClick={resetFilters}
                className="p-4 bg-slate-100 dark:bg-slate-800 text-slate-500 rounded-xl hover:text-rose-500 transition-colors"
             >
                <RotateCcw size={20} />
             </button>
          </div>
        </div>
      </Modal>
    </DashboardLayout>
  );
};

export default Logs;
