
import React, { useState } from 'react';
import { 
  Plus, Trash2, Edit3, GripVertical, FileText, Music, 
  Link as LinkIcon, X, Share2, Copy, Check, Terminal, 
  Folder, ArrowRightLeft 
} from 'lucide-react';
import { Resource, ResourceType } from '../types.ts';
import { ResourceForm } from './ResourceForm.tsx';

interface AdminViewProps {
  resources: Resource[];
  modules: string[];
  onAdd: (r: Resource) => void;
  onDelete: (id: string) => void;
  onUpdate: (r: Resource) => void;
  onReorder: (newResources: Resource[]) => void;
  onUpdateModules: (modules: string[]) => void;
}

export const AdminView: React.FC<AdminViewProps> = ({ 
  resources, 
  modules: availableModules, 
  onAdd, 
  onDelete, 
  onUpdate, 
  onReorder,
  onUpdateModules
}) => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isSyncOpen, setIsSyncOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [editingResource, setEditingResource] = useState<Resource | null>(null);
  
  const [draggedResourceId, setDraggedResourceId] = useState<string | null>(null);
  const [draggedModuleName, setDraggedModuleName] = useState<string | null>(null);
  const [dropTargetId, setDropTargetId] = useState<string | null>(null);

  const getIconForType = (type: ResourceType) => {
    switch (type) {
      case 'PDF': return <FileText size={18} />;
      case 'Áudio': return <Music size={18} />;
      case 'Link': return <LinkIcon size={18} />;
    }
  };

  const handleEdit = (r: Resource) => {
    setEditingResource(r);
    setIsFormOpen(true);
  };

  const handleDeleteModule = (moduleName: string) => {
    const moduleResources = resources.filter(r => (r.module || 'Modulo 1') === moduleName);
    const message = moduleResources.length > 0 
      ? `Tem certeza que deseja apagar o módulo "${moduleName}" e TODOS os seus ${moduleResources.length} recursos? Esta ação é irreversível.`
      : `Tem certeza que deseja apagar o módulo vazio "${moduleName}"?`;

    if (window.confirm(message)) {
      const filteredResources = resources.filter(r => (r.module || 'Modulo 1') !== moduleName);
      onReorder(filteredResources);
      const filteredModules = availableModules.filter(m => m !== moduleName);
      onUpdateModules(filteredModules);
    }
  };

  const handleDragStartModule = (e: React.DragEvent, moduleName: string) => {
    // IMPORTANTE: Prevenir o arrasto se o usuário clicou em um botão
    if ((e.target as HTMLElement).closest('button')) {
      e.preventDefault();
      return;
    }
    
    setDraggedModuleName(moduleName);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', moduleName);
  };

  const handleDropModule = (targetModule: string) => {
    if (!draggedModuleName || draggedModuleName === targetModule) {
      setDraggedModuleName(null);
      return;
    }

    const currentModules = [...availableModules];
    const fromIdx = currentModules.indexOf(draggedModuleName);
    const toIdx = currentModules.indexOf(targetModule);

    if (fromIdx === -1 || toIdx === -1) {
      setDraggedModuleName(null);
      return;
    }

    const newModulesOrder = [...currentModules];
    const [movedModule] = newModulesOrder.splice(fromIdx, 1);
    newModulesOrder.splice(toIdx, 0, movedModule);

    onUpdateModules(newModulesOrder);

    const newResourcesOrder: Resource[] = [];
    newModulesOrder.forEach(mod => {
      newResourcesOrder.push(...resources.filter(r => (r.module || 'Modulo 1') === mod));
    });
    
    const extraResources = resources.filter(r => !newModulesOrder.includes(r.module || 'Modulo 1'));
    newResourcesOrder.push(...extraResources);

    onReorder(newResourcesOrder);
    setDraggedModuleName(null);
  };

  const handleDragStartResource = (e: React.DragEvent, id: string) => {
    if ((e.target as HTMLElement).closest('button')) {
      e.preventDefault();
      return;
    }
    
    setDraggedResourceId(id);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', id);
    e.stopPropagation();
  };

  const handleDragEnd = () => {
    setDraggedResourceId(null);
    setDraggedModuleName(null);
    setDropTargetId(null);
  };

  const handleDragOverResource = (e: React.DragEvent, id: string) => {
    e.preventDefault();
    if (draggedResourceId && draggedResourceId !== id) {
      setDropTargetId(id);
    }
  };

  const handleDropResource = (e: React.DragEvent, targetResourceId: string) => {
    e.preventDefault();
    e.stopPropagation();
    setDropTargetId(null);
    
    if (!draggedResourceId || draggedResourceId === targetResourceId) {
      setDraggedResourceId(null);
      return;
    }

    const dragIdx = resources.findIndex(r => r.id === draggedResourceId);
    if (dragIdx === -1) {
      setDraggedResourceId(null);
      return;
    }

    const targetResource = resources.find(r => r.id === targetResourceId);
    if (!targetResource) {
      setDraggedResourceId(null);
      return;
    }

    const updatedResources = [...resources];
    const [draggedItem] = updatedResources.splice(dragIdx, 1);
    draggedItem.module = targetResource.module;
    
    const newDropIdx = updatedResources.findIndex(r => r.id === targetResourceId);
    if (newDropIdx !== -1) {
      updatedResources.splice(newDropIdx, 0, draggedItem);
    } else {
      updatedResources.push(draggedItem);
    }
    
    onReorder(updatedResources);
    setDraggedResourceId(null);
  };

  const handleDropOnModuleHeader = (e: React.DragEvent, targetModule: string) => {
    e.preventDefault();
    setDropTargetId(null);
    if (draggedResourceId) {
      const dragIdx = resources.findIndex(r => r.id === draggedResourceId);
      if (dragIdx === -1) {
        setDraggedResourceId(null);
        return;
      }

      const updatedResources = [...resources];
      const [draggedItem] = updatedResources.splice(dragIdx, 1);
      draggedItem.module = targetModule;
      
      const targetModuleFirstIdx = updatedResources.findIndex(r => (r.module || 'Modulo 1') === targetModule);
      if (targetModuleFirstIdx !== -1) {
        updatedResources.splice(targetModuleFirstIdx, 0, draggedItem);
      } else {
        updatedResources.push(draggedItem);
      }

      onReorder(updatedResources);
      setDraggedResourceId(null);
    }
  };

  const changeResourceModule = (id: string, newModule: string) => {
    const resource = resources.find(r => r.id === id);
    if (resource) {
      onUpdate({ ...resource, module: newModule });
    }
  };

  const copyToClipboard = () => {
    const jsonContent = JSON.stringify(resources, null, 2);
    const code = `import { Resource } from './types.ts';\n\nexport const MASTER_RESOURCES: Resource[] = ${jsonContent};`;
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-12 pb-20">
      <header className="flex flex-col md:flex-row md:justify-between md:items-end border-b border-white/10 pb-8 gap-8">
        <div>
          <h3 className="font-playfair text-white/40 text-sm tracking-[0.3em] uppercase mb-2">Painel de Gestão</h3>
          <h2 className="font-playfair text-4xl md:text-5xl font-bold tracking-tight">
            Arsenal do <span className="italic text-gold">Admin</span>
          </h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 w-full md:w-auto">
          <button 
            onClick={() => setIsSyncOpen(true)}
            className="group bg-white/5 hover:bg-white/10 text-white px-6 py-4 rounded-lg font-montserrat font-bold text-[10px] tracking-[0.2em] flex items-center justify-center space-x-3 transition-all border border-white/10 hover:border-gold/30"
          >
            <Share2 size={16} className="text-gold group-hover:scale-110 transition-transform" />
            <span>PUBLICAR PARA CLIENTES</span>
          </button>
          <button 
            onClick={() => { setEditingResource(null); setIsFormOpen(true); }}
            className="group bg-gold hover:bg-white text-matte px-6 py-4 rounded-lg font-montserrat font-bold text-[10px] tracking-[0.2em] flex items-center justify-center space-x-3 transition-all shadow-xl shadow-gold/10 hover:shadow-white/5"
          >
            <Plus size={16} className="group-hover:rotate-90 transition-transform" />
            <span>NOVO RECURSO</span>
          </button>
        </div>
      </header>

      <div className="space-y-12">
        {availableModules.length === 0 ? (
          <div className="py-24 text-center border-2 border-dashed border-white/5 rounded-2xl bg-white/[0.02]">
            <p className="text-gray-600 font-montserrat italic tracking-wide">Seu arsenal está sem módulos ativos.</p>
          </div>
        ) : (
          availableModules.map((moduleName) => {
            const moduleResources = resources.filter(r => (r.module || 'Modulo 1') === moduleName);
            return (
              <div 
                key={moduleName} 
                className={`space-y-4 transition-all duration-300 ${draggedModuleName === moduleName ? 'opacity-40 scale-95' : 'opacity-100'}`}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  if (draggedModuleName) handleDropModule(moduleName);
                  if (draggedResourceId) handleDropOnModuleHeader(e, moduleName);
                }}
              >
                <div 
                  draggable 
                  onDragStart={(e) => handleDragStartModule(e, moduleName)}
                  onDragEnd={handleDragEnd}
                  className="flex items-center justify-between border-l-2 border-gold pl-4 bg-white/[0.02] py-3 pr-4 rounded-r-lg cursor-grab active:cursor-grabbing group hover:bg-white/[0.04] transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <GripVertical size={16} className="text-gold/30 group-hover:text-gold transition-colors" />
                    <Folder size={18} className="text-gold" />
                    <h3 className="font-playfair text-xl font-bold tracking-widest text-white/80 uppercase">{moduleName}</h3>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="text-[9px] font-bold text-gray-700 uppercase tracking-widest hidden md:block">
                      Arraste o módulo para reordenar
                    </div>
                    {/* Botão de Excluir Módulo - ÚNICO LOCAL PERMITIDO AGORA */}
                    <button 
                      onMouseDown={(e) => e.stopPropagation()} 
                      onClick={(e) => { 
                        e.stopPropagation(); 
                        handleDeleteModule(moduleName); 
                      }}
                      className="p-3 bg-wine/10 text-wine hover:bg-wine hover:text-white rounded-lg transition-all border border-wine/20 flex items-center justify-center"
                      title="Excluir Módulo e Recursos"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
                
                <div className="space-y-4 min-h-[80px]">
                  {moduleResources.length === 0 ? (
                    <div className="border border-dashed border-white/5 rounded-xl py-10 text-center bg-white/[0.01]">
                       <p className="text-[10px] text-gray-700 font-bold uppercase tracking-widest">Módulo Vazio</p>
                       <p className="text-[9px] text-gray-800 uppercase mt-1">Arraste um recurso para cá</p>
                    </div>
                  ) : (
                    moduleResources.map((resource) => (
                      <div 
                        key={resource.id} 
                        draggable
                        onDragStart={(e) => handleDragStartResource(e, resource.id)}
                        onDragEnd={handleDragEnd}
                        onDragOver={(e) => handleDragOverResource(e, resource.id)}
                        onDragLeave={() => setDropTargetId(null)}
                        onDrop={(e) => handleDropResource(e, resource.id)}
                        className={`bg-sidebar/40 border p-5 rounded-xl flex items-center justify-between group transition-all cursor-grab active:cursor-grabbing ${
                          draggedResourceId === resource.id 
                          ? 'opacity-40 border-gold/50 bg-gold/5' 
                          : dropTargetId === resource.id
                          ? 'border-gold bg-gold/10 scale-[1.02] shadow-[0_0_20px_rgba(198,166,100,0.2)]'
                          : 'border-white/5 hover:border-gold/40 hover:bg-sidebar/60'
                        }`}
                      >
                        <div className="flex items-center space-x-4 md:space-x-8 flex-1 min-w-0">
                          <div className="text-white/10 hidden md:block shrink-0 group-hover:text-gold/50 transition-colors">
                            <GripVertical size={20} />
                          </div>
                          <div className="w-14 h-18 md:w-20 md:h-28 bg-matte rounded-lg overflow-hidden flex-shrink-0 border border-white/10 shadow-2xl">
                            <img src={resource.coverBase64} alt="" className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center space-x-3 mb-2">
                              <span className="text-gold bg-gold/10 p-1.5 rounded-md shrink-0">{getIconForType(resource.type)}</span>
                              <h4 className="font-montserrat font-bold text-sm md:text-base tracking-wide truncate text-white/90">{resource.title}</h4>
                            </div>
                            <p className="text-[10px] md:text-xs text-gray-500 line-clamp-1 max-w-md font-medium uppercase tracking-wider">{resource.description}</p>
                            
                            <div className="mt-4 flex items-center space-x-2">
                               <ArrowRightLeft size={10} className="text-gray-700" />
                               <select 
                                 value={resource.module || 'Modulo 1'}
                                 onChange={(e) => changeResourceModule(resource.id, e.target.value)}
                                 onClick={(e) => e.stopPropagation()}
                                 onMouseDown={(e) => e.stopPropagation()}
                                 className="bg-transparent text-[9px] font-bold text-gray-600 uppercase tracking-widest outline-none cursor-pointer hover:text-gold transition-colors"
                               >
                                 {availableModules.map(m => (
                                   <option key={m} value={m} className="bg-matte text-white">{m}</option>
                                 ))}
                               </select>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center space-x-2 md:space-x-8 shrink-0 ml-4">
                          <div className="text-right hidden lg:block">
                            <p className="text-[10px] text-gray-600 font-bold uppercase tracking-widest mb-1">Trava Temporal</p>
                            <p className="text-base font-playfair italic text-gold">{resource.lockDays} dias</p>
                          </div>
                          <div className="flex space-x-2">
                            <button 
                              onMouseDown={e => e.stopPropagation()}
                              onClick={(e) => { e.stopPropagation(); handleEdit(resource); }}
                              className="p-3 text-white/30 hover:text-gold hover:bg-gold/10 rounded-xl transition-all border border-transparent hover:border-gold/20"
                            >
                              <Edit3 size={18} />
                            </button>
                            <button 
                              onMouseDown={e => e.stopPropagation()}
                              onClick={(e) => { e.stopPropagation(); onDelete(resource.id); }}
                              className="p-3 text-white/30 hover:text-wine hover:bg-wine/10 rounded-xl transition-all border border-transparent hover:border-wine/20"
                            >
                              <Trash2 size={18} />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {isSyncOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 md:p-12 bg-matte/98 backdrop-blur-2xl overflow-y-auto">
          <div className="w-full max-w-5xl bg-sidebar border border-gold/20 rounded-2xl shadow-[0_50px_100px_-20px_rgba(0,0,0,1)] overflow-hidden animate-in fade-in zoom-in duration-500 flex flex-col md:flex-row my-auto">
            <div className="w-full md:w-80 bg-black/40 border-b md:border-b-0 md:border-r border-white/5 p-8 md:p-10 space-y-8 shrink-0">
              <h4 className="text-gold font-playfair font-bold italic text-xl uppercase tracking-[0.2em]">Deploy</h4>
              <div className="space-y-8">
                {[1, 2, 3, 4].map(num => (
                  <div key={num} className="flex items-start space-x-4">
                    <div className="w-6 h-6 rounded-full bg-gold/10 border border-gold/30 flex items-center justify-center text-gold text-[10px] font-bold shrink-0">{num}</div>
                    <p className="text-[10px] text-gray-400 font-montserrat leading-relaxed uppercase tracking-widest font-semibold">
                      {num === 1 && "Prepare o arsenal com novos conteúdos."}
                      {num === 2 && "Clique no botão copiar código fonte."}
                      {num === 3 && "Substitua o conteúdo de database.ts."}
                      {num === 4 && "Atualize seu deploy no Netlify/Vercel."}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex-1 p-8 md:p-12 space-y-8 bg-sidebar">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-playfair text-2xl md:text-3xl font-bold text-white uppercase tracking-tight">Sincronização</h3>
                  <p className="text-[10px] text-gold/60 uppercase tracking-[0.3em] font-bold mt-2">Módulo de Exportação Mestra</p>
                </div>
                <button onClick={() => setIsSyncOpen(false)} className="text-gray-500 hover:text-white transition-colors p-3 hover:bg-white/5 rounded-full">
                  <X size={28} />
                </button>
              </div>
              
              <button 
                onClick={copyToClipboard}
                className={`w-full py-6 rounded-xl transition-all flex items-center justify-center space-x-4 font-montserrat font-bold text-[11px] tracking-[0.4em] uppercase shadow-2xl ${
                  copied 
                  ? 'bg-green-600 text-white scale-[0.98]' 
                  : 'bg-gold text-matte hover:bg-white hover:shadow-gold/30'
                }`}
              >
                {copied ? <><Check size={20} /> <span>CÓDIGO COPIADO</span></> : <><Copy size={20} /> <span>COPIAR CÓDIGO FONTE</span></>}
              </button>

              <div className="relative group rounded-xl overflow-hidden border border-white/10">
                <div className="bg-black/90 p-6 pt-12 text-[10px] md:text-[11px] overflow-auto font-mono text-gray-500 max-h-[300px] leading-relaxed custom-scrollbar">
                  <div className="absolute top-4 left-6 flex items-center space-x-2 opacity-40">
                    <Terminal size={14} className="text-gold" />
                    <span className="font-sans uppercase tracking-[0.2em] text-[9px] font-bold">Preview database.ts</span>
                  </div>
                  <pre className="whitespace-pre-wrap break-all">
                    <span className="text-gold/80">import</span> {'{ Resource }'} <span className="text-gold/80">from</span> <span className="text-green-500">'./types.ts'</span>;<br /><br />
                    <span className="text-gold/80">export const</span> <span className="text-yellow-500">MASTER_RESOURCES</span>: Resource[] = {JSON.stringify(resources, null, 2).substring(0, 800)}...
                  </pre>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {isFormOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 md:p-12 bg-matte/98 backdrop-blur-2xl overflow-y-auto">
          <div className="w-full max-w-4xl bg-sidebar border border-white/10 rounded-2xl shadow-[0_50px_100px_-20px_rgba(0,0,0,1)] overflow-hidden animate-in fade-in zoom-in duration-500 my-auto flex flex-col max-h-[90vh]">
            <div className="p-8 border-b border-white/5 flex justify-between items-center bg-black/40">
              <div>
                <h3 className="font-playfair text-2xl md:text-3xl font-bold uppercase tracking-tight">
                  {editingResource ? 'Editar Item' : 'Novo Recurso'}
                </h3>
                <p className="text-[10px] text-gold/60 uppercase tracking-[0.3em] font-bold mt-2">Personalização do Arsenal</p>
              </div>
              <button onClick={() => setIsFormOpen(false)} className="text-gray-500 hover:text-white transition-colors p-3 hover:bg-white/5 rounded-full">
                <X size={28} />
              </button>
            </div>
            <div className="p-8 md:p-12 overflow-y-auto custom-scrollbar flex-1">
              <ResourceForm 
                onSave={(r) => {
                  editingResource ? onUpdate(r) : onAdd(r);
                  setIsFormOpen(false);
                }}
                initialData={editingResource}
                availableModules={availableModules}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
