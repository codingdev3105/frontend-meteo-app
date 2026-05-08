import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Book, 
  Cpu, 
  Radio, 
  HelpCircle, 
  ChevronRight, 
  Search, 
  CloudRain, 
  Loader2, 
  Activity,
  Monitor,
  MessageCircle,
  Clock,
  ArrowRight,
  X
} from 'lucide-react';
import PublicLayout from '../../components/layout/PublicLayout';
import { api } from '../../api/api';

const Documentation = () => {
  const [docs, setDocs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('station');

  const categoryMap = {
    'station': 'STATION_GUIDE',
    'platform': 'PLATFORM_GUIDE',
    'faq': 'FAQ'
  };

  const tabs = [
    { id: 'station', label: 'Guide Station', icon: <Cpu size={18} />, title: "Guide de la Station Physique", subtitle: "Apprenez à installer et à alimenter votre station météo autonome." },
    { id: 'platform', label: 'Plateforme', icon: <Monitor size={18} />, title: "Interface Cloud & Dashboard", subtitle: "Exploitez toute la puissance de l'analyse de données en temps réel." },
    { id: 'faq', label: 'FAQ', icon: <HelpCircle size={18} />, title: "Questions Fréquentes", subtitle: "Trouvez rapidement des réponses aux interrogations les plus courantes." },
  ];

  const fetchDocs = async () => {
    try {
      setLoading(true);
      const data = await api.getDocs();
      setDocs(data);
    } catch (err) {
      console.error("Error fetching docs:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocs();
  }, []);

  const activeTabData = tabs.find(t => t.id === activeTab);
  const filteredDocs = docs.filter(d => d.category === categoryMap[activeTab]);

  return (
    <PublicLayout>
      <div className="bg-slate-50/50 dark:bg-transparent min-h-screen transition-colors duration-500">
        <div className="max-w-7xl mx-auto px-6 py-12 md:py-24">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
            
            {/* Sidebar Navigation */}
            <aside className="lg:col-span-3 space-y-12">
              <div>
                <p className="text-[10px] font-black text-slate-400 dark:text-white uppercase tracking-[0.2em] mb-8 ml-2">Documentation</p>
                <div className="space-y-2">
                  {tabs.map(tab => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center space-x-4 p-4 rounded-2xl font-black text-sm transition-all duration-300 ${
                        activeTab === tab.id 
                          ? 'bg-[#1e293b] dark:bg-primary text-white shadow-xl shadow-slate-200 dark:shadow-primary/20' 
                          : 'text-slate-500 dark:text-white hover:bg-white dark:hover:bg-slate-900/50 hover:text-slate-900 dark:hover:text-white'
                      }`}
                    >
                      {tab.icon}
                      <span>{tab.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Help Card */}
              <div className="bg-white dark:bg-slate-900/50 p-8 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-sm relative overflow-hidden group transition-colors duration-500 cursor-pointer">
                <div className="absolute top-0 left-0 w-1.5 h-full bg-emerald-500"></div>
                <h4 className="font-black text-slate-900 dark:text-white mb-3">Besoin d'aide ?</h4>
                <p className="text-sm font-medium text-slate-500 dark:text-white leading-relaxed mb-6">
                  Notre équipe technique est à votre disposition pour vous accompagner.
                </p>
                <Link 
                  to="/contact" 
                  className="inline-flex items-center space-x-2 text-[#1e293b] dark:text-primary font-black text-xs uppercase tracking-widest hover:translate-x-2 transition-transform"
                >
                  <MessageCircle size={16} />
                  <span>Contacter le support</span>
                </Link>
              </div>
            </aside>

            {/* Main Content Area */}
            <main className="lg:col-span-9">
              {loading ? (
                <div className="flex flex-col items-center justify-center py-20 space-y-4">
                  <Loader2 className="w-10 h-10 animate-spin text-slate-200 dark:text-slate-800" />
                  <p className="text-[10px] font-black text-slate-400 dark:text-white uppercase tracking-widest animate-pulse">Synchronisation des guides...</p>
                </div>
              ) : (
                <div className="space-y-16 animate-in fade-in slide-in-from-bottom-4 duration-700">
                  {/* Category Header */}
                  <header>
                    <h1 className="text-5xl font-black text-slate-900 dark:text-white mb-4 tracking-tight">
                      {activeTabData?.title}
                    </h1>
                    <p className="text-xl text-slate-500 dark:text-white font-medium leading-relaxed">
                      {activeTabData?.subtitle}
                    </p>
                  </header>

                  {/* Sections List */}
                  <div className="space-y-20">
                    {filteredDocs.length > 0 ? filteredDocs.map((section) => (
                      <div key={section._id} className="space-y-8">
                        <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight flex items-center space-x-4">
                          <span>{section.title}</span>
                        </h2>

                        <div className="space-y-6">
                          {section.steps?.map((step, idx) => (
                            <div key={idx} className="bg-white dark:bg-slate-900/40 p-8 md:p-10 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-xl hover:shadow-slate-200/40 dark:hover:shadow-primary/5 transition-all group duration-500 cursor-pointer">
                              <div className="space-y-6">
                                <div className="flex items-start space-x-4">
                                  <span className="text-xl font-black text-[#1e293b] dark:text-primary leading-tight">
                                    {idx + 1}.
                                  </span>
                                  <div className="flex-1 space-y-4">
                                    <h3 className="text-xl font-black text-slate-900 dark:text-white leading-tight">
                                      {step.title}
                                    </h3>
                                    <p className="text-slate-500 dark:text-white font-medium leading-relaxed text-lg whitespace-pre-wrap">
                                      {step.content}
                                    </p>
                                  </div>
                                </div>

                                {step.mediaUrl && (
                                  <div className="rounded-[2rem] overflow-hidden border border-slate-100 dark:border-slate-800 shadow-inner mt-6 bg-slate-50 dark:bg-slate-950/50">
                                    {step.mediaType === 'video' ? (
                                      <video 
                                        src={`http://localhost:5000${step.mediaUrl}`} 
                                        controls 
                                        className="w-full aspect-video object-cover" 
                                      />
                                    ) : (
                                      <img 
                                        src={`http://localhost:5000${step.mediaUrl}`} 
                                        alt={step.title} 
                                        className="w-full h-auto object-cover cursor-pointer hover:opacity-90 transition-all" 
                                        onClick={() => window.open(`http://localhost:5000${step.mediaUrl}`, '_blank')}
                                      />
                                    )}
                                  </div>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )) : (
                      <div className="flex flex-col items-center justify-center py-20 bg-white dark:bg-slate-900/20 rounded-[3rem] border-2 border-dashed border-slate-100 dark:border-slate-800 transition-colors duration-500">
                        <CloudRain size={64} className="text-slate-100 dark:text-slate-900 mb-4" />
                        <p className="text-slate-400 dark:text-white font-bold italic text-lg">Cette section est en cours de rédaction.</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </main>
          </div>
        </div>
      </div>
    </PublicLayout>
  );
};

export default Documentation;
