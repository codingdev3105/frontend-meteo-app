import React, { useEffect, useState } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import { useToast } from '../../components/ui/Toast';
import { api } from '../../api/api';
import { Users as UsersIcon, Mail, Phone, Edit, Trash2, Search, Plus, User, Lock, Loader2, Shield } from 'lucide-react';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingUserId, setEditingUserId] = useState(null);
  const [createLoading, setCreateLoading] = useState(false);
  const { addToast } = useToast();

  const [formData, setFormData] = useState({
    username: '',
    email: '',
    phoneNumber: '',
    password: '',
    role: 'user'
  });

  const fetchUsers = async () => {
    try {
      const data = await api.getUsers();
      setUsers(data);
    } catch (err) {
      console.error("Error fetching users:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleCreateUser = async (e) => {
    e.preventDefault();
    setCreateLoading(true);
    try {
      if (isEditMode) {
        await api.adminUpdateUser(editingUserId, formData);
        addToast("Utilisateur mis à jour", "success");
      } else {
        await api.register(formData);
        addToast("Client créé avec succès", "success");
      }
      setIsModalOpen(false);
      resetForm();
      fetchUsers();
    } catch (err) {
      addToast(err.response?.data?.message || "Erreur lors de l'opération", "error");
    } finally {
      setCreateLoading(false);
    }
  };

  const handleDeleteUser = async () => {
    if (!userToDelete) return;
    setCreateLoading(true);
    try {
      await api.adminDeleteUser(userToDelete._id);
      addToast("Utilisateur supprimé", "success");
      setIsDeleteModalOpen(false);
      setUserToDelete(null);
      fetchUsers();
    } catch (err) {
      addToast(err.response?.data?.message || "Erreur lors de la suppression", "error");
    } finally {
      setCreateLoading(false);
    }
  };

  const handleEditClick = (user) => {
    setEditingUserId(user._id);
    setFormData({
      username: user.username,
      email: user.email,
      phoneNumber: user.phoneNumber || '',
      password: '', 
      role: user.role
    });
    setIsEditMode(true);
    setIsModalOpen(true);
  };

  const resetForm = () => {
    setFormData({ username: '', email: '', phoneNumber: '', password: '', role: 'user' });
    setIsEditMode(false);
    setEditingUserId(null);
  };

  const getInitials = (name) => {
    return name?.charAt(0).toUpperCase() || '?';
  };

  const getRandomColor = (id) => {
    const colors = [
      'bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400',
      'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400',
      'bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400',
      'bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400',
      'bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400'
    ];
    const index = parseInt(id?.slice(-1), 16) % colors.length || 0;
    return colors[index];
  };


  return (
    <DashboardLayout title="Gestion Utilisateurs" isAdmin={true}>
      {loading ? (
        <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-6">
          <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest animate-pulse">Chargement de la base clients...</p>
        </div>
      ) : (
        <>
          {/* Modal Création/Edition */}
          <Modal 
            isOpen={isModalOpen} 
            onClose={() => { setIsModalOpen(false); resetForm(); }}
            title={isEditMode ? "Modifier l'utilisateur" : "Ajouter un utilisateur"}
            showFooter={false}
            customIcon={isEditMode ? <Edit size={28} /> : <Plus size={28} />}
          >
            <form onSubmit={handleCreateUser} className="space-y-4 p-2">
              <div className="relative">
                <div className="absolute top-1/2 left-5 -translate-y-1/2 text-slate-400">
                  <User size={18} />
                </div>
                <input 
                  type="text" 
                  placeholder="Nom complet / Pseudo"
                  required
                  className="input-premium pl-14 w-full"
                  value={formData.username}
                  onChange={(e) => setFormData({...formData, username: e.target.value})}
                />
              </div>

              <div className="relative">
                <div className="absolute top-1/2 left-5 -translate-y-1/2 text-slate-400">
                  <Mail size={18} />
                </div>
                <input
                  type="email" 
                  placeholder="Adresse Email"
                  required
                  className="input-premium pl-14 w-full"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                />
              </div>

              <div className="relative">
                <div className="absolute top-1/2 left-5 -translate-y-1/2 text-slate-400">
                  <Phone size={18} />
                </div>
                <input 
                  type="text" 
                  placeholder="Numéro de Téléphone"
                  required
                  className="input-premium pl-14 w-full"
                  value={formData.phoneNumber}
                  onChange={(e) => setFormData({...formData, phoneNumber: e.target.value})}
                />
              </div>

              <div className="relative">
                <div className="absolute top-1/2 left-5 -translate-y-1/2 text-slate-400">
                  <Lock size={18} />
                </div>
                <input 
                  type="password" 
                  placeholder={isEditMode ? "Nouveau mot de passe (optionnel)" : "Mot de passe provisoire"}
                  required={!isEditMode}
                  className="input-premium pl-14 w-full"
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                />
              </div>

              <div className="flex items-center space-x-3 pt-6">
                <Button 
                  type="button" 
                  variant="secondary"
                  onClick={() => { setIsModalOpen(false); resetForm(); }}
                  className="flex-1 py-4"
                >
                  Annuler
                </Button>
                <Button 
                  type="submit" 
                  disabled={createLoading}
                  className="flex-[2] py-4 shadow-xl shadow-primary/20"
                >
                  {createLoading ? <Loader2 className="animate-spin mx-auto" size={18} /> : (isEditMode ? "Enregistrer les modifications" : "Créer le compte Client")}
                </Button>
              </div>
            </form>
          </Modal>

          {/* Modal Confirmation Suppression */}
          <Modal
            isOpen={isDeleteModalOpen}
            onClose={() => setIsDeleteModalOpen(false)}
            title="Supprimer l'utilisateur"
            type="danger"
            confirmText="Supprimer définitivement"
            onConfirm={handleDeleteUser}
            loading={createLoading}
          >
            <div className="text-center p-4">
               <div className="w-16 h-16 bg-rose-50 dark:bg-rose-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Trash2 className="text-rose-500" size={32} />
               </div>
               <p className="text-slate-600 dark:text-slate-400 font-bold mb-2">Êtes-vous sûr de vouloir supprimer cet utilisateur ?</p>
               <p className="text-slate-900 dark:text-white font-black text-lg">{userToDelete?.username}</p>
               <p className="text-[10px] text-rose-500 font-black uppercase tracking-widest mt-4">Cette action est irréversible</p>
            </div>
          </Modal>

          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-12">
            <div className="flex items-center space-x-6">
               <div className="bg-primary/10 p-4 rounded-2xl">
                  <UsersIcon className="text-primary" size={32} />
               </div>
               <div>
                  <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Gestion Clients</h2>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">{users.length} comptes enregistrés</p>
               </div>
            </div>
            
            <div className="flex flex-col md:flex-row items-center gap-4">
               <div className="relative group w-full md:w-auto">
                  <div className="absolute top-1/2 left-5 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors">
                    <Search size={18} />
                  </div>
                  <input 
                    type="text" 
                    placeholder="Rechercher par nom ou email..."
                    className="input-premium pl-14 w-full md:w-80 shadow-lg shadow-slate-100/50 dark:shadow-none"
                  />
               </div>
               <Button onClick={() => { setIsEditMode(false); setIsModalOpen(true); }} className="w-full md:w-auto flex items-center justify-center space-x-3 py-4 px-8 shadow-xl shadow-primary/20">
                  <Plus size={20} strokeWidth={3} />
                  <span className="font-black uppercase tracking-widest text-[11px]">Nouveau Client</span>
               </Button>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900/40 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-2xl shadow-slate-100/40 dark:shadow-none p-2 overflow-hidden transition-colors duration-500">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-slate-800/50">
                    <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Identité Client</th>
                    <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Contact & Liaison</th>
                    <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-center">Rôle</th>
                    <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 dark:divide-slate-800/30">
                  {users.map((user) => (
                    <tr key={user._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors group">
                      <td className="px-8 py-5">
                        <div className="flex items-center space-x-4">
                          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-lg ${getRandomColor(user._id)} shadow-inner border border-white/10 group-hover:scale-110 transition-transform`}>
                            {getInitials(user.username)}
                          </div>
                          <div>
                            <h4 className="font-black text-slate-900 dark:text-white text-[15px] tracking-tight">{user.username}</h4> 
                            <p className="text-[10px] font-bold text-slate-400">ID: {user._id.slice(-8).toUpperCase()}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-5">
                        <div className="space-y-1.5">
                          <div className="flex items-center space-x-3 text-slate-600 dark:text-slate-300">
                            <Mail size={14} className="text-primary/60" />
                            <span className="text-[13px] font-bold">{user.email}</span>
                          </div>
                          <div className="flex items-center space-x-3 text-slate-600 dark:text-slate-300">
                            <Phone size={14} className="text-primary/60" />
                            <span className="text-[13px] font-bold">{user.phoneNumber || '---'}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-5 text-center">
                        <span className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest ${
                          user.role === 'admin' 
                            ? 'bg-indigo-500/10 text-indigo-500 border border-indigo-500/20' 
                            : 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'
                        }`}>
                          {user.role}
                        </span>
                      </td>
                      <td className="px-8 py-5">
                        <div className="flex items-center justify-center space-x-3">
                          <button 
                            onClick={() => handleEditClick(user)}
                            className="p-3 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-primary hover:text-white rounded-2xl transition-all duration-300 border border-transparent hover:shadow-lg hover:shadow-primary/20"
                          >
                            <Edit size={18} />
                          </button>
                          <button 
                            onClick={() => { setUserToDelete(user); setIsDeleteModalOpen(true); }}
                            className="p-3 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-rose-500 hover:text-white rounded-2xl transition-all duration-300 border border-transparent hover:shadow-lg hover:shadow-rose-500/20"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </DashboardLayout>
  );
};

export default AdminUsers;
