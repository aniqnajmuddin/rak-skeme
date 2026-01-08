import React, { useState, useEffect } from 'react';
import { studentDataService } from '../services/studentDataService';
import { 
  Users, Trophy, Calendar, Activity, 
  MapPin, Zap, ArrowRight, Megaphone,
  Tent, Moon, Gift, Coffee, Star, Clock
} from 'lucide-react';
import { TakwimEvent } from '../types';

interface DashboardProps {
  onNavigate: (screen: string) => void;
  userRole?: 'ADMIN' | 'GURU' | null;
}

const DashboardScreen: React.FC<DashboardProps> = ({ onNavigate, userRole }) => {
  const [stats, setStats] = useState({ students: 0, activities: 0, upcoming: 0 });
  const [nearestEvent, setNearestEvent] = useState<TakwimEvent | null>(null);
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [announcement, setAnnouncement] = useState('');
  const [mood, setMood] = useState('NORMAL');

  useEffect(() => {
    const st = studentDataService.getAllStudents().length;
    const ac = studentDataService.activityRecords.length;
    const savedMood = localStorage.getItem('RAK_SYSTEM_MOOD') || 'NORMAL';
    const savedMsg = localStorage.getItem('RAK_ANNOUNCEMENT') || '';
    
    setMood(savedMood);
    setAnnouncement(savedMsg);

    const today = new Date();
    today.setHours(0,0,0,0);
    const upcoming = studentDataService.takwim
      .filter(e => new Date(e.date) >= today)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    setStats({ students: st, activities: ac, upcoming: upcoming.length });
    if (upcoming.length > 0) setNearestEvent(upcoming[0]);
  }, []);

  useEffect(() => {
    if (!nearestEvent) return;
    const timer = setInterval(() => {
      const now = new Date().getTime();
      const eventDate = new Date(nearestEvent.date);
      eventDate.setHours(8, 0, 0, 0); 
      const diff = eventDate.getTime() - now;
      if (diff > 0) {
        setTimeLeft({
          days: Math.floor(diff / (1000 * 60 * 60 * 24)),
          hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((diff % (1000 * 60)) / 1000),
        });
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [nearestEvent]);

  const getMoodConfig = () => {
    switch(mood) {
      case 'SUKAN': return { bg: 'from-rose-900 to-red-600', icon: Trophy, accent: 'text-yellow-400', label: 'MOD SUKAN TAHUNAN' };
      case 'KEM': return { bg: 'from-emerald-900 to-teal-800', icon: Tent, accent: 'text-emerald-300', label: 'MOD PERKHEMAHAN' };
      case 'RAMADAN': return { bg: 'from-indigo-950 to-purple-900', icon: Moon, accent: 'text-indigo-300', label: 'MOD RAMADAN' };
      case 'RAYA': return { bg: 'from-green-900 to-yellow-700', icon: Gift, accent: 'text-yellow-300', label: 'MOD AIDILFITRI' };
      case 'CUTI': return { bg: 'from-orange-900 to-rose-800', icon: Coffee, accent: 'text-orange-200', label: 'MOD CUTI SEKOLAH' };
      default: return { bg: 'from-indigo-900 to-blue-900', icon: Zap, accent: 'text-blue-300', label: 'MOD NORMAL' };
    }
  };

  const mCfg = getMoodConfig();

  const menuItems = [
    { id: 'REKOD', label: 'Rekod Aktiviti', icon: Activity, color: 'bg-emerald-600', count: stats.activities, desc: 'Laporan PAJSK', role: 'GURU' },
    { id: 'TAKWIM', label: 'Takwim Koku', icon: Calendar, color: 'bg-orange-500', count: stats.upcoming, desc: 'Jadual Mingguan', role: 'ALL' },
    { id: 'ANALISIS', label: 'Analisis Data', icon: Trophy, color: 'bg-blue-600', desc: 'Graf & Sijil', role: 'ALL' },
    { id: 'ADMIN', label: 'Admin HQ', icon: Users, color: 'bg-slate-800', count: stats.students, desc: 'Urus Sistem', role: 'ADMIN' },
  ];

  return (
    <div className="flex flex-col h-full bg-[#020617] text-white p-4 md:p-8 pb-32 font-['Manrope'] overflow-y-auto no-scrollbar animate-in fade-in duration-700">
      
      {/* Ticker Hebahan - Slim Version */}
      {announcement && (
        <div className="mb-4 bg-white/5 border border-white/10 rounded-xl p-3 flex items-center gap-3 overflow-hidden shadow-lg backdrop-blur-md">
          <div className="bg-blue-600 p-1.5 rounded-lg animate-pulse shrink-0">
            <Megaphone size={14} />
          </div>
          <div className="flex-1 overflow-hidden">
            <p className="text-[10px] md:text-xs font-black uppercase tracking-[0.1em] whitespace-nowrap animate-marquee">
              {announcement} • {announcement} • {announcement}
            </p>
          </div>
        </div>
      )}

      {/* HEADER SLIM: EVENT & COUNTDOWN */}
      <div className={`w-full bg-gradient-to-br ${mCfg.bg} rounded-[2.5rem] p-6 md:p-10 mb-6 relative overflow-hidden shadow-2xl border border-white/10`}>
        <div className="absolute -right-6 -bottom-6 opacity-10 rotate-12">
            <mCfg.icon size={220} />
        </div>
        
        <div className="relative z-10 flex flex-col lg:flex-row justify-between items-center gap-6">
           <div className="text-center lg:text-left flex-1">
              <span className={`px-3 py-1 bg-black/20 rounded-full text-[9px] font-black uppercase tracking-widest ${mCfg.accent} inline-flex items-center gap-2 mb-3 border border-white/5`}>
                <Clock size={10}/> AKTIVITI AKAN DATANG
              </span>
              
              {nearestEvent ? (
                <>
                  <h2 className="text-4xl md:text-6xl font-['Teko'] font-bold uppercase leading-tight mb-3 drop-shadow-xl">{nearestEvent.title}</h2>
                  <div className="flex flex-wrap gap-2 text-[10px] font-bold uppercase tracking-wider justify-center lg:justify-start opacity-90">
                     <span className="flex items-center gap-1.5 bg-black/30 px-3 py-1.5 rounded-lg border border-white/5"><Calendar size={12}/> {new Date(nearestEvent.date).toLocaleDateString('ms-MY', { day: 'numeric', month: 'short'})}</span>
                     {nearestEvent.venue && <span className="flex items-center gap-1.5 bg-black/30 px-3 py-1.5 rounded-lg border border-white/5"><MapPin size={12}/> {nearestEvent.venue}</span>}
                  </div>
                </>
              ) : (
                <h2 className="text-3xl font-['Teko'] font-bold uppercase text-white/30 italic tracking-widest">Sistem Sedia Menerima Arahan</h2>
              )}
           </div>

           {/* MINI COUNTDOWN CAPSULE */}
           {nearestEvent && (
             <div className="flex bg-black/30 backdrop-blur-xl border border-white/10 p-2 rounded-[2rem] gap-1 shadow-2xl">
                {[
                  { label: 'HARI', val: timeLeft.days },
                  { label: 'JAM', val: timeLeft.hours },
                  { label: 'MINIT', val: timeLeft.minutes },
                ].map((item, i) => (
                  <div key={i} className="flex flex-col items-center justify-center min-w-[65px] md:min-w-[80px] py-2">
                     <span className="text-2xl md:text-4xl font-['Teko'] font-bold leading-none text-white">{item.val}</span>
                     <span className={`text-[7px] font-black uppercase tracking-widest ${mCfg.accent}`}>{item.label}</span>
                  </div>
                ))}
             </div>
           )}
        </div>
      </div>

      {/* QUICK MENU GRID - COMPACT VERSION */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        {menuItems.filter(m => m.role === 'ALL' || userRole === 'ADMIN' || (userRole === 'GURU' && m.role !== 'ADMIN')).map((menu) => (
          <button 
            key={menu.id}
            onClick={() => onNavigate(menu.id)}
            className={`${menu.color} p-5 md:p-6 rounded-[2rem] relative overflow-hidden group hover:translate-y-[-4px] active:scale-95 transition-all shadow-xl h-40 md:h-48 flex flex-col justify-between items-start border border-white/10`}
          >
            <div className="absolute -right-4 -bottom-4 opacity-10 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500">
               <menu.icon size={120} />
            </div>
            
            <div className="bg-black/20 p-2.5 rounded-xl backdrop-blur-md relative z-10">
               <menu.icon size={20} className="text-white"/>
            </div>
            
            <div className="relative z-10 w-full">
               {menu.count !== undefined && <span className="text-3xl md:text-4xl font-['Teko'] font-bold leading-none block">{menu.count}</span>}
               <span className="text-[14px] md:text-lg font-black uppercase tracking-tighter leading-none block mb-1">{menu.label}</span>
               <p className="text-[8px] md:text-[9px] text-white/60 font-bold uppercase tracking-widest leading-none">{menu.desc}</p>
            </div>
          </button>
        ))}
      </div>

      <style>{`
        @keyframes marquee {
          0% { transform: translateX(100%); }
          100% { transform: translateX(-100%); }
        }
        .animate-marquee {
          display: inline-block;
          animation: marquee 15s linear infinite;
        }
      `}</style>

    </div>
  );
};

export default DashboardScreen;