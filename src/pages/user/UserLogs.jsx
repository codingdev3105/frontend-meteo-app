import React, { useState, useEffect } from 'react';
import { api } from '../../api';
import { 
  Database, Search, Filter, Calendar, 
  Clock, ShieldAlert, Zap, Radio, 
  Info, AlertTriangle, Bug, ArrowRight
} from 'lucide-react';
import '../../styles/Dashboard.css';

const UserLogs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState('ALL');
  const [filterDate, setFilterDate] = useState('');
  const [availableTypes, setAvailableTypes] = useState([]);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const data = await api.getSystemLogs(filterType, filterDate);
      setLogs(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchTypes = async () => {
      try {
        const types = await api.getLogTypes();
        setAvailableTypes(types);
      } catch (err) {
        console.error(err);
      }
    };
    fetchTypes();
  }, []);

  useEffect(() => {
    fetchLogs();
  }, [filterType, filterDate]);

  const getLogIcon = (event, type) => {
    if (event === 'STATION_CONNECTED') return <Zap size={18} color="#0070f3" />;
    if (event === 'STATION_OFFLINE') return <Radio size={18} color="#ef4444" className="animate-pulse" />;
    if (type === 'CRITICAL') return <ShieldAlert size={18} color="#ef4444" />;
    if (type === 'WARNING') return <AlertTriangle size={18} color="#f59e0b" />;
    return <Info size={18} color="#64748b" />;
  };

  const getTypeStyle = (type) => {
    switch (type) {
      case 'CRITICAL': return { bg: '#fee2e2', text: '#ef4444', label: 'CRITIQUE' };
      case 'WARNING': return { bg: '#fef3c7', text: '#d97706', label: 'ATTENTION' };
      case 'STATION': return { bg: '#eff6ff', text: '#2563eb', label: 'STATION' };
      case 'AUTH': return { bg: '#f5f3ff', text: '#7c3aed', label: 'SÉCURITÉ' };
      default: return { bg: '#f1f5f9', text: '#475569', label: 'INFO' };
    }
  };

  return (
    <div className="animate-up">
      <header className="premium-header">
        <div className="premium-title-group">
          <h1 style={{ fontSize: '2rem', fontWeight: '900', letterSpacing: '-1px' }}>Journal du Système</h1>
          <div className="premium-subtitle">
            <span className="premium-accent-dot"></span>
            <span>Historique complet des événements techniques et de sécurité.</span>
          </div>
        </div>
      </header>

      {/* FILTRES BAR */}
      <div className="db-header-actions db-card" style={{ 
        padding: '1.5rem 2rem', borderRadius: '25px', marginBottom: '2rem', 
        background: '#fff', border: '1px solid #f1f5f9',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1.5rem'
      }}>
        
        {/* LEFT: TYPE FILTER */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Filter size={18} color="#94a3b8" />
            <span style={{ fontSize: '0.8rem', fontWeight: '950', color: '#1e293b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Type :</span>
          </div>
          <select 
            value={filterType} 
            onChange={(e) => setFilterType(e.target.value)}
            style={{ 
              padding: '12px 25px', borderRadius: '15px', border: '1px solid #e2e8f0',
              background: '#f8fafc', fontWeight: '800', fontSize: '0.9rem', outline: 'none',
              cursor: 'pointer', minWidth: '180px'
            }}
          >
            <option value="ALL">Tous les types</option>
            {availableTypes.map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
        </div>

        {/* RIGHT: DATE FILTER & COUNT */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '2rem', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
             <span style={{ fontSize: '0.8rem', fontWeight: '950', color: '#1e293b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Date :</span>
             <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
               <Calendar size={18} color="#94a3b8" style={{ position: 'absolute', left: '15px' }} />
               <input 
                type="date" 
                value={filterDate}
                onChange={(e) => setFilterDate(e.target.value)}
                style={{ 
                  padding: '12px 20px 12px 45px', borderRadius: '15px', border: '1px solid #e2e8f0',
                  background: '#f8fafc', fontWeight: '800', fontSize: '0.9rem', outline: 'none',
                  fontFamily: 'inherit', cursor: 'pointer'
                }}
               />
               {filterDate && (
                 <button 
                  onClick={() => setFilterDate('')}
                  style={{ marginLeft: '10px', background: '#fee2e2', border: 'none', color: '#ef4444', padding: '6px 12px', borderRadius: '8px', fontSize: '0.75rem', fontWeight: '800', cursor: 'pointer' }}
                 >
                   Effacer
                 </button>
               )}
             </div>
          </div>

          <div style={{ padding: '8px 15px', background: '#f1f5f9', borderRadius: '12px', color: '#475569', fontSize: '0.8rem', fontWeight: '800' }}>
            {logs.length} événements
          </div>
        </div>

      </div>

      {/* LOGS TABLE / LIST */}
      <div className="db-card" style={{ borderRadius: '35px', padding: '1rem' }}>
        <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
          <table className="premium-table" style={{ minWidth: '800px' }}>
            <thead>
              <tr>
                <th style={{ width: '220px' }}>DATE & HEURE</th>
                <th style={{ width: '250px' }}>TYPE & ÉVÉNEMENT</th>
                <th>DÉTAILS DU MESSAGE</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="3" style={{ padding: '100px', textAlign: 'center' }}>
                    <Database className="animate-spin" size={30} color="#0070f3" style={{ opacity: 0.3 }} />
                  </td>
                </tr>
              ) : logs.length > 0 ? logs.map((log) => {
                const style = getTypeStyle(log.type);
                return (
                  <tr key={log._id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Clock size={14} color="#94a3b8" />
                        <span style={{ fontSize: '0.9rem', fontWeight: '800', color: '#1e293b' }}>
                          {new Date(log.createdAt).toLocaleString()}
                        </span>
                      </div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ 
                          width: '32px', height: '32px', borderRadius: '10px', 
                          background: style.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 
                        }}>
                          {getLogIcon(log.event, log.type)}
                        </div>
                        <div>
                          <div style={{ 
                            padding: '2px 8px', borderRadius: '6px', fontSize: '0.6rem', fontWeight: '950',
                            background: style.bg, color: style.text, width: 'fit-content', marginBottom: '4px'
                          }}>
                            {style.label}
                          </div>
                          <div style={{ fontSize: '0.85rem', fontWeight: '700', color: '#475569' }}>{log.event}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div style={{ fontSize: '1rem', color: '#1e293b', fontWeight: '600', lineHeight: '1.4' }}>
                        {log.message}
                      </div>
                    </td>
                  </tr>
                );
              }) : (
                <tr>
                  <td colSpan="3" style={{ textAlign: 'center', padding: '4rem', color: '#94a3b8' }}>
                    Aucun événement trouvé.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default UserLogs;
