import React, { useState, useEffect, useRef, useContext } from 'react';
import { studentDataService } from '../services/studentDataService';
import { NotifyContext } from '../App';
import { 
  Database, FileUp, ArrowLeft, Megaphone, Trash, Settings, 
  Search, Filter, PlusCircle, Sparkles, Users, Edit3, ChevronRight 
} from 'lucide-react';

const AdminPanelScreen: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const notifyCtx = useContext(NotifyContext);
  const [activeModule, setActiveModule] = useState<'DATA' | 'BULLETIN' | 'SETTINGS'>('DATA');
  const [searchTerm, setSearchTerm] = useState('');
  const [students, setStudents] = useState<any[]>([]);
  const [classes, setClasses] = useState<string[]>([]);
  const [selectedClass, setSelectedClass] = useState<string>('SEMUA');
  const [bulletin, setBulletin] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { 
    refreshData(); 
    const savedMsg = localStorage.getItem('RAK_ANNOUNCEMENT');
    if (savedMsg) setBulletin(savedMsg);
  }, []);

  const refreshData = () => {
    const allStudents = studentDataService.getAllStudents() || [];
    // Tapis supaya tak tunjuk dummy penanda kelas dalam senarai admin
    setStudents(allStudents.filter((s: any) => s.name !== 'SISTEM: PENANDA KELAS'));
    setClasses(['SEMUA', ...studentDataService.getUniqueClasses()]);
  };

  // --- PEMBAIKAN HANDLE IMPORT (ASYNC & STABLE) ---
  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const loadId = notifyCtx?.notify("Intelligence Hunter sedang mengimbas fail...", "loading");
    
    try {
      // Pastikan parseFile dalam service adalah async
      const res = await studentDataService.parseFile(file);
      
      if (res && res.length > 0) {
        studentDataService.bulkAddStudents(res);
        notifyCtx?.notify(`Misi Berjaya! ${res.length} murid diserap ke database.`, "success");
        refreshData();
      } else {
        notifyCtx?.notify("Fail dikesan tapi tiada data murid yang sah.", "error");
      }
    } catch (err) { 
      console.error(err);
      notifyCtx?.notify("Ralat fail! Pastikan format betul (Nama, IC, Kelas).", "error"); 
    } finally { 
      // Reset input supaya boleh upload fail yang sama jika perlu
      if (fileInputRef.current) fileInputRef.current.value = '';
      // Tutup loading notification jika ada fungsi dismiss
      if (loadId && notifyCtx?.dismiss) notifyCtx.dismiss(loadId);
    }
  };

  const filteredStudents = students.filter(s => {
    const name = String(s.name || '').toUpperCase();
    const ic = String(s.icNumber || '');
    const matchSearch = name.includes(searchTerm.toUpperCase()) || ic.includes(searchTerm);
    const matchClass = selectedClass === 'SEMUA' || s.className === selectedClass;
    return matchSearch && matchClass;
  });

  return (
    <div className="min-h-screen bg-[#020617] text-white p-4 lg:p-10 pb-32 font-['Manrope']">
      <div className="max-w-7xl mx-auto">
        
        {/* HEADER UTAMA */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
          <div className="flex items-center gap-4">
            <button onClick={onBack} className="p-3 bg-white/5 rounded-xl text-blue-500 border border-white/10 hover:bg-blue-600 hover:text-white transition-all shadow-lg">
              <ArrowLeft size={24}/>
            </button>
            <div>
              <h1 className="text-5xl font-['Teko'] font-bold uppercase italic tracking-tight leading-none text-white">ADMIN <span className="text-emerald-500">CONTROL</span></h1>
              <p className="text-[10px] font-black text-slate-500 tracking-[0.3em] uppercase mt-1 italic tracking-tighter">Pusat Penyelenggaraan SK Menerong</p>
            </div>
          </div>
          <div className="flex bg-white/5 p-1.5 rounded-[1.5rem] border border-white/10 shadow-inner overflow-hidden">
            {[
              {id: 'DATA', icon: Database, label: 'Database'},
              {id: 'BULLETIN', icon: Megaphone, label: 'Hebahan'},
              {id: 'SETTINGS', icon: Settings, label: 'Sistem'}
            ].map((tab: any) => (
              <button 
                key={tab.id} 
                onClick={() => setActiveModule(tab.id)} 
                className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase flex items-center gap-2 transition-all ${activeModule === tab.id ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
              >
                <tab.icon size={16}/> {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* 1. MODUL DATABASE MURID */}
        {activeModule === 'DATA' && (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 animate-in fade-in duration-500">
            <div className="space-y-6">
              <div onClick={() => fileInputRef.current?.click()} className="bg-emerald-500/5 border-2 border-dashed border-emerald-500/20 p-10 rounded-[2.5rem] text-center cursor-pointer hover:bg-emerald-500/10 transition-all group shadow-2xl">
                <FileUp className="mx-auto text-emerald-500 mb-4 group-hover:scale-110 transition-transform" size={40}/>
                <span className="text-[11px] font-black uppercase text-emerald-500 tracking-widest block">Master Import</span>
                <p className="text-[8px] text-slate-500 mt-2 uppercase">Klik untuk upload CSV / XLSX</p>
                <input type="file" ref={fileInputRef} onChange={handleImport} className="hidden" accept=".xlsx,.csv" />
              </div>
              <div className="bg-white/5 p-6 rounded-[2.5rem] border border-white/10 shadow-xl">
                <h3 className="text-[10px] font-black uppercase text-slate-500 mb-6 flex items-center gap-2 tracking-widest border-b border-white/5 pb-4"><Filter size={14}/> Filter Kelas</h3>
                <div className="space-y-2 max-h-64 overflow-y-auto no-scrollbar pr-2">
                  {classes.map(c => (
                    <button key={c} onClick={() => setSelectedClass(c)} className={`w-full text-left px-5 py-4 rounded-2xl text-[10px] font-black uppercase transition-all flex justify-between items-center ${selectedClass === c ? 'bg-blue-600 text-white shadow-lg' : 'bg-white/5 text-slate-500 hover:bg-white/10'}`}>
                      {c} <ChevronRight size={14} className={selectedClass === c ? 'opacity-100' : 'opacity-0'}/>
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className="lg:col-span-3 bg-white/5 p-8 rounded-[3rem] border border-white/10 shadow-2xl">
              <div className="relative mb-8">
                <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-600" size={20}/>
                <input value={searchTerm} onChange={e => setSearchTerm(e.target.value)} placeholder="CARI NAMA / KAD PENGENALAN..." className="w-full bg-slate-900/50 border border-white/10 rounded-[1.5rem] py-5 pl-14 pr-6 text-[11px] font-bold uppercase outline-none focus:border-blue-500 transition-all shadow-inner" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[55vh] overflow-y-auto no-scrollbar pr-3">
                {filteredStudents.length > 0 ? filteredStudents.map(s => (
                  <div key={s.id} className="bg-white/5 p-5 rounded-3xl border border-white/5 flex items-center justify-between group hover:bg-white/10 transition-all">
                    <div className="flex items-center gap-4 truncate">
                      <div className="w-12 h-12 bg-blue-600/10 rounded-2xl flex items-center justify-center font-black text-blue-500 shrink-0 border border-blue-500/20">{s.name?.charAt(0)}</div>
                      <div className="truncate">
                        <div className="text-[11px] font-black uppercase text-white truncate">{s.name}</div>
                        <div className="text-[9px] font-bold text-slate-500 mt-1 uppercase">{s.icNumber} | {s.className}</div>
                      </div>
                    </div>
                    <button onClick={() => { if(window.confirm(`Padam data ${s.name}?`)) { studentDataService.deleteStudent(s.id); refreshData(); notifyCtx?.notify("Murid dipadam.", "info"); } }} className="w-10 h-10 rounded-xl flex items-center justify-center text-slate-700 hover:text-red-500 transition-all"><Trash size={18}/></button>
                  </div>
                )) : (
                  <div className="col-span-full py-20 text-center opacity-20 uppercase font-black tracking-[0.5em] text-xs">Tiada Data Dijumpai</div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* 2. MODUL HEBAHAN */}
        {activeModule === 'BULLETIN' && (
          <div className="max-w-2xl mx-auto w-full animate-in zoom-in-95 duration-500">
            <div className="bg-white/5 p-10 rounded-[3.5rem] border border-white/10 shadow-2xl relative overflow-hidden">
              <Megaphone className="absolute -right-10 -bottom-10 text-white/5 rotate-12" size={240} />
              <div className="relative z-10 text-center">
                <h3 className="text-3xl font-['Teko'] font-bold text-white uppercase mb-8 flex items-center justify-center gap-4 border-b border-white/5 pb-6">
                  <Megaphone size={28} className="text-blue-500"/> Hebahan Dashboard
                </h3>
                <textarea 
                  value={bulletin} 
                  onChange={e => setBulletin(e.target.value.toUpperCase())} 
                  className="w-full h-40 bg-slate-900/50 border border-white/10 rounded-3xl p-6 text-[11px] font-bold text-white outline-none focus:border-blue-500 transition-all resize-none shadow-inner text-center" 
                  placeholder="TULIS MAKLUMAN DI SINI..."
                />
                <button onClick={() => { localStorage.setItem('RAK_ANNOUNCEMENT', bulletin); notifyCtx?.notify("Hebahan dikemaskini!", "success"); }} className="w-full mt-8 py-5 bg-blue-600 hover:bg-blue-500 text-white rounded-[1.5rem] text-[11px] font-black uppercase tracking-[0.2em] shadow-xl transition-all">Sync Hebahan Sekarang</button>
              </div>
            </div>
          </div>
        )}

        {/* 3. MODUL SISTEM */}
        {activeModule === 'SETTINGS' && (
          <div className="max-w-5xl mx-auto w-full animate-in slide-in-from-right-5 duration-500 space-y-10 pb-20">
            <div className="bg-white/5 p-8 rounded-[3rem] border border-white/10 shadow-2xl">
              <h3 className="text-3xl font-['Teko'] font-bold text-white uppercase mb-6 flex items-center gap-4 border-b border-white/5 pb-4">
                <Settings size={28} className="text-blue-500"/> Urus Senarai Kelas
              </h3>
              <div className="flex flex-col md:flex-row gap-3 mb-8">
                <input id="newClassName" placeholder="NAMA KELAS BARU (CTH: 6 ANGGERIK)..." className="flex-1 bg-slate-900/50 border border-white/10 rounded-2xl px-6 py-4 text-[11px] font-black uppercase outline-none focus:border-blue-500" />
                <button onClick={() => {
                  const el = document.getElementById('newClassName') as HTMLInputElement;
                  if(el.value) { studentDataService.addManualClass(el.value); el.value=''; refreshData(); notifyCtx?.notify("Kelas dicipta!", "success"); }
                }} className="bg-blue-600 hover:bg-blue-500 px-8 py-4 rounded-2xl text-[11px] font-black uppercase flex items-center gap-2 shadow-lg"><PlusCircle size={18}/> Tambah</button>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {studentDataService.getUniqueClasses().map(c => (
                  <div key={c} className="bg-white/5 p-4 rounded-2xl border border-white/5 flex items-center justify-between group">
                    <span className="text-[10px] font-black text-slate-300 uppercase truncate">{c}</span>
                    <div className="flex gap-1">
                      <button onClick={() => {const n = prompt("Tukar "+c+" kepada:"); if(n){studentDataService.updateClassName(c,n); refreshData(); notifyCtx?.notify("Kelas dikemaskini!", "info");}}} className="p-2 text-blue-500 hover:bg-blue-500/10 rounded-lg"><Edit3 size={14}/></button>
                      <button onClick={() => {if(window.confirm("Padam kelas "+c+"? Murid dalam kelas ini akan kekal tanpa kelas.")){studentDataService.deleteClassName(c); refreshData(); notifyCtx?.notify("Kelas dipadam.", "info");}}} className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg"><Trash size={14}/></button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="bg-white/5 p-8 rounded-[3rem] border border-white/10 shadow-2xl">
              <h3 className="text-3xl font-['Teko'] font-bold text-white uppercase mb-6 flex items-center gap-4 border-b border-white/5 pb-4">
                <Sparkles size={28} className="text-emerald-500"/> Kamus Suggestion Program
              </h3>
              <div className="flex flex-col md:flex-row gap-3 mb-8">
                <input id="newSuggestName" placeholder="NAMA AKTIVITI CADANGAN..." className="flex-1 bg-slate-900/50 border border-white/10 rounded-2xl px-6 py-4 text-[11px] font-black uppercase outline-none focus:border-emerald-500" />
                <button onClick={() => {
                  const el = document.getElementById('newSuggestName') as HTMLInputElement;
                  if(el.value) { studentDataService.addSuggestion(el.value); el.value=''; refreshData(); notifyCtx?.notify("Kamus dikemaskini!", "success"); }
                }} className="bg-emerald-600 hover:bg-emerald-500 px-8 py-4 rounded-2xl text-[11px] font-black uppercase flex items-center gap-2 shadow-lg"><PlusCircle size={18}/> Simpan</button>
              </div>
              <div className="flex flex-wrap gap-2">
                {studentDataService.suggestions.map((s: string) => (
                  <div key={s} className="bg-emerald-500/10 border border-emerald-500/20 px-4 py-2 rounded-xl flex items-center gap-3">
                    <span className="text-[9px] font-black text-emerald-500 uppercase">{s}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPanelScreen;