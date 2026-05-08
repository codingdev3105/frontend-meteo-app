import React from 'react';
import { Link } from 'react-router-dom';
import { Wind, Thermometer, Shield, Zap, BarChart3, ChevronRight, Globe, CloudRain } from 'lucide-react';
import Button from '../../components/ui/Button';
import PublicLayout from '../../components/layout/PublicLayout';

const Home = () => {
  return (
    <PublicLayout>
      {/* Hero Section */}
      <section className="relative pt-12 md:pt-20 pb-20 md:pb-32 overflow-hidden transition-colors duration-500">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <div className="z-10 text-center lg:text-left order-2 lg:order-1">
            <div className="inline-flex items-center space-x-2 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-4 py-2 rounded-full text-sm font-bold mb-6 border border-transparent dark:border-emerald-500/20">
              <span className="flex h-2 w-2 rounded-full bg-emerald-600 dark:bg-emerald-500 animate-pulse"></span>
              <span>Propulsez votre supervision météo</span>
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-7xl font-black text-slate-900 dark:text-white leading-tight md:leading-none mb-8 tracking-tighter transition-colors duration-500">
              Maîtrisez votre climat <br className="hidden sm:block"/>
              <span className="text-primary italic"> avec précision</span>
            </h1>
            <p className="text-lg md:text-xl text-slate-800 dark:text-white mb-10 max-w-xl mx-auto lg:mx-0 leading-relaxed font-bold transition-colors duration-500">
              Découvrez <strong>MétéoPro</strong>, l'écosystème intelligent qui connecte 
              votre exploitation à la puissance du Cloud. Une surveillance constante pour une sérénité totale.
            </p>
            <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 justify-center lg:justify-start">
              <Link to="/register">
                <Button size="lg" className="w-full sm:w-auto px-10">Créer un compte</Button>
              </Link>
              <Link to="/documentation">
                <Button variant="secondary" size="lg" className="w-full sm:w-auto flex items-center justify-center px-10">
                  En savoir plus <ChevronRight size={20} className="ml-2" />
                </Button>
              </Link>
            </div>
          </div>
          
          <div className="relative order-1 lg:order-2 mb-8 lg:mb-0">
            <div className="absolute -top-10 -right-10 md:-top-20 md:-right-20 w-64 md:w-96 h-64 md:h-96 bg-emerald-500/20 rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute -bottom-10 -left-10 md:-bottom-20 md:-left-20 w-64 md:w-96 h-64 md:h-96 bg-emerald-500/10 rounded-full blur-3xl"></div>
            
            <div className="relative bg-white dark:bg-slate-900/50 rounded-[2rem] md:rounded-[3rem] shadow-2xl border border-slate-200 dark:border-slate-800 p-3 md:p-4 transform hover:rotate-1 transition-all duration-700 cursor-pointer">
              <div className="bg-slate-900 rounded-[1.5rem] md:rounded-[2.5rem] overflow-hidden p-6 md:p-10 aspect-video flex flex-col justify-between border border-slate-800">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-slate-400 text-xs md:text-sm font-bold uppercase tracking-widest mb-1">Station active</p>
                    <h3 className="text-white text-xl md:text-3xl font-black tracking-tight">ST-2024-08</h3>
                  </div>
                  <div className="bg-emerald-500 text-white px-3 md:px-4 py-1 rounded-full text-[10px] md:text-xs font-black border border-emerald-400/50 shadow-lg shadow-emerald-500/20">
                    LIVE
                  </div>
                </div>
                
                <div className="grid grid-cols-3 gap-3 md:gap-6">
                  {[
                    { icon: <Thermometer className="text-orange-400" size={20} />, label: "Temp", val: "24.5°C" },
                    { icon: <Wind className="text-sky-400" size={20} />, label: "Vent", val: "12km/h" },
                    { icon: <Zap className="text-yellow-400" size={20} />, label: "Bat", val: "98%" },
                  ].map((item, idx) => (
                    <div key={idx} className="bg-slate-800/50 backdrop-blur-sm p-3 md:p-5 rounded-2xl border border-slate-700">
                      <div className="mb-2">{item.icon}</div>
                      <p className="text-slate-500 text-[10px] uppercase font-black">{item.label}</p>
                      <p className="text-white text-sm md:text-lg font-black">{item.val}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 md:py-32 bg-slate-50 dark:bg-slate-900/10 relative transition-colors duration-500 border-t border-slate-100 dark:border-slate-900">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16 md:mb-24">
            <h2 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white mb-6 tracking-tighter transition-colors duration-500">Pourquoi choisir <span className="text-primary italic">MétéoPro ?</span></h2>
            <p className="text-lg md:text-xl text-slate-800 dark:text-white max-w-2xl mx-auto font-black transition-colors duration-500">Une plateforme IoT pensée pour la performance industrielle et la simplicité SaaS.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-12">
            {[
              { icon: <Zap />, title: "Temps Réel", desc: "Données actualisées chaque seconde via MQTT et protocoles IoT basse latence haute performance." },
              { icon: <Shield />, title: "Sécurisé", desc: "Chiffrement de bout en bout, protocoles TLS et gestion granulaire des rôles." },
              { icon: <BarChart3 />, title: "Analyses", desc: "Visualisez les tendances avec nos graphiques haute résolution et rapports automatiques." },
              { icon: <Globe />, title: "Multi-Stations", desc: "Gérez votre flotte mondiale de stations depuis un centre de contrôle unifié." },
              { icon: <CloudRain />, title: "Précision", desc: "Algorithmes de post-traitement avancés pour une fiabilité de donnée professionnelle." },
              { icon: <ChevronRight />, title: "API Ouverte", desc: "Connectez vos outils métiers et automatisez vos workflows via notre API REST." },
            ].map((f, i) => (
              <div key={i} className="group bg-white dark:bg-slate-900/30 p-8 md:p-10 rounded-[2rem] border border-slate-200 dark:border-slate-800 hover:border-primary/20 dark:hover:border-primary/40 hover:shadow-2xl hover:shadow-primary/5 transition-all duration-500 cursor-pointer">
                <div className="bg-slate-50 dark:bg-slate-800 group-hover:bg-primary/10 text-slate-400 group-hover:text-primary w-14 h-14 rounded-2xl flex items-center justify-center mb-8 transition-colors duration-500">
                  {f.icon}
                </div>
                <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-4 tracking-tight transition-colors duration-500">{f.title}</h3>
                <p className="text-slate-800 dark:text-white leading-relaxed font-bold transition-colors duration-500">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </PublicLayout>
  );
};

export default Home;
