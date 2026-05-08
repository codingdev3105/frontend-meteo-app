import React, { useState, useEffect, useRef } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import { useToast } from '../../components/ui/Toast';
import { api } from '../../api/api';
import { 
  Book, 
  Monitor, 
  HelpCircle, 
  Plus, 
  Trash2, 
  ChevronUp, 
  ChevronDown, 
  Image as ImageIcon, 
  Save, 
  X,
  Loader2,
  FileText
} from 'lucide-react';

const AdminDocs = () => {
  const [activeTab, setActiveTab] = useState('station');
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [allDocs, setAllDocs] = useState([]);
  const [sections, setSections] = useState([]);
  const [selectedSection, setSelectedSection] = useState(null);
  const [steps, setSteps] = useState([]);
  const { addToast } = useToast();
  const fileInputRef = useRef(null);
  const [uploadingStepIndex, setUploadingStepIndex] = useState(null);
  
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [sectionToDelete, setSectionToDelete] = useState(null);

  const categoryMap = {
    'station': 'STATION_GUIDE',
    'platform': 'PLATFORM_GUIDE',
    'faq': 'FAQ'
  };

  const tabs = [
    { id: 'station', label: 'Guide Station', icon: <Book size={18} /> },
    { id: 'platform', label: 'Guide Plateforme', icon: <Monitor size={18} /> },
    { id: 'faq', label: 'Questions Fréquentes', icon: <HelpCircle size={18} /> },
  ];

  const fetchDocs = async () => {
    try {
      setLoading(true);
      const data = await api.getDocs();
      setAllDocs(data);
      filterSections(data, activeTab);
    } catch (err) {
      addToast("Erreur lors du chargement de la documentation", "error");
    } finally {
      setLoading(false);
    }
  };

  const filterSections = (data, tab) => {
    const category = categoryMap[tab];
    const filtered = data.filter(doc => doc.category === category);
    setSections(filtered);
    
    // Auto-select first section if none selected or if tab changed
    if (filtered.length > 0) {
      setSelectedSection(filtered[0]);
      setSteps(filtered[0].steps || []);
    } else {
      setSelectedSection(null);
      setSteps([]);
    }
  };

  useEffect(() => {
    fetchDocs();
  }, []);

  useEffect(() => {
    if (allDocs.length > 0) {
      filterSections(allDocs, activeTab);
    }
  }, [activeTab]);

  const handleAddNewSection = () => {
    const newSection = {
      title: 'Nouvelle Section',
      category: categoryMap[activeTab],
      steps: [{ title: '', content: '', mediaType: 'none' }]
    };
    setSelectedSection(newSection);
    setSteps(newSection.steps);
  };

  const handleSave = async () => {
    if (!selectedSection?.title) {
      return addToast("Le titre de la section est requis", "error");
    }
    
    setIsSaving(true);
    try {
      const docData = {
        ...selectedSection,
        steps: steps.map(s => ({
          title: s.title,
          content: s.content,
          mediaUrl: s.mediaUrl,
          mediaType: s.mediaType
        }))
      };
      await api.saveDocSection(docData);
      addToast("Documentation enregistrée", "success");
      fetchDocs();
    } catch (err) {
      addToast("Erreur lors de l'enregistrement", "error");
    } finally {
      setIsSaving(false);
    }
  };

  const openDeleteModal = (id, e) => {
    e.stopPropagation();
    setSectionToDelete(id);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!sectionToDelete) return;
    
    try {
      await api.deleteDocSection(sectionToDelete);
      addToast("Section supprimée", "success");
      setIsDeleteModalOpen(false);
      setSectionToDelete(null);
      fetchDocs();
    } catch (err) {
      addToast("Erreur lors de la suppression", "error");
    }
  };

  const handleStepChange = (index, field, value) => {
    const newSteps = [...steps];
    newSteps[index] = { ...newSteps[index], [field]: value };
    setSteps(newSteps);
  };

  const handleAddStep = () => {
    setSteps([...steps, { title: '', content: '', mediaType: 'none' }]);
  };

  const handleMoveStep = (index, direction) => {
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === steps.length - 1) return;
    
    const newSteps = [...steps];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    [newSteps[index], newSteps[targetIndex]] = [newSteps[targetIndex], newSteps[index]];
    setSteps(newSteps);
  };

  const handleRemoveStep = (index) => {
    setSteps(steps.filter((_, i) => i !== index));
  };

  const handleFileSelect = async (e) => {
    const file = e.target.files[0];
    if (!file || uploadingStepIndex === null) return;

    const formData = new FormData();
    formData.append('media', file);

    try {
      addToast("Téléchargement en cours...", "info");
      const result = await api.uploadDocMedia(formData);
      
      const newSteps = [...steps];
      newSteps[uploadingStepIndex] = { 
        ...newSteps[uploadingStepIndex], 
        mediaUrl: result.url,
        mediaType: file.type.startsWith('video') ? 'video' : 'image'
      };
      setSteps(newSteps);
      addToast("Fichier ajouté", "success");
    } catch (err) {
      addToast("Erreur lors du téléchargement", "error");
    } finally {
      setUploadingStepIndex(null);
    }
  };

  return (
    <DashboardLayout title="Gestion de la Documentation" isAdmin={true}>
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileSelect} 
        className="hidden" 
        accept="image/*,video/*"
      />

      {/* Header */}
      <div className="mb-12">
        <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight mb-3">Documentation Système</h1>
        <div className="flex items-center space-x-3">
          <div className="w-2.5 h-2.5 rounded-full bg-primary shadow-[0_0_15px_rgba(16,185,129,0.5)]"></div>
          <p className="text-sm font-bold text-slate-500 dark:text-slate-400">Administration des guides interactifs et de la FAQ utilisateur.</p>
        </div>
      </div>

      {/* Main Tabs */}
      <div className="flex flex-wrap items-center gap-4 mb-12">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center space-x-3 px-8 py-5 rounded-[1.5rem] font-black text-sm transition-all duration-300 ${
              activeTab === tab.id 
                ? 'bg-slate-900 dark:bg-primary text-white shadow-2xl shadow-slate-200 dark:shadow-primary/20 scale-105' 
                : 'bg-white dark:bg-slate-900/40 text-slate-500 dark:text-slate-400 border border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/40'
            }`}
          >
            <span className={activeTab === tab.id ? 'text-white' : 'text-primary'}>{tab.icon}</span>
            <span className="uppercase tracking-widest text-[11px]">{tab.label}</span>
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center min-h-[40vh] space-y-6">
          <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] animate-pulse">Chargement de la base...</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-12">
            {/* Left Panel: Sections */}
            <div className="lg:col-span-4 bg-white dark:bg-slate-900/40 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-2xl shadow-slate-100/40 dark:shadow-none p-8 transition-colors duration-500">
              <div className="flex items-center justify-between mb-8">
                <div>
                   <h2 className="text-xl font-black text-slate-900 dark:text-white">Sommaire</h2>
                   <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">{sections.length} sections actives</p>
                </div>
                <button 
                  onClick={handleAddNewSection}
                  className="p-3 bg-primary text-white rounded-xl shadow-lg shadow-primary/20 hover:scale-110 transition-transform"
                  title="Ajouter une section"
                >
                  <Plus size={20} strokeWidth={3} />
                </button>
              </div>

              <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
                {sections.length > 0 ? sections.map(section => (
                  <div 
                    key={section._id || 'new'}
                    onClick={() => {
                      setSelectedSection(section);
                      setSteps(section.steps || []);
                    }}
                    className={`group flex items-center justify-between p-5 rounded-2xl cursor-pointer transition-all border-2 ${
                      (selectedSection?._id === section._id && section._id) || (selectedSection === section)
                        ? 'bg-primary/5 border-primary shadow-sm' 
                        : 'bg-slate-50 dark:bg-slate-800/20 border-transparent hover:border-slate-200 dark:hover:border-slate-700'
                    }`}
                  >
                    <span className={`font-black text-[13px] tracking-tight ${
                      (selectedSection?._id === section._id && section._id) || (selectedSection === section)
                        ? 'text-primary' 
                        : 'text-slate-700 dark:text-slate-300'
                    }`}>
                      {section.title}
                    </span>
                    {section._id && (
                      <button 
                        onClick={(e) => openDeleteModal(section._id, e)}
                        className="p-2 bg-rose-500/10 text-rose-500 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-rose-500 hover:text-white"
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                )) : (
                  <div className="text-center py-12 border-2 border-dashed border-slate-100 dark:border-slate-800 rounded-3xl">
                    <p className="text-slate-400 font-bold italic text-sm">Aucune section définie</p>
                  </div>
                )}
              </div>
            </div>

            {/* Right Panel: Editor */}
            {selectedSection ? (
              <div className="lg:col-span-8 bg-white dark:bg-slate-900/40 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-2xl shadow-slate-100/40 dark:shadow-none p-8 lg:p-12 relative transition-colors duration-500">
                <button 
                  onClick={() => setSelectedSection(null)}
                  className="absolute top-8 right-8 p-2 text-slate-400 hover:text-rose-500 transition-colors"
                >
                  <X size={24} />
                </button>

                <div className="mb-12">
                   <h2 className="text-2xl font-black text-slate-900 dark:text-white">Éditeur de Section</h2>
                   <p className="text-xs font-bold text-slate-400 mt-1 uppercase tracking-[0.2em]">Configuration du contenu pas à pas</p>
                </div>

                <div className="space-y-10">
                  {/* Section Title */}
                  <div className="relative group">
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-4 ml-1">Titre Principal</label>
                    <div className="relative">
                       <div className="absolute top-1/2 left-5 -translate-y-1/2 text-primary">
                          <FileText size={20} />
                       </div>
                       <input 
                         type="text" 
                         placeholder="Ex: Mise en service de la batterie"
                         value={selectedSection.title}
                         onChange={(e) => setSelectedSection({ ...selectedSection, title: e.target.value })}
                         className="w-full p-6 pl-14 bg-slate-50 dark:bg-slate-800/40 border-2 border-slate-100 dark:border-slate-800 rounded-2xl focus:border-primary outline-none font-black text-slate-900 dark:text-white transition-all placeholder:text-slate-300 dark:placeholder:text-slate-600"
                       />
                    </div>
                  </div>

                  {/* Steps List */}
                  <div className="space-y-8">
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] ml-1">Étapes du guide</label>
                    {steps.map((step, index) => (
                      <div key={index} className="bg-slate-50 dark:bg-slate-800/20 border border-slate-100 dark:border-slate-800 rounded-[2.5rem] p-8 space-y-8 transition-all hover:border-primary/20 group/step">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-6">
                            <div className="w-10 h-10 bg-primary text-white rounded-xl flex items-center justify-center font-black text-sm shadow-lg shadow-primary/20">
                               {index + 1}
                            </div>
                            <div className="flex items-center space-x-2 bg-white dark:bg-slate-900 p-1 rounded-lg border border-slate-100 dark:border-slate-800">
                              <button onClick={() => handleMoveStep(index, 'up')} className="p-1.5 text-slate-400 hover:text-primary transition-colors"><ChevronUp size={16}/></button>
                              <div className="w-[1px] h-4 bg-slate-100 dark:bg-slate-800"></div>
                              <button onClick={() => handleMoveStep(index, 'down')} className="p-1.5 text-slate-400 hover:text-primary transition-colors"><ChevronDown size={16}/></button>
                            </div>
                          </div>
                          <button 
                            onClick={() => handleRemoveStep(index)} 
                            className="p-3 text-rose-400 hover:bg-rose-500 hover:text-white rounded-xl transition-all"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>

                        <div className="space-y-5">
                          <input 
                            type="text" 
                            placeholder="Titre de cette étape..."
                            value={step.title}
                            onChange={(e) => handleStepChange(index, 'title', e.target.value)}
                            className="w-full p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:border-primary outline-none font-black text-slate-900 dark:text-white text-sm"
                          />
                          <textarea 
                            rows="4"
                            placeholder="Explications détaillées pour l'utilisateur..."
                            value={step.content}
                            onChange={(e) => handleStepChange(index, 'content', e.target.value)}
                            className="w-full p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:border-primary outline-none font-bold text-slate-600 dark:text-slate-400 text-sm leading-relaxed"
                          ></textarea>
                        </div>

                        {step.mediaUrl && (
                          <div className="relative rounded-3xl overflow-hidden border border-slate-200 dark:border-slate-800 group/media shadow-xl">
                            {step.mediaType === 'video' ? (
                              <video src={`http://localhost:5000${step.mediaUrl}`} className="w-full h-56 object-cover" controls />
                            ) : (
                              <img 
                                src={`http://localhost:5000${step.mediaUrl}`} 
                                alt="" 
                                className="w-full h-56 object-cover cursor-pointer hover:scale-105 transition-transform duration-700" 
                                onClick={() => window.open(`http://localhost:5000${step.mediaUrl}`, '_blank')}
                              />
                            )}
                            <button 
                              onClick={() => handleStepChange(index, 'mediaUrl', null)}
                              className="absolute top-4 right-4 p-3 bg-black/60 text-white rounded-full hover:bg-rose-500 transition-all opacity-0 group-hover/media:opacity-100 backdrop-blur-md"
                            >
                              <X size={16} />
                            </button>
                          </div>
                        )}

                        {!step.mediaUrl && (
                          <button 
                            onClick={() => {
                              setUploadingStepIndex(index);
                              fileInputRef.current.click();
                            }}
                            className="w-full flex items-center justify-center space-x-3 p-5 bg-white dark:bg-slate-900 text-slate-400 dark:text-slate-500 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] hover:text-primary hover:border-primary transition-all border border-dashed border-slate-200 dark:border-slate-800"
                          >
                            <ImageIcon size={18} />
                            <span>Lier un média (Image/Vidéo)</span>
                          </button>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Actions Footer */}
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-6 pt-10 border-t border-slate-100 dark:border-slate-800">
                    <button 
                      onClick={handleAddStep}
                      className="w-full sm:w-auto flex items-center justify-center space-x-3 px-8 py-5 bg-slate-100 dark:bg-slate-800/40 text-slate-900 dark:text-slate-200 rounded-[1.5rem] font-black text-[11px] uppercase tracking-widest hover:bg-primary hover:text-white transition-all border border-transparent"
                    >
                      <Plus size={18} strokeWidth={3} />
                      <span>Ajouter une étape</span>
                    </button>
                    
                    <button 
                      onClick={handleSave}
                      disabled={isSaving}
                      className="w-full sm:w-auto flex items-center justify-center space-x-4 px-12 py-5 bg-primary text-white rounded-[1.5rem] font-black text-[12px] uppercase tracking-[0.2em] hover:scale-105 transition-all shadow-2xl shadow-primary/30 disabled:opacity-50"
                    >
                      {isSaving ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
                      <span>Enregistrer les modifications</span>
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="lg:col-span-8 flex flex-col items-center justify-center p-20 bg-slate-50/50 dark:bg-slate-900/20 border-4 border-dashed border-slate-100 dark:border-slate-800 rounded-[4rem] transition-colors duration-500">
                <div className="bg-white dark:bg-slate-900 p-8 rounded-[2rem] shadow-sm mb-6 border border-slate-100 dark:border-slate-800">
                    <FileText size={64} className="text-primary/20" />
                </div>
                <p className="text-slate-400 dark:text-slate-500 font-bold italic text-center max-w-sm">Sélectionnez une section dans le menu de gauche pour commencer l'édition.</p>
              </div>
            )}
          </div>

          {/* Modal Confirmation de Suppression */}
          <Modal
            isOpen={isDeleteModalOpen}
            onClose={() => setIsDeleteModalOpen(false)}
            title="Suppression Irréversible"
            showFooter={false}
            customIcon={<Trash2 size={28} className="text-rose-500" />}
          >
            <div className="p-8 text-center space-y-8">
               <div className="w-20 h-20 bg-rose-50 dark:bg-rose-500/10 rounded-full flex items-center justify-center mx-auto">
                  <Trash2 className="text-rose-500" size={36} />
               </div>
               <div>
                  <p className="text-slate-600 dark:text-slate-400 font-bold text-lg mb-2">Êtes-vous absolument sûr ?</p>
                  <p className="text-sm text-slate-400 dark:text-slate-500">Cette section et toutes ses étapes seront définitivement supprimées du serveur.</p>
               </div>
               <div className="flex items-center gap-4">
                <button 
                  onClick={() => setIsDeleteModalOpen(false)}
                  className="flex-1 px-8 py-5 bg-slate-100 dark:bg-slate-800 text-slate-500 rounded-2xl font-black text-[11px] uppercase tracking-widest hover:bg-slate-200 transition-all"
                >
                  Annuler
                </button>
                <button 
                  onClick={confirmDelete}
                  className="flex-1 px-8 py-5 bg-rose-500 text-white rounded-2xl font-black text-[11px] uppercase tracking-widest hover:bg-rose-600 transition-all shadow-xl shadow-rose-500/30"
                >
                  Supprimer
                </button>
              </div>
            </div>
          </Modal>

        </>
      )}
    </DashboardLayout>
  );
};

export default AdminDocs;
