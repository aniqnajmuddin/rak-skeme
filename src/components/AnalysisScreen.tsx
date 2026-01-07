import React, { useState, useEffect } from 'react';
import { studentDataService } from '../services/studentDataService';
import { 
  ArrowLeft, FileSpreadsheet, FileText, Search, 
  Trophy, Users, Target, Zap, Activity, Trash 
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

  // --- STATS LOGIC ---
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

  const barData = {
    labels: stats.levels,
    datasets: [{
      label: 'Jumlah Program',
      data: stats.actCounts,
      backgroundColor: ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#6366f1'],
      borderRadius: 8,
      barThickness: 30,
    }]
  };

  const doughnutData = {
    labels: stats.levels,
    datasets: [{
      data: stats.stuCounts,
      backgroundColor: ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#6366f1'],
      borderWidth: 0,
      cutout: '75%'
    }]
  };

  // --- ACTIONS: EXCEL, PDF, DELETE ---
  const downloadFullExcel = () => {
    let all: any[] = [];
    records.forEach(r => {
      if(r.participants) {
        r.participants.forEach((p: any) => all.push({ 
          'PROGRAM': r.programName, 
          'TARIKH': r.date, 
          'PERINGKAT': r.level, 
          'NAMA MURID': p.name, 
          'IC': p.icNumber, 
          'KELAS': p.className || "TIADA DATA",
          'PENCAPAIAN': p.achievement 
        }));
      }
    });

    if(all.length === 0) return alert("Tiada rekod!");
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(all), "Laporan_Penuh");
    XLSX.writeFile(wb, `ANALISIS_MASTER_KOKO.xlsx`);
  };

  const downloadSingleExcel = (rec: any) => {
    if(!rec.participants) return;
    const data = rec.participants.map((p:any) => ({ 
      'Nama': p.name, 
      'IC': p.icNumber, 
      'Kelas': p.className || "TIADA DATA", 
      'Pencapaian': p.achievement 
    }));
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(data), "Peserta");
    XLSX.writeFile(wb, `${rec.programName || 'Rekod'}.xlsx`);
  };

  const downloadFullPDF = () => {
    const doc = new jsPDF();
    doc.text("LAPORAN ANALISIS KOKURIKULUM (MASTER)", 14, 20);
    doc.text(`Tarikh Cetakan: ${new Date().toLocaleDateString()}`, 14, 28);
    const tableRows: any[] = [];
    records.forEach(r => {
      r.participants?.forEach((p: any) => {
        tableRows.push([r.programName, r.level, p.name, p.className || "-", p.achievement]);
      });
    });
    autoTable(doc, {
      head: [['Program', 'Peringkat', 'Nama Murid', 'Kelas', 'Pencapaian']],
      body: tableRows,
      startY: 35,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [22, 163, 74] } 
    });
    doc.save("Laporan_Master_Koko.pdf");
  };

  const downloadSinglePDF = (rec: any) => {
    const doc = new jsPDF();
    doc.text(`LAPORAN: ${rec.programName.toUpperCase()}`, 14, 20);
    doc.setFontSize(10);
    doc.text(`Tarikh: ${rec.date} | Peringkat: ${rec.level}`, 14, 28);
    const tableRows = rec.participants?.map((p: any) => [p.name, p.icNumber, p.className || "-", p.achievement]);
    autoTable(doc, {
      head: [['Nama Murid', 'No. KP', 'Kelas', 'Pencapaian']],
      body: tableRows,
      startY: 35,
      headStyles: { fillColor: [59, 130, 246] } 
    });
    doc.save(`${rec.programName}.pdf`);
  };

  // --- FUNGSI DELETE BARU ---
  const handleDelete = (id: string, programName: string) => {
    if (window.confirm(`Adakah anda pasti ingin memadam rekod "${programName}"?\nData tidak boleh dikembalikan.`)) {
      studentDataService.deleteActivityRecord(id);
      setRecords(studentDataService.activityRecords); // Refresh list terus
    }
  };

  return (
    <div className="min-h-screen bg-[#020617] text-white p-6 lg:p-10 pb-32 font-['Manrope']">
      <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in">
        
        {/* HEADER */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-4">
            <button onClick={onBack} className="p-4 bg-white/5 rounded-2xl border border-white/10 text-blue-500 hover:bg-blue-600 hover:text-white transition-all shadow-lg"><ArrowLeft/></button>
            <div>
              <h1 className="text-5xl lg:text-6xl font-['Teko'] font-bold uppercase italic leading-none">DATA <span className="text-blue-500">INTELLIGENCE</span></h1>
              <p className="text-[10px] font-black text-slate-500 tracking-[0.3em] uppercase mt-1">Pusat Analisis & Pelaporan</p>
            </div>
          </div>
          <div className="flex gap-3">
            <button onClick={downloadFullPDF} className="bg-red-600 hover:bg-red-500 px-6 py-4 rounded-2xl text-[10px] font-black uppercase flex items-center gap-2 shadow-2xl transition-all hover:scale-105">
              <FileText size={18}/> PDF Master
            </button>
            <button onClick={downloadFullExcel} className="bg-emerald-600 hover:bg-emerald-500 px-6 py-4 rounded-2xl text-[10px] font-black uppercase flex items-center gap-2 shadow-2xl transition-all hover:scale-105">
              <FileSpreadsheet size={18}/> Excel Master
            </button>
          </div>
        </div>

        {/* STATS CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { label: 'JOHAN (LUAR SEKOLAH)', val: stats.johan, col: 'text-amber-400', bg: 'bg-amber-400/5', icon: Trophy },
            { label: 'NAIB JOHAN (LUAR SEKOLAH)', val: stats.naib, col: 'text-slate-300', bg: 'bg-slate-300/5', icon: Target },
            { label: 'TEMPAT KETIGA (LUAR SEKOLAH)', val: stats.ketiga, col: 'text-orange-500', bg: 'bg-orange-500/5', icon: Zap },
          ].map((s, i) => (
            <div key={i} className={`${s.bg} border border-white/5 p-8 rounded-[2rem] flex items-center justify-between shadow-xl hover:bg-white/5 transition-all`}>
              <div><p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">{s.label}</p><p className={`text-6xl font-['Teko'] font-bold ${s.col} leading-none`}>{s.val}</p></div>
              <s.icon size={40} className={`${s.col} opacity-30`} />
            </div>
          ))}
        </div>

        {/* GRAF UTAMA */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-7 bg-white/5 p-8 rounded-[2.5rem] border border-white/10 h-[450px] shadow-2xl">
            <p className="text-[11px] font-black uppercase text-slate-500 mb-6 flex items-center gap-2 tracking-widest"><Activity size={16} className="text-blue-500"/> Bilangan Program Mengikut Peringkat</p>
            <div className="h-[320px]">
              <Bar data={barData} options={{ 
                responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, 
                scales: { y: { ticks: { color: '#64748b', font: {size: 10} }, grid: { color: '#ffffff05' } }, x: { ticks: { color: '#94a3b8', font: { size: 10, weight: 'bold' } }, grid: { display: false } } } 
              }} />
            </div>
          </div>
          <div className="lg:col-span-5 bg-white/5 p-8 rounded-[2.5rem] border border-white/10 h-[450px] flex flex-col items-center shadow-2xl">
             <p className="text-[11px] font-black uppercase text-slate-500 mb-6 w-full text-left flex items-center gap-2 tracking-widest"><Users size={16} className="text-emerald-500"/> Taburan Penyertaan Murid</p>
             <div className="flex-1 relative flex items-center justify-center w-full">
                <Doughnut data={doughnutData} options={{ 
                  responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom', labels: { color: '#94a3b8', font: { size: 9 }, usePointStyle: true, boxWidth: 6 } } } 
                }} />
                <div className="absolute flex flex-col items-center pb-8 pointer-events-none">
                  <p className="text-5xl font-['Teko'] font-bold text-white leading-none">{stats.stuCounts.reduce((a, b) => a + b, 0)}</p>
                  <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Penyertaan</p>
                </div>
             </div>
          </div>
        </div>

        {/* JADUAL TERPERINCI */}
        <div className="bg-white/5 p-8 rounded-[3rem] border border-white/10 shadow-2xl">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-8">
            <h3 className="text-[11px] font-black uppercase text-slate-500 tracking-widest flex items-center gap-2"><FileSpreadsheet size={16}/> Senarai Aktiviti Terperinci</h3>
            <div className="relative w-full md:w-96 group">
               <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-blue-500 transition-colors" size={16}/>
               <input 
                 value={searchTerm} 
                 onChange={e => setSearchTerm(e.target.value.toUpperCase())} 
                 placeholder="CARI NAMA PROGRAM..." 
                 className="w-full bg-black/40 border border-white/5 p-4 pl-12 rounded-2xl text-[10px] font-bold outline-none focus:border-blue-500 transition-all uppercase text-white shadow-inner" 
               />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="text-[9px] text-slate-500 font-black uppercase border-b border-white/5">
                <tr>
                  <th className="p-4 pl-6">Nama Program</th>
                  <th className="p-4">Tarikh</th>
                  <th className="p-4">Peringkat</th>
                  <th className="p-4 text-center">Peserta</th>
                  <th className="p-4 text-right pr-6">Tindakan</th>
                </tr>
              </thead>
              <tbody className="text-[11px] font-bold">
                {records.filter(r => (r.programName || '').toUpperCase().includes(searchTerm)).map((rec) => (
                  <tr key={rec.id} className="border-b border-white/5 hover:bg-white/5 transition-all group">
                    <td className="p-4 pl-6 font-black uppercase text-white group-hover:text-blue-400 transition-colors">{rec.programName}</td>
                    <td className="p-4 text-slate-400">{rec.date}</td>
                    <td className="p-4">
                      <span className={`px-3 py-1.5 rounded-lg text-[9px] font-black tracking-wider ${
                        (rec.level || '').toUpperCase() === 'SEKOLAH' ? 'bg-slate-500/10 text-slate-400' :
                        (rec.level || '').toUpperCase() === 'DAERAH' ? 'bg-amber-500/10 text-amber-500' : 
                        (rec.level || '').toUpperCase() === 'NEGERI' ? 'bg-emerald-500/10 text-emerald-500' :
                        'bg-purple-500/10 text-purple-500'
                      }`}>{rec.level}</span>
                    </td>
                    <td className="p-4 text-center font-['Teko'] text-xl text-slate-300">{rec.participants?.length || 0}</td>
                    <td className="p-4 text-right pr-6">
                      <div className="flex justify-end gap-2">
                         <button onClick={() => downloadSinglePDF(rec)} className="p-2 bg-white/5 hover:bg-red-600 hover:text-white text-red-500 rounded-lg transition-all" title="Download PDF">
                           <FileText size={16}/>
                         </button>
                         <button onClick={() => downloadSingleExcel(rec)} className="p-2 bg-white/5 hover:bg-emerald-600 hover:text-white text-emerald-500 rounded-lg transition-all" title="Download Excel">
                           <FileSpreadsheet size={16}/>
                         </button>
                         <button onClick={() => handleDelete(rec.id, rec.programName)} className="p-2 bg-white/5 hover:bg-red-600 hover:text-white text-slate-500 rounded-lg transition-all" title="Padam Rekod">
                           <Trash size={16}/>
                         </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {records.length === 0 && (
                  <tr><td colSpan={5} className="p-10 text-center text-xs text-slate-600 font-black uppercase tracking-widest">Tiada Rekod Dijumpai</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
};

export default AnalysisScreen;