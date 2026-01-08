import React, { useState, useEffect } from 'react';
import { studentDataService } from '../services/studentDataService';
import { 
  ArrowLeft, FileSpreadsheet, FileText, Search, 
  Trophy, Users, Target, Zap, Activity, Trash, BarChart3, Medal
} from 'lucide-react';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
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
    const data = studentDataService.activityRecords || [];
    setRecords(data); 
  }, []);

  // --- LOGIK STATISTIK ---
  const stats = (() => {
    const rawLevels = studentDataService.levels; 
    const actCounts = rawLevels.map(lvl => records.filter(r => (r.level || '').toUpperCase() === lvl.toUpperCase()).length);
    const stuCounts = rawLevels.map(lvl => records.filter(r => (r.level || '').toUpperCase() === lvl.toUpperCase()).reduce((sum, r) => sum + (r.participants?.length || 0), 0));
    
    let johan = 0, naib = 0, ketiga = 0;
    records.filter(r => (r.level || '').toUpperCase() !== 'SEKOLAH').forEach(r => {
      if (r.participants) {
        r.participants.forEach((p: any) => {
          const ach = (p.achievement || '').toUpperCase();
          if (ach === 'JOHAN') johan++;
          if (ach === 'NAIB JOHAN') naib++;
          if (ach === 'KETIGA') ketiga++;
        });
      }
    });
    return { levels: rawLevels, actCounts, stuCounts, johan, naib, ketiga };
  })();

  // --- LOGIK DOWNLOAD (MASTER) ---
  const downloadFullExcel = () => {
    let all: any[] = [];
    records.forEach(r => {
      r.participants?.forEach((p: any) => all.push({ 
        'PROGRAM': r.programName, 'TARIKH': r.date, 'PERINGKAT': r.level, 
        'NAMA': p.name, 'IC': p.icNumber, 'KELAS': p.className || "-", 'PENCAPAIAN': p.achievement 
      }));
    });
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(all), "Laporan");
    XLSX.writeFile(wb, `ANALISIS_MASTER.xlsx`);
  };

  const downloadFullPDF = () => {
    const doc = new jsPDF();
    doc.text("LAPORAN MASTER KOKURIKULUM", 14, 20);
    const rows: any[] = [];
    records.forEach(r => r.participants?.forEach((p: any) => rows.push([r.programName, r.level, p.name, p.className, p.achievement])));
    autoTable(doc, { head: [['Program', 'Peringkat', 'Murid', 'Kelas', 'Pencapaian']], body: rows, startY: 30 });
    doc.save("Laporan_Master.pdf");
  };

  // --- LOGIK DOWNLOAD (SINGLE) ---
  const downloadSingleExcel = (rec: any) => {
    const data = rec.participants.map((p:any) => ({ 'Nama': p.name, 'IC': p.icNumber, 'Kelas': p.className, 'Pencapaian': p.achievement }));
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(data), "Peserta");
    XLSX.writeFile(wb, `${rec.programName}.xlsx`);
  };

  const downloadSinglePDF = (rec: any) => {
    const doc = new jsPDF();
    doc.text(`LAPORAN: ${rec.programName}`, 14, 20);
    const rows = rec.participants?.map((p: any) => [p.name, p.icNumber, p.className, p.achievement]);
    autoTable(doc, { head: [['Nama', 'IC', 'Kelas', 'Pencapaian']], body: rows, startY: 30 });
    doc.save(`${rec.programName}.pdf`);
  };

  const handleDelete = (id: string, programName: string) => {
    if (window.confirm(`Hapus rekod "${programName}"?`)) {
      studentDataService.deleteActivityRecord(id);
      setRecords([...studentDataService.activityRecords]);
    }
  };

  const barData = {
    labels: stats.levels,
    datasets: [{ data: stats.actCounts, backgroundColor: '#3b82f6', borderRadius: 4 }]
  };

  const doughnutData = {
    labels: stats.levels,
    datasets: [{ data: stats.stuCounts, backgroundColor: ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#6366f1'], borderWidth: 0, cutout: '70%' }]
  };

  return (
    <div className="min-h-screen bg-[#020617] text-white p-4 md:p-8 pb-32 font-['Manrope'] overflow-y-auto no-scrollbar">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* HEADER */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-4">
            <button onClick={onBack} className="p-3 bg-white/5 rounded-xl border border-white/10 text-blue-500 hover:bg-blue-600 hover:text-white transition-all"><ArrowLeft size={20}/></button>
            <div>
              <h1 className="text-4xl font-['Teko'] font-bold uppercase leading-none tracking-tight">ANALISIS <span className="text-blue-500">INTEL</span></h1>
              <p className="text-[8px] font-black text-slate-500 tracking-[0.3em] uppercase">Master Data Management</p>
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={downloadFullExcel} className="bg-emerald-600/10 hover:bg-emerald-600 p-3 rounded-xl text-emerald-500 hover:text-white border border-emerald-500/20 transition-all"><FileSpreadsheet size={18}/></button>
            <button onClick={downloadFullPDF} className="bg-rose-600/10 hover:bg-rose-600 p-3 rounded-xl text-rose-500 hover:text-white border border-rose-500/20 transition-all"><FileText size={18}/></button>
          </div>
        </div>

        {/* STATS CARDS */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: 'JOHAN', val: stats.johan, col: 'text-amber-400', bg: 'bg-amber-400/5', icon: Trophy },
            { label: 'NAIB JOHAN', val: stats.naib, col: 'text-slate-300', bg: 'bg-slate-300/5', icon: Medal },
            { label: 'KETIGA', val: stats.ketiga, col: 'text-orange-500', bg: 'bg-orange-500/5', icon: Target },
          ].map((s, i) => (
            <div key={i} className={`relative overflow-hidden ${s.bg} border border-white/5 p-4 rounded-3xl flex flex-col items-center justify-center shadow-lg group hover:bg-white/10 transition-all`}>
              <s.icon size={45} className={`absolute -right-2 -bottom-2 opacity-10 ${s.col} group-hover:scale-110 transition-transform duration-500`} />
              <p className="text-[7px] font-black text-slate-500 uppercase tracking-widest mb-1 relative z-10">{s.label}</p>
              <p className={`text-4xl md:text-5xl font-['Teko'] font-bold ${s.col} leading-none relative z-10`}>{s.val}</p>
            </div>
          ))}
        </div>

        {/* ANALYTICS CHARTS */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="bg-white/5 p-6 rounded-[2.5rem] border border-white/10 h-64 flex flex-col shadow-xl">
            <p className="text-[9px] font-black uppercase text-slate-500 mb-4 flex items-center gap-2"><BarChart3 size={14} className="text-blue-500"/> Program Per Peringkat</p>
            <div className="flex-1 min-h-0">
              <Bar data={barData} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { y: { display: false }, x: { ticks: { color: '#64748b', font: { size: 8, weight: 'bold' } }, grid: { display: false } } } }} />
            </div>
          </div>
          <div className="bg-white/5 p-6 rounded-[2.5rem] border border-white/10 h-64 flex flex-col items-center shadow-xl relative">
             <p className="text-[9px] font-black uppercase text-slate-500 mb-2 w-full text-left flex items-center gap-2 tracking-widest"><Users size={14} className="text-emerald-500"/> Penyertaan Murid</p>
             <div className="flex-1 relative w-full">
                <Doughnut data={doughnutData} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'right', labels: { color: '#94a3b8', font: { size: 7 }, boxWidth: 5, usePointStyle: true } } } }} />
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none pr-24 pb-4">
                  <p className="text-4xl font-['Teko'] font-bold text-white leading-none">{stats.stuCounts.reduce((a, b) => a + b, 0)}</p>
                  <p className="text-[6px] font-black text-slate-500 uppercase tracking-widest">Total</p>
                </div>
             </div>
          </div>
        </div>

        {/* DATA TABLE */}
        <div className="bg-white/5 rounded-[2.5rem] border border-white/10 shadow-2xl overflow-hidden">
          <div className="p-6 border-b border-white/5 flex flex-col sm:flex-row justify-between items-center gap-4">
            <h3 className="text-[10px] font-black uppercase text-slate-500 tracking-widest flex items-center gap-2"><Activity size={14}/> Senarai Aktiviti</h3>
            <div className="relative w-full sm:w-64">
               <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600" size={14}/>
               <input value={searchTerm} onChange={e => setSearchTerm(e.target.value.toUpperCase())} placeholder="CARI PROGRAM..." className="w-full bg-black/40 border border-white/5 p-2.5 pl-10 rounded-xl text-[9px] font-bold outline-none focus:border-blue-500 text-white" />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="text-[8px] text-slate-500 font-black uppercase bg-white/5">
                <tr>
                  <th className="p-4 pl-8">Program</th>
                  <th className="p-4">Tarikh</th>
                  <th className="p-4 text-center">Peserta</th>
                  <th className="p-4 text-right pr-8">Tindakan</th>
                </tr>
              </thead>
              <tbody className="text-[10px] font-bold">
                {records.filter(r => (r.programName || '').toUpperCase().includes(searchTerm)).map((rec) => (
                  <tr key={rec.id} className="border-b border-white/5 hover:bg-white/5 transition-all group">
                    <td className="p-4 pl-8 font-black uppercase text-blue-400">{rec.programName}</td>
                    <td className="p-4 text-slate-400 font-mono">{rec.date}</td>
                    <td className="p-4 text-center font-['Teko'] text-xl">{rec.participants?.length || 0}</td>
                    <td className="p-4 text-right pr-8">
                      <div className="flex justify-end gap-1.5">
                         {/* BUTANG PDF */}
                         <button onClick={() => downloadSinglePDF(rec)} className="p-2.5 bg-rose-600/10 hover:bg-rose-600 text-rose-500 hover:text-white rounded-lg transition-all" title="PDF">
                            <FileText size={14}/>
                         </button>
                         {/* BUTANG EXCEL */}
                         <button onClick={() => downloadSingleExcel(rec)} className="p-2.5 bg-emerald-600/10 hover:bg-emerald-600 text-emerald-500 hover:text-white rounded-lg transition-all" title="Excel">
                            <FileSpreadsheet size={14}/>
                         </button>
                         {/* BUTANG DELETE */}
                         <button onClick={() => handleDelete(rec.id, rec.programName)} className="p-2.5 bg-white/5 hover:bg-red-600 text-slate-500 hover:text-white rounded-lg transition-all" title="Delete">
                            <Trash size={14}/>
                         </button>
                      </div>
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