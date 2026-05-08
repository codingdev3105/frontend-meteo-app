import React, { useState, useEffect } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { 
  CloudRain, 
  Menu, 
  X, 
  ChevronRight, 
  Sun, 
  Moon, 
  Mail, 
  ArrowRight,
  Globe,
  Zap,
  Shield,
  Activity,
  MessageSquare
} from 'lucide-react';
import Button from '../ui/Button';
import { useTheme } from '../../contexts/ThemeContext';

const PublicLayout = ({ children }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { isDarkMode, toggleDarkMode } = useTheme();

  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
  }, [isMenuOpen]);

  const navLinks = [
    { to: '/', label: 'Accueil' },
    { to: '/documentation', label: 'Documentation' },
    { to: '/contact', label: 'Contact' },
  ];

  return (
    <div className="bg-white dark:bg-[#020617] min-h-screen flex flex-col relative transition-colors duration-500">
      {/* Navigation Header */}
      <nav className="sticky top-0 z-[999] bg-white/95 dark:bg-[#020617] backdrop-blur-md border-b border-slate-100 dark:border-slate-800 transition-colors duration-500">
        <div className="flex items-center justify-between px-6 py-4 max-w-7xl mx-auto w-full">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2 group">
            <div className="bg-primary p-1.5 rounded-lg shadow-lg shadow-primary/20 group-hover:scale-110 transition-transform duration-300">
              <CloudRain className="text-white" size={24} />
            </div>
            <span className="text-2xl font-black text-slate-900 dark:text-white tracking-tighter">MétéoPro</span>
          </Link>

          {/* Desktop Links */}
          <div className="hidden md:flex items-center space-x-8 font-bold text-slate-600 dark:text-white">
            {navLinks.map(link => (
              <NavLink 
                key={link.to} 
                to={link.to} 
                className={({ isActive }) => 
                  `hover:text-primary transition-all duration-300 relative group ${isActive ? 'text-primary' : ''}`
                }
              >
                {link.label}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-full"></span>
              </NavLink>
            ))}
          </div>

          {/* Desktop Auth & Theme Toggle */}
          <div className="hidden md:flex items-center space-x-4">
            <button 
              onClick={toggleDarkMode}
              className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-white hover:text-primary transition-all duration-300"
              aria-label="Toggle theme"
            >
              {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            <div className="w-px h-6 bg-slate-200 dark:bg-slate-800 mx-2"></div>
            <Link to="/login" className="text-slate-600 dark:text-white font-bold hover:text-primary transition-colors px-4">
              Connexion
            </Link>
            <Link to="/register">
              <Button size="sm" className="rounded-xl px-6">Démarrer</Button>
            </Link>
          </div>

          {/* Mobile Menu Trigger & Theme Toggle */}
          <div className="md:hidden flex items-center space-x-4">
            <button 
              onClick={toggleDarkMode}
              className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-white"
            >
              {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            <button 
              className="p-2 text-slate-600 dark:text-white hover:text-primary transition-colors"
              onClick={() => setIsMenuOpen(true)}
            >
              <Menu size={28} />
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      <div className={`fixed inset-0 bg-white dark:bg-[#020617] z-[1000] md:hidden transition-all duration-500 ease-in-out ${
        isMenuOpen ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-full pointer-events-none'
      }`}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center space-x-2">
            <div className="bg-primary p-1.5 rounded-lg shadow-lg shadow-primary/20">
              <CloudRain className="text-white" size={24} />
            </div>
            <span className="text-2xl font-black text-slate-900 dark:text-white tracking-tighter">MétéoPro</span>
          </div>
          <button 
            onClick={() => setIsMenuOpen(false)}
            className="p-2 text-slate-400 dark:text-white hover:text-primary transition-colors"
          >
            <X size={32} />
          </button>
        </div>

        <div className="p-8 flex flex-col space-y-8 h-[calc(100vh-80px)] overflow-y-auto">
          <div className="space-y-4">
            <p className="text-[10px] font-black text-slate-400 dark:text-white uppercase tracking-[0.2em] ml-1">Navigation</p>
            {navLinks.map(link => (
              <Link 
                key={link.to} 
                to={link.to} 
                onClick={() => setIsMenuOpen(false)}
                className="text-4xl font-black text-slate-800 dark:text-white hover:text-primary flex items-center justify-between group py-2 transition-all hover:translate-x-2"
              >
                {link.label}
                <ChevronRight size={32} className="text-slate-200 dark:text-slate-800 group-hover:text-primary transition-colors" />
              </Link>
            ))}
          </div>

          <div className="pt-10 border-t border-slate-100 dark:border-slate-800 flex flex-col space-y-4 mt-auto pb-10">
            <p className="text-[10px] font-black text-slate-400 dark:text-white uppercase tracking-[0.2em] ml-1">Espace Membre</p>
            <Link to="/login" onClick={() => setIsMenuOpen(false)}>
              <Button variant="secondary" className="w-full py-5 text-xl font-black rounded-2xl">Connexion</Button>
            </Link>
            <Link to="/register" onClick={() => setIsMenuOpen(false)}>
              <Button className="w-full py-5 text-xl font-black rounded-2xl shadow-xl shadow-primary/20">Créer un compte</Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-grow">
        {children}
      </div>

      {/* Footer Refined - Sanitized Icons */}
      <footer className="bg-[#020617] text-white pt-24 pb-12 px-6 relative overflow-hidden transition-colors duration-500">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-[120px] -translate-y-1/2"></div>
        
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-24">
            
            <div className="lg:col-span-4 space-y-8">
              <Link to="/" className="flex items-center space-x-3">
                <div className="bg-primary p-2 rounded-xl">
                  <CloudRain className="text-white" size={28} />
                </div>
                <span className="text-3xl font-black tracking-tighter">MétéoPro</span>
              </Link>
              <p className="text-slate-400 text-lg leading-relaxed font-medium max-w-sm">
                La référence IoT pour la surveillance météorologique professionnelle. Precision, fiabilité et simplicité au service de votre climat.
              </p>
              <div className="flex items-center space-x-4">
                <button className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 hover:text-primary hover:border-primary/50 transition-all duration-300">
                  <X size={18} />
                </button>
                <button className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 hover:text-primary hover:border-primary/50 transition-all duration-300">
                  <Globe size={18} />
                </button>
                <button className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 hover:text-primary hover:border-primary/50 transition-all duration-300">
                  <Zap size={18} />
                </button>
                <button className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 hover:text-primary hover:border-primary/50 transition-all duration-300">
                  <Mail size={18} />
                </button>
              </div>
            </div>

            <div className="lg:col-span-5 grid grid-cols-2 md:grid-cols-2 gap-12">
              <div className="space-y-8">
                <h4 className="text-xs font-black uppercase tracking-[0.2em] text-emerald-500">Écosystème</h4>
                <ul className="space-y-4">
                  {['Fonctionnalités', 'Stations IoT', 'Analytique', 'Cas d\'usage'].map((item) => (
                    <li key={item} className="group flex items-center">
                      <span className="w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-3 mr-0 group-hover:mr-3"></span>
                      <a href="#" className="text-slate-400 hover:text-white font-bold transition-colors">{item}</a>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="space-y-8">
                <h4 className="text-xs font-black uppercase tracking-[0.2em] text-emerald-500">Ressources</h4>
                <ul className="space-y-4">
                  {['Documentation', 'Guides d\'installation', 'Support Technique', 'Statut API'].map((item) => (item.includes('Documentation') ? (
                    <li key={item} className="group flex items-center">
                      <span className="w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-3 mr-0 group-hover:mr-3"></span>
                      <Link to="/documentation" className="text-slate-400 hover:text-white font-bold transition-colors">{item}</Link>
                    </li>
                  ) : (
                    <li key={item} className="group flex items-center">
                      <span className="w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-3 mr-0 group-hover:mr-3"></span>
                      <a href="#" className="text-slate-400 hover:text-white font-bold transition-colors">{item}</a>
                    </li>
                  )))}
                </ul>
              </div>
            </div>

            <div className="lg:col-span-3 space-y-8">
              <h4 className="text-xs font-black uppercase tracking-[0.2em] text-emerald-500">Newsletter</h4>
              <div className="space-y-4">
                <p className="text-sm text-slate-400 font-bold">Restez informé de nos dernières innovations IoT.</p>
                <div className="relative group">
                  <input 
                    type="email" 
                    placeholder="votre@email.com" 
                    className="w-full bg-slate-900 border border-slate-800 rounded-2xl py-4 px-6 text-sm font-bold focus:outline-none focus:border-primary/50 transition-all"
                  />
                  <button className="absolute right-2 top-2 p-2 bg-primary rounded-xl text-white hover:scale-105 transition-transform">
                    <ArrowRight size={20} />
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-24 pt-8 border-t border-slate-900/50 flex flex-col md:flex-row items-center justify-between gap-6">
            <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest">
              &copy; 2026 MÉTÉOPRO SYSTEMS. FAIT AVEC PASSION POUR L'IOT.
            </p>
            <div className="flex items-center space-x-8">
              <a href="#" className="text-slate-500 hover:text-primary text-[10px] font-black uppercase tracking-widest transition-colors">Confidentialité</a>
              <a href="#" className="text-slate-500 hover:text-primary text-[10px] font-black uppercase tracking-widest transition-colors">CGU</a>
              <div className="flex items-center space-x-2 text-slate-500 pl-8 border-l border-slate-800">
                <Globe size={14} />
                <span className="text-[10px] font-black uppercase">FRANÇAIS</span>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default PublicLayout;
