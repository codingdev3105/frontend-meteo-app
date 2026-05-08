import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { api } from '../../api/api';
import { 
  LayoutDashboard, 
  Radio, 
  LineChart, 
  History, 
  Bell, 
  FileText, 
  LogOut,
  Users,
  CloudRain,
  Menu,
  X,
  ChevronRight
} from 'lucide-react';

const Sidebar = ({ isAdmin = false, collapsed, setCollapsed, onClose }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    api.logout();
    navigate('/login');
  };

  const userLinks = [
    { to: '/user/dashboard', icon: <LayoutDashboard size={22} />, label: 'Tableau de bord' },
    { to: '/user/stations', icon: <Radio size={22} />, label: 'Stations Météo' },
    { to: '/user/history', icon: <History size={22} />, label: 'Historiques' },
    { to: '/user/alerts', icon: <Bell size={22} />, label: 'Alertes' },
    { to: '/user/logs', icon: <FileText size={22} />, label: 'Logs Système' },
  ];

  const adminLinks = [
    { to: '/admin/dashboard', icon: <LayoutDashboard size={22} />, label: 'Tableau de bord' },
    { to: '/admin/users', icon: <Users size={22} />, label: 'Utilisateurs' },
    { to: '/admin/stations', icon: <Radio size={22} />, label: 'Stations Météo' },
    { to: '/admin/docs', icon: <FileText size={22} />, label: 'Documentation' },
  ];

  const links = isAdmin ? adminLinks : userLinks;

  return (
    <aside className={`bg-white dark:bg-[#020617] border-r border-slate-100 dark:border-slate-800 h-screen flex flex-col transition-all duration-500 relative z-[100] ${collapsed ? 'w-24' : 'w-72'}`}>
      {/* Header */}
      <div className="p-6 flex items-center justify-between border-b border-slate-50 dark:border-slate-900/50">
        <div className="flex items-center space-x-3">
          {collapsed ? (
            <button 
              onClick={() => setCollapsed(false)}
              className="bg-primary p-2 rounded-xl text-white shadow-lg shadow-primary/20"
            >
              <ChevronRight size={24} />
            </button>
          ) : (
            <>
              <div className="bg-primary p-2 rounded-xl shadow-lg shadow-primary/20">
                <CloudRain className="text-white" size={24} />
              </div>
              <span className="text-xl font-black text-slate-900 dark:text-white tracking-tight">
                MétéoPro <span className="text-primary italic">Panel</span>
              </span>
            </>
          )}
        </div>
        {!collapsed && (
          <button 
            onClick={() => setCollapsed(true)}
            className="text-slate-400 hover:text-primary lg:block hidden transition-colors"
          >
            <Menu size={24} />
          </button>
        )}
        <button onClick={onClose} className="lg:hidden text-slate-400">
          <X size={24} />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-grow px-4 mt-8 space-y-2 overflow-y-auto custom-scrollbar">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            className={({ isActive }) => 
              `flex items-center rounded-xl transition-all duration-300 ${collapsed ? 'justify-center p-4' : 'px-6 py-4 space-x-4'} ${
                isActive 
                  ? 'bg-blue-50 dark:bg-primary/10 text-primary font-black shadow-sm dark:shadow-none border border-transparent dark:border-primary/20' 
                  : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-900/50 hover:text-slate-900 dark:hover:text-white font-bold'
              }`
            }
          >
            <div className={`${collapsed ? '' : 'shrink-0'}`}>
              {link.icon}
            </div>
            {!collapsed && <span className="text-[15px]">{link.label}</span>}
          </NavLink>
        ))}
      </nav>

      {/* Footer / Logout */}
      <div className="p-6 border-t border-slate-100 dark:border-slate-800">
        <button 
          onClick={handleLogout}
          className={`flex items-center rounded-xl bg-red-50 dark:bg-red-500/10 border-2 border-red-100 dark:border-red-500/20 hover:border-red-500 text-red-600 dark:text-red-400 font-black transition-all duration-300 ${collapsed ? 'justify-center p-3' : 'px-4 py-2 space-x-3 w-full'}`}
        >
          <LogOut size={18} />
          {!collapsed && <span className="text-[12px] font-black uppercase tracking-widest">Déconnexion</span>}
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
