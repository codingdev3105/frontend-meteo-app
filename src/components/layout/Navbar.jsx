import React from 'react';
import { Bell, Search, User, Menu, Sun, Moon } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';

const Navbar = ({ title, onMenuClick }) => {
  const { isDarkMode, toggleDarkMode } = useTheme();
  const user = JSON.parse(localStorage.getItem('user') || '{"username": "Utilisateur", "email": ""}');
  
  return (
    <header className="h-20 bg-white dark:bg-[#020617] border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-8 sticky top-0 z-40 transition-colors duration-500">
      <div className="flex items-center space-x-4">
        <button onClick={onMenuClick} className="lg:hidden text-slate-500 dark:text-slate-400 hover:text-primary">
          <Menu size={24} />
        </button>
        <h2 className="text-xl font-black text-slate-800 dark:text-white tracking-tight">{title}</h2>
      </div>

      <div className="flex items-center space-x-6">
        <div className="hidden md:flex items-center bg-slate-50 dark:bg-slate-900 px-4 py-2.5 rounded-2xl w-80 border border-slate-100 dark:border-slate-800 focus-within:ring-2 ring-primary/20 transition-all">
          <Search size={18} className="text-slate-400" />
          <input 
            type="text" 
            placeholder="Rechercher dans le système..." 
            className="bg-transparent border-none focus:ring-0 text-sm ml-2 w-full outline-none text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-600 font-bold"
          />
        </div>

        <div className="flex items-center space-x-2 md:space-x-4">
          <button 
            onClick={toggleDarkMode}
            className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 text-slate-500 dark:text-slate-400 hover:text-primary transition-all border border-transparent dark:border-slate-800"
            aria-label="Toggle theme"
          >
            {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
          </button>

          <button className="relative p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 text-slate-500 dark:text-slate-400 hover:text-primary transition-all border border-transparent dark:border-slate-800">
            <Bell size={20} />
            <span className="absolute top-2 right-2 w-2 h-2 bg-rose-500 rounded-full border-2 border-white dark:border-[#020617]"></span>
          </button>
          
          <div className="w-px h-8 bg-slate-200 dark:bg-slate-800 mx-2 hidden sm:block"></div>

          <div 
            onClick={() => window.location.href = user.role === 'admin' ? '/admin/profile' : '/user/profile'}
            className="flex items-center space-x-3 cursor-pointer group"
          >
            <div className="text-right hidden sm:block">
              <p className="text-sm font-black text-slate-900 dark:text-white leading-none capitalize group-hover:text-primary transition-colors">{user.username}</p>
              <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mt-1">
                {user.role === 'admin' ? 'Administrateur' : 'Utilisateur'}
              </p>
            </div>
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center border-2 border-emerald-100 dark:border-emerald-500/20 group-hover:border-primary transition-all shadow-sm">
              <User size={20} className="text-emerald-600 dark:text-emerald-400" />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
