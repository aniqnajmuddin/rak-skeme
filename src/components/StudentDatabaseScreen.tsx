import React, { useState } from 'react';
import { studentDataService } from '../services/studentDataService';
import { 
  ArrowLeft, Search, ChevronDown, ChevronRight, 
  UserCircle2, Trash2, Database 
} from 'lucide-react';

const StudentDatabaseScreen: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const [query, setQuery] = useState('');
  const [expandedClass, setExpandedClass] = useState<string | null>(null);
  
  const allStudents = studentDataService.getAllStudents() || [];

  // 1. Grouping murid ikut kelas (Logic Intelligence)
  const groupedStudents = allStudents.reduce((acc: any, student) => {
    const className = student.className || 'TIADA KELAS';
    if (!acc[className]) acc[className] = [];
    acc[className].push(student);
    return acc;
  }, {});

  // Ambil senarai kelas dan susun (A-Z)
  const classes = Object.keys(groupedStudents).sort();

  const handleDelete = (id: string) => {
    if (window.confirm("Bohh pasti nak padam data murid ni?")) {
      studentDataService.deleteStudent(id);
      window.location.reload(); // Refresh untuk update senarai
    }
  };

  return (
    <div className="min-h-screen bg-[#020617] text-white p-4 md:p-10 pb-32 animate-in fade-in duration-500 font-['Manrope']">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* HEADER SECTION - TRADEMARK RAK SKeMe */}
        <div className="flex items-center gap-4 border-b border-white/5 pb-6">
          <button onClick={onBack} className="p-3 rounded-2xl bg-white/5 border border-white/10 text-emerald-500 hover:bg-emerald-500/10 transition-all">
            <ArrowLeft size={20} />
          </button>
          <div>
            <h2 className="text-4xl font-['Teko'] font-bold uppercase text-white leading-none tracking-tight">DATA <span className="text-emerald-500">INDUK</span></h2>
            <p className="text-[10px] font-black text-slate-500 tracking-[0.3em] uppercase mt-1">Susunan Sistematik Mengikut Kelas</p>
          </div>
        </div>

        {/* SEARCH BAR PINTAR */}
        <div className="relative group">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-emerald-500 transition-all" size={18} />
          <input 
            type="text" 
            placeholder="CARI NAMA ATAU NO. KAD PENGENALAN..." 
            className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-14 pr-6 text-[10px] font-black uppercase tracking-widest focus:border-emerald-500/50 outline-none transition-all"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>

        {/* CLASS ACCORDION LIST */}
        <div className="space-y-3">
          {classes.length > 0 ? classes.map((className) => {
            // Filter murid dalam kelas berdasarkan carian
            const filteredInClass = groupedStudents[className].filter((s: any) => 
              (s.name || '').toLowerCase().includes(query.toLowerCase()) || 
              (s.icNumber || '').includes(query)
            );

            // Kalau tengah cari, dan kelas tu tak ada nama yang dicari, kita sorok kelas tu
            if (query && filteredInClass.length === 0) return null;

            // Expand secara automatik kalau user sedang buat carian
            const isExpanded = expandedClass === className || query.length > 0;

            return (
              <div key={className} className="bg-white/5 border border-white/5 rounded-[2rem] overflow-hidden transition-all hover:border-white/10 shadow-xl">
                {/* Bar Kelas (Trigger) */}
                <button 
                  onClick={() => setExpandedClass(isExpanded ? null : className)}
                  className={`w-full p-6 flex justify-between items-center transition-all ${isExpanded ? 'bg-white/5' : 'hover:bg-white/5'}`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`p-2 rounded-xl transition-all ${isExpanded ? 'bg-emerald-500 text-white' : 'bg-white/5 text-emerald-500'}`}>
                      <Database size={20} />
                    </div>
                    <span className="text-sm font-black uppercase tracking-widest text-white">KELAS: {className}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-[9px] font-black bg-white/5 px-4 py-1.5 rounded-full text-slate-400 border border-white/5">
                      {filteredInClass.length} ENTITI
                    </span>
                    <div className="text-slate-600 transition-transform">
                       {isExpanded ? <ChevronDown size={20}/> : <ChevronRight size={20}/>}
                    </div>
                  </div>
                </button>

                {/* Senarai Murid (Content) */}
                {isExpanded && (
                  <div className="p-4 pt-0 space-y-2 animate-in slide-in-from-top-2 duration-300">
                    <div className="h-[1px] bg-white/5 w-full mb-4" />
                    {filteredInClass.map((s: any) => (
                      <div key={s.id} className="bg-black/20 p-4 rounded-2xl border border-white/5 flex justify-between items-center group hover:bg-white/5 transition-all">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-slate-500 group-hover:text-emerald-500 transition-colors">
                            <UserCircle2 size={24} />
                          </div>
                          <div>
                            <p className="text-[11px] font-black uppercase text-white group-hover:text-emerald-500 transition-colors">{s.name}</p>
                            <p className="text-[9px] text-slate-500 font-bold tracking-tighter italic">{s.icNumber}</p>
                          </div>
                        </div>
                        <button 
                          onClick={() => handleDelete(s.id)}
                          className="p-3 text-slate-700 hover:text-rose-500 hover:bg-rose-500/10 rounded-xl transition-all"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          }) : (
            <div className="text-center py-24 bg-white/5 border-2 border-dashed border-white/5 rounded-[3rem]">
               <Database className="mx-auto text-slate-800 mb-4 opacity-20" size={48} />
               <p className="text-[10px] text-slate-600 font-black uppercase tracking-[0.4em]">Tiada Data Untuk Dipaparkan</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentDatabaseScreen;