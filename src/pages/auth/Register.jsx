import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, User, Phone, Loader2, Check } from 'lucide-react';
import Button from '../../components/ui/Button';
import { api } from '../../api/api';
import PublicLayout from '../../components/layout/PublicLayout';

const Register = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const userData = {
        username: e.target.username.value,
        email: e.target.email.value,
        phoneNumber: e.target.phoneNumber.value,
        password: e.target.password.value,
        role: 'user'
      };
      
      await api.register(userData);
      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur lors de l\'inscription.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <PublicLayout>
      <div className="min-h-[85vh] flex items-center justify-center p-6 bg-slate-50 dark:bg-[#020617] transition-colors duration-500">
        <div className="w-full max-w-lg">
          <div className="text-center mb-10">
            <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter">Créer un <span className="text-primary italic">compte.</span></h1>
            <p className="text-slate-800 dark:text-slate-400 mt-2 font-bold">Rejoignez le réseau MétéoPro Systems dès aujourd'hui</p>
          </div>

          <div className="bg-white dark:bg-slate-900/40 p-8 md:p-10 rounded-[2.5rem] shadow-2xl shadow-slate-200/60 dark:shadow-none border border-slate-100 dark:border-slate-800 backdrop-blur-sm transition-all duration-500">
            {error && (
              <div className="mb-6 bg-rose-50 dark:bg-rose-500/10 border border-rose-100 dark:border-rose-500/20 text-rose-600 dark:text-rose-400 px-4 py-3 rounded-2xl text-sm font-bold flex items-center">
                <span className="w-2 h-2 bg-rose-600 dark:bg-rose-500 rounded-full mr-3 animate-pulse"></span>
                {error}
              </div>
            )}
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="relative">
                <div className="absolute top-1/2 left-5 -translate-y-1/2 text-slate-400">
                  <User size={18} />
                </div>
                <input 
                  name="username" 
                  required 
                  className="w-full !pl-16 pr-6 py-4 bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 rounded-2xl focus:bg-white dark:focus:bg-slate-900 focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all font-bold text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-600" 
                  placeholder="Nom d'utilisateur" 
                />
              </div>

              <div className="relative">
                <div className="absolute top-1/2 left-5 -translate-y-1/2 text-slate-400">
                  <Mail size={18} />
                </div>
                <input 
                  name="email" 
                  type="email" 
                  required 
                  className="w-full !pl-16 pr-6 py-4 bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 rounded-2xl focus:bg-white dark:focus:bg-slate-900 focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all font-bold text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-600" 
                  placeholder="Adresse Email" 
                />
              </div>

              <div className="relative">
                <div className="absolute top-1/2 left-5 -translate-y-1/2 text-slate-400">
                  <Phone size={18} />
                </div>
                <input 
                  name="phoneNumber" 
                  type="tel" 
                  required 
                  className="w-full !pl-16 pr-6 py-4 bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 rounded-2xl focus:bg-white dark:focus:bg-slate-900 focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all font-bold text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-600" 
                  placeholder="Numéro de téléphone" 
                />
              </div>

              <div className="relative">
                <div className="absolute top-1/2 left-5 -translate-y-1/2 text-slate-400">
                  <Lock size={18} />
                </div>
                <input 
                  name="password" 
                  type="password" 
                  required 
                  className="w-full !pl-16 pr-6 py-4 bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 rounded-2xl focus:bg-white dark:focus:bg-slate-900 focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all font-bold text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-600" 
                  placeholder="Mot de passe" 
                />
              </div>

              <div className="flex items-start space-x-3 px-1">
                <div className="relative flex items-center mt-1">
                  <input type="checkbox" required className="peer w-5 h-5 opacity-0 absolute cursor-pointer" />
                  <div className="w-5 h-5 border-2 border-slate-300 dark:border-slate-700 rounded-lg peer-checked:bg-primary peer-checked:border-primary transition-all flex items-center justify-center">
                    <Check size={12} className="text-white opacity-0 peer-checked:opacity-100" />
                  </div>
                </div>
                <span className="text-sm text-slate-600 dark:text-slate-400 font-bold leading-relaxed">
                  J'accepte les <a href="#!" className="text-slate-900 dark:text-white font-black hover:underline">Conditions</a> et la <a href="#!" className="text-slate-900 dark:text-white font-black hover:underline">Politique de Confidentialité</a>.
                </span>
              </div>

              <Button 
                type="submit" 
                disabled={loading}
                className="w-full py-4 text-lg font-black flex items-center justify-center space-x-3 shadow-xl shadow-primary/20"
              >
                {loading ? (
                  <>
                    <Loader2 size={20} className="animate-spin" />
                    <span>Création...</span>
                  </>
                ) : (
                  'Créer mon compte'
                )}
              </Button>
            </form>
          </div>

          <p className="text-center mt-10 text-slate-800 dark:text-slate-400 font-bold">
            Déjà inscrit ?{' '}
            <Link to="/login" className="text-primary font-black hover:underline decoration-2 underline-offset-4">Connectez-vous</Link>
          </p>
        </div>
      </div>
    </PublicLayout>
  );
};

export default Register;
