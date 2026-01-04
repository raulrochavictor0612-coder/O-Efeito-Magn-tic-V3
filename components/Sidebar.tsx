
import React from 'react';
import { 
  Library, 
  ShieldAlert, 
  User as UserIcon, 
  LogOut,
  ChevronRight,
  X
} from 'lucide-react';
import { ViewMode } from '../types.ts';

interface SidebarProps {
  currentView: ViewMode;
  setView: (view: ViewMode) => void;
  userRole: 'admin' | 'user';
  onLogout: () => void;
  isOpen?: boolean;
  onClose?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ 
  currentView, 
  setView, 
  userRole, 
  onLogout,
  isOpen = false,
  onClose
}) => {
  const menuItems = [
    { id: ViewMode.LIBRARY, label: 'BIBLIOTECA', icon: Library },
    ...(userRole === 'admin' ? [{ id: ViewMode.ADMIN, label: 'ARSENAL', icon: ShieldAlert }] : []),
    { id: ViewMode.PROFILE, label: 'PERFIL', icon: UserIcon },
  ];

  const sidebarClasses = `
    fixed inset-y-0 left-0 z-[150] w-72 bg-sidebar border-r border-white/5 flex flex-col h-full transition-all duration-500 ease-in-out
    md:relative md:translate-x-0
    ${isOpen ? 'translate-x-0 shadow-[0_0_100px_rgba(0,0,0,1)]' : '-translate-x-full md:translate-x-0'}
  `;

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/95 backdrop-blur-md z-[140] md:hidden animate-in fade-in duration-500" 
          onClick={onClose}
        />
      )}

      <aside className={sidebarClasses}>
        <div className="p-10 pb-16 flex justify-between items-start">
          <div className="space-y-1">
            <h2 className="font-playfair text-3xl font-bold tracking-tighter leading-none">
              DOMÍNIO
            </h2>
            <h2 className="font-playfair text-3xl font-bold tracking-tighter leading-none italic text-gold">
              MAGNÉTICO<span className="text-[12px] not-italic align-top ml-1 opacity-40">TM</span>
            </h2>
          </div>
          {onClose && (
            <button 
              onClick={onClose}
              className="md:hidden text-gray-500 hover:text-white p-2 hover:bg-white/5 rounded-full transition-all"
            >
              <X size={28} />
            </button>
          )}
        </div>

        <nav className="flex-1 px-6 space-y-3">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => { setView(item.id); onClose?.(); }}
              className={`w-full group flex items-center justify-between px-6 py-5 rounded-xl transition-all duration-500 border relative overflow-hidden ${
                currentView === item.id 
                  ? 'bg-gold/5 text-gold border-gold/30 shadow-[0_10px_30px_-10px_rgba(198,166,100,0.2)]' 
                  : 'text-gray-500 hover:text-white hover:bg-white/[0.03] border-transparent'
              }`}
            >
              {currentView === item.id && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-gold rounded-r-full" />
              )}
              <div className="flex items-center space-x-5">
                <item.icon size={22} strokeWidth={currentView === item.id ? 2 : 1.5} className={`${currentView === item.id ? 'text-gold' : 'text-gray-600 group-hover:text-white'} transition-colors duration-300`} />
                <span className={`text-[11px] font-montserrat font-bold tracking-[0.3em] uppercase ${currentView === item.id ? 'text-gold' : 'text-gray-500 group-hover:text-white'} transition-colors duration-300`}>
                  {item.label}
                </span>
              </div>
              <ChevronRight size={14} className={`transition-all duration-500 ${currentView === item.id ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-2'}`} />
            </button>
          ))}
        </nav>

        <div className="p-10 border-t border-white/5">
          <button 
            onClick={onLogout}
            className="flex items-center space-x-4 text-gray-600 hover:text-wine transition-all group w-full py-4 px-2 hover:bg-wine/5 rounded-xl"
          >
            <div className="p-2 rounded-lg bg-white/[0.02] group-hover:bg-wine/10 transition-colors">
              <LogOut size={18} strokeWidth={1.5} />
            </div>
            <span className="text-[10px] font-bold tracking-[0.2em] uppercase">Encerrar Sessão</span>
          </button>
        </div>
      </aside>
    </>
  );
};
