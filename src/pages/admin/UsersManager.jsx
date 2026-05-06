import React, { useEffect, useState } from 'react';
import { api } from '../../api';
import { Trash2, Edit, Plus, UserPlus, X, Mail, Phone, Shield, Lock, User, Save, Users } from 'lucide-react';
import ConfirmModal from '../../components/common/ConfirmModal';
import { toast } from 'react-hot-toast';

const UsersManager = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState(null);
  
  const [confirmDelete, setConfirmDelete] = useState({ isOpen: false, userId: null });
  
  const [formData, setFormData] = useState({ username: '', password: '', role: 'user', email: '', phoneNumber: '' });
  const [error, setError] = useState(null);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const data = await api.getAllUsers();
      setUsers(data);
    } catch (error) {
      toast.error("Échec de la synchronisation.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const openDeleteConfirmation = (id) => {
    setConfirmDelete({ isOpen: true, userId: id });
  };

  const handleDelete = async () => {
    const id = confirmDelete.userId;
    const loadingToast = toast.loading("Suppression...");
    try {
      await api.deleteUser(id);
      toast.success("Utilisateur supprimé", { id: loadingToast });
      setConfirmDelete({ isOpen: false, userId: null });
      fetchUsers();
    } catch (error) {
      toast.error("Erreur lors de la suppression", { id: loadingToast });
    }
  };

  const handleOpenAddModal = () => {
    setIsEditing(false);
    setSelectedUserId(null);
    setFormData({ username: '', password: '', role: 'user', email: '', phoneNumber: '' });
    setError(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (user) => {
    setIsEditing(true);
    setSelectedUserId(user._id);
    setFormData({ 
      username: user.username, 
      password: '', 
      role: user.role, 
      email: user.email || '', 
      phoneNumber: user.phoneNumber || '' 
    });
    setError(null);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const loadingToast = toast.loading(isEditing ? "Mise à jour..." : "Création...");
    try {
      if (isEditing) {
        const updateData = { ...formData };
        if (!updateData.password) delete updateData.password;
        await api.updateUser(selectedUserId, updateData);
        toast.success("Modifié avec succès", { id: loadingToast });
      } else {
        await api.register(formData);
        toast.success("Compte créé avec succès", { id: loadingToast });
      }
      setIsModalOpen(false);
      fetchUsers();
    } catch (err) {
      toast.error(err.response?.data?.message || "Une erreur est survenue", { id: loadingToast });
    }
  };

  return (
    <div className="animate-up" style={{ paddingBottom: '50px' }}>
      
      <header className="premium-header">
        <div className="premium-title-group">
          <h1 style={{ fontSize: '2rem', fontWeight: '900', letterSpacing: '-1px' }}>Gestion des Utilisateurs</h1>
          <div className="premium-subtitle">
            <span className="premium-accent-dot"></span>
            <span>Contrôlez les accès et gérez les comptes clients de la plateforme.</span>
          </div>
        </div>
        <button onClick={handleOpenAddModal} className="btn-primary-premium" style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 25px' }}>
          <UserPlus size={20} /> Nouveau Compte
        </button>
      </header>

      {/* TABLE CARD */}
      <div className="db-card" style={{ padding: 0, borderRadius: '40px', overflow: 'hidden' }}>
        <div style={{ padding: '2rem 2.5rem', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8fafc' }}>
           <h2 style={{ fontSize: '1.2rem', fontWeight: '900', margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
             <Users size={20} color="#0070f3" /> Liste des Clients ({users.length})
           </h2>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f8fafc', borderBottom: '1px solid #f1f5f9' }}>
                <th style={{ padding: '1.5rem 2.5rem', textAlign: 'left', fontSize: '0.8rem', fontWeight: '900', color: '#1e293b', textTransform: 'uppercase', letterSpacing: '1px' }}>Utilisateur</th>
                <th style={{ padding: '1.5rem 2.5rem', textAlign: 'left', fontSize: '0.8rem', fontWeight: '900', color: '#1e293b', textTransform: 'uppercase', letterSpacing: '1px' }}>Coordonnées</th>
                <th style={{ padding: '1.5rem 2.5rem', textAlign: 'left', fontSize: '0.8rem', fontWeight: '900', color: '#1e293b', textTransform: 'uppercase', letterSpacing: '1px' }}>Rôle</th>
                <th style={{ padding: '1.5rem 2.5rem', textAlign: 'center', fontSize: '0.8rem', fontWeight: '900', color: '#1e293b', textTransform: 'uppercase', letterSpacing: '1px' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="4" style={{ padding: '5rem', textAlign: 'center', color: '#94a3b8' }}>Synchronisation...</td></tr>
              ) : users.length === 0 ? (
                <tr><td colSpan="4" style={{ padding: '5rem', textAlign: 'center', color: '#94a3b8' }}>Aucun utilisateur trouvé.</td></tr>
              ) : (
                users.map((user) => (
                  <tr key={user._id} className="table-row-hover" style={{ borderBottom: '1px solid #f8fafc', transition: 'all 0.2s' }}>
                    <td style={{ padding: '1.5rem 2.5rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                        <div style={{ width: '45px', height: '45px', borderRadius: '15px', background: user.role === 'admin' ? '#f0f9ff' : '#f0fdf4', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '900', color: user.role === 'admin' ? '#0070f3' : '#10b981', border: '1px solid #e2e8f0' }}>
                           {user.username.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div style={{ fontWeight: '900', color: '#1e293b', fontSize: '1rem' }}>{user.username}</div>
                          <div style={{ fontSize: '0.7rem', color: '#94a3b8', fontWeight: '700' }}>ID: {user._id.substring(0, 12)}...</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '1.5rem 2.5rem' }}>
                       <div style={{ display: 'grid', gap: '5px' }}>
                         <div style={{ fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '8px', color: '#64748b', fontWeight: '600' }}><Mail size={14} /> {user.email || '—'}</div>
                         <div style={{ fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '8px', color: '#64748b', fontWeight: '600' }}><Phone size={14} /> {user.phoneNumber || '—'}</div>
                       </div>
                    </td>
                    <td style={{ padding: '1.5rem 2.5rem' }}>
                      <span style={{
                        background: user.role === 'admin' ? '#eff6ff' : '#f0fdf4',
                        color: user.role === 'admin' ? '#1e40af' : '#166534',
                        padding: '6px 14px',
                        borderRadius: '20px',
                        fontSize: '0.7rem',
                        fontWeight: '900',
                        textTransform: 'uppercase'
                      }}>
                        {user.role}
                      </span>
                    </td>
                    <td style={{ padding: '1.5rem 2.5rem', textAlign: 'center' }}>
                      <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
                        <button onClick={() => handleOpenEditModal(user)} className="btn-action-premium" style={{ padding: '10px', background: '#f8fafc', color: '#64748b', border: 'none', borderRadius: '12px', cursor: 'pointer' }} title="Modifier">
                          <Edit size={18} />
                        </button>
                        <button 
                          onClick={() => openDeleteConfirmation(user._id)} 
                          disabled={user.role === 'admin'}
                          className="btn-action-premium" 
                          style={{ padding: '10px', background: '#fef2f2', color: '#ef4444', border: 'none', borderRadius: '12px', cursor: user.role === 'admin' ? 'not-allowed' : 'pointer', opacity: user.role === 'admin' ? 0.3 : 1 }} 
                          title="Supprimer"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL AJOUT/ÉDITION */}
      {isModalOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.7)', backdropFilter: 'blur(10px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}>
          <div className="db-card animate-up" style={{ width: '100%', maxWidth: '550px', padding: '3rem', borderRadius: '40px' }}>
             <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
                <div>
                   <h2 style={{ fontSize: '1.6rem', fontWeight: '950', margin: 0, letterSpacing: '-1px' }}>{isEditing ? 'Édition Compte' : 'Nouveau Compte'}</h2>
                   <p style={{ margin: '5px 0 0', fontSize: '0.85rem', color: '#64748b' }}>Configurez les accès de l'utilisateur.</p>
                </div>
                <button onClick={() => setIsModalOpen(false)} style={{ background: '#f1f5f9', border: 'none', borderRadius: '50%', padding: '10px', cursor: 'pointer', color: '#64748b' }}><X size={20}/></button>
             </div>
             
             <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '1.8rem' }}>
                <div className="form-group-premium">
                  <label className="label-premium">Nom d'utilisateur</label>
                  <div style={{ position: 'relative' }}>
                    <User size={18} style={{ position: 'absolute', left: '15px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                    <input type="text" name="username" value={formData.username} onChange={(e) => setFormData({...formData, username: e.target.value})} className="input-premium-styled" style={{ paddingLeft: '45px' }} placeholder="Ex: amine_2024" required />
                  </div>
                </div>

                <div className="form-group-premium">
                  <label className="label-premium">Mot de passe</label>
                  <div style={{ position: 'relative' }}>
                    <Lock size={18} style={{ position: 'absolute', left: '15px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                    <input type="password" name="password" value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})} className="input-premium-styled" style={{ paddingLeft: '45px' }} placeholder={isEditing ? "Laisser vide si inchangé" : "••••••••"} required={!isEditing} />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                   <div className="form-group-premium">
                      <label className="label-premium">Email</label>
                      <input type="email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} className="input-premium-styled" placeholder="client@exemple.com" />
                   </div>
                   <div className="form-group-premium">
                      <label className="label-premium">Téléphone</label>
                      <input type="text" value={formData.phoneNumber} onChange={(e) => setFormData({...formData, phoneNumber: e.target.value})} className="input-premium-styled" placeholder="06..." />
                   </div>
                </div>

                <div className="form-group-premium">
                   <label className="label-premium">Rôle Système</label>
                   <select 
                    name="role" 
                    value={formData.role} 
                    onChange={(e) => setFormData({...formData, role: e.target.value})} 
                    className="input-premium-styled" 
                    style={{ width: '100%', opacity: (isEditing && formData.role === 'admin') ? 0.6 : 1, cursor: (isEditing && formData.role === 'admin') ? 'not-allowed' : 'pointer' }}
                    disabled={isEditing && formData.role === 'admin'}
                   >
                      <option value="user">Utilisateur Standard</option>
                      <option value="admin">Administrateur</option>
                   </select>
                   {isEditing && formData.role === 'admin' && (
                     <p style={{ fontSize: '0.7rem', color: '#94a3b8', marginTop: '5px' }}>Le rôle d'administrateur ne peut pas être rétrogradé par sécurité.</p>
                   )}
                </div>

                <button type="submit" className="btn-primary-premium" style={{ padding: '18px', fontSize: '1.1rem', marginTop: '1rem' }}>
                   {isEditing ? 'Appliquer les modifications' : 'Créer le compte utilisateur'}
                </button>
             </form>
          </div>
        </div>
      )}

      <ConfirmModal 
        isOpen={confirmDelete.isOpen}
        title="Supprimer l'utilisateur ?"
        message="Attention : Cette action révoquera immédiatement tous les accès de cet utilisateur à la plateforme."
        onConfirm={handleDelete}
        onCancel={() => setConfirmDelete({ isOpen: false, userId: null })}
        type="danger"
      />
    </div>
  );
};

export default UsersManager;
