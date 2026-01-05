
import React, { useState, useEffect, useMemo } from 'react';
import { studentDataService } from '../services/studentDataService';
import { ActivityRecordModel } from '../types';
import { 
  BarChart3, Trophy, ArrowLeft, Target, Award, Users 
} from 'lucide-react';

interface AnalysisScreenProps {
    onBack: () => void;
    isDarkMode?: boolean;
}

const AnalysisScreen: React.FC<AnalysisScreenProps> = ({ onBack, isDarkMode = true }) => {
  const [records, setRecords] = useState<ActivityRecordModel[]>([]);

  useEffect(() => { 
    setRecords([...studentDataService.activityRecords]); 
  }, []);

  // ANALYTICS COMPUTATION
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
      const studentMap: Record<string, { name: string, count: number, class: string }> = {};

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

              // Achievement Stats
              const ach = (p.achievement || '').toLowerCase();
              if (ach.includes('johan') || ach.includes('emas') || ach.includes('pertama')) byAchievement['Johan/Emas']++;
              else if (ach.includes('naib') || ach.includes('perak') || ach.includes('kedua')) byAchievement['Naib/Perak']++;
              else if (ach.includes('ketiga') || ach.includes('gangsa')) byAchievement['Ketiga/Gangsa']++;
              else byAchievement['Penyertaan']++;

              // Top Students
              const key = `${p.name}-${p.ic}`;
              if (!studentMap[key]) {
                  studentMap[key] = { name: p.name, count: 0, class: cls };
              }
              studentMap[key].count++;
          });
      });

      return {
          byLevel,
          byClass: Object.entries(byClass).sort((a, b) => b[1] - a[1]).slice(0, 5),
          byAchievement,
          topStudents: Object.values(studentMap).sort((a, b) => b.count - a.count).slice(0, 5)
      };
  }, [records]);

  const getBarHeight = (val: number, max: number) => `${Math.max((val / (max || 1)) * 100, 5)}%`;
  
  const bgClass = isDarkMode ? 'bg-[#0F172A]' : 'bg-[#F8FAFC]';
  const cardClass = isDarkMode ? 'bg-[#1E293B] border-slate-700' : 'bg-white border-slate-200 shadow-md';
  const textClass = isDarkMode ? 'text-slate-100' : 'text-slate-800';
  const subTextClass = isDarkMode ? 'text-slate-400' : 'text-slate-500';

  const totalParticipants = useMemo(() => {
    return records.reduce((acc, r) => acc + (r.participants?.length || 0), 0) || 1;
  }, [records]);

  return (
    <div className={`flex flex-col h-full ${bgClass} ${textClass} font-['Manrope'] p-6 md:p-10 overflow-y-auto no-scrollbar`}>
      <div className="max-w-7xl mx-auto w-full pb-20">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
            <div className="flex items-center gap-4">
                <button onClick={onBack} className={`w-12 h-12 border rounded-xl flex items-center justify-center transition-all shadow-lg ${isDarkMode ? 'bg-slate-800 border-slate-700 text-blue-400 hover:bg-blue-600 hover:text-white' : 'bg-white border-slate-200 text-blue-600 hover:bg-blue-50'}`}>
                    <ArrowLeft size={24} />
                </button>
                <div>
                    <h2 className={`text-4xl font-['Teko'] font-bold uppercase tracking-wide flex items-center gap-3 ${textClass}`}>
                        <BarChart3 className="text-purple-500" size={32} /> ANALISIS DATA
                    </h2>
                    <p className={`text-xs font-bold uppercase tracking-widest ${subTextClass}`}>Statistik Menyeluruh Kokurikulum</p>
                </div>
            </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 mb-8">
            <div className={`border rounded-3xl p-6 flex flex-col ${cardClass} xl:col-span-2`}>
                <h3 className={`text-lg font-bold uppercase tracking-wide mb-6 flex items-center gap-2 ${textClass}`}><Target size={20} className="text-blue-500"/> Penyertaan Mengikut Peringkat</h3>
                <div className="flex-1 flex items-end justify-between gap-4 h-48 px-2">
                    {Object.entries(stats.byLevel).map(([lvl, count]) => {
                         const max = Math.max(...(Object.values(stats.byLevel) as number[]), 10);
                         return (
                            <div key={lvl} className="flex-1 flex flex-col items-center gap-2 group">
                                <div className={`font-bold text-xs ${textClass}`}>{String(count)}</div>
                                <div className="w-full bg-blue-500/20 rounded-t-lg relative overflow-hidden transition-all group-hover:bg-blue-500/40" style={{ height: getBarHeight(count, max) }}>
                                    <div className="absolute bottom-0 left-0 w-full bg-blue-500 transition-all duration-1000" style={{ height: '100%', opacity: 0.6 }}></div>
                                </div>
                                <div className={`text-[10px] font-bold uppercase text-center truncate w-full ${subTextClass}`}>{String(lvl)}</div>
                            </div>
                         )
                    })}
                </div>
            </div>

            <div className={`border rounded-3xl p-6 ${cardClass}`}>
                <h3 className={`text-lg font-bold uppercase tracking-wide mb-6 flex items-center gap-2 ${textClass}`}><Trophy size={20} className="text-amber-500"/> Pecahan Pencapaian</h3>
                <div className="space-y-4">
                    {Object.entries(stats.byAchievement).map(([type, count]) => (
                        <div key={type} className="flex items-center gap-4">
                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold text-xs ${type.includes('Johan') ? 'bg-amber-100 text-amber-700' : type.includes('Naib') ? 'bg-slate-200 text-slate-700' : type.includes('Ketiga') ? 'bg-orange-100 text-orange-800' : 'bg-blue-100 text-blue-700'}`}>
                                {String(count)}
                            </div>
                            <div className="flex-1">
                                <div className={`text-xs font-bold uppercase ${subTextClass}`}>{String(type)}</div>
                                <div className="w-full bg-slate-700/10 h-2 rounded-full mt-1 overflow-hidden">
                                    <div className={`h-full rounded-full ${type.includes('Johan') ? 'bg-amber-500' : 'bg-slate-400'}`} style={{ width: `${(count / totalParticipants) * 100}%` }}></div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className={`border rounded-3xl p-6 ${cardClass}`}>
                <h3 className={`text-lg font-bold uppercase tracking-wide mb-6 flex items-center gap-2 ${textClass}`}><Users size={20} className="text-green-500"/> Kelas Paling Aktif</h3>
                <div className="space-y-3">
                    {stats.byClass.map(([cls, count], i) => (
                        <div key={cls} className="flex items-center justify-between p-3 rounded-xl bg-slate-500/5">
                            <div className="flex items-center gap-3">
                                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${i===0 ? 'bg-amber-500 text-white' : 'bg-slate-600 text-white'}`}>{i+1}</div>
                                <span className={`font-bold text-sm uppercase ${textClass}`}>{String(cls)}</span>
                            </div>
                            <span className={`font-['Teko'] text-xl font-bold ${textClass}`}>{String(count)}</span>
                        </div>
                    ))}
                </div>
            </div>

            <div className={`border rounded-3xl p-6 ${cardClass} lg:col-span-2`}>
                 <h3 className={`text-lg font-bold uppercase tracking-wide mb-6 flex items-center gap-2 ${textClass}`}><Award size={20} className="text-rose-500"/> Top 5 Murid Paling Aktif</h3>
                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                     {stats.topStudents.map((stud, i) => (
                         <div key={i} className={`p-4 rounded-2xl border flex flex-col items-center text-center gap-2 ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-200'}`}>
                             <div className={`w-12 h-12 rounded-full flex items-center justify-center text-lg font-['Teko'] font-bold border-4 ${i===0 ? 'border-amber-500 text-amber-500' : 'border-slate-300 text-slate-400'}`}>
                                 {i+1}
                             </div>
                             <div className="w-full">
                                 <div className={`font-bold text-xs uppercase truncate w-full ${textClass}`}>{String(stud.name)}</div>
                                 <div className={`text-[10px] font-bold ${subTextClass}`}>{String(stud.class)}</div>
                             </div>
                             <div className="mt-auto px-3 py-1 bg-green-500/10 text-green-600 rounded-full text-[10px] font-bold uppercase">
                                 {String(stud.count)} Aktiviti
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
