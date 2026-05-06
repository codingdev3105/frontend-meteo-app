import React, { useState, useEffect } from 'react';
import { CloudRain, ArrowLeft, Cpu, Globe, HelpCircle, Download, PlayCircle, Activity, X, Video, Menu } from 'lucide-react';
import { Link } from 'react-router-dom';
import { api } from '../../api';
import './Vitrine.css';

const Documentation = () => {
  const [activeTab, setActiveTab] = useState('station');
  const [docs, setDocs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [previewMedia, setPreviewMedia] = useState(null); 
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  // URL de base pour les médias (Backend)
  const SERVER_URL = 'http://localhost:5000';

  useEffect(() => {
    const fetchDocs = async () => {
      try {
        const data = await api.getDocs();
        setDocs(data);
      } catch (err) {
        console.error("Erreur lors de la récupération de la documentation :", err);
      } finally {
        setLoading(false);
      }
    };
    fetchDocs();
  }, []);

  const getFilteredDocs = () => {
    const categoryMap = {
      'station': 'STATION_GUIDE',
      'cloud': 'PLATFORM_GUIDE',
      'faq': 'FAQ'
    };
    return docs.filter(d => d.category === categoryMap[activeTab]);
  };

  if (loading) return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#f8fafc' }}>
      <Activity className="animate-spin" size={40} color="#0070f3" />
      <p style={{ marginTop: '20px', fontWeight: '700', color: '#64748b' }}>Chargement de l'aide...</p>
    </div>
  );

  return (
    <div className="vitrine-container">
      {/* MOBILE MENU OVERLAY (Synchronisé sur toute la vitrine) */}
      <div className={`mobile-menu-overlay ${isMenuOpen ? 'open' : ''}`}>
         <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem', borderBottom: '1px solid rgba(0,0,0,0.05)', paddingBottom: '1.5rem' }}>
            <div className="nav-logo" style={{ fontSize: '1rem' }}>
               <CloudRain size={28} color="var(--vp-secondary)" />
               <span>MétéoPro Systems Platform</span>
            </div>
            <X size={32} onClick={toggleMenu} style={{ cursor: 'pointer', color: 'var(--vp-primary)' }} />
         </div>
         <Link to="/" className="mobile-nav-link" onClick={toggleMenu}>Accueil</Link>
         <Link to="/documentation" className="mobile-nav-link" onClick={toggleMenu}>Documentation</Link>
         <Link to="/contact" className="mobile-nav-link" onClick={toggleMenu}>Contact</Link>
         <Link to="/login" className="nav-btn" style={{ textAlign: 'center', marginTop: '1rem' }} onClick={toggleMenu}>Espace Client</Link>
      </div>

      {/* HEADER / NAVBAR (Synchronisé sur toute la vitrine) */}
      <header className="navbar-glass">
        <Link to="/" className="nav-logo" style={{ textDecoration: 'none' }}>
          <CloudRain size={32} color="var(--vp-secondary)" />
          <span>MétéoPro Systems Platform</span>
        </Link>
        
        {/* DESKTOP LINKS */}
        <nav className="nav-links hide-mobile">
          <Link to="/" className="nav-link">Accueil</Link>
          <Link to="/documentation" className="nav-link">Documentation</Link>
          <Link to="/contact" className="nav-link">Contact</Link>
          <Link to="/login" className="nav-btn">Espace Client</Link>
        </nav>

        {/* HAMBURGER BTN (MOBILE ONLY) */}
        <div className="hamburger-btn" onClick={toggleMenu}>
           <Menu size={28} />
        </div>
      </header>

      <main style={{ padding: '4rem 5%', display: 'flex', gap: '4rem', maxWidth: '1300px', margin: '0 auto' }}>
        
        {/* SIDEBAR NAVIGATION */}
        <aside className="doc-sidebar">
          <h3 className="hide-mobile" style={{ marginBottom: '1.5rem', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '1px', color: '#94a3b8' }}>
            Documentation
          </h3>
          <div className="doc-nav-btn-group">
            <button 
              onClick={() => setActiveTab('station')}
              className={`doc-nav-btn ${activeTab === 'station' ? 'active' : ''}`}
            >
              <Cpu size={18} /> Guide Station
            </button>
            <button 
              onClick={() => setActiveTab('cloud')}
              className={`doc-nav-btn ${activeTab === 'cloud' ? 'active' : ''}`}
            >
              <Globe size={18} /> Plateforme
            </button>
            <button 
              onClick={() => setActiveTab('faq')}
              className={`doc-nav-btn ${activeTab === 'faq' ? 'active' : ''}`}
            >
              <HelpCircle size={18} /> FAQ
            </button>
          </div>

          <div className="protocol-card" style={{ marginTop: '3rem' }}>
             <p style={{ fontSize: '0.95rem', fontWeight: '700', marginBottom: '0.5rem', color: '#1e293b' }}>Besoin d'aide ?</p>
             <p style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '1.5rem', lineHeight: '1.5' }}>Notre équipe technique est à votre disposition pour vous accompagner.</p>
             <Link to="/contact" style={{ fontSize: '0.85rem', fontWeight: '600', color: 'var(--vp-primary)', display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none' }}>
                <HelpCircle size={16} /> Contacter le support
             </Link>
          </div>
        </aside>

        {/* CONTENT AREA */}
        <section style={{ flex: 1 }}>
          <div className="animate-up">
            <h1 style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>
              {activeTab === 'station' && "Guide de la Station Physique"}
              {activeTab === 'cloud' && "Guide de la Plateforme Cloud"}
              {activeTab === 'faq' && "Questions Fréquentes"}
            </h1>
            <p style={{ color: 'var(--vp-text-muted)', fontSize: '1.1rem', marginBottom: '3rem' }}>
              {activeTab === 'station' && "Apprenez à installer et à alimenter votre station météo autonome."}
              {activeTab === 'cloud' && "Maîtrisez les outils de surveillance, les alertes et l'historique."}
              {activeTab === 'faq' && "Réponses aux questions les plus courantes sur le système."}
            </p>

            {getFilteredDocs().map((doc, idx) => (
              <div key={doc._id} className="doc-section" style={{ marginTop: idx === 0 ? 0 : '5rem' }}>
                <h2 style={{ fontSize: '1.8rem', color: '#0f172a', marginBottom: '1.5rem' }}>{doc.title}</h2>
                
                <div style={{ display: 'grid', gap: '2.5rem' }}>
                   {doc.steps.map((step, sIdx) => (
                     <div key={sIdx} className="doc-card">
                        <h4 style={{ fontSize: '1.4rem', marginBottom: '1.25rem', color: '#1e293b', fontWeight: '800' }}>{step.title}</h4>
                        <p style={{ lineHeight: '1.8', color: '#475569', fontSize: '1.05rem', marginBottom: '2.5rem' }}>{step.content}</p>
                        
                        {step.mediaUrl && step.mediaType !== 'none' && (
                          <div 
                            onClick={() => setPreviewMedia({ url: step.mediaUrl, type: step.mediaType })}
                            style={{ 
                              width: '100%', borderRadius: '16px', overflow: 'hidden', 
                              background: '#000', border: '1px solid #e2e8f0', cursor: 'pointer',
                              transition: 'transform 0.3s ease', position: 'relative'
                            }}
                            className="media-preview-hover"
                          >
                             {step.mediaType === 'image' ? (
                               <img crossOrigin="anonymous" src={`${SERVER_URL}${step.mediaUrl}`} style={{ width: '100%', display: 'block' }} alt={step.title} />
                             ) : (
                               <div style={{ position: 'relative' }}>
                                 <video crossOrigin="anonymous" style={{ width: '100%', display: 'block', pointerEvents: 'none' }}>
                                    <source src={`${SERVER_URL}${step.mediaUrl}`} />
                                 </video>
                                 <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.2)' }}>
                                    <div style={{ background: 'rgba(255,255,255,0.2)', padding: '15px', borderRadius: '50%', backdropFilter: 'blur(5px)' }}>
                                       <PlayCircle size={40} color="#fff" />
                                    </div>
                                 </div>
                               </div>
                             )}
                          </div>
                        )}
                     </div>
                   ))}
                </div>
              </div>
            ))}

            {getFilteredDocs().length === 0 && (
              <div style={{ textAlign: 'center', padding: '5rem', background: '#fff', borderRadius: '30px', border: '1px dashed #e2e8f0' }}>
                 <HelpCircle size={48} color="#cbd5e1" style={{ marginBottom: '1.5rem' }} />
                 <h3 style={{ color: '#64748b' }}>Aucun guide disponible pour le moment.</h3>
              </div>
            )}
          </div>
        </section>
      </main>

      {/* MODAL D'AGRANDISSEMENT MÉDIA (PUBLIC) */}
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

      {/* FOOTER MINI */}
      <footer style={{ padding: '3rem 5%', borderTop: '1px solid var(--vp-border)', textAlign: 'center', color: 'var(--vp-text-muted)', fontSize: '0.9rem' }}>
          © {new Date().getFullYear()} MétéoPro Systems Platform - Centre d'Assistance
      </footer>
    </div>
  );
};

export default Documentation;
