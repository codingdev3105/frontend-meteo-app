import React, { useEffect, useState } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Card from '../../components/ui/Card';
import { api } from '../../api/api';
import { 
  Users, 
  Database, 
  Activity,
  Cpu,
  Thermometer
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const s = await api.getAdminStats();
        setStats(s);
      } catch (err) {
        console.error("Error fetching admin data:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <DashboardLayout title="Administration Système" isAdmin={true}>
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 space-y-6">
          <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
          <p className="text-slate-900 dark:text-white text-[10px] font-black uppercase tracking-[0.3em] animate-pulse">Synchronisation du Panel...</p>
        </div>
      ) : stats ? (
        <>
          {/* Top Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
            {[
              { label: 'Utilisateurs', value: stats.totalUsers, icon: <Users />, color: 'bg-indigo-600', shadow: 'shadow-indigo-500/20' },
              { label: 'Stations Hub', value: stats.activeStations, icon: <Database />, color: 'bg-cyan-600', shadow: 'shadow-cyan-500/20' },
              { label: 'Nœuds Capteurs', value: stats.nodes, icon: <Cpu />, color: 'bg-emerald-600', shadow: 'shadow-emerald-500/20' },
              { label: 'Total Capteurs', value: stats.totalSensors, icon: <Thermometer />, color: 'bg-rose-600', shadow: 'shadow-rose-500/20' },
            ].map((item, i) => (
              <div key={i} className="bg-white dark:bg-slate-900/40 p-8 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-xl shadow-slate-100/40 dark:shadow-none group transition-all duration-500 hover:border-primary/30">
                <div className="flex items-center space-x-5">
                  <div className={`${item.color} p-4 rounded-2xl text-white shadow-2xl ${item.shadow} group-hover:scale-110 transition-transform duration-500`}>
                    {item.icon}
                  </div>
                  <div>
                    <p className="text-slate-400 dark:text-slate-500 text-[10px] font-black uppercase tracking-widest mb-1">{item.label}</p>
                    <h3 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">{item.value}</h3>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-10">
            {/* Throughput Chart */}
            <Card title="Débit de Données (24h)" className="lg:col-span-2 shadow-xl shadow-slate-100/40 dark:shadow-none border-slate-200 dark:border-slate-800">
              <div className="h-80 w-full mt-6">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={stats.throughput}>
                    <defs>
                      <linearGradient id="colorPulse" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(148, 163, 184, 0.1)" />
                    <XAxis 
                      dataKey="time" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 'bold'}} 
                    />
                    <YAxis 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 'bold'}} 
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#0f172a', 
                        borderRadius: '16px', 
                        border: 'none', 
                        boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.3)',
                        padding: '12px'
                      }}
                      itemStyle={{ color: '#fff', fontSize: '12px', fontWeight: 'bold' }}
                      labelStyle={{ color: '#64748b', fontSize: '10px', textTransform: 'uppercase', marginBottom: '4px' }}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="value" 
                      stroke="#10b981" 
                      strokeWidth={4} 
                      fill="url(#colorPulse)" 
                      animationDuration={2000}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </Card>

            {/* Services Status */}
            <Card title="État des Services" className="shadow-xl shadow-slate-100/40 dark:shadow-none border-slate-200 dark:border-slate-800">
              <div className="space-y-4 mt-6">
                {stats.services.map((s, i) => (
                  <div key={i} className="flex justify-between items-center p-5 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-100 dark:border-slate-800 hover:border-primary/20 transition-all duration-300 group">
                    <div className="flex items-center space-x-4">
                      <div className={`w-3 h-3 rounded-full relative ${
                        s.status === 'Online' 
                          ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' 
                          : 'bg-slate-300 dark:bg-slate-700'
                      }`}>
                        {s.status === 'Online' && <span className="absolute inset-0 rounded-full bg-emerald-500 animate-ping opacity-40"></span>}
                      </div>
                      <span className="text-[11px] font-black text-slate-700 dark:text-slate-200 uppercase tracking-widest">{s.name}</span>
                    </div>
                    <span className="text-xs font-black text-primary bg-primary/10 px-3 py-1.5 rounded-lg group-hover:bg-primary group-hover:text-white transition-all duration-300">
                       {s.latency || s.storageSize}
                    </span>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </>
      ) : (
        <div className="p-20 text-center">
           <div className="w-20 h-20 bg-rose-50 dark:bg-rose-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <Activity className="text-rose-500" size={40} />
           </div>
           <h3 className="text-xl font-black text-slate-900 dark:text-white mb-2">Données indisponibles</h3>
           <p className="text-slate-500 font-bold italic">Veuillez vérifier la connexion avec le serveur.</p>
        </div>
      )}
    </DashboardLayout>
  );
};

export default AdminDashboard;
