import React, { useState, useEffect } from 'react';
import { api } from '../../api';
import { 
  FileText, Plus, Trash2, Image, 
  Video, Save, ChevronDown, ChevronUp, 
  HelpCircle, BookOpen, Monitor, Upload, X
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import '../../styles/Dashboard.css';

const AdminDocs = () => {
  const [docs, setDocs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('STATION_GUIDE');
  
  // État pour la section en cours d'édition
  const [editingSection, setEditingSection] = useState(null);
  const [previewMedia, setPreviewMedia] = useState(null); // Pour l'agrandissement au clic

  const SERVER_URL = 'http://localhost:5000';

  const loadDocs = async () => {
    try {
      const data = await api.getDocs();
      setDocs(data);
    } catch (err) {
      console.error(err);
      toast.error("Erreur lors du chargement des docs");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadDocs(); }, []);

  const handleCreateSection = () => {
    setEditingSection({
      category: activeCategory,
      title: '',
      steps: [{ title: '', content: '', mediaUrl: '', mediaType: 'none' }],
      order: docs.filter(d => d.category === activeCategory).length
    });
  };

  const handleAddStep = () => {
    setEditingSection({
      ...editingSection,
      steps: [...editingSection.steps, { title: '', content: '', mediaUrl: '', mediaType: 'none' }]
    });
  };

  const handleStepChange = (index, field, value) => {
    const newSteps = [...editingSection.steps];
    newSteps[index][field] = value;
    setEditingSection({ ...editingSection, steps: newSteps });
  };

  const handleFileUpload = async (index, file) => {
    const formData = new FormData();
    formData.append('media', file);
    
    const t = toast.loading("Téléchargement du média...");
    try {
      const { url } = await api.uploadDocMedia(formData);
      const isVideo = file.type.startsWith('video');
      
      const newSteps = [...editingSection.steps];
      newSteps[index].mediaUrl = url;
      newSteps[index].mediaType = isVideo ? 'video' : 'image';
      
      setEditingSection({ ...editingSection, steps: newSteps });
      toast.success("Média téléchargé !", { id: t });
    } catch (err) {
      toast.error("Erreur de téléchargement", { id: t });
    }
  };

  const handleSave = async () => {
    if (!editingSection.title) return toast.error("Le titre est requis");
    
    const t = toast.loading("Sauvegarde en cours...");
    try {
      await api.saveDocSection(editingSection);
      toast.success("Section sauvegardée !", { id: t });
      setEditingSection(null);
      loadDocs();
    } catch (err) {
      toast.error("Erreur de sauvegarde", { id: t });
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Supprimer cette section ?")) return;
    try {
      await api.deleteDocSection(id);
      toast.success("Section supprimée");
      loadDocs();
    } catch (err) {
      toast.error("Erreur");
    }
  };

  const handleMoveStep = (index, direction) => {
    const newSteps = [...editingSection.steps];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    
    if (targetIndex < 0 || targetIndex >= newSteps.length) return;
    
    // Swap
    [newSteps[index], newSteps[targetIndex]] = [newSteps[targetIndex], newSteps[index]];
    setEditingSection({ ...editingSection, steps: newSteps });
  };

  const categories = [
    { id: 'STATION_GUIDE', label: 'Guide Station', icon: <BookOpen size={18}/> },
    { id: 'PLATFORM_GUIDE', label: 'Guide Plateforme', icon: <Monitor size={18}/> },
    { id: 'FAQ', label: 'Questions Fréquentes', icon: <HelpCircle size={18}/> }
  ];

  if (loading) return <div className="db-main">Chargement...</div>;

  return (
    <div className="db-main animate-up">
      <header className="premium-header" style={{ marginBottom: '3rem' }}>
        <div className="premium-title-group">
          <h1 style={{ fontSize: '2.5rem', fontWeight: '950', letterSpacing: '-2px' }}>Gestion de la Documentation</h1>
          <div className="premium-subtitle">
            <span className="premium-accent-dot"></span>
            <span>Configurez les guides et l'aide pour les utilisateurs.</span>
          </div>
        </div>
      </header>

      {/* TABS CATEGORIES */}
      <div style={{ display: 'flex', gap: '15px', marginBottom: '2.5rem' }}>
        {categories.map(cat => (
          <button 
            key={cat.id}
            onClick={() => { setActiveCategory(cat.id); setEditingSection(null); }}
            style={{
              padding: '12px 24px', borderRadius: '15px', border: 'none',
              background: activeCategory === cat.id ? '#0f172a' : '#fff',
              color: activeCategory === cat.id ? '#fff' : '#64748b',
              fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px',
              boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)', transition: 'all 0.2s'
            }}
          >
            {cat.icon} {cat.label}
          </button>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: editingSection ? '1fr 1.5fr' : '1fr', gap: '2rem' }}>
        
        {/* LISTE DES SECTIONS DANS LA CATEGORIE */}
        <div className="db-card" style={{ padding: '2rem', borderRadius: '30px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
            <h3 style={{ fontWeight: '900', margin: 0 }}>Sections existantes</h3>
            <button className="btn-primary-premium" style={{ padding: '8px 15px', fontSize: '0.8rem' }} onClick={handleCreateSection}>
              <Plus size={16}/> Ajouter
            </button>
          </div>
          
          <div style={{ display: 'grid', gap: '12px' }}>
            {docs.filter(d => d.category === activeCategory).map(doc => (
              <div 
                key={doc._id} 
                style={{ 
                  padding: '15px 20px', borderRadius: '15px', background: '#f8fafc',
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  border: editingSection?._id === doc._id ? '2px solid #0070f3' : '2px solid transparent',
                  cursor: 'pointer'
                }}
                onClick={() => setEditingSection(doc)}
              >
                <span style={{ fontWeight: '700', color: '#1e293b' }}>{doc.title}</span>
                <div style={{ display: 'flex', gap: '10px' }}>
                   <button className="btn-icon-danger" style={{ width: '30px', height: '30px' }} onClick={(e) => { e.stopPropagation(); handleDelete(doc._id); }}>
                     <Trash2 size={14}/>
                   </button>
                </div>
              </div>
            ))}
            {docs.filter(d => d.category === activeCategory).length === 0 && (
              <p style={{ textAlign: 'center', color: '#94a3b8', padding: '2rem' }}>Aucune section dans cette catégorie.</p>
            )}
          </div>
        </div>

        {/* EDITEUR DE SECTION */}
        {editingSection && (
          <div className="db-card animate-up" style={{ padding: '2.5rem', borderRadius: '30px', background: '#fff' }}>
             <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h3 style={{ fontWeight: '900', margin: 0 }}>Éditer la section</h3>
                <button onClick={() => setEditingSection(null)} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}><X size={24}/></button>
             </div>

             <div className="form-group" style={{ marginBottom: '2rem' }}>
                <label>Titre de la section</label>
                <input 
                  type="text" value={editingSection.title} 
                  onChange={(e) => setEditingSection({...editingSection, title: e.target.value})}
                  placeholder="Ex: Étape 1 : Branchement de la batterie"
                />
             </div>

             <div style={{ display: 'grid', gap: '2rem', marginBottom: '2rem' }}>
                {editingSection.steps.map((step, idx) => (
                  <div key={idx} style={{ padding: '20px', background: '#f8fafc', borderRadius: '20px', border: '1px solid #e2e8f0', position: 'relative' }}>
                     <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px', alignItems: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                           <span style={{ fontWeight: '900', color: '#0f172a', fontSize: '0.9rem' }}>Étape {idx + 1}</span>
                           <div style={{ display: 'flex', gap: '5px' }}>
                              <button 
                                onClick={() => handleMoveStep(idx, 'up')}
                                disabled={idx === 0}
                                style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '6px', padding: '2px', cursor: idx === 0 ? 'not-allowed' : 'pointer', opacity: idx === 0 ? 0.3 : 1 }}
                              >
                                <ChevronUp size={14}/>
                              </button>
                              <button 
                                onClick={() => handleMoveStep(idx, 'down')}
                                disabled={idx === editingSection.steps.length - 1}
                                style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '6px', padding: '2px', cursor: idx === editingSection.steps.length - 1 ? 'not-allowed' : 'pointer', opacity: idx === editingSection.steps.length - 1 ? 0.3 : 1 }}
                              >
                                <ChevronDown size={14}/>
                              </button>
                           </div>
                        </div>
                        {editingSection.steps.length > 1 && (
                          <button onClick={() => {
                            const newSteps = [...editingSection.steps];
                            newSteps.splice(idx, 1);
                            setEditingSection({...editingSection, steps: newSteps});
                          }} style={{ color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer' }}><Trash2 size={16}/></button>
                        )}
                     </div>

                     <div className="form-group" style={{ marginBottom: '15px' }}>
                        <input 
                          type="text" value={step.title} placeholder="Titre de l'étape"
                          onChange={(e) => handleStepChange(idx, 'title', e.target.value)}
                        />
                     </div>
                     
                     <div className="form-group" style={{ marginBottom: '15px' }}>
                        <textarea 
                          rows="3" value={step.content} placeholder="Description détaillée..."
                          onChange={(e) => handleStepChange(idx, 'content', e.target.value)}
                        />
                     </div>

                     <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                        <div style={{ flex: 1 }}>
                           <label className="btn-secondary-premium" style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 15px', fontSize: '0.85rem', cursor: 'pointer' }}>
                              <Upload size={16}/> {step.mediaUrl ? 'Changer média' : 'Ajouter Image/Vidéo'}
                              <input type="file" hidden accept="image/*,video/*" onChange={(e) => handleFileUpload(idx, e.target.files[0])} />
                           </label>
                        </div>
                        {step.mediaUrl && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <div 
                              onClick={() => setPreviewMedia({ url: step.mediaUrl, type: step.mediaType })}
                              style={{ 
                                width: '100px', height: '60px', background: '#000', borderRadius: '12px', 
                                overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                cursor: 'pointer', border: '2px solid #fff', boxShadow: '0 4px 10px rgba(0,0,0,0.2)',
                                transition: 'transform 0.2s'
                              }}
                              onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                              onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
                            >
                               {step.mediaType === 'image' ? (
                                 <img crossOrigin="anonymous" src={`${SERVER_URL}${step.mediaUrl}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="Aperçu" />
                               ) : (
                                 <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px' }}>
                                   <Video size={18} color="#fff"/>
                                   <span style={{ fontSize: '0.5rem', color: '#fff', fontWeight: 'bold' }}>VIDÉO</span>
                                 </div>
                               )}
                            </div>
                            <button 
                              onClick={() => {
                                const newSteps = [...editingSection.steps];
                                newSteps[idx].mediaUrl = '';
                                newSteps[idx].mediaType = 'none';
                                setEditingSection({ ...editingSection, steps: newSteps });
                              }}
                              style={{ background: '#fee2e2', border: 'none', color: '#ef4444', padding: '8px', borderRadius: '10px', cursor: 'pointer' }}
                              title="Supprimer le média"
                            >
                               <Trash2 size={16} />
                            </button>
                          </div>
                        )}
                     </div>
                  </div>
                ))}
             </div>

             <div style={{ display: 'flex', gap: '15px' }}>
                <button className="btn-secondary-premium" onClick={handleAddStep} style={{ flex: 1 }}>+ Ajouter une étape</button>
                <button className="btn-primary-premium" onClick={handleSave} style={{ flex: 1, background: '#10b981' }}>
                  <Save size={18}/> Enregistrer la section
                </button>
             </div>
          </div>
        )}
      </div>

      {/* MODAL D'AGRANDISSEMENT MÉDIA */}
      {previewMedia && (
        <div className="modal-overlay" onClick={() => setPreviewMedia(null)}>
           <div 
             className="db-card animate-up" 
             style={{ maxWidth: '90vw', maxHeight: '90vh', padding: '10px', background: '#000', borderRadius: '20px', overflow: 'hidden', position: 'relative' }}
             onClick={(e) => e.stopPropagation()}
           >
              <button 
                onClick={() => setPreviewMedia(null)}
                style={{ position: 'absolute', top: '15px', right: '15px', background: 'rgba(0,0,0,0.5)', border: 'none', color: '#fff', borderRadius: '50%', padding: '5px', cursor: 'pointer', zIndex: 10 }}
              >
                <X size={20}/>
              </button>
              {previewMedia.type === 'image' ? (
                <img crossOrigin="anonymous" src={`${SERVER_URL}${previewMedia.url}`} style={{ maxWidth: '100%', maxHeight: '80vh', display: 'block' }} alt="Agrandissement" />
              ) : (
                <video crossOrigin="anonymous" controls autoPlay style={{ maxWidth: '100%', maxHeight: '80vh', display: 'block' }}>
                   <source src={`${SERVER_URL}${previewMedia.url}`} />
                </video>
              )}
           </div>
        </div>
      )}
    </div>
  );
};

export default AdminDocs;
