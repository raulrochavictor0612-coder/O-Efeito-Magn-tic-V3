
import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar.tsx';
import { UserView } from './components/UserView.tsx';
import { AdminView } from './components/AdminView.tsx';
import { ProfileView } from './components/ProfileView.tsx';
import { LoginView } from './components/LoginView.tsx';
import { ViewMode, Resource, User } from './types.ts';
import { loadResourcesDB, saveResourcesDB } from './utils.ts';
import { MASTER_RESOURCES } from './database.ts';
import { Menu } from 'lucide-react';

const App: React.FC = () => {
  const [view, setView] = useState<ViewMode>(ViewMode.LIBRARY);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [resources, setResources] = useState<Resource[]>([]);
  const [modules, setModules] = useState<string[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  
  // SEMPRE INICIA NULL: Isto resolve o pedido de login obrigatório a cada acesso.
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const localData = await loadResourcesDB();
        const masterIds = new Set(MASTER_RESOURCES.map(r => r.id));
        const filteredLocal = localData.filter(r => !masterIds.has(r.id));
        const allResources = [...MASTER_RESOURCES, ...filteredLocal];
        setResources(allResources);
        
        const initialModules = Array.from(new Set(allResources.map(r => r.module || 'Modulo 1')));
        if (initialModules.length === 0) initialModules.push('Modulo 1');
        
        const savedModules = localStorage.getItem('dm_modules');
        if (savedModules) {
          const parsed = JSON.parse(savedModules);
          const merged = Array.from(new Set([...parsed, ...initialModules]));
          setModules(merged);
        } else {
          setModules(initialModules);
        }
      } catch (e) {
        console.error("Erro ao carregar banco de dados:", e);
        setResources(MASTER_RESOURCES);
        setModules(['Modulo 1']);
      } finally {
        setIsLoaded(true);
      }
    };
    loadData();
  }, []);

  useEffect(() => {
    if (isLoaded) {
      saveResourcesDB(resources).catch(console.error);
      localStorage.setItem('dm_modules', JSON.stringify(modules));
    }
  }, [resources, modules, isLoaded]);

  const addResource = (resource: Resource) => {
    setResources(prev => [resource, ...prev]);
    if (resource.module && !modules.includes(resource.module)) {
      setModules(prev => [...prev, resource.module!]);
    }
  };

  const deleteResource = (id: string) => {
    setResources(prev => prev.filter(r => r.id !== id));
  };

  const updateResource = (updated: Resource) => {
    setResources(prev => prev.map(r => r.id === updated.id ? updated : r));
    if (updated.module && !modules.includes(updated.module)) {
      setModules(prev => [...prev, updated.module!]);
    }
  };

  const reorderResources = (newResources: Resource[]) => {
    setResources(newResources);
  };

  const handleLogout = () => {
    setUser(null);
    setView(ViewMode.LIBRARY);
  };

  const renderContent = () => {
    if (!user) return null;

    switch (view) {
      case ViewMode.LIBRARY:
        return <UserView resources={resources} user={user} />;
      case ViewMode.ADMIN:
        return (
          <AdminView 
            resources={resources} 
            modules={modules}
            onAdd={addResource} 
            onDelete={deleteResource}
            onUpdate={updateResource}
            onReorder={reorderResources}
            onUpdateModules={setModules}
          />
        );
      case ViewMode.PROFILE:
        return <ProfileView user={user} setUser={setUser} />;
      default:
        return <UserView resources={resources} user={user} />;
    }
  };

  if (!user) {
    return <LoginView onLogin={setUser} />;
  }

  return (
    <div className="flex h-screen bg-matte text-white overflow-hidden relative font-montserrat">
      <Sidebar 
        currentView={view} 
        setView={(v) => { setView(v); setIsSidebarOpen(false); }} 
        userRole={user.role} 
        onLogout={handleLogout}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />
      
      <main className="flex-1 overflow-y-auto bg-matte relative custom-scrollbar">
        <div className="md:hidden flex items-center justify-between px-8 py-6 border-b border-white/5 bg-matte/90 backdrop-blur-2xl sticky top-0 z-[100] shadow-2xl">
          <div className="flex flex-col">
            <h2 className="font-playfair text-xl font-bold tracking-tighter leading-none">
              DOMÍNIO <span className="text-gold italic">MAGNÉTICO</span>
            </h2>
          </div>
          <button 
            onClick={() => setIsSidebarOpen(true)}
            className="p-3 text-gold bg-gold/10 hover:bg-gold/20 rounded-xl transition-all active:scale-90"
          >
            <Menu size={24} />
          </button>
        </div>

        <div className="p-8 md:p-16 max-w-7xl mx-auto min-h-full">
          {!isLoaded ? (
            <div className="flex flex-col items-center justify-center h-full space-y-6 pt-20">
              <div className="relative">
                <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-gold"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="h-8 w-8 bg-gold/20 rounded-full animate-pulse" />
                </div>
              </div>
              <p className="font-playfair italic text-gold text-lg animate-pulse tracking-widest">Iniciando Arsenal...</p>
            </div>
          ) : renderContent()}
        </div>
        
        <div className="fixed bottom-0 right-0 p-12 pointer-events-none opacity-[0.03] select-none hidden lg:block">
          <h1 className="font-playfair text-[15rem] italic font-bold text-white leading-none">DM</h1>
        </div>
      </main>
    </div>
  );
};

export default App;
