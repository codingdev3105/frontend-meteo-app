import React, { useState } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import { useToast } from '../../components/ui/Toast';
import { api } from '../../api/api';
import { User, Mail, Phone, Shield, Save, CheckCircle, Lock, AlertCircle } from 'lucide-react';

const Profile = () => {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const { addToast } = useToast();
  
  // Profile Info States
  const [formData, setFormData] = useState({
    username: user.username || '',
    email: user.email || '',
    phoneNumber: user.phoneNumber || ''
  });
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Security States
  const [passwordData, setPasswordData] = useState({
    password: '',
    confirmPassword: ''
  });
  const [pwdLoading, setPwdLoading] = useState(false);

  const handleProfileSubmit = async () => {
    setLoading(true);
    setIsModalOpen(false);
    try {
      await api.updateProfile(formData);
      addToast("Profil mis à jour avec succès", "success");
    } catch (err) {
      addToast(err.response?.data?.message || "Erreur lors de la mise à jour", "error");
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();

    if (passwordData.password !== passwordData.confirmPassword) {
      return addToast("Les mots de passe ne correspondent pas", "error");
    }
    if (passwordData.password.length < 6) {
      return addToast("Le mot de passe doit faire au moins 6 caractères", "error");
    }

    setPwdLoading(true);
    try {
      await api.updatePassword(passwordData.password);
      addToast("Mot de passe mis à jour avec succès", "success");
      setPasswordData({ password: '', confirmPassword: '' });
    } catch (err) {
      addToast(err.response?.data?.message || "Erreur de sécurité", "error");
    } finally {
      setPwdLoading(false);
    }
  };

  return (
    <DashboardLayout title="Mon Profil" isAdmin={user.role === 'admin'}>
      <div className="max-w-6xl mx-auto">
        {/* Modal Confirmation */}
        <Modal 
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title="Confirmer les changements"
          onConfirm={handleProfileSubmit}
          loading={loading}
          customIcon={<CheckCircle className="text-primary" size={28} />}
        >
          <div className="p-4 text-center">
             <p className="text-slate-600 dark:text-slate-400 font-bold leading-relaxed">
                Êtes-vous sûr de vouloir mettre à jour vos informations personnelles ? Ces changements seront effectifs immédiatement sur tout le panel.
             </p>
          </div>
        </Modal>

        {/* Header Avatar */}
        <div className="flex flex-col md:flex-row items-center md:space-x-8 space-y-6 md:space-y-0 mb-12 bg-white dark:bg-slate-900/40 p-10 rounded-[3rem] border border-slate-100 dark:border-slate-800 shadow-xl shadow-slate-200/40 dark:shadow-none transition-all duration-500">
           <div className="w-28 h-28 rounded-[2.5rem] bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center border-4 border-white dark:border-slate-800 shadow-2xl shadow-emerald-500/20">
              <User size={56} className="text-emerald-600 dark:text-emerald-400" />
           </div>
           <div className="text-center md:text-left">
              <h2 className="text-4xl font-black text-slate-900 dark:text-white uppercase tracking-tighter leading-none mb-2">{user.username}</h2>
              <div className="flex items-center justify-center md:justify-start space-x-3">
                 <Shield size={14} className="text-primary" />
                 <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.3em]">
                   {user.role === 'admin' ? 'Administrateur Système' : 'Utilisateur Certifié'}
                 </p>
              </div>
           </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
           {/* Section Infos */}
           <div className="lg:col-span-2">
              <div className="bg-white dark:bg-slate-900/40 p-8 md:p-10 rounded-[3rem] border border-slate-100 dark:border-slate-800 shadow-2xl shadow-slate-200/40 dark:shadow-none transition-all duration-500">
                 <div className="flex items-center space-x-4 mb-10">
                    <div className="p-3 bg-primary/10 rounded-2xl">
                       <User className="text-primary" size={24} />
                    </div>
                    <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Détails du Compte</h3>
                 </div>

                 <div className="space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                       <div className="space-y-3">
                          <label className="block text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Nom d'utilisateur</label>
                          <div className="relative group">
                             <div className="absolute top-1/2 left-5 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors">
                                <User size={18} />
                             </div>
                             <input 
                               type="text" 
                               value={formData.username}
                               onChange={(e) => setFormData({...formData, username: e.target.value})}
                               className="input-premium !pl-16 w-full"
                               placeholder="Pseudo"
                             />
                          </div>
                       </div>
                       <div className="space-y-3">
                          <label className="block text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Adresse Email</label>
                          <div className="relative group">
                             <div className="absolute top-1/2 left-5 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors">
                                <Mail size={18} />
                             </div>
                             <input 
                               type="email" 
                               value={formData.email}
                               onChange={(e) => setFormData({...formData, email: e.target.value})}
                               className="input-premium !pl-16 w-full"
                               placeholder="Email"
                             />
                          </div>
                       </div>
                       <div className="space-y-3">
                          <label className="block text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Numéro de téléphone</label>
                          <div className="relative group">
                             <div className="absolute top-1/2 left-5 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors">
                                <Phone size={18} />
                             </div>
                             <input 
                               type="tel" 
                               value={formData.phoneNumber}
                               onChange={(e) => setFormData({...formData, phoneNumber: e.target.value})}
                               className="input-premium !pl-16 w-full"
                               placeholder="Téléphone"
                             />
                          </div>
                       </div>
                    </div>

                    <Button 
                       onClick={() => setIsModalOpen(true)} 
                       disabled={loading} 
                       className="w-full py-5 text-sm font-black uppercase tracking-widest shadow-xl shadow-primary/20"
                    >
                       {loading ? 'Traitement en cours...' : 'Enregistrer les Modifications'}
                    </Button>
                 </div>
              </div>
           </div>

           {/* Section Sécurité */}
           <div className="lg:col-span-1">
              <div className="bg-white dark:bg-slate-900/40 p-8 md:p-10 rounded-[3rem] border border-slate-100 dark:border-slate-800 shadow-2xl shadow-slate-200/40 dark:shadow-none transition-all duration-500 h-full">
                 <div className="flex items-center space-x-4 mb-10">
                    <div className="p-3 bg-rose-500/10 rounded-2xl">
                       <Lock className="text-rose-500" size={24} />
                    </div>
                    <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Sécurité</h3>
                 </div>

                 <form onSubmit={handlePasswordSubmit} className="space-y-6">
                    <div className="space-y-3">
                       <label className="block text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Nouveau mot de passe</label>
                       <div className="relative group">
                          <div className="absolute top-1/2 left-5 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors">
                             <Lock size={18} />
                          </div>
                          <input 
                            type="password" 
                            placeholder="••••••••"
                            value={passwordData.password}
                            onChange={(e) => setPasswordData({...passwordData, password: e.target.value})}
                            className="input-premium !pl-16 w-full"
                          />
                       </div>
                    </div>

                    <div className="space-y-3">
                       <label className="block text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Confirmer mot de passe</label>
                       <div className="relative group">
                          <div className="absolute top-1/2 left-5 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors">
                             <Lock size={18} />
                          </div>
                          <input 
                            type="password" 
                            placeholder="••••••••"
                            value={passwordData.confirmPassword}
                            onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                            className="input-premium !pl-16 w-full"
                          />
                       </div>
                    </div>

                    <Button 
                      type="submit" 
                      disabled={pwdLoading}
                      className="w-full py-5 text-sm font-black uppercase tracking-widest bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-100 border-none mt-4"
                    >
                       {pwdLoading ? 'En cours...' : 'Mettre à jour'}
                    </Button>
                 </form>
              </div>
           </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Profile;
