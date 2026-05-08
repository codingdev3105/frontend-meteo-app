import React, { useState } from 'react';
import { Mail, MapPin, Phone, Send, CheckCircle } from 'lucide-react';
import Button from '../../components/ui/Button';
import PublicLayout from '../../components/layout/PublicLayout';

const Contact = () => {
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <PublicLayout>
      <section className="py-12 md:py-24 px-6 max-w-7xl mx-auto transition-colors duration-500">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24">
          <div className="text-center lg:text-left">
            <h1 className="text-4xl md:text-6xl font-black text-slate-900 dark:text-white mb-6 tracking-tighter">
              Contactez <br className="hidden md:block"/> 
              <span className="text-primary italic">nos experts.</span>
            </h1>
            <p className="text-lg md:text-xl text-slate-800 dark:text-slate-300 mb-12 leading-relaxed font-bold">
              Une question technique ? Un besoin spécifique pour votre réseau de stations ? Notre équipe est là pour vous accompagner.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-6 text-left max-w-lg mx-auto lg:mx-0">
              {[
                { icon: <Mail size={24} />, title: "Email", val: "support@meteo-pro.systems" },
                { icon: <Phone size={24} />, title: "Téléphone", val: "+33 (0)1 23 45 67 89" },
                { icon: <MapPin size={24} />, title: "Bureaux", val: "Parc Technologique, 75000 Paris" }
              ].map((item, idx) => (
                <div key={idx} className="flex items-center space-x-6 bg-white dark:bg-slate-900/50 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm transition-all duration-500 group hover:border-primary/30">
                  <div className="bg-primary/10 dark:bg-primary/20 p-4 rounded-xl text-primary transition-colors group-hover:bg-primary group-hover:text-white">
                    {item.icon}
                  </div>
                  <div>
                    <h4 className="font-black text-slate-900 dark:text-white text-sm uppercase tracking-widest">{item.title}</h4>
                    <p className="text-slate-800 dark:text-slate-400 font-bold">{item.val}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900/40 p-6 md:p-12 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-2xl shadow-slate-200/50 dark:shadow-none transition-all duration-500 backdrop-blur-sm">
            {submitted ? (
              <div className="text-center py-12">
                <div className="w-24 h-24 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-8 animate-bounce border-2 border-emerald-100 dark:border-emerald-500/20">
                  <CheckCircle size={48} />
                </div>
                <h3 className="text-3xl font-black text-slate-900 dark:text-white mb-4 tracking-tight">Message envoyé !</h3>
                <p className="text-slate-800 dark:text-slate-400 font-bold mb-8">Nous avons bien reçu votre demande et vous répondrons dans les plus brefs délais.</p>
                <Button variant="secondary" className="px-10 py-4 font-bold border-2 dark:border-slate-700 dark:hover:bg-slate-800" onClick={() => setSubmitted(false)}>Renvoyer un message</Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-widest ml-1">Nom complet</label>
                    <input 
                      required 
                      type="text" 
                      className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 rounded-2xl focus:bg-white dark:focus:bg-slate-900 focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all font-bold text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-600" 
                      placeholder="Jean Dupont" 
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-widest ml-1">Email professionnel</label>
                    <input 
                      required 
                      type="email" 
                      className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 rounded-2xl focus:bg-white dark:focus:bg-slate-900 focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all font-bold text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-600" 
                      placeholder="jean@entreprise.com" 
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-widest ml-1">Sujet de votre demande</label>
                  <div className="relative">
                    <select className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 rounded-2xl focus:bg-white dark:focus:bg-slate-900 focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all font-bold text-slate-900 dark:text-white appearance-none">
                      <option>Support technique IoT</option>
                      <option>Devis pour parc de stations</option>
                      <option>Intégration API / Cloud</option>
                      <option>Autre demande</option>
                    </select>
                    <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                      <ChevronRight size={20} className="rotate-90" />
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-widest ml-1">Message</label>
                  <textarea 
                    required 
                    rows="6" 
                    className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 rounded-2xl focus:bg-white dark:focus:bg-slate-900 focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all font-bold text-slate-900 dark:text-white resize-none placeholder:text-slate-400 dark:placeholder:text-slate-600" 
                    placeholder="Comment pouvons-nous vous aider ?"
                  ></textarea>
                </div>
                <Button type="submit" className="w-full py-5 text-lg font-black flex items-center justify-center space-x-3 shadow-xl shadow-primary/20">
                  <Send size={20} />
                  <span>Envoyer ma demande</span>
                </Button>
              </form>
            )}
          </div>
        </div>
      </section>
    </PublicLayout>
  );
};

// Simple Chevron import for the select
const ChevronRight = ({ size, className }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <path d="m9 18 6-6-6-6"/>
  </svg>
);

export default Contact;
