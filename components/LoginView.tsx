
import React, { useState } from 'react';
import { User } from '../types.ts';
import { User as UserIcon, Lock, ArrowRight, Sparkles } from 'lucide-react';

interface LoginViewProps {
  onLogin: (user: User) => void;
}

export const LoginView: React.FC<LoginViewProps> = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const normalizedEmail = email.toLowerCase().trim();

    if (normalizedEmail === 'admin@dominio.com' && password === 'admin123') {
      const adminJoinKey = 'dm_admin_join_date';
      let joinedAt = localStorage.getItem(adminJoinKey);
      if (!joinedAt) {
        joinedAt = Date.now().toString();
        localStorage.setItem(adminJoinKey, joinedAt);
      }
      onLogin({
        id: 'admin-1',
        name: 'Comandante Supremo',
        role: 'admin',
        joinedAt: parseInt(joinedAt),
        magneticPower: 100
      });
      return;
    }

    if (normalizedEmail.includes('@') && password === 'MAGNETICO2026') {
      const joinKey = `dm_join_date_${normalizedEmail}`;
      let joinedAt = localStorage.getItem(joinKey);
      if (!joinedAt) {
        joinedAt = Date.now().toString();
        localStorage.setItem(joinKey, joinedAt);
      }
      onLogin({
        id: 'user-' + normalizedEmail.replace(/[^a-zA-Z0-9]/g, ''),
        name: normalizedEmail.split('@')[0].toUpperCase(),
        role: 'user',
        joinedAt: parseInt(joinedAt),
        magneticPower: 45
      });
    } else {
      setError('Acesso negado. Verifique sua chave de elite.');
    }
  };

  return (
    <div className="min-h-screen bg-matte flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-full opacity-20 pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-[600px] h-[600px] bg-gold/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] bg-wine/10 blur-[120px] rounded-full" />
      </div>
      
      <div className="w-full max-w-md z-10 animate-fade-in-up">
        <div className="text-center mb-12">
          <div className="inline-flex items-center space-x-2 mb-4 px-4 py-1.5 rounded-full border border-gold/20 bg-gold/5">
            <Sparkles size={12} className="text-gold" />
            <span className="text-[9px] font-bold tracking-[0.3em] text-gold uppercase">Portal de Membros Elite</span>
          </div>
          <h1 className="font-playfair text-5xl md:text-6xl font-bold tracking-tighter mb-2">
            DOMÍNIO <span className="text-gold italic">MAGNÉTICO</span>
          </h1>
          <p className="font-montserrat text-[10px] font-bold tracking-[0.5em] text-white/30 uppercase">
            ESTÉTICA • AUTORIDADE • DOMÍNIO
          </p>
        </div>

        <div className="bg-sidebar/40 backdrop-blur-3xl rounded-[2.5rem] border border-white/5 shadow-2xl overflow-hidden">
          <form onSubmit={handleLogin} className="p-10 space-y-8">
            {error && (
              <div className="bg-wine/5 border border-wine/20 p-4 rounded-xl text-[10px] font-bold text-wine tracking-widest uppercase text-center animate-pulse">
                {error}
              </div>
            )}
            
            <div className="space-y-6">
              <div className="group">
                <label className="block text-[9px] font-bold uppercase tracking-[0.3em] text-white/40 mb-3 ml-1">
                  Identidade de Acesso
                </label>
                <div className="relative">
                  <input 
                    type="email" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-black/40 border border-white/10 rounded-2xl p-5 text-sm focus:border-gold/30 outline-none transition-all pl-14 text-white font-montserrat"
                    placeholder="seu@email.com" 
                    required
                  />
                  <UserIcon className="absolute left-5 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-gold transition-colors" size={20} />
                </div>
              </div>

              <div className="group">
                <label className="block text-[9px] font-bold uppercase tracking-[0.3em] text-white/40 mb-3 ml-1">
                  Chave Mestra Individual
                </label>
                <div className="relative">
                  <input 
                    type="password" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-black/40 border border-white/10 rounded-2xl p-5 text-sm focus:border-gold/30 outline-none transition-all pl-14 text-white font-montserrat"
                    placeholder="••••••••"
                    required
                  />
                  <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-gold transition-colors" size={20} />
                </div>
              </div>
            </div>

            <button 
              type="submit"
              className="w-full bg-gold hover:bg-white text-matte py-6 rounded-2xl font-montserrat font-bold text-[11px] tracking-[0.4em] uppercase transition-all flex items-center justify-center space-x-4 group shadow-xl shadow-gold/5 active:scale-95"
            >
              <span>Ativar Arsenal</span>
              <ArrowRight size={18} className="group-hover:translate-x-2 transition-transform" />
            </button>
          </form>
        </div>

        <p className="mt-12 text-center text-white/20 text-[9px] font-bold tracking-[0.2em] uppercase max-w-[280px] mx-auto leading-relaxed">
          O cronômetro de entrega inicia no primeiro acesso.<br />
          © 2026 Domínio Magnético™
        </p>
      </div>
    </div>
  );
};
