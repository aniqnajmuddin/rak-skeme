// src/components/DashboardScreen.tsx

import React, { useState, useEffect } from 'react';
import { studentDataService } from '../services/studentDataService';
import { 
  Users, Trophy, Calendar, Activity, 
  MapPin, Zap, ArrowRight 
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

  useEffect(() => {
    // 1. Load Statistik Semasa
    const st = studentDataService.getAllStudents().length;
    const ac = studentDataService.activityRecords.length;
    
    // 2. Cari Event Terdekat dari Takwim
    const today = new Date();
    today.setHours(0,0,0,0);
    
    // Filter event yang belum lepas (hari ini atau akan datang)
    const upcoming = studentDataService.takwim
      .filter(e => new Date(e.date) >= today)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    setStats({ students: st, activities: ac, upcoming: upcoming.length });
    
    // Ambil event pertama (paling dekat)
    if (upcoming.length > 0) {
      setNearestEvent(upcoming[0]);
    }
  }, []);

  // 3. Logic Countdown Timer
  useEffect(() => {
    if (!nearestEvent) return;

    const timer = setInterval(() => {
      const now = new Date().getTime();
      // Set target pukul 8:00 pagi pada tarikh event
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
      } else {
        // Kalau event dah mula hari ni
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [nearestEvent]);

  // Menu Grid Config
  const menuItems = [
    { 
      id: 'REKOD', 
      label: 'Rekod Aktiviti', 
      icon: Activity, 
      color: 'bg-emerald-600', 
      count: stats.activities, 
      desc: 'Simpan Data PAJSK',
      role: 'GURU' 
    },
    { 
      id: 'TAKWIM', 
      label: 'Takwim Koku', 
      icon: Calendar, 
      color: 'bg-orange-500', 
      count: stats.upcoming, 
      desc: 'Jadual & Perancangan',
      role: 'ALL' 
    },
    { 
      id: 'ANALISIS', 
      label: 'Analisis Data', 
      icon: Trophy, 
      color: 'bg-blue-600', 
      desc: 'Graf & Laporan',
      role: 'ALL' 
    },
    { 
      id: 'ADMIN', 
      label: 'Admin Panel', 
      icon: Users, 
      color: 'bg-slate-700', 
      count: stats.students, 
      desc: 'Database Murid',
      role: 'ADMIN' 
    },
  ];

  return (
    <div className="flex flex-col h-full bg-[#020617] text-white p-6 lg:p-10 pb-40 font-['Manrope'] overflow-y-auto no-scrollbar">
      
      {/* HEADER: COUNTDOWN TIMER */}
      <div className="w-full bg-gradient-to-r from-indigo-900 to-blue-900 rounded-[3rem] p-8 md:p-12 mb-10 relative overflow-hidden shadow-2xl border border-white/10 group">
        
        {/* Hiasan Background */}
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-blue-500/20 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
        
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-8">
           <div className="text-center md:text-left">
              <div className="flex items-center gap-3 justify-center md:justify-start mb-2">
                 <span className="px-3 py-1 bg-white/10 rounded-full text-[10px] font-black uppercase tracking-widest text-blue-300 flex items-center gap-2 border border-white/5">
                    <Zap size={12}/> Aktiviti Terdekat
                 </span>
              </div>
              
              {nearestEvent ? (
                <>
                  <h2 className="text-5xl md:text-7xl font-['Teko'] font-bold uppercase leading-none mb-2 drop-shadow-lg">{nearestEvent.title}</h2>
                  <div className="flex flex-col md:flex-row gap-4 text-sm text-blue-200 font-bold uppercase tracking-wider justify-center md:justify-start">
                     <span className="flex items-center gap-2 bg-blue-950/50 px-3 py-1 rounded-lg"><Calendar size={16}/> {new Date(nearestEvent.date).toLocaleDateString('ms-MY', { day: 'numeric', month: 'long', year: 'numeric'})}</span>
                     {nearestEvent.venue && <span className="flex items-center gap-2 bg-blue-950/50 px-3 py-1 rounded-lg"><MapPin size={16}/> {nearestEvent.venue}</span>}
                     <span className="flex items-center gap-2 bg-blue-950/50 px-3 py-1 rounded-lg"><Trophy size={16}/> {nearestEvent.level}</span>
                  </div>
                </>
              ) : (
                <h2 className="text-4xl font-['Teko'] font-bold uppercase text-slate-400">TIADA AKTIVITI DALAM MASA TERDEKAT</h2>
              )}
           </div>

           {/* KOTAK COUNTDOWN */}
           {nearestEvent && (
             <div className="flex gap-3 md:gap-4">
                {[
                  { label: 'HARI', val: timeLeft.days },
                  { label: 'JAM', val: timeLeft.hours },
                  { label: 'MINIT', val: timeLeft.minutes },
                ].map((item, i) => (
                  <div key={i} className="bg-black/30 backdrop-blur-md border border-white/10 p-4 rounded-2xl min-w-[80px] md:min-w-[100px] text-center shadow-lg">
                     <span className="block text-4xl md:text-5xl font-['Teko'] font-bold leading-none text-white">{item.val}</span>
                     <span className="text-[9px] font-black text-blue-300 uppercase tracking-widest">{item.label}</span>
                  </div>
                ))}
             </div>
           )}
        </div>
      </div>

      {/* MENU NAVIGATION GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-10">
        {menuItems.filter(m => m.role === 'ALL' || userRole === 'ADMIN' || (userRole === 'GURU' && m.role !== 'ADMIN')).map((menu) => (
          <button 
            key={menu.id}
            onClick={() => onNavigate(menu.id)}
            className={`${menu.color} p-6 rounded-[2.5rem] relative overflow-hidden group hover:scale-[1.02] transition-all shadow-xl h-48 flex flex-col justify-between items-start text-left border border-white/5`}
          >
            {/* Background Icon Effect */}
            <div className="absolute -right-6 -bottom-6 opacity-20 group-hover:scale-125 group-hover:rotate-12 transition-transform duration-500">
               <menu.icon size={120} />
            </div>
            
            {/* Top Icon */}
            <div className="bg-black/20 p-3 rounded-2xl backdrop-blur-sm shadow-inner">
               <menu.icon size={24} className="text-white"/>
            </div>
            
            {/* Content */}
            <div className="relative z-10 w-full">
               {menu.count !== undefined && <span className="text-4xl font-['Teko'] font-bold leading-none block mb-1">{menu.count}</span>}
               <span className="text-lg font-black uppercase tracking-tight leading-none block">{menu.label}</span>
               <span className="text-[10px] text-white/70 font-bold uppercase tracking-wider mt-1 block">{menu.desc}</span>
            </div>
            
            {/* Arrow */}
            <div className="absolute top-6 right-6 opacity-0 group-hover:opacity-100 transition-opacity transform group-hover:translate-x-1">
              <ArrowRight size={20}/>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default DashboardScreen;