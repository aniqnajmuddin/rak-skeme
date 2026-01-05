import React, { useState, useEffect, useContext } from 'react';
import { studentDataService } from '../services/studentDataService';
import { NotifyContext } from '../App'; // Panggil suis notifikasi
import { Student } from '../types';
import { 
  Search, Plus, Edit2, Database, User, Filter, 
  Trash2, ChevronRight, Hash, Users, ShieldAlert 
} from 'lucide-react';

const StudentDatabaseScreen: React.FC = () => {
  // --- AKTIFKAN NOTIFY ---
  const notifyCtx = useContext(NotifyContext);

  const [students, setStudents] = useState<Student[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClassFilter, setSelectedClassFilter] = useState('SEMUA');
  const [availableClasses, setAvailableClasses] = useState<string[]>([]);
  
  useEffect(() => { 
      const loadId = notifyCtx?.notify("Memuatkan pangkalan data murid...", "loading");
      
      const allStudents = studentDataService.getAllStudents();
      setStudents([...allStudents]); 
      setAvailableClasses(['SEMUA', ...studentDataService.getUniqueClasses()]);
      
      if (loadId) notifyCtx?.removeNotify(loadId);
  }, []);

  const handleFilterClass = (cls: string) => {
    setSelectedClassFilter(cls);
    if (cls !== 'SEMUA') {
        notifyCtx?.notify(`Menapis murid kelas ${cls}`, "info");
    }
  };

  const handleDeleteStudent = (id: string, name: string) => {
    if (confirm(`Adakah anda pasti untuk memadam data ${name}?`)) {
        studentDataService.deleteStudent(id);
        setStudents(prev => prev.filter(s => s.id !== id));
        notifyCtx?.notify(`Rekod ${name} telah dipadam selamanya.`, "success");
    }
  };

  const filteredStudents = students.filter(s => {
    const matchesSearch = s.name.toLowerCase().includes(searchTerm.toLowerCase()) || s.icNumber.includes(searchTerm);
    const matchesClass = selectedClassFilter === 'SEMUA' || s.className === selectedClassFilter;
    return matchesSearch && matchesClass;
  });

  return (
    <div className="flex flex-col h-full bg-[#0F172A] text-slate-100 font-['Manrope'] p-6 md:p-10 overflow-y-auto no-scrollbar">
      
      <div className="max-w-7xl mx-auto w-full">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
            <div>
                <h2 className="text-5xl font-['Teko'] font-bold text-white uppercase tracking-tight flex items-center gap-4">
                    <Database className="text-blue-500" size={40} /> PANGKALAN <span className="text-blue-500">DATA</span>
                </h2>
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] mt-1">Sistem Pengurusan Maklumat Murid WIRA KOKU</p>
            </div>
            <div className="flex gap-3">
                <button 
                  onClick={() => notifyCtx?.notify("Fungsi 'Urus Kelas' akan tersedia pada kemaskini akan datang.", "info")}
                  className="bg-slate-800 border border-white/5 text-slate-400 px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:text-white transition-all"
                >
                  Urus Kelas
                </button>
                <button 
                  onClick={() => notifyCtx?.notify("Sila gunakan borang 'Pilih Peserta' di skrin Rekod Aktiviti untuk pendaftaran pantas.", "info")}
                  className="bg-blue-600 text-white px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-500 flex items-center gap-2 shadow-xl shadow-blue-600/20 active:scale-95 transition-all"
                >
                  <Plus size={16}/> Tambah Murid
                </button>
            </div>
        </div>

        {/* Search & Filter Bar */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 mb-8">
            <div className="lg:col-span-3 relative group">
                <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none">
                    <Search className="text-slate-500 group-focus-within:text-blue-500 transition-colors" size={20}/>
                </div>
                <input 
                  type="text" 
                  placeholder="CARI NAMA ATAU NO. MYKID..." 
                  className="w-full bg-slate-800/40 border-2 border-white/5 rounded-[1.5rem] pl-16 pr-6 py-5 text-white font-bold uppercase tracking-widest focus:border-blue-500/50 focus:bg-slate-800/60 outline-none transition-all" 
                  value={searchTerm} 
                  onChange={e => setSearchTerm(e.target.value)} 
                />
            </div>
            <div className="relative">
                <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none">
                    <Filter className="text-slate-500" size={16}/>
                </div>
                <select 
                    value={selectedClassFilter} 
                    onChange={e => handleFilterClass(e.target.value)} 
                    className="w-full bg-slate-800/40 border-2 border-white/5 rounded-[1.5rem] pl-12 pr-6 py-5 text-white font-black uppercase text-[10px] tracking-widest appearance-none outline-none focus:border-blue-500/50 cursor-pointer"
                >
                    {availableClasses.map(cls => <option key={cls} value={cls} className="bg-[#0F172A]">{cls}</option>)}
                </select>
            </div>
        </div>

        {/* Table Data */}
        <div className="bg-slate-800/20 border border-white/5 rounded-[2.5rem] overflow-hidden shadow-2xl backdrop-blur-sm">
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-slate-800/50 text-slate-500 text-[10px] font-black uppercase tracking-[0.2em]">
                            <th className="p-6">Maklumat Murid</th>
                            <th className="p-6">No. Kad Pengenalan</th>
                            <th className="p-6 text-center">Kelas</th>
                            <th className="p-6 text-center">Rumah</th>
                            <th className="p-6 text-right">Tindakan</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {filteredStudents.length > 0 ? filteredStudents.map(s => (
                            <tr key={s.id} className="hover:bg-white/5 transition-all group">
                                <td className="p-6">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500 font-bold group-hover:scale-110 transition-transform">
                                            {s.name.charAt(0)}
                                        </div>
                                        <div className="font-bold text-sm text-white uppercase tracking-wide group-hover:text-blue-400 transition-colors">{s.name}</div>
                                    </div>
                                </td>
                                <td className="p-6 font-mono text-xs text-slate-500 tracking-tighter">{s.icNumber}</td>
                                <td className="p-6 text-center">
                                    <span className="bg-blue-500/10 px-4 py-1.5 rounded-full text-[10px] font-black text-blue-500 uppercase border border-blue-500/20">
                                        {s.className}
                                    </span>
                                </td>
                                <td className="p-6 text-center text-[10px] font-black text-slate-500 uppercase tracking-widest">
                                    {s.house || 'TIADA'}
                                </td>
                                <td className="p-6">
                                    <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button 
                                          onClick={() => notifyCtx?.notify("Mod kemaskini profil sedang diselenggara.", "info")}
                                          className="p-3 bg-slate-800 rounded-xl text-slate-400 hover:text-white transition-all"
                                        >
                                          <Edit2 size={16}/>
                                        </button>
                                        <button 
                                          onClick={() => handleDeleteStudent(s.id, s.name)}
                                          className="p-3 bg-slate-800 rounded-xl text-slate-400 hover:text-rose-500 transition-all"
                                        >
                                          <Trash2 size={16}/>
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        )) : (
                          <tr>
                            <td colSpan={5} className="p-20 text-center">
                                <ShieldAlert className="mx-auto text-slate-800 mb-4" size={48} />
                                <p className="text-[10px] font-black text-slate-700 uppercase tracking-widest">Tiada rekod murid ditemui</p>
                            </td>
                          </tr>
                        )}
                    </tbody>
                </table>
            </div>
            
            {/* Footer Table Stats */}
            <div className="bg-slate-800/50 p-6 flex justify-between items-center border-t border-white/5">
                <div className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">
                    Menunjukkan {filteredStudents.length} daripada {students.length} rekod
                </div>
                <div className="flex gap-1">
                   {[1].map(p => (
                       <div key={p} className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-xs font-bold text-white shadow-lg shadow-blue-600/20">1</div>
                   ))}
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default StudentDatabaseScreen;