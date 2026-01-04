
import React, { useState } from 'react';
import { Resource, ResourceType, Deliverable, DeliveryMode } from '../types.ts';
import { fileToBase64 } from '../utils.ts';
import { Upload, Link as LinkIcon, ChevronDown, Lock, X, ShoppingCart, Key, Sparkles, ShieldAlert, Plus, Trash2, FileText, Music, BookOpen, Download } from 'lucide-react';

interface ResourceFormProps {
  onSave: (r: Resource) => void;
  initialData: Resource | null;
  availableModules?: string[];
}

export const ResourceForm: React.FC<ResourceFormProps> = ({ 
  onSave, 
  initialData, 
  availableModules = [] 
}) => {
  const [title, setTitle] = useState(initialData?.title || '');
  const [description, setDescription] = useState(initialData?.description || '');
  const [type, setType] = useState<ResourceType>(initialData?.type || 'PDF');
  const [module, setModule] = useState(initialData?.module || availableModules[0] || 'Modulo 1');
  const [lockDays, setLockDays] = useState(initialData?.lockDays || 0);
  const [isManualLock, setIsManualLock] = useState(initialData?.isManualLock || false);
  const [checkoutUrl, setCheckoutUrl] = useState(initialData?.checkoutUrl || '');
  const [unlockKey, setUnlockKey] = useState(initialData?.unlockKey || '');
  const [previewCta, setPreviewCta] = useState(initialData?.previewCta || '');
  const [previewButtonLabel, setPreviewButtonLabel] = useState(initialData?.previewButtonLabel || 'QUERO MEU ACESSO AGORA');
  const [cover, setCover] = useState<string>(initialData?.coverBase64 || '');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isAddingNewModule, setIsAddingNewModule] = useState(false);
  const [newModuleName, setNewModuleName] = useState('');

  const [deliverables, setDeliverables] = useState<Deliverable[]>(() => {
    if (initialData?.deliverables && initialData.deliverables.length > 0) {
      return initialData.deliverables;
    }
    return [];
  });

  const addDeliverable = () => {
    const newItem: Deliverable = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      title: '',
      type: 'PDF',
      deliveryMode: 'viewer' // Padrão agora é sempre viewer (abrir aba)
    };
    setDeliverables([...deliverables, newItem]);
  };

  const updateDeliverable = (id: string, updates: Partial<Deliverable>) => {
    setDeliverables(deliverables.map(d => d.id === id ? { ...d, ...updates } : d));
  };

  const removeDeliverable = (id: string) => {
    setDeliverables(deliverables.filter(d => d.id !== id));
  };

  const handleDeliverableFile = async (id: string, file: File, target: HTMLInputElement) => {
    setIsProcessing(true);
    try {
      const base64 = await fileToBase64(file);
      updateDeliverable(id, { fileBase64: base64 });
    } catch (err) {
      alert("Erro ao processar arquivo.");
    } finally {
      setIsProcessing(false);
      if (target) target.value = '';
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !cover) {
      alert("Título e Capa são obrigatórios.");
      return;
    }

    const finalModule = isAddingNewModule ? newModuleName : module;

    onSave({
      id: initialData?.id || Date.now().toString(),
      title,
      description,
      type,
      deliveryMode: 'viewer', // Forçamos viewer
      module: finalModule,
      lockDays: isManualLock ? 0 : lockDays,
      isManualLock: isManualLock,
      checkoutUrl: isManualLock ? checkoutUrl : '',
      unlockKey: isManualLock ? unlockKey : '',
      previewCta: isManualLock ? previewCta : '',
      previewButtonLabel: isManualLock ? previewButtonLabel : '',
      deliverables,
      coverBase64: cover,
      createdAt: initialData?.createdAt || Date.now()
    });
  };

  const handleCoverChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setIsProcessing(true);
      try {
        const base64 = await fileToBase64(e.target.files[0]);
        setCover(base64);
      } catch (err) {
        alert("Erro ao processar imagem de capa.");
      } finally {
        setIsProcessing(false);
        e.target.value = '';
      }
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-10 font-montserrat">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        <div className="space-y-8">
          <div className="space-y-6">
            <div>
              <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em] mb-3">Título do Recurso</label>
              <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} className="w-full bg-black/40 border border-white/10 rounded-lg p-4 text-sm focus:border-gold/50 outline-none transition-all text-white" placeholder="Ex: O Efeito Magnético 2.0" required />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em] mb-3">Descrição Curta</label>
              <textarea value={description} onChange={(e) => setDescription(e.target.value)} className="w-full bg-black/40 border border-white/10 rounded-lg p-4 text-sm focus:border-gold/50 outline-none transition-all text-white h-24 resize-none" placeholder="Breve resumo..." />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em] mb-3">Módulo</label>
              {isAddingNewModule ? (
                <div className="relative">
                  <input type="text" value={newModuleName} onChange={(e) => setNewModuleName(e.target.value)} className="w-full bg-gold/5 border border-gold/30 rounded-lg p-4 text-sm outline-none text-gold" placeholder="Nome" autoFocus />
                  <button type="button" onClick={() => setIsAddingNewModule(false)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gold/50"><X size={16} /></button>
                </div>
              ) : (
                <div className="relative group">
                  <select value={module} onChange={(e) => e.target.value === 'new' ? setIsAddingNewModule(true) : setModule(e.target.value)} className="w-full bg-black/40 border border-white/10 rounded-lg p-4 text-sm outline-none appearance-none text-white">
                    {availableModules.map(m => <option key={m} value={m} className="bg-matte">{m}</option>)}
                    <option value="new" className="bg-matte text-gold font-bold">+ NOVO MÓDULO</option>
                  </select>
                  <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-600 pointer-events-none" size={16} />
                </div>
              )}
            </div>
            <div>
              <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em] mb-3">Estilo de Ícone</label>
              <div className="relative group">
                <select value={type} onChange={(e) => setType(e.target.value as ResourceType)} className="w-full bg-black/40 border border-white/10 rounded-lg p-4 text-sm outline-none appearance-none text-white">
                  <option value="PDF" className="bg-matte">PDF / E-book</option>
                  <option value="Áudio" className="bg-matte">Podcast / Áudio</option>
                  <option value="Link" className="bg-matte">Link Externo</option>
                </select>
                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-600 pointer-events-none" size={16} />
              </div>
            </div>
          </div>

          <div className="bg-gold/5 border border-gold/10 p-6 rounded-xl space-y-3">
             <div className="flex items-center space-x-2 text-gold">
               <BookOpen size={16} />
               <span className="text-[10px] font-bold uppercase tracking-[0.2em]">Entrega de Conteúdo</span>
             </div>
             <p className="text-[10px] text-gray-400 leading-relaxed font-medium">
               Todos os arquivos PDF serão abertos em uma <span className="text-white">nova aba do navegador</span> para garantir a melhor experiência de leitura e preservar sua formatação personalizada.
             </p>
          </div>

          <div className={`relative p-6 rounded-xl space-y-6 transition-all duration-500 border overflow-hidden ${isManualLock ? 'bg-gold/5 border-gold/20' : 'bg-black/20 border-white/5 opacity-40 grayscale pointer-events-none'}`}>
            {!isManualLock && (
              <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-black/40 backdrop-blur-[1px]">
                <ShieldAlert className="text-gray-600 mb-2" size={20} />
                <span className="text-[8px] font-bold text-gray-600 uppercase tracking-[0.2em]">Ative o Lock Manual para configurar</span>
              </div>
            )}
            <div className="flex items-center space-x-3 mb-2"><ShoppingCart className="text-gold" size={16} /><h4 className="text-[10px] font-bold text-gold uppercase tracking-[0.3em]">Checkout / Venda</h4></div>
            <div className="grid grid-cols-1 gap-4">
              <input type="url" value={checkoutUrl} onChange={(e) => setCheckoutUrl(e.target.value)} className="w-full bg-black/40 border border-gold/20 rounded-lg p-3 text-xs outline-none text-white focus:border-gold/50" placeholder="Link de Venda (Kiwify/etc)" disabled={!isManualLock} />
              <div className="relative">
                <input type="text" value={unlockKey} onChange={(e) => setUnlockKey(e.target.value)} className="w-full bg-black/40 border border-gold/20 rounded-lg p-3 text-xs outline-none text-white focus:border-gold/50 pl-10 font-mono" placeholder="Chave de Desbloqueio" disabled={!isManualLock} />
                <Key className="absolute left-3 top-1/2 -translate-y-1/2 text-gold/40" size={14} />
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-8">
          <div>
            <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em] mb-3">Capa (3:4)</label>
            <div className="relative aspect-[3/4] w-full max-w-[200px] mx-auto bg-black/60 border border-white/10 rounded-xl overflow-hidden group cursor-pointer hover:border-gold/30 transition-all flex flex-col items-center justify-center text-center p-4">
              {cover ? (
                <>
                  <img src={cover} alt="Preview" className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:scale-110 transition-transform duration-700" />
                  <div className="relative z-10 flex flex-col items-center"><Upload size={24} className="text-white mb-2" /><span className="text-[9px] font-bold text-white uppercase tracking-widest bg-black/60 p-2 rounded">Alterar</span></div>
                </>
              ) : (
                <>
                  <Upload size={32} className="text-gray-700 mb-4 group-hover:text-gold transition-colors" />
                  <span className="text-[9px] font-bold text-gray-600 uppercase tracking-widest leading-relaxed">Arraste a capa</span>
                </>
              )}
              <input type="file" accept="image/*" onChange={handleCoverChange} className="absolute inset-0 opacity-0 cursor-pointer z-[20]" />
            </div>
          </div>

          <div className="bg-black/20 p-6 rounded-xl border border-white/5 space-y-6">
            <div className="flex items-center justify-between border-b border-white/5 pb-4">
              <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em]">Arquivos Disponíveis</label>
              <button 
                type="button" 
                onClick={addDeliverable}
                className="flex items-center space-x-2 text-gold hover:text-white transition-colors text-[9px] font-bold uppercase tracking-widest bg-gold/10 px-3 py-1.5 rounded-lg border border-gold/20"
              >
                <Plus size={14} />
                <span>Adicionar</span>
              </button>
            </div>

            <div className="space-y-4 max-h-[300px] overflow-y-auto custom-scrollbar pr-2">
              {deliverables.length === 0 && (
                <p className="text-[9px] text-gray-600 uppercase tracking-widest text-center py-4 italic">Nenhum conteúdo vinculado.</p>
              )}
              {deliverables.map((item, index) => (
                <div key={item.id} className="bg-matte/40 border border-white/5 p-4 rounded-xl space-y-4 animate-in slide-in-from-right-4 duration-300">
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] font-bold text-gray-700 uppercase tracking-tighter">Item #{index + 1}</span>
                    <button type="button" onClick={() => removeDeliverable(item.id)} className="text-red-500/50 hover:text-red-500 transition-colors">
                      <Trash2 size={14} />
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <input 
                      type="text" 
                      value={item.title} 
                      onChange={(e) => updateDeliverable(item.id, { title: e.target.value })} 
                      className="col-span-1 bg-black/60 border border-white/10 rounded p-2 text-[10px] text-white outline-none focus:border-gold/30" 
                      placeholder="Nome do arquivo" 
                    />
                    <select 
                      value={item.type} 
                      onChange={(e) => updateDeliverable(item.id, { type: e.target.value as ResourceType })} 
                      className="col-span-1 bg-black/60 border border-white/10 rounded p-2 text-[10px] text-white outline-none"
                    >
                      <option value="PDF">PDF</option>
                      <option value="Áudio">Áudio</option>
                      <option value="Link">Link</option>
                    </select>
                  </div>

                  {item.type === 'Link' ? (
                    <div className="relative">
                      <input 
                        type="text" 
                        value={item.externalLink || ''} 
                        onChange={(e) => updateDeliverable(item.id, { externalLink: e.target.value })} 
                        className="w-full bg-black/60 border border-white/10 rounded p-2 text-[10px] text-gold outline-none focus:border-gold/30 pl-8" 
                        placeholder="https://..." 
                      />
                      <LinkIcon className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-600" size={12} />
                    </div>
                  ) : (
                    <div className="relative h-20 border border-dashed border-white/10 rounded-lg flex flex-col items-center justify-center group hover:border-gold/20 transition-all overflow-hidden">
                      {item.fileBase64 ? (
                        <div className="flex items-center space-x-2">
                          <span className="text-green-500"><FileText size={16} /></span>
                          <span className="text-[9px] font-bold text-green-500 uppercase tracking-widest">Carregado ✓</span>
                        </div>
                      ) : (
                        <>
                          <Upload size={16} className="text-gray-700 mb-1" />
                          <span className="text-[8px] font-bold text-gray-600 uppercase">Subir {item.type}</span>
                        </>
                      )}
                      <input 
                        type="file" 
                        accept={item.type === 'PDF' ? '.pdf' : 'audio/*'} 
                        onChange={(e) => e.target.files && handleDeliverableFile(item.id, e.target.files[0], e.target)} 
                        className="absolute inset-0 opacity-0 cursor-pointer z-[20]" 
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="bg-sidebar p-6 rounded-xl border border-white/5 space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3"><Lock className="text-wine" size={16} /><h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]">Trava de Arsenal</h4></div>
              <button type="button" onClick={() => setIsManualLock(!isManualLock)} className={`px-3 py-1.5 rounded text-[9px] font-bold tracking-widest uppercase transition-all border ${isManualLock ? 'bg-gold/10 border-gold/30 text-gold shadow-[0_0_15px_rgba(198,166,100,0.2)]' : 'bg-white/5 border-white/10 text-gray-600'}`}>{isManualLock ? 'LOCK MANUAL ATIVO' : 'MANUAL DESLIGADO'}</button>
            </div>
            {isManualLock && (
              <div className="space-y-4 pt-4 border-t border-white/5 animate-in slide-in-from-top-2 duration-300">
                <div className="flex items-center space-x-2 mb-2"><Sparkles className="text-gold" size={14} /><span className="text-[9px] font-bold text-gold uppercase tracking-widest">Configuração do Pop-up</span></div>
                <textarea value={previewCta} onChange={(e) => setPreviewCta(e.target.value)} className="w-full bg-black/40 border border-white/10 rounded p-3 text-[11px] text-white h-20 resize-none outline-none focus:border-gold/30" placeholder="CTA de Venda..." />
                <input type="text" value={previewButtonLabel} onChange={(e) => setPreviewButtonLabel(e.target.value)} className="w-full bg-black/40 border border-white/10 rounded p-3 text-[11px] text-white outline-none focus:border-gold/30" placeholder="Texto do Botão..." />
              </div>
            )}
            <div className={isManualLock ? 'opacity-30 pointer-events-none' : ''}>
              <label className="block text-[9px] font-bold text-gray-600 uppercase tracking-[0.2em] mb-4">Aguardar X dias:</label>
              <div className="flex items-center space-x-6">
                <input type="range" min="0" max="60" step="1" value={lockDays} onChange={(e) => setLockDays(parseInt(e.target.value))} className="flex-1 accent-gold" />
                <span className="font-playfair text-3xl font-bold text-gold italic w-16 text-right">{lockDays}d</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="pt-10 border-t border-white/5 flex justify-end">
        <button type="submit" disabled={isProcessing} className="bg-gold hover:bg-white text-matte px-12 py-5 rounded-lg font-montserrat font-bold text-xs tracking-[0.4em] uppercase transition-all shadow-2xl flex items-center space-x-4 group disabled:opacity-50">
          {isProcessing ? 'Processando...' : <><span>Salvar no Arsenal</span><Upload size={18} className="group-hover:-translate-y-1 transition-transform" /></>}
        </button>
      </div>
    </form>
  );
};
