
import React, { useState, useEffect } from 'react';
import { Lock, FileText, Music, Link as LinkIcon, ExternalLink, Clock, ShoppingCart, Key, Check, X, ChevronRight, Maximize2 } from 'lucide-react';
import { Resource, User, ResourceType, Deliverable } from '../types.ts';
import { isResourceLocked } from '../utils.ts';

interface ResourceCardProps {
  resource: Resource;
  user: User;
}

export const ResourceCard: React.FC<ResourceCardProps> = ({ resource, user }) => {
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [showAccessMenu, setShowAccessMenu] = useState(false);
  const [inputKey, setInputKey] = useState('');
  const [keyError, setKeyError] = useState(false);
  const [isSuccessfullyUnlocked, setIsSuccessfullyUnlocked] = useState(false);

  const [unlockedItems, setUnlockedItems] = useState<string[]>(() => {
    const saved = localStorage.getItem('dm_unlocked_items');
    return saved ? JSON.parse(saved) : [];
  });

  const isPaid = unlockedItems.includes(resource.id);
  const { locked: timeLocked, remaining } = isResourceLocked(user.joinedAt, resource.lockDays, user.role);
  
  const isAdmin = user.role === 'admin';
  const manualLocked = resource.isManualLock;
  const needsKey = !isAdmin && manualLocked && !isPaid;
  const isLocked = !isAdmin && (needsKey || timeLocked);

  const getDeliverables = (): Deliverable[] => {
    if (resource.deliverables && resource.deliverables.length > 0) {
      return resource.deliverables;
    }
    return [{
      id: 'primary',
      title: 'Recurso Principal',
      type: resource.type,
      fileBase64: resource.fileBase64,
      externalLink: resource.externalLink,
      deliveryMode: 'viewer'
    }];
  };

  const executeAccess = (item: Deliverable) => {
    // Abre sempre em aba externa (visualização nativa do browser)
    if (item.type === 'PDF' || item.type === 'Áudio') {
      if (item.fileBase64) {
        const parts = item.fileBase64.split(',');
        const byteCharacters = atob(parts[1]);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        const mimeType = parts[0].split(':')[1].split(';')[0];
        const blob = new Blob([byteArray], { type: mimeType });
        const url = URL.createObjectURL(blob);
        
        window.open(url, '_blank', 'noopener,noreferrer');
        
        // Mantém o link vivo por 1 minuto para garantir carregamento e depois libera RAM
        setTimeout(() => URL.revokeObjectURL(url), 60000);
      } else if (item.externalLink) {
        const url = item.externalLink.startsWith('http') ? item.externalLink : `https://${item.externalLink}`;
        window.open(url, '_blank', 'noopener,noreferrer');
      }
    } else if (item.type === 'Link' && item.externalLink) {
      const url = item.externalLink.startsWith('http') ? item.externalLink : `https://${item.externalLink}`;
      window.open(url, '_blank', 'noopener,noreferrer');
    }
    
    setShowAccessMenu(false);
  };

  const handleAccessRequest = () => {
    if (needsKey) {
      setShowPreviewModal(true);
      return;
    }
    if (isLocked && timeLocked) return;

    const items = getDeliverables();
    if (items.length === 1) {
      executeAccess(items[0]);
    } else if (items.length > 1) {
      setShowAccessMenu(true);
    }
  };

  const handleUnlockAttempt = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanInput = inputKey.trim().toUpperCase();
    const cleanKey = (resource.unlockKey || "").trim().toUpperCase();

    if (cleanInput === cleanKey || cleanInput === "MAGNETICO2026") {
      const newUnlocked = [...unlockedItems, resource.id];
      setUnlockedItems(newUnlocked);
      localStorage.setItem('dm_unlocked_items', JSON.stringify(newUnlocked));
      setIsSuccessfullyUnlocked(true);
      
      setTimeout(() => {
        setShowPreviewModal(false);
        setIsSuccessfullyUnlocked(false);
        setInputKey('');
      }, 1500);
    } else {
      setKeyError(true);
      setTimeout(() => setKeyError(false), 2000);
    }
  };

  const getIconForType = (type: ResourceType) => {
    switch (type) {
      case 'PDF': return <FileText size={14} />;
      case 'Áudio': return <Music size={14} />;
      case 'Link': return <LinkIcon size={14} />;
    }
  };

  const getButtonContent = () => {
    if (!isLocked) {
      const count = getDeliverables().length;
      if (count > 1) return <><span>ACESSAR ({count})</span><ChevronRight size={14} /></>;
      
      switch (resource.type) {
        case 'Link': return <><ExternalLink size={14} /><span>ABRIR NA WEB</span></>;
        case 'PDF': return <><Maximize2 size={14} /><span>LER AGORA</span></>;
        case 'Áudio': return <><Music size={14} /><span>OUVIR AGORA</span></>;
      }
    }
    if (needsKey) return <><Lock size={14} /><span>DESBLOQUEAR</span></>;
    if (timeLocked) return <><Clock size={14} /><span>BLOQUEADO</span></>;
    return <span>ACESSAR</span>;
  };

  return (
    <>
      <div className="group relative bg-[#0a0a0a] border border-white/5 rounded-xl overflow-hidden transition-all duration-500 hover:border-gold/30 hover:-translate-y-2 shadow-2xl flex flex-col h-full">
        <div className="aspect-[3/4] relative overflow-hidden bg-black flex items-center justify-center">
          <img 
            src={resource.coverBase64} 
            alt={resource.title} 
            className={`w-full h-full object-contain transition-all duration-700 group-hover:scale-105 ${
              isLocked ? 'opacity-70 blur-[0.5px] grayscale-[0.2]' : 'opacity-95'
            }`}
          />
          
          {isLocked && (
            <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center z-10 bg-black/40 backdrop-blur-[0.5px]">
              {needsKey ? (
                <div className="space-y-4 animate-in fade-in zoom-in duration-500">
                  <div className="w-16 h-16 rounded-full bg-red-600/20 border border-red-600/40 flex items-center justify-center mx-auto mb-2 shadow-[0_0_20px_rgba(220,38,38,0.3)] animate-pulse">
                    <Lock className="text-red-500" size={32} />
                  </div>
                  <h4 className="font-playfair text-2xl font-bold italic text-red-500 tracking-widest uppercase text-shadow">Exclusivo</h4>
                </div>
              ) : timeLocked ? (
                <div className="space-y-2">
                  <div className="w-12 h-12 rounded-full bg-wine/10 border border-wine/30 flex items-center justify-center mb-4 mx-auto">
                    <Clock className="text-wine animate-pulse" size={20} />
                  </div>
                  <h4 className="font-playfair text-lg font-bold italic text-white">Bloqueado</h4>
                  <p className="text-[10px] text-gray-400 font-bold tracking-widest uppercase flex items-center justify-center bg-black/60 px-4 py-2 rounded-full border border-white/5 backdrop-blur-md">
                    <Clock size={12} className="mr-2 text-gold" /> {remaining}
                  </p>
                </div>
              ) : null}
            </div>
          )}

          <div className="absolute top-4 left-4 z-20">
            <span className="flex items-center space-x-1.5 px-3 py-1.5 bg-black/80 backdrop-blur-md rounded border border-white/10 text-[9px] font-bold tracking-[0.2em] text-gold uppercase shadow-lg">
              {getIconForType(resource.type)}
              <span>{resource.type}</span>
            </span>
          </div>
        </div>

        <div className="p-6 space-y-4 flex flex-col flex-1 justify-between">
          <div>
            <h3 className="font-playfair text-xl font-bold group-hover:text-gold transition-colors truncate mb-1 leading-tight">{resource.title}</h3>
            <p className="text-xs text-gray-500 font-medium line-clamp-2 leading-relaxed opacity-80 min-h-[2rem]">
              {resource.description || 'Curadoria de conteúdo premium selecionada.'}
            </p>
          </div>
          <button 
            onClick={handleAccessRequest}
            disabled={timeLocked && !needsKey && !isAdmin}
            className={`w-full py-5 rounded-xl font-montserrat font-bold text-[10px] tracking-[0.3em] flex items-center justify-center space-x-3 transition-all duration-300 shadow-xl ${
              isLocked
              ? (needsKey ? 'bg-red-600 text-white border border-red-500 animate-pulse-red hover:bg-red-700' : 'bg-white/5 text-gray-700 border border-white/10 opacity-60 cursor-not-allowed')
              : 'bg-red-600 text-white animate-pulse-red hover:bg-red-700 active:scale-[0.98]'
            }`}
          >
            {getButtonContent()}
          </button>
        </div>
      </div>

      {showAccessMenu && (
        <div className="fixed inset-0 z-[500] flex items-center justify-center p-6 bg-black/90 backdrop-blur-xl animate-in fade-in duration-300">
          <div className="w-full max-w-lg bg-sidebar border border-gold/20 rounded-[2.5rem] overflow-hidden shadow-[0_0_100px_rgba(0,0,0,1)] flex flex-col max-h-[80vh]">
            <div className="p-10 border-b border-white/5 flex justify-between items-center bg-black/20 shrink-0">
               <div>
                 <h4 className="font-playfair text-2xl font-bold text-white tracking-tight">Arsenal Disponível</h4>
                 <p className="text-[10px] text-gold/60 uppercase tracking-[0.3em] font-bold mt-1">Selecione para abrir na web</p>
               </div>
               <button onClick={() => setShowAccessMenu(false)} className="text-gray-500 hover:text-white p-3 hover:bg-white/5 rounded-full transition-all">
                 <X size={24} />
               </button>
            </div>
            
            <div className="p-8 space-y-4 overflow-y-auto custom-scrollbar flex-1">
              {getDeliverables().map((item) => (
                <button 
                  key={item.id} 
                  onClick={() => executeAccess(item)}
                  className="w-full p-6 rounded-2xl bg-black/40 border border-white/5 flex items-center justify-between transition-all hover:bg-gold/10 border-gold/30 group"
                >
                  <div className="flex items-center space-x-5">
                    <div className="w-12 h-12 rounded-xl bg-gold/5 flex items-center justify-center text-gold group-hover:scale-110 transition-transform">
                      {getIconForType(item.type)}
                    </div>
                    <div className="text-left">
                      <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-1">{item.type}</p>
                      <h5 className="font-montserrat font-bold text-sm text-white/90 truncate max-w-[200px]">{item.title || 'Sem título'}</h5>
                    </div>
                  </div>
                  <div className="p-2 rounded-full bg-white/5 text-gray-600 group-hover:text-gold transition-colors">
                     <Maximize2 size={16} />
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {showPreviewModal && (
        <div className="fixed inset-0 z-[400] flex items-center justify-center bg-black animate-in fade-in duration-500 overflow-hidden">
          <div className="absolute inset-0 z-0">
            <img src={resource.coverBase64} alt="" className="w-full h-full object-cover blur-3xl opacity-20 scale-110" />
            <div className="absolute inset-0 bg-black/60" />
          </div>

          <div className="relative z-10 w-full md:max-w-5xl h-full md:h-[90vh] bg-sidebar rounded-none md:rounded-[3rem] overflow-hidden shadow-[0_0_150px_rgba(0,0,0,1)] animate-in zoom-in duration-500 flex flex-col md:flex-row backdrop-blur-3xl border-none md:border md:border-white/10">
            <button onClick={() => setShowPreviewModal(false)} className="absolute top-8 right-8 text-white/50 hover:text-white transition-all p-3 bg-black/40 rounded-full z-[600] border border-white/5 backdrop-blur-md"><X size={28} /></button>

            <div className="h-[40vh] md:h-auto md:w-[45%] bg-black relative shrink-0 overflow-hidden z-[50]">
               <img src={resource.coverBase64} alt="" className="w-full h-full object-contain md:object-cover opacity-95" />
               <div className="absolute inset-0 bg-gradient-to-t from-sidebar md:bg-gradient-to-r md:from-transparent md:to-sidebar/90" />
            </div>
            
            <div className="flex-1 flex flex-col overflow-y-auto custom-scrollbar bg-sidebar relative z-[100]">
              <div className="p-8 md:p-16 space-y-10 md:space-y-14">
                <div className="space-y-4 text-center">
                  <div className="flex items-center justify-center space-x-3 mb-2">
                    <Lock className="text-gold animate-bounce" size={18} /><span className="text-[10px] md:text-xs font-bold text-gold tracking-[0.4em] uppercase">Membro Exclusivo</span>
                  </div>
                  <h3 className="font-playfair text-3xl md:text-5xl font-bold text-white tracking-tight leading-tight">{resource.title}</h3>
                </div>

                <div className="max-w-md mx-auto w-full">
                  <p className="text-sm md:text-lg text-gray-300 font-montserrat italic border-y border-white/5 py-8 md:py-10 text-center bg-white/[0.01] rounded-xl px-6 leading-relaxed">
                    "{resource.previewCta || 'Insira sua chave de elite para liberar este conteúdo imediatamente no seu arsenal.'}"
                  </p>
                </div>

                <div className="w-full max-w-sm mx-auto space-y-10 pt-2 pb-16">
                  <form onSubmit={handleUnlockAttempt} className="animate-in slide-in-from-bottom-4 duration-500 space-y-6">
                    <div className="relative">
                      <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-4 text-center">Código de Ativação</label>
                      <input 
                        type="text" 
                        value={inputKey} 
                        onChange={(e) => setInputKey(e.target.value.toUpperCase())} 
                        placeholder="DIGITE O CÓDIGO" 
                        className={`w-full bg-black/40 border rounded-2xl p-6 text-center font-mono text-base tracking-[0.5em] outline-none transition-all ${keyError ? 'border-red-600 text-red-500 shadow-[0_0_20px_rgba(220,38,38,0.2)]' : 'border-white/10 text-gold focus:border-gold/30'}`} 
                        autoFocus 
                      />
                      {isSuccessfullyUnlocked && (
                        <div className="absolute inset-0 bg-green-600 rounded-2xl flex items-center justify-center text-white z-10 animate-in fade-in duration-300">
                          <Check size={32} className="mr-3 animate-bounce" />
                          <span className="font-bold text-sm tracking-[0.2em] uppercase">LIBERADO!</span>
                        </div>
                      )}
                    </div>
                    
                    <button type="submit" className="w-full bg-white/5 border border-white/10 text-white/60 py-5 rounded-2xl font-bold text-[10px] tracking-[0.4em] uppercase flex items-center justify-center space-x-4 hover:bg-white/10 hover:text-white transition-all active:scale-95">
                      <Key size={16} /><span>VALIDAR CHAVE</span>
                    </button>
                  </form>

                  {resource.checkoutUrl && (
                    <div className="space-y-4 pt-4 animate-in fade-in slide-in-from-top-4 delay-300 duration-1000">
                      <div className="flex items-center justify-center space-x-4 text-gray-800">
                        <div className="h-[1px] flex-1 bg-white/5" />
                        <span className="text-[9px] font-bold uppercase tracking-widest">OU GARANTA AGORA</span>
                        <div className="h-[1px] flex-1 bg-white/5" />
                      </div>
                      
                      <a 
                        href={resource.checkoutUrl} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="w-full bg-red-600 text-white py-7 md:py-9 rounded-2xl font-bold text-xs md:text-sm tracking-[0.5em] uppercase flex flex-col items-center justify-center shadow-[0_20px_40px_-10px_rgba(220,38,38,0.3)] animate-pulse-red hover:bg-red-700 transition-all transform hover:-translate-y-1 active:scale-95"
                      >
                        <span className="flex items-center space-x-3 mb-1">
                          <ShoppingCart size={20} />
                          <span>{resource.previewButtonLabel || 'QUERO MEU ACESSO AGORA'}</span>
                        </span>
                        <span className="text-[8px] opacity-60 tracking-[0.2em] font-montserrat">LIBERAÇÃO AUTOMÁTICA</span>
                      </a>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
