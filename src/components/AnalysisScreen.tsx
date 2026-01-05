import React, { useState, useEffect, useMemo, useContext } from 'react';
import { studentDataService } from '../services/studentDataService';
import { NotifyContext } from '../App';
import { ActivityRecordModel } from '../types';
import { 
  BarChart3, Trophy, ArrowLeft, Target, Award, Users, TrendingUp, Star
} from 'lucide-react';

interface AnalysisScreenProps {
    onBack: () => void;
    isDarkMode?: boolean;
}

const AnalysisScreen: React.FC<AnalysisScreenProps> = ({ onBack, isDarkMode = true }) => {
  const [records, setRecords] = useState<ActivityRecordModel[]>([]);
  const notifyCtx = useContext(NotifyContext);

  useEffect(() => { 
    const loadId = notifyCtx?.notify("Menganalisis pangkalan data...", "loading");
    setRecords([...studentDataService.activityRecords]); 
    if (loadId) notifyCtx?.removeNotify(loadId);
  }, []);

  // --- ANALYTICS ENGINE (INTELLIGENT COMPUTATION) ---
  const stats = useMemo(() => {
      const levels = ['Sekolah', 'Zon', 'Daerah', 'Negeri', 'Kebangsaan'];
      const byLevel: Record<string, number> = {};
      const byClass: Record<string, number> = {};
      const byAchievement: Record<string, number> = {
          'Johan/Emas': 0,
          'Naib/Perak': 0,
          'Ketiga/Gangsa': 0,
          'Penyertaan': 0
      };
      const studentMap: Record<string, { name: string, count: number, class: string, score: number }> = {};

      levels.forEach(l => byLevel[l] = 0);

      records.forEach(rec => {
          if (!rec.participants) return;
          rec.participants.forEach(p => {
              // Level Stats
              const lvl = levels.find(l => (p.level || '').includes(l)) || 'Sekolah';
              byLevel[lvl] = (byLevel[lvl] || 0) + 1;

              // Class Stats
              const cls = p.class || 'Lain-lain';
              if (cls !== '-') {
                  byClass[cls] = (byClass[cls] || 0) + 1;
              }

              // Achievement Stats & Scoring Logic
              let points = 1;
              const ach = (p.achievement || '').toLowerCase();
              if (ach.includes('johan') || ach.includes('emas') || ach.includes('pertama')) {
                  byAchievement['Johan/Emas']++;
                  points = 10;
              } else if (ach.includes('naib') || ach.includes('perak') || ach.includes('kedua')) {
                  byAchievement['Naib/Perak']++;
                  points = 7;
              } else if (ach.includes('ketiga') || ach.includes('gangsa')) {
                  byAchievement['Ketiga/Gangsa']++;
                  points = 5;
              } else {
                  byAchievement['Penyertaan']++;
                  points = 2;
              }

              // Intelligent Student Map (Weighted Score)
              const key = `${p.name}-${p.ic}`;
              if (!studentMap[key]) {
                  studentMap[key] = { name: p.name, count: 0, class: cls, score: 0 };
              }
              studentMap[key].count++;
              studentMap[key].score += points;
          });
      });

      return {
          byLevel,
          byClass: Object.entries(byClass).sort((a, b) => b[1] - a[1]).slice(0, 5),
          byAchievement,
          topStudents: Object.values(studentMap).sort((a, b) => b.score - a.score).slice(0, 5)
      };
  }, [records]);

  const getBarHeight = (val: number, max: number) => `${Math.max((val / (max || 1)) * 100, 5)}%`;
  
  const bgClass = isDarkMode ? 'bg-[#0F172A]' : 'bg-[#F8FAFC]';
  const cardClass = isDarkMode ? 'bg-slate-800/40 border-white/5 shadow-2xl' : 'bg-white border-slate-200 shadow-xl';
  const themeColor = '#f59e0b'; // Amber-500

  return (
    <div className={`flex flex-col h-full ${bgClass} font-['Manrope'] p-6 md:p-10 overflow-y-auto no-scrollbar`}>
      <div className="max-w-7xl mx-auto w-full pb-32">
        
        {/* Header - Selaras dengan Global Style */}
        <div className="flex items-center gap-6 mb-12">
            <button onClick={onBack} className={`w-12 h-12 border rounded-2xl flex items-center justify-center transition-all shadow-lg active:scale-90 ${isDarkMode ? 'bg-slate-800 border-white/10 text-amber-500' : 'bg-white border-slate-200 text-amber-600'}`}>
                <ArrowLeft size={24} />
            </button>
            <div>
                <h2 className="text-5xl font-['Teko'] font-bold uppercase tracking-wide leading-none">ANALISIS <span className="text-amber-500">PRESTASI</span></h2>
                <p className="text-[10px] font-black uppercase tracking-[0.3em] opacity-40 mt-1">Laporan Statistik Menyeluruh WIRA KOKU</p>
            </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            
            {/* 1. Bar Chart: Peringkat */}
            <div className={`lg:col-span-2 border rounded-[2.5rem] p-10 flex flex-col ${cardClass}`}>
                <div className="flex justify-between items-center mb-10">
                    <h3 className="text-xl font-['Teko'] font-bold uppercase tracking-widest flex items-center gap-3"><Target className="text-amber-500"/> Penyertaan Mengikut Peringkat</h3>
                    <div className="px-4 py-1 bg-amber-500/10 text-amber-500 rounded-full text-[10px] font-black uppercase tracking-widest border border-amber-500/20">Real-time Data</div>
                </div>
                <div className="flex-1 flex items-end justify-between gap-6 h-64 px-4">
                    {Object.entries(stats.byLevel).map(([lvl, count]) => {
                         const max = Math.max(...(Object.values(stats.byLevel) as number[]), 1);
                         return (
                            <div key={lvl} className="flex-1 flex flex-col items-center gap-4 group">
                                <div className="font-['Teko'] text-2xl font-bold opacity-0 group-hover:opacity-100 transition-opacity" style={{color: themeColor}}>{String(count)}</div>
                                <div className="w-full bg-slate-700/20 rounded-2xl relative overflow-hidden transition-all group-hover:bg-slate-700/30" style={{ height: getBarHeight(count, max) }}>
                                    <div className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-amber-600 to-amber-400 transition-all duration-1000 shadow-[0_0_20px_rgba(245,158,11,0.3)]" style={{ height: '100%' }}></div>
                                </div>
                                <div className="text-[10px] font-black uppercase text-center truncate w-full opacity-50">{String(lvl)}</div>
                            </div>
                         )
                    })}
                </div>
            </div>

            {/* 2. List: Kelas Aktif */}
            <div className={`border rounded-[2.5rem] p-8 ${cardClass}`}>
                <h3 className="text-xl font-['Teko'] font-bold uppercase tracking-widest mb-8 flex items-center gap-3"><TrendingUp className="text-emerald-500"/> Kelas Paling Aktif</h3>
                <div className="space-y-4">
                    {stats.byClass.map(([cls, count], i) => (
                        <div key={cls} className="flex items-center justify-between p-4 rounded-2xl bg-slate-500/5 border border-white/5 group hover:bg-white/5 transition-all">
                            <div className="flex items-center gap-4">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black ${i===0 ? 'bg-amber-500 text-slate-900' : 'bg-slate-700 text-white'}`}>{i+1}</div>
                                <span className="font-bold text-sm uppercase tracking-wide">{String(cls)}</span>
                            </div>
                            <div className="text-right">
                                <div className="text-2xl font-['Teko'] font-bold text-amber-500 leading-none">{String(count)}</div>
                                <div className="text-[8px] font-bold opacity-30 uppercase tracking-tighter">Penyertaan</div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* 3. Horizontal Chart: Pencapaian */}
            <div className={`border rounded-[2.5rem] p-8 ${cardClass}`}>
                <h3 className="text-xl font-['Teko'] font-bold uppercase tracking-widest mb-8 flex items-center gap-3"><Trophy className="text-amber-500"/> Pecahan Pencapaian</h3>
                <div className="space-y-6">
                    {Object.entries(stats.byAchievement).map(([type, count]) => (
                        <div key={type} className="space-y-2">
                            <div className="flex justify-between items-end px-1">
                                <span className="text-[10px] font-black uppercase opacity-50 tracking-widest">{String(type)}</span>
                                <span className="text-xl font-['Teko'] font-bold leading-none">{String(count)}</span>
                            </div>
                            <div className="w-full bg-slate-700/20 h-2.5 rounded-full overflow-hidden border border-white/5">
                                <div className="h-full rounded-full bg-gradient-to-r from-amber-600 to-amber-300 shadow-[0_0_10px_rgba(245,158,11,0.2)]" 
                                     style={{ width: `${(count / (records.reduce((acc, r) => acc + (r.participants?.length || 0), 0) || 1)) * 100}%` }}></div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* 4. Top 5 Students - Big Feature */}
            <div className={`border rounded-[2.5rem] p-10 lg:col-span-2 ${cardClass}`}>
                 <h3 className="text-xl font-['Teko'] font-bold uppercase tracking-widest mb-10 flex items-center gap-3"><Star className="text-amber-500"/> Top 5 Murid Harapan</h3>
                 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
                     {stats.topStudents.map((stud, i) => (
                         <div key={i} className={`p-6 rounded-[2rem] border relative flex flex-col items-center text-center gap-4 transition-all hover:-translate-y-2 ${isDarkMode ? 'bg-slate-900/50 border-white/5' : 'bg-slate-50 border-slate-200 shadow-lg'}`}>
                             {i === 0 && <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-amber-500 text-slate-900 text-[8px] font-black px-3 py-1 rounded-full uppercase shadow-lg">Champion</div>}
                             <div className={`w-16 h-16 rounded-3xl flex items-center justify-center text-3xl font-['Teko'] font-bold border-4 rotate-3 group-hover:rotate-0 transition-transform ${i===0 ? 'border-amber-500 text-amber-500 bg-amber-500/5' : 'border-slate-700 text-slate-500'}`}>
                                 {i+1}
                             </div>
                             <div className="flex-1">
                                 <div className="font-bold text-xs uppercase truncate w-full mb-1">{String(stud.name)}</div>
                                 <div className="text-[9px] font-black opacity-30 uppercase tracking-tighter">{String(stud.class)}</div>
                             </div>
                             <div className="w-full pt-4 border-t border-white/5 flex flex-col gap-1">
                                <div className="text-amber-500 font-['Teko'] text-2xl leading-none">{String(stud.count)}</div>
                                <div className="text-[8px] font-bold opacity-30 uppercase tracking-widest">Aktiviti</div>
                             </div>
                         </div>
                     ))}
                 </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default AnalysisScreen;