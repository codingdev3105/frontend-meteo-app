import React, { useState } from 'react';
import { CloudRain, Zap, ArrowRight, Cpu, Globe, CheckCircle2, PlayCircle, BookOpen, Video, Activity, History, Settings, Menu, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import './Vitrine.css';
import hero_section_image from '../../assets/hero_section_image.png';

const Accueil = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  return (
    <div className="vitrine-container">
      
      {/* MOBILE MENU OVERLAY */}
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

      {/* HEADER / NAVBAR */}
      <header className="navbar-glass">
        <Link to="/" className="nav-logo" style={{ textDecoration: 'none' }}>
          <CloudRain size={32} color="var(--vp-secondary)" />
          <span>MétéoPro Systems Platform</span>
        </Link>
        
        {/* DESKTOP LINKS */}
        <nav className="nav-links">
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

      {/* HERO SECTION */}
      <section className="hero-section">
        <div className="hero-content">
          <h1 className="hero-title animate-up" style={{ animationDelay: '0.1s' }}>
            Maîtrisez votre climat 
            <span style={{ color: 'var(--vp-secondary)' }}> avec précision</span>
          </h1>
          
          <p className="hero-subtitle animate-up" style={{ animationDelay: '0.2s' }}>
            Découvrez <strong>MétéoPro Systems Platform</strong>, l'écosystème intelligent qui connecte 
            votre exploitation à la puissance du Cloud. Une surveillance constante pour une sérénité totale.
          </p>

          <div className="hero-benefits-group animate-up" style={{ animationDelay: '0.3s' }}>
            <div className="benefit-tag">
               <Cpu size={18} color="var(--vp-secondary)" /> 
               <span>Multi-Nœuds Intelligent</span>
            </div>
            <div className="benefit-tag">
               <Globe size={18} color="var(--vp-secondary)" /> 
               <span>Accès Cloud Universel</span>
            </div>
            <div className="benefit-tag">
               <Activity size={18} color="var(--vp-secondary)" /> 
               <span>Temps Réel Garanti</span>
            </div>
          </div>
          
          <div className="hero-cta-group animate-up" style={{ animationDelay: '0.4s' }}>
            <Link to="/login" className="btn-hero-primary">
              Ouvrir mon Dashboard <ArrowRight size={20} />
            </Link>
            <Link to="/documentation" className="btn-hero-secondary">
               Documentation Illustrée
            </Link>
          </div>
        </div>
        
        <div className="hero-image-container animate-up" style={{ animationDelay: '0.5s' }}>
          <img src={hero_section_image} alt="Système MétéoPro" className="hero-image floating" />
        </div>
      </section>

      {/* SECTION VIDÉO ILLUSTRATIVE */}
      <section className="video-presentation-section">
        <div className="section-header">
           <h2 className="section-title">Découvrez le système en action</h2>
           <p style={{ color: 'var(--vp-text-muted)', marginTop: '1rem' }}>Une démonstration complète de l'interface et du matériel.</p>
        </div>
        <div className="video-container-box">
           <div className="video-wrapper">
              <video 
                controls 
                className="presentation-video"
                poster="/placeholder-video-thumbnail.jpg"
              >
                <source src="/uploads/docs/installation-guide.mp4" type="video/mp4" />
                Votre navigateur ne supporte pas la lecture de vidéos.
              </video>
           </div>
        </div>
      </section>

      {/* SECTION FONCTIONNALITÉS CLÉS (anciennement ÉTAPES) */}
      <section className="steps-section">
        {/* <div className="section-header">
           <h2 className="section-title">Fonctionnement clés du système</h2>
           <p style={{ color: 'var(--vp-text-muted)', marginTop: '1rem' }}>Une installation rapide, une surveillance à vie.</p>
        </div> */}

        <div className="steps-grid">
           <div className="step-card">
              <div className="step-number" style={{ background: 'rgba(16, 185, 129, 0.1)', color: 'var(--vp-secondary)' }}>
                 <Activity size={24} />
              </div>
              <h4>Surveillance en temps réel</h4>
              <p>Suivez l'état de vos capteurs instantanément avec des mises à jour toutes les 60 secondes.</p>
           </div>
           <div className="step-card">
              <div className="step-number" style={{ background: 'rgba(59, 130, 246, 0.1)', color: 'var(--vp-primary)' }}>
                 <History size={24} />
              </div>
              <h4>Historique météo & environnemental</h4>
              <p>Analysez les tendances passées grâce à un archivage complet de toutes les données collectées.</p>
           </div>
           <div className="step-card">
              <div className="step-number" style={{ background: 'rgba(100, 116, 139, 0.1)', color: '#64748b' }}>
                 <Settings size={24} />
              </div>
              <h4>Configuration & Réseau</h4>
              <p>Gérez vos stations et optimisez la communication de votre infrastructure IoT en toute simplicité.</p>
           </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="vitrine-footer">
        <div className="footer-content">
          <div className="footer-brand">
            <div className="nav-logo">
              <CloudRain size={28} color="var(--vp-secondary)" />
              <span>MétéoPro Systems</span>
            </div>
            <p>La solution IoT complète pour les professionnels de l'environnement.</p>
          </div>
          
          <div className="footer-links">
            <h4>Compte</h4>
            <ul>
              <li><Link to="/login">Se Connecter</Link></li>
              <li><Link to="/">Créer un compte</Link></li>
            </ul>
          </div>

          <div className="footer-links">
            <h4>Aide</h4>
            <ul>
              <li><Link to="/documentation">Guide d'installation</Link></li>
              <li><Link to="/contact">Contact</Link></li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          <p>© {new Date().getFullYear()} MétéoPro Systems Platform (PFE 2026)</p>
        </div>
      </footer>
    </div>
  );
};

export default Accueil;
