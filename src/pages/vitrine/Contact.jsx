import React, { useState } from 'react';
import { Mail, Phone, MapPin, CloudRain, Menu, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import toast, { Toaster } from 'react-hot-toast';
import './Vitrine.css';

const Contact = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [loading, setLoading] = useState(false);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const response = await fetch(`${apiUrl}/api/contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success('Votre message a été envoyé avec succès !');
        setFormData({ name: '', email: '', message: '' });
      } else {
        throw new Error(data.message || "Une erreur est survenue.");
      }
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="vitrine-container">
      
      {/* MOBILE MENU OVERLAY (Synchronisé) */}
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

      {/* HEADER / NAVBAR (Synchronisé) */}
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

      <main style={{ padding: '6rem 5%', minHeight: '80vh' }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
          
          <div className="animate-up" style={{ textAlign: 'center', marginBottom: '4rem' }}>
            <h1 style={{ fontSize: '3.8rem', fontWeight: '900', color: 'var(--vp-primary)', marginBottom: '1.5rem' }}>
              Contacter <span style={{ color: 'var(--vp-secondary)' }}>notre service</span>
            </h1>
            <p style={{ fontSize: '1.3rem', color: 'var(--vp-text-muted)', maxWidth: '700px', margin: '0 auto', lineHeight: '1.6' }}>
              Vous souhaitez déployer une solution de surveillance environnementale intelligente ? 
              Notre équipe d'experts est là pour vous accompagner.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '3rem' }}>
            
            {/* FORMULAIRE PREMIUM */}
            <div className="doc-card" style={{ padding: '3rem' }}>
              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: '0.75rem', fontWeight: '700', fontSize: '1rem', color: '#1e293b' }}>Nom complet</label>
                    <input 
                      type="text" 
                      placeholder="mohammed" 
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      style={{ width: '100%', padding: '1.1rem', borderRadius: '12px', border: '1px solid var(--vp-border)', outline: 'none', background: '#f8fafc', fontSize: '1.1rem' }} 
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '0.75rem', fontWeight: '700', fontSize: '1rem', color: '#1e293b' }}>Email</label>
                    <input 
                      type="email" 
                      placeholder="mohammed@gmail.com" 
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      style={{ width: '100%', padding: '1.1rem', borderRadius: '12px', border: '1px solid var(--vp-border)', outline: 'none', background: '#f8fafc', fontSize: '1.1rem' }} 
                    />
                  </div>
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.75rem', fontWeight: '700', fontSize: '1rem', color: '#1e293b' }}>Message</label>
                  <textarea 
                    rows="5" 
                    placeholder="Comment pouvons-nous vous aider ?" 
                    required
                    value={formData.message}
                    onChange={(e) => setFormData({...formData, message: e.target.value})}
                    style={{ width: '100%', padding: '1.1rem', borderRadius: '12px', border: '1px solid var(--vp-border)', outline: 'none', resize: 'vertical', background: '#f8fafc', fontSize: '1.1rem' }}
                  ></textarea>
                </div>
                <button 
                  type="submit" 
                  disabled={loading}
                  className="btn-hero-primary" 
                  style={{ border: 'none', width: 'fit-content', cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1, padding: '1.1rem 2.5rem', fontSize: '1.1rem' }}
                >
                  {loading ? 'Envoi en cours...' : 'Envoyer le message'}
                </button>
              </form>
            </div>

            {/* INFOS DE CONTACT */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
               <div className="protocol-card" style={{ padding: '2.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginBottom: '1rem' }}>
                     <div style={{ background: 'rgba(5, 150, 105, 0.1)', padding: '18px', borderRadius: '18px' }}>
                        <Mail size={28} color="var(--vp-secondary)" />
                     </div>
                     <div>
                        <h4 style={{ margin: 0, fontSize: '1.25rem', color: 'var(--vp-primary)' }}>Email</h4>
                        <p style={{ margin: 0, color: 'var(--vp-text-muted)', fontSize: '1.15rem' }}>yahiahanani2001@gmail.com</p>
                     </div>
                  </div>
               </div>

               <div className="protocol-card" style={{ padding: '2.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginBottom: '1rem' }}>
                     <div style={{ background: 'rgba(2, 132, 199, 0.1)', padding: '18px', borderRadius: '18px' }}>
                        <Phone size={28} color="var(--vp-accent)" />
                     </div>
                     <div>
                        <h4 style={{ margin: 0, fontSize: '1.25rem', color: 'var(--vp-primary)' }}>Téléphone</h4>
                        <p style={{ margin: 0, color: 'var(--vp-text-muted)', fontSize: '1.15rem' }}>0773198320</p>
                     </div>
                  </div>
               </div>

               <div className="protocol-card" style={{ padding: '2.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginBottom: '1rem' }}>
                     <div style={{ background: 'rgba(30, 41, 59, 0.1)', padding: '18px', borderRadius: '18px' }}>
                        <MapPin size={28} color="var(--vp-primary)" />
                     </div>
                     <div>
                        <h4 style={{ margin: 0, fontSize: '1.25rem', color: 'var(--vp-primary)' }}>Localisation</h4>
                        <p style={{ margin: 0, color: 'var(--vp-text-muted)', fontSize: '1.15rem' }}>Algeria, Algiers, Bordj El Bahri</p>
                     </div>
                  </div>
               </div>
            </div>

          </div>
        </div>
      </main>

      {/* FOOTER MINI */}
      <footer style={{ padding: '3rem 5%', borderTop: '1px solid var(--vp-border)', textAlign: 'center', color: 'var(--vp-text-muted)', fontSize: '0.9rem' }}>
          © {new Date().getFullYear()} MétéoPro Systems Platform - Contact Support
      </footer>

      <Toaster position="top-right" />
    </div>
  );
};

export default Contact;
