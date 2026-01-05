import React, { useState, useEffect } from 'react';
import { studentDataService } from '../services/studentDataService';
import { 
  ArrowLeft, BarChart3, FileSpreadsheet, Search, 
  Trophy, Users, Target, Zap, Activity 
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { Bar, Doughnut } from 'react-chartjs-2';
import { 
  Chart as ChartJS, CategoryScale, LinearScale, BarElement, 
  Title, Tooltip, Legend, ArcElement, PointElement, LineElement 
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement, PointElement, LineElement);

const AnalysisScreen: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const [records, setRecords] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => { 
    setRecords(studentDataService.activityRecords || []); 
  }, []);

  // --- LOGIK PENGIRAAN DATA ---
  const stats = (() => {
    const levels = studentDataService.levels; // ['SEKOLAH', 'ZON', 'DAERAH', 'NEGERI', 'KEBANGSAAN']
    const actCounts = levels.map(lvl => records.filter(r => r.level === lvl).length);
    const stuCounts = levels.map(lvl => records.filter(r => r.level === lvl).reduce((sum, r) => sum + (r.participants?.length || 0), 0));
    
    // Kira pencapaian 1,2,3 untuk LUAR SEKOLAH sahaja
    let johan = 0, naib = 0, ketiga = 0;
    records.filter(r => r.level !== 'SEKOLAH').forEach(r => {
      r.participants?.forEach((p: any) => {
        if (p.achievement === 'JOHAN') johan++;
        if (p.achievement === 'NAIB JOHAN') naib++;
        if (p.achievement === 'KETIGA') ketiga++;
      });
    });
    return { levels, actCounts, stuCounts, johan, naib, ketiga };
  })();

  // --- CONFIG GRAF ---
  const barData = {
    labels: stats.levels,
    datasets: [{
      label: 'Jumlah Program',
      data: stats.actCounts,
      backgroundColor: ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'],
      borderRadius: 12,
    }]
  };

  const doughnutData = {
    labels: stats.levels,
    datasets: [{
      data: stats.stuCounts,
      backgroundColor: ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'],
      borderWidth: 0,
      cutout: '70%'
    }]
  };

  // --- FUNGSI DOWNLOAD ---
  const downloadFullExcel = () => {
    let all: any[] = [];
    records.forEach(r => r.participants.forEach((p: any) => all.push({ 
      'PROGRAM': r.programName, 'TARIKH': r.date, 'PERINGKAT': r.level, 'NAMA': p.name, 'IC': p.icNumber, 'PENCAPAIAN': p.achievement 
    })));
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(all), "Laporan_Penuh");
    XLSX.writeFile(wb, `ANALISIS_KOKO_SKEME.xlsx`);
  };

  const downloadSingleExcel = (rec: any) => {
    const data = rec.participants.map((p:any) => ({ 'Nama': p.name, 'IC': p.icNumber, 'Pencapaian': p.achievement }));
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(data), "Peserta");
    XLSX.writeFile(wb, `${rec.programName}.xlsx`);
  };

  return (
    <div className="min-h-screen bg-[#020617] text-white p-6 lg:p-10 pb-32 font-['Manrope']">
      <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in">
        
        {/* HEADER */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-4">
            <button onClick={onBack} className="p-4 bg-white/5 rounded-2xl border border-white/10 text-blue-500 hover:bg-blue-600 hover:text-white transition-all"><ArrowLeft/></button>
            <h1 className="text-6xl font-['Teko'] font-bold uppercase italic leading-none">DATA <span className="text-blue-500">INTELLIGENCE</span></h1>
          </div>
          <button onClick={downloadFullExcel} className="bg-blue-600 hover:bg-blue-500 px-8 py-4 rounded-2xl text-[10px] font-black uppercase flex items-center gap-2 shadow-2xl transition-all">
            <FileSpreadsheet size={18}/> Export Master Analytics
          </button>
        </div>

        {/* PENCAPAIAN LUAR (STATS CARDS) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { label: 'Johan (Luar)', val: stats.johan, col: 'text-amber-400', bg: 'bg-amber-400/10', icon: Trophy },
            { label: 'Naib Johan (Luar)', val: stats.naib, col: 'text-slate-300', bg: 'bg-slate-300/10', icon: Target },
            { label: 'Ketiga (Luar)', val: stats.ketiga, col: 'text-orange-500', bg: 'bg-orange-500/10', icon: Zap },
          ].map((s, i) => (
            <div key={i} className={`${s.bg} border border-white/5 p-8 rounded-[2rem] flex items-center justify-between shadow-xl`}>
              <div><p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{s.label}</p><p className={`text-6xl font-['Teko'] font-bold ${s.col} leading-none`}>{s.val}</p></div>
              <s.icon size={50} className={`${s.col} opacity-20`} />
            </div>
          ))}
        </div>

        {/* GRAF UTAMA */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-7 bg-white/5 p-8 rounded-[2.5rem] border border-white/10 h-[450px]">
            <p className="text-[11px] font-black uppercase text-slate-500 mb-6 flex items-center gap-2"><Activity size={16} className="text-blue-500"/> Program Mengikut Peringkat</p>
            <div className="h-[320px]">
              <Bar data={barData} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { y: { ticks: { color: '#64748b' }, grid: { color: '#ffffff05' } }, x: { ticks: { color: '#fff', font: { weight: 'bold' } }, grid: { display: false } } } }} />
            </div>
          </div>
          <div className="lg:col-span-5 bg-white/5 p-8 rounded-[2.5rem] border border-white/10 h-[450px] flex flex-col items-center">
             <p className="text-[11px] font-black uppercase text-slate-500 mb-6 w-full text-left flex items-center gap-2"><Users size={16} className="text-emerald-500"/> Penglibatan Murid</p>
             <div className="flex-1 relative flex items-center justify-center w-full">
                <Doughnut data={doughnutData} options={{ responsive: true, maintainAspectRatio: false }} />
                <div className="absolute flex flex-col items-center">
                  <p className="text-4xl font-['Teko'] font-bold text-white">{stats.stuCounts.reduce((a, b) => a + b, 0)}</p>
                  <p className="text-[8px] font-black text-slate-500 uppercase">Total Murid</p>
                </div>
             </div>
          </div>
        </div>

        {/* JADUAL TERPERINCI (YANG HILANG TADI) */}
        <div className="bg-white/5 p-8 rounded-[3rem] border border-white/10 shadow-2xl">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-8">
            <h3 className="text-[11px] font-black uppercase text-slate-500 tracking-widest">Senarai Aktiviti Terperinci</h3>
            <div className="relative w-full md:w-96">
               <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={16}/>
               <input 
                 value={searchTerm} 
                 onChange={e => setSearchTerm(e.target.value.toUpperCase())} 
                 placeholder="CARI PROGRAM..." 
                 className="w-full bg-black/40 border border-white/5 p-4 pl-12 rounded-2xl text-[10px] font-bold outline-none focus:border-blue-500" 
               />
            </div>
          </div>

          <div className="overflow-x-auto no-scrollbar">
            <table className="w-full text-left">
              <thead className="text-[10px] text-slate-600 font-black uppercase border-b border-white/5">
                <tr>
                  <th className="p-4">Nama Program</th>
                  <th className="p-4">Peringkat</th>
                  <th className="p-4 text-center">Peserta</th>
                  <th className="p-4 text-right">Excel</th>
                </tr>
              </thead>
              <tbody className="text-xs font-bold">
                {records.filter(r => r.programName.includes(searchTerm)).map((rec) => (
                  <tr key={rec.id} className="border-b border-white/5 hover:bg-white/5 transition-all">
                    <td className="p-4 font-black uppercase text-white">{rec.programName}</td>
                    <td className="p-4">
                      <span className={`px-3 py-1 rounded-lg text-[9px] font-black ${
                        rec.level === 'DAERAH' ? 'bg-amber-500/20 text-amber-500' : 
                        rec.level === 'NEGERI' ? 'bg-emerald-500/20 text-emerald-500' :
                        rec.level === 'KEBANGSAAN' ? 'bg-purple-500/20 text-purple-500' : 'bg-slate-500/20 text-slate-400'
                      }`}>{rec.level}</span>
                    </td>
                    <td className="p-4 text-center font-['Teko'] text-xl">{rec.participants?.length || 0}</td>
                    <td className="p-4 text-right">
                      <button onClick={() => downloadSingleExcel(rec)} className="p-2 bg-emerald-600/10 text-emerald-500 rounded-lg hover:bg-emerald-600 hover:text-white transition-all">
                        <FileSpreadsheet size={16}/>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
};

export default AnalysisScreen;