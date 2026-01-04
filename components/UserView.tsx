
import React from 'react';
import { Resource, User } from '../types.ts';
import { ResourceCard } from './ResourceCard.tsx';
import { Folder, Layers, Sparkles } from 'lucide-react';

interface UserViewProps {
  resources: Resource[];
  user: User;
}

export const UserView: React.FC<UserViewProps> = ({ resources, user }) => {
  const modules = Array.from(new Set(resources.map(r => r.module || 'Modulo 1')));
  
  return (
    <div className="space-y-12 -mt-4 md:-mt-8">
      <style>{`
        @keyframes subtle-zoom {
          0% { transform: scale(1); }
          100% { transform: scale(1.1); }
        }
        .editorial-shadow {
          text-shadow: 0 10px 30px rgba(0,0,0,0.8);
        }
        .grain-overlay {
          background-image: url("https://grainy-gradients.vercel.app/noise.svg");
          filter: contrast(150%) brightness(100%);
        }
      `}</style>

      {/* Banner de Elite Ultra Compacto & Posicionado ao Topo */}
      <header className="relative h-[200px] md:h-[240px] rounded-[2rem] overflow-hidden border border-white/10 shadow-[0_20px_50px_-15px_rgba(0,0,0,0.9)] group">
        {/* Camada de Imagem com Movimento */}
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&q=80&w=2048" 
            alt="Elite Executive" 
            className="w-full h-full object-cover object-top opacity-40 grayscale-[0.2] group-hover:grayscale-0 transition-all duration-[10s] ease-out scale-105"
            style={{ animation: 'subtle-zoom 20s infinite alternate' }}
          />
          {/* Efeito de Spotlight de Estúdio */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(198,166,100,0.1)_0%,rgba(5,5,5,0.95)_80%)]" />
          {/* Textura de Filme (Grão) */}
          <div className="absolute inset-0 grain-overlay opacity-[0.03] pointer-events-none" />
        </div>

        {/* Moldura Interna de Luxo Minimalista */}
        <div className="absolute inset-3 border border-white/5 rounded-[1.5rem] pointer-events-none z-10" />

        {/* Conteúdo Centralizado e Compacto */}
        <div className="relative z-20 h-full flex flex-col justify-center px-8 md:px-14 max-w-xl">
          <div className="flex items-center space-x-3 mb-3 animate-in fade-in slide-in-from-left-6 duration-1000">
            <div className="w-5 h-[1px] bg-gold" />
            <Sparkles className="text-gold" size={10} />
            <h3 className="font-montserrat text-gold text-[8px] font-bold tracking-[0.4em] uppercase">
              COLEÇÃO EXCLUSIVA
            </h3>
          </div>

          <h2 className="font-playfair text-2xl md:text-4xl font-bold leading-tight text-white editorial-shadow animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-200">
            Sua Biblioteca de <br />
            <span className="italic text-gold">Elite Magnética</span>
          </h2>

          <p className="mt-3 text-gray-500 text-[9px] md:text-[11px] max-w-[280px] font-montserrat tracking-wide leading-relaxed opacity-0 animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-500 fill-mode-forwards border-l border-gold/20 pl-4">
            Curadoria reservada de ativos de alto valor.
          </p>
        </div>

        {/* Badge de Autoridade Discreta */}
        <div className="absolute bottom-5 right-7 z-20 hidden md:block opacity-[0.04]">
           <h4 className="font-playfair text-6xl font-black italic select-none">DM</h4>
        </div>
      </header>

      {resources.length === 0 ? (
        <div className="py-20 text-center border border-white/5 bg-sidebar/30 rounded-2xl backdrop-blur-sm">
          <p className="font-playfair text-lg text-gray-600 italic">O arsenal está sendo preparado.</p>
          <p className="text-[8px] text-gray-700 font-bold tracking-widest uppercase mt-4">Aguarde a próxima remessa</p>
        </div>
      ) : (
        <div className="space-y-16">
          {modules.map((moduleName, index) => {
            const moduleResources = resources.filter(r => (r.module || 'Modulo 1') === moduleName);
            if (moduleResources.length === 0) return null;
            
            return (
              <section key={moduleName} className="space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700" style={{ animationDelay: `${index * 150}ms` }}>
                <div className="relative overflow-hidden rounded-2xl border border-white/5 bg-gradient-to-r from-sidebar/80 to-matte/20 p-6 md:p-8 shadow-xl group/module">
                  <div className="absolute top-0 left-0 w-1 h-full bg-gold/40 group-hover/module:bg-gold transition-colors duration-500" />
                  
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
                    <div className="flex items-center space-x-5">
                      <div className="w-12 h-12 rounded-xl bg-gold/5 border border-gold/10 flex items-center justify-center shadow-inner group-hover/module:border-gold/30 transition-all duration-500">
                        <Layers className="text-gold" size={20} strokeWidth={1.5} />
                      </div>
                      <div>
                        <div className="flex items-center space-x-2 mb-1">
                          <span className="text-[8px] font-bold text-gold tracking-[0.2em] uppercase opacity-60">Módulo Ativo</span>
                          <span className="text-[8px] text-gray-600">•</span>
                          <span className="text-[8px] font-bold text-gray-600 tracking-[0.2em] uppercase">{moduleResources.length} Itens</span>
                        </div>
                        <h3 className="font-playfair text-2xl md:text-3xl font-bold italic text-white tracking-tight">
                          {moduleName}
                        </h3>
                      </div>
                    </div>
                  </div>

                  <div className="absolute -right-6 -bottom-6 opacity-[0.02] text-white pointer-events-none select-none">
                    <Folder size={160} />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 md:gap-10">
                  {moduleResources.map((resource) => (
                    <ResourceCard key={resource.id} resource={resource} user={user} />
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
};
