import React, { useState, useContext } from 'react';
import { studentDataService } from '../services/studentDataService';
import { NotifyContext } from '../App';
import { 
  ArrowLeft, Search, ChevronDown, ChevronRight, 
  UserCircle2, Trash2, Database, Upload, Download 
} from 'lucide-react';
import * as XLSX from 'xlsx';

const StudentDatabaseScreen: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const notifyCtx = useContext(NotifyContext);
  const [query, setQuery] = useState('');
  const [expandedClass, setExpandedClass] = useState<string | null>(null);
  const [allStudents, setAllStudents] = useState(studentDataService.getAllStudents());

  // --- LOGIK BIJAK: NORMALISASI NAMA KELAS ---
  const normalizeClassName = (raw: string) => {
    let name = raw.toUpperCase().trim();
    // Jika nampak keyword Tahun 6 / Enam / 6 Anggerik -> Auto-create/match
    if (name.includes("ENAM") || name.includes("TAHUN 6") || name.startsWith("6")) {
      // Boleh tambah logik spesifik di sini jika perlu
    }
    return name || "TIADA KELAS";
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: 'binary' });
        const data: any[] = XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]]);

        const cleaned = data.map((item: any) => ({
          id: Math.random().toString(36).substring(2, 11),
          name: (item.Nama || item.NAMA || "").toUpperCase().trim(),
          icNumber: String(item.IC || item['No. KP'] || "").replace(/-/g, ''),
          className: normalizeClassName(item.Kelas || item.KELAS || "")
        })).filter(s => s.name && s.icNumber);

        studentDataService.bulkAddStudents(cleaned);
        setAllStudents(studentDataService.getAllStudents());
        notifyCtx?.notify(`Berjaya import ${cleaned.length} murid!`, "success");
      } catch (err) { notifyCtx?.notify("Gagal baca fail!", "error"); }
      e.target.value = ""; 
    };
    reader.readAsBinaryString(file);
  };

  const handleDelete = (id: string) => {
    if (window.confirm("Bohh pasti nak padam data murid ni?")) {
      studentDataService.deleteStudent(id);
      setAllStudents([...studentDataService.getAllStudents()]);
      notifyCtx?.notify("Murid dipadam.", "info");
    }
  };

  // Grouping murid ikut kelas
  const groupedStudents = allStudents.reduce((acc: any, student) => {
    const className = student.className;
    if (!acc[className]) acc[className] = [];
    acc[className].push(student);
    return acc;
  }, {});

  const classes = Object.keys(groupedStudents).sort();

  return (
    <div className="min-h-screen bg-[#020617] text-white p-4 md:p-10 pb-32 font-['Manrope']">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* HEADER */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-6 border-b border-white/5 pb-6">
          <div className="flex items-center gap-4">
            <button onClick={onBack} className="p-3 rounded-2xl bg-white/5 border border-white/10 text-emerald-500 hover:bg-emerald-500/10 transition-all">
              <ArrowLeft size={20} />
            </button>
            <div>
              <h2 className="text-4xl font-['Teko'] font-bold uppercase text-white leading-none">DATA <span className="text-emerald-500">INDUK</span></h2>
              <p className="text-[10px] font-black text-slate-500 tracking-[0.3em] uppercase mt-1">SKeMe Intelligence Storage</p>
            </div>
          </div>
          <div className="flex gap-2">
            <label className="bg-emerald-600 hover:bg-emerald-500 px-6 py-3 rounded-xl text-[9px] font-black uppercase flex items-center gap-2 cursor-pointer transition-all shadow-lg">
              <Upload size={14}/> Import Data
              <input type="file" hidden accept=".csv, .xlsx" onChange={handleFileUpload} />
            </label>
          </div>
        </div>

        {/* SEARCH */}
        <div className="relative group">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
          <input 
            type="text" 
            placeholder="CARI NAMA ATAU NO. KAD PENGENALAN..." 
            className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-14 pr-6 text-[10px] font-black uppercase tracking-widest focus:border-emerald-500/50 outline-none transition-all"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>

        {/* ACCORDION */}
        <div className="space-y-3">
          {classes.length > 0 ? classes.map((className) => {
            const filteredInClass = groupedStudents[className].filter((s: any) => 
              s.name.includes(query.toUpperCase()) || s.icNumber.includes(query)
            );

            if (query && filteredInClass.length === 0) return null;
            const isExpanded = expandedClass === className || query.length > 0;

            return (
              <div key={className} className="bg-white/5 border border-white/5 rounded-[2rem] overflow-hidden hover:border-white/10 transition-all shadow-xl">
                <button 
                  onClick={() => setExpandedClass(isExpanded ? null : className)}
                  className={`w-full p-6 flex justify-between items-center ${isExpanded ? 'bg-white/5' : ''}`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`p-2 rounded-xl ${isExpanded ? 'bg-emerald-500 text-white' : 'bg-white/5 text-emerald-500'}`}>
                      <Database size={20} />
                    </div>
                    <span className="text-sm font-black uppercase tracking-widest text-white">{className}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-[9px] font-black bg-white/5 px-4 py-1.5 rounded-full text-slate-400">
                      {filteredInClass.length} MURID
                    </span>
                    {isExpanded ? <ChevronDown size={20}/> : <ChevronRight size={20}/>}
                  </div>
                </button>

                {isExpanded && (
                  <div className="p-4 pt-0 space-y-2 animate-in slide-in-from-top-2">
                    <div className="h-[1px] bg-white/5 w-full mb-4" />
                    {filteredInClass.map((s: any) => (
                      <div key={s.id} className="bg-black/20 p-4 rounded-2xl border border-white/5 flex justify-between items-center group hover:bg-white/5 transition-all">
                        <div className="flex items-center gap-4">
                          <UserCircle2 className="text-slate-600 group-hover:text-emerald-500" size={24} />
                          <div>
                            <p className="text-[11px] font-black uppercase text-white">{s.name}</p>
                            <p className="text-[9px] text-slate-500 font-bold tracking-tighter">{s.icNumber}</p>
                          </div>
                        </div>
                        <button onClick={() => handleDelete(s.id)} className="p-3 text-slate-700 hover:text-rose-500 transition-all">
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