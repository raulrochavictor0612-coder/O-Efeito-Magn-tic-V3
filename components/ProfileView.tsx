
import React from 'react';
import { User } from '../types.ts';
import { ShieldCheck, Trophy, Zap, Clock } from 'lucide-react';

interface ProfileViewProps {
  user: User;
  setUser: (u: User) => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({ user }) => {
  const stats = [
    { label: 'STATUS', value: 'MEMBRO ELITE', icon: ShieldCheck },
    { label: 'CONTEÚDOS', value: '12 ACESSADOS', icon: Trophy },
    { label: 'DESDE', value: new Date(user.joinedAt).toLocaleDateString(), icon: Clock },
  ];

  return (
    <div className="space-y-16 max-w-4xl mx-auto">
      <header className="text-center md:text-left">
        <h3 className="font-playfair text-white/40 text-sm tracking-widest uppercase mb-2">Seu Domínio</h3>
        <h2 className="font-playfair text-5xl md:text-7xl font-bold leading-tight">
          Perfil de <br />
          <span className="italic text-gold">{user.name}</span>
        </h2>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat, i) => (
          <div key={i} className="glass p-8 rounded-2xl border border-white/5 flex flex-col items-center text-center group hover:border-gold/30 transition-all duration-500 shadow-xl">
            <div className="w-14 h-14 rounded-full bg-gold/5 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <stat.icon className="text-gold" size={28} strokeWidth={1.5} />
            </div>
            <p className="text-[10px] text-gray-500 font-bold tracking-[0.3em] uppercase mb-2">{stat.label}</p>
            <p className="font-playfair text-xl md:text-2xl font-bold text-white/90">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="glass p-10 md:p-14 rounded-[2rem] border border-white/5 relative overflow-hidden shadow-inner">
        <div className="absolute top-0 right-0 p-8 opacity-[0.05] pointer-events-none">
          <Zap size={180} className="text-gold" />
        </div>
        
        <div className="relative z-10">
          <div className="flex flex-col md:flex-row justify-between items-center md:items-end mb-10 gap-6">
            <div className="text-center md:text-left">
              <h3 className="font-playfair text-3xl font-bold italic mb-3 text-white">Potência Magnética™</h3>
              <p className="text-sm text-gray-500 max-w-md leading-relaxed">Seu nível de influência e autoridade dentro da plataforma baseada no consumo de conteúdo.</p>
            </div>
            <div className="text-right">
              <span className="font-playfair text-6xl md:text-7xl font-bold text-gold drop-shadow-2xl">{user.magneticPower}%</span>
            </div>
          </div>

          <div className="w-full h-5 bg-black/40 rounded-full overflow-hidden border border-white/5 p-1 shadow-inner">
            <div 
              className="h-full bg-gradient-to-r from-gold via-white/80 to-gold rounded-full shadow-[0_0_30px_rgba(198,166,100,0.4)] transition-all duration-1000 ease-out" 
              style={{ width: `${user.magneticPower}%` }}
            />
          </div>
          
          <div className="mt-8 flex items-center justify-between text-[10px] font-bold tracking-[0.3em] text-gray-600 uppercase">
            <span className="hover:text-gold transition-colors">Iniciante</span>
            <span className="hover:text-gold transition-colors">Mestre Magnético</span>
            <span className="hover:text-gold transition-colors text-gold/80">Domínio Supremo</span>
          </div>
        </div>
      </div>

      <div className="pt-12 border-t border-white/5 flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-6">
        <button className="flex-1 bg-white/5 hover:bg-white/10 text-white px-10 py-5 rounded-lg font-montserrat font-bold text-[11px] tracking-[0.3em] uppercase transition-all border border-white/5 hover:border-white/20">
          Editar Dados
        </button>
        <button className="flex-1 bg-wine/20 hover:bg-wine text-white px-10 py-5 rounded-lg font-montserrat font-bold text-[11px] tracking-[0.3em] uppercase transition-all border border-wine/20">
          Mudar Senha
        </button>
      </div>
    </div>
  );
};
