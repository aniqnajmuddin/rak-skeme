import React, { useState, useEffect, useRef, useContext } from 'react';
import { studentDataService } from '../services/studentDataService';
import { NotifyContext } from '../App'; // Panggil suis speaker
import { 
  Database, Users, Bell, FileUp, Plus, Trash2, Search, ArrowLeft, 
  ShieldCheck, Megaphone, Trash, Settings, ChevronRight, CheckCircle, Filter
} from 'lucide-react';

const AdminPanelScreen: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  // --- AKTIFKAN NOTIFY ---
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
    setStudents(studentDataService.getAllStudents());
    setClasses(['SEMUA', ...studentDataService.getUniqueClasses()]);
  };

  // --- FUNGSI IMPORT YANG CERDIK ---
  const handleBulkImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Munculkan popup LOADING
    const loadId = notifyCtx?.notify(`Sedang menganalisis fail: ${file.name}...`, "loading");

    try {
        const newStudents = await studentDataService.parseFile(file);
        studentDataService.bulkAddStudents(newStudents);
        
        // Munculkan popup BERJAYA
        notifyCtx?.notify(`Hebat! Pangkalan data berjaya dikemaskini dengan ${newStudents.length} murid baru.`, "success");
        refreshData();
    } catch (err) {
        // Munculkan popup ERROR
        notifyCtx?.notify("Gagal! Sila pastikan fail anda adalah format Excel atau CSV yang betul.", "error");
    } finally {
        if (loadId) notifyCtx?.removeNotify(loadId); // Tutup loading
        if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleSaveBulletin = () => {
    localStorage.setItem('RAK_ANNOUNCEMENT', bulletin);
    notifyCtx?.notify("Makluman rasmi telah dikemaskini ke Dashboard Guru!", "success");
  };

  const filteredStudents = students.filter(s => {
    const matchSearch = s.name.toLowerCase().includes(searchTerm.toLowerCase()) || s.icNumber.includes(searchTerm);
    const matchClass = selectedClass === 'SEMUA' || s.className === selectedClass;
    return matchSearch && matchClass;
  });

  return (
    <div className="min-h-screen bg-[#0F172A] text-slate-100 font-['Manrope'] p-6 md:p-10">
      <div className="max-w-7xl mx-auto flex flex-col h-full">
        
        {/* Header Admin */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
            <div className="flex items-center gap-4">
                <button onClick={onBack} className="w-12 h-12 bg-slate-800 rounded-2xl flex items-center justify-center text-blue-400 border border-white/5 hover:bg-blue-600 transition-all"><ArrowLeft/></button>
                <div>
                    <h1 className="text-4xl font-['Teko'] font-bold uppercase leading-none text-white tracking-wide">ADMIN <span className="text-emerald-500">CONTROL</span></h1>
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Pusat Penyelenggaraan Sistem</p>
                </div>
            </div>

            <div className="flex bg-slate-800/50 p-1 rounded-2xl border border-white/5">
                {[
                  {id: 'DATA', icon: Database, label: 'Data'},
                  {id: 'BULLETIN', icon: Megaphone, label: 'Makluman'},
                  {id: 'SETTINGS', icon: Settings, label: 'Sistem'}
                ].map((tab: any) => (
                    <button key={tab.id} onClick={() => setActiveModule(tab.id)} className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase flex items-center gap-2 transition-all ${activeModule === tab.id ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' : 'text-slate-500 hover:text-slate-300'}`}>
                        <tab.icon size={16}/> {tab.label}
                    </button>
                ))}
            </div>
        </div>

        {/* MODUL DATA MURID */}
        {activeModule === 'DATA' && (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 animate-in fade-in duration-500">
            <div className="lg:col-span-1 space-y-6">
                <div className="bg-slate-800/40 p-6 rounded-[2rem] border border-white/5">
                    <h3 className="text-sm font-black uppercase text-slate-400 mb-6 flex items-center gap-2"><Filter size={16}/> Filter Kelas</h3>
                    <div className="space-y-1">
                        {classes.map(c => (
                            <button key={c} onClick={() => setSelectedClass(c)} className={`w-full text-left px-4 py-3 rounded-xl text-[10px] font-black uppercase transition-all flex justify-between items-center ${selectedClass === c ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-500 hover:bg-white/5'}`}>
                                {c} <ChevronRight size={14} className={selectedClass === c ? 'opacity-100' : 'opacity-0'}/>
                            </button>
                        ))}
                    </div>
                </div>
                
                <div onClick={() => fileInputRef.current?.click()} className="bg-emerald-500/10 border-2 border-dashed border-emerald-500/30 p-8 rounded-[2rem] flex flex-col items-center justify-center text-center cursor-pointer group hover:bg-emerald-500/20 transition-all">
                    <FileUp size={32} className="text-emerald-500 mb-3 group-hover:scale-110 transition-transform" />
                    <span className="text-[10px] font-black uppercase text-emerald-500">Update Master Data</span>
                    <input type="file" ref={fileInputRef} onChange={handleBulkImport} className="hidden" accept=".xlsx,.csv" />
                </div>
            </div>

            <div className="lg:col-span-3">
                <div className="bg-slate-800/40 p-8 rounded-[2.5rem] border border-white/5">
                    <div className="flex flex-col md:flex-row gap-4 justify-between items-center mb-8">
                        <div className="relative w-full md:w-96">
                            <Search className="absolute left-4 top-3.5 text-slate-500" size={18}/>
                            <input value={searchTerm} onChange={e => setSearchTerm(e.target.value)} placeholder="Cari Nama / No. KP..." className="w-full bg-slate-900/50 border border-white/10 rounded-2xl py-3 pl-12 pr-4 text-sm font-bold uppercase outline-none focus:border-blue-500" />
                        </div>
                        <div className="text-[10px] font-black text-slate-500 uppercase">{filteredStudents.length} Rekod Aktif</div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[60vh] overflow-y-auto no-scrollbar">
                        {filteredStudents.map(s => (
                            <div key={s.id} className="bg-slate-900/40 p-4 rounded-2xl border border-white/5 flex items-center justify-between group">
                                <div className="flex items-center gap-4 min-w-0 pr-2">
                                    <div className="w-10 h-10 bg-slate-800 rounded-xl flex items-center justify-center font-bold text-blue-500 shrink-0">{s.name.charAt(0)}</div>
                                    <div className="min-w-0">
                                        <div className="text-[10px] font-black uppercase text-white truncate">{s.name}</div>
                                        <div className="text-[9px] font-bold text-slate-500">{s.icNumber} • {s.className}</div>
                                    </div>
                                </div>
                                <button onClick={() => { if(confirm("Padam data murid ini?")) { studentDataService.deleteStudent(s.id); refreshData(); notifyCtx?.notify("Data murid berjaya dipadam.", "info"); } }} className="p-2 text-slate-700 hover:text-red-500 transition-colors shrink-0"><Trash size={16}/></button>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
          </div>
        )}

        {/* MODUL MAKLUMAN */}
        {activeModule === 'BULLETIN' && (
           <div className="max-w-2xl mx-auto w-full animate-in zoom-in-95 duration-500">
               <div className="bg-slate-800/40 p-8 rounded-[2.5rem] border border-white/5 shadow-2xl">
                   <h3 className="text-2xl font-['Teko'] font-bold text-white uppercase mb-6 flex items-center gap-3"><Megaphone size={24} className="text-orange-500"/> Hebahan Dashboard Guru</h3>
                   <textarea value={bulletin} onChange={e => setBulletin(e.target.value.toUpperCase())} className="w-full h-40 bg-slate-900/50 border border-white/10 rounded-3xl p-6 text-white font-bold outline-none focus:border-orange-500 transition-all resize-none" placeholder="TULIS MAKLUMAN DI SINI..."></textarea>
                   <button onClick={handleSaveBulletin} className="w-full mt-6 py-4 bg-orange-500 hover:bg-orange-600 text-white rounded-2xl font-['Teko'] font-bold text-xl uppercase tracking-widest shadow-lg shadow-orange-500/20 active:scale-95 transition-all">Publish Makluman</button>
               </div>
           </div>
        )}
      </div>
    </div>
  );
};

export default AdminPanelScreen;