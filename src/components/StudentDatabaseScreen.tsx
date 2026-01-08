import React, { useState, useEffect, useContext } from 'react';
import { studentDataService } from '../services/studentDataService';
import { NotifyContext } from '../App';
import { 
  ArrowLeft, Search, Upload, Trash2, 
  Edit2, X, Check, Folder, Plus, ChevronDown, 
  Database, ShieldCheck, AlertCircle, Users 
} from 'lucide-react';
import { Student } from '../types';

const StudentDatabaseScreen: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const notifyCtx = useContext(NotifyContext);
  const [students, setStudents] = useState<Student[]>([]);
  const [viewMode, setViewMode] = useState<'CLASSES' | 'STUDENTS'>('CLASSES');
  const [selectedClassName, setSelectedClassName] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [newClassName, setNewClassName] = useState('');
  const [showAddClass, setShowAddClass] = useState(false);
  const [manualClassName, setManualClassName] = useState('');

  const [showDropList, setShowDropList] = useState(false);
  const allAvailableClasses = studentDataService.getUniqueClasses();
  const filteredSuggestions = allAvailableClasses.filter(c => 
    c.toUpperCase().includes(newClassName.toUpperCase())
  );

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    refreshData();
    return () => { document.body.style.overflow = 'auto'; };
  }, []);

  const refreshData = () => {
    const all = studentDataService.getAllStudents();
    setStudents([...all]);
  };

  const handleTransferSubmit = () => {
    if (editingStudent && newClassName.trim()) {
      studentDataService.transferStudent(editingStudent.id, newClassName.toUpperCase().trim());
      refreshData();
      notifyCtx?.notify(`Misi Berjaya! ${editingStudent.name} kini di kelas ${newClassName.toUpperCase()}.`, "success");
      setEditingStudent(null);
      setNewClassName('');
      setShowDropList(false);
    } else {
      notifyCtx?.notify("Sila pilih atau taip nama kelas dahulu, bohh!", "error");
    }
  };

  const handleAddManualClass = () => {
    if (!manualClassName.trim()) {
      notifyCtx?.notify("Nama kelas tak boleh kosong!", "error");
      return;
    }
    studentDataService.addManualClass(manualClassName.toUpperCase());
    setManualClassName('');
    setShowAddClass(false);
    refreshData();
    notifyCtx?.notify(`Mantap! Kelas ${manualClassName.toUpperCase()} telah dicipta.`, "success");
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    const loadId = notifyCtx?.notify("SKeMe Intel sedang memproses fail...", "loading");
    try {
      const extracted = await studentDataService.parseFile(file);
      studentDataService.bulkAddStudents(extracted);
      refreshData();
      if (loadId) notifyCtx?.removeNotify(loadId);
      notifyCtx?.notify(`Berjaya! ${extracted.length} data murid telah diserap masuk.`, "success");
    } catch (err) {
      if (loadId) notifyCtx?.removeNotify(loadId);
      notifyCtx?.notify("Gagal proses fail. Pastikan format betul!", "error");
    } finally {
      setIsUploading(false);
      e.target.value = '';
    }
  };

  const filteredStudents = students.filter(s => {
    const matchSearch = s.name.toUpperCase().includes(searchTerm.toUpperCase()) || s.icNumber.includes(searchTerm);
    const matchClass = (searchTerm !== '') ? true : (viewMode === 'STUDENTS' ? s.className === selectedClassName : true);
    return matchSearch && matchClass && s.name !== 'SISTEM: PENANDA KELAS';
  });

  return (
    <div className="fixed inset-0 bg-[#020617] z-[60] flex flex-col font-['Manrope'] text-white overflow-hidden">
      
      {/* HEADER SECTION */}
      <div className="p-4 md:p-6 bg-[#020617] border-b border-white/10 flex justify-between items-center shadow-2xl z-20">
        <div className="flex items-center gap-3 md:gap-5 overflow-hidden">
          <button onClick={viewMode === 'STUDENTS' ? () => setViewMode('CLASSES') : onBack} className="p-2 md:p-3 bg-white/5 rounded-xl text-blue-500 hover:bg-blue-600 hover:text-white transition-all border border-white/5 shadow-inner">
            <ArrowLeft size={22}/>
          </button>
          <div className="truncate">
            <div className="flex items-center gap-2 mb-0.5 opacity-50">
              <Database size={12} className="text-blue-500" />
              <p className="text-[8px] md:text-[10px] font-black uppercase tracking-[0.3em]">Master Database</p>
            </div>
            <h1 className="text-2xl md:text-5xl font-['Teko'] font-bold uppercase leading-none truncate tracking-tight">
              {viewMode === 'CLASSES' ? 'PENGURUSAN DATA' : selectedClassName}
            </h1>
          </div>
        </div>

        <div className="flex gap-2">
          {viewMode === 'CLASSES' && (
            <button onClick={() => setShowAddClass(true)} className="p-3 md:px-6 md:py-4 bg-white/5 border border-white/10 rounded-xl text-[10px] font-black uppercase flex items-center gap-2 hover:bg-blue-600 transition-all shadow-lg">
              <Plus size={16} className="text-blue-500 group-hover:text-white"/> <span className="hidden sm:inline">Kelas Baru</span>
            </button>
          )}
          <label className="p-3 md:px-6 md:py-4 bg-emerald-600 rounded-xl text-[10px] font-black uppercase flex items-center gap-2 cursor-pointer hover:bg-emerald-500 transition-all shadow-[0_0_20px_rgba(16,185,129,0.2)]">
            <Upload size={16}/> <span className="hidden sm:inline uppercase">{isUploading ? 'Sedang Imbas...' : 'Import Master'}</span>
            <input type="file" className="hidden" accept=".xlsx, .xls" onChange={handleFileUpload} />
          </label>
        </div>
      </div>

      {/* SEARCH BAR */}
      <div className="p-3 md:p-4 bg-white/5 border-b border-white/5 flex items-center px-6 md:px-10">
        <Search size={18} className="text-slate-500 mr-4"/>
        <input 
          value={searchTerm} 
          onChange={e => { setSearchTerm(e.target.value); if(e.target.value.length > 0) setViewMode('STUDENTS'); }}
          placeholder="IMBAS NAMA MURID ATAU NO. KAD PENGENALAN..." 
          className="bg-transparent w-full h-8 md:h-12 outline-none text-xs md:text-sm font-bold uppercase placeholder:text-slate-700 tracking-wider"
        />
      </div>

      {/* CONTENT AREA */}
      <div className="flex-1 overflow-y-auto p-4 md:p-10 custom-scrollbar bg-black/40">
        {viewMode === 'CLASSES' && searchTerm === '' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 animate-in fade-in duration-500 slide-in-from-bottom-5">
            {allAvailableClasses.map(c => {
              const count = students.filter(s => s.className === c && s.name !== 'SISTEM: PENANDA KELAS').length;
              return (
                <div key={c} onClick={() => { setSelectedClassName(c); setViewMode('STUDENTS'); }} className="bg-white/5 border border-white/10 p-5 md:p-8 rounded-[2rem] md:rounded-[3rem] relative group hover:border-blue-500/50 cursor-pointer transition-all active:scale-95 shadow-xl hover:shadow-blue-500/10">
                  <div className="flex justify-between items-start mb-6">
                    <div className="p-4 bg-blue-500/10 rounded-2xl group-hover:bg-blue-600 transition-all">
                      <Folder className="text-blue-500 group-hover:text-white" size={32} />
                    </div>
                    <div className="flex gap-1.5">
                      <button onClick={(e) => { e.stopPropagation(); const n=window.prompt("Edit nama folder:", c); if(n){studentDataService.updateClassName(c,n); refreshData(); notifyCtx?.notify("Folder telah dikemaskini.","info");} }} className="p-2.5 bg-white/5 text-slate-400 rounded-xl hover:bg-blue-600 hover:text-white transition-all"><Edit2 size={14}/></button>
                      <button onClick={(e) => { e.stopPropagation(); if(window.confirm('Padam folder ni?')){studentDataService.deleteClassName(c); refreshData(); notifyCtx?.notify("Folder dipadam.","info");} }} className="p-2.5 bg-white/5 text-slate-400 rounded-xl hover:bg-rose-600 hover:text-white transition-all"><Trash2 size={14}/></button>
                    </div>
                  </div>
                  <h3 className="text-2xl md:text-3xl font-['Teko'] font-bold uppercase tracking-wide leading-none">{c}</h3>
                  <div className="flex items-center gap-2 mt-3 opacity-40">
                    <Users size={12} />
                    <p className="text-[10px] font-black uppercase tracking-widest">{count} Orang</p>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="max-w-5xl mx-auto bg-white/5 rounded-3xl md:rounded-[3rem] border border-white/10 overflow-hidden shadow-2xl animate-in zoom-in-95">
            <table className="w-full text-left">
              <thead className="bg-white/5 text-[9px] md:text-[10px] font-black uppercase text-slate-500 tracking-[0.2em] border-b border-white/5">
                <tr><th className="p-5 md:p-8">Profil Murid</th><th className="p-5 md:p-8 text-right">Kawalan Admin</th></tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredStudents.map(s => (
                  <tr key={s.id} className="hover:bg-white/[0.02] transition-all group">
                    <td className="p-5 md:p-8">
                      <div className="flex items-center gap-4">
                        <div className="hidden sm:flex w-10 h-10 bg-white/5 rounded-xl items-center justify-center text-[10px] font-black text-blue-500 border border-white/5">{s.name.charAt(0)}</div>
                        <div>
                          <p className="text-[12px] md:text-sm font-bold uppercase text-white group-hover:text-blue-400 transition-colors tracking-wide">{s.name}</p>
                          <div className="flex items-center gap-3 mt-1.5">
                            <span className="text-[8px] font-black bg-blue-500/10 text-blue-500 px-2 py-0.5 rounded uppercase border border-blue-500/20">{s.className}</span>
                            <span className="text-[9px] font-mono text-slate-600 hidden sm:inline">{s.icNumber}</span>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="p-5 md:p-8 text-right">
                      <div className="flex justify-end gap-2">
                        <button onClick={() => { setEditingStudent(s); setNewClassName(s.className); }} className="p-3 bg-white/5 text-blue-500 rounded-xl hover:bg-blue-600 hover:text-white transition-all shadow-lg border border-white/5"><Edit2 size={16}/></button>
                        <button onClick={() => { if(window.confirm(`Hapus rekod ${s.name}?`)) { studentDataService.deleteStudent(s.id); refreshData(); notifyCtx?.notify("Rekod murid dipadam.", "info"); } }} className="p-3 bg-white/5 text-rose-500 rounded-xl hover:bg-rose-600 hover:text-white transition-all shadow-lg border border-white/5"><Trash2 size={16}/></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filteredStudents.length === 0 && (
              <div className="py-20 flex flex-col items-center opacity-20">
                <AlertCircle size={48} className="mb-4" />
                <p className="text-xs font-black uppercase tracking-[0.5em]">Tiada Data Dijumpai</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* MODAL PINDAH KELAS */}
      {editingStudent && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-xl z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-[#0f172a] border-t sm:border border-white/10 p-6 md:p-10 rounded-t-[2.5rem] sm:rounded-[3.5rem] w-full max-w-md shadow-2xl relative animate-in slide-in-from-bottom duration-300">
            <div className="flex justify-between items-start mb-8">
              <div>
                <h2 className="text-3xl md:text-4xl font-['Teko'] font-bold uppercase text-white leading-none">Pindah <span className="text-blue-500">Kelas</span></h2>
                <p className="text-[10px] font-black text-slate-500 uppercase mt-1 tracking-widest">Manual Reassignment</p>
              </div>
              <button onClick={() => { setEditingStudent(null); setShowDropList(false); }} className="p-2 bg-white/5 rounded-full text-slate-500 hover:text-white transition-colors"><X/></button>
            </div>
            
            <div className="space-y-6">
              <div>
                <label className="text-[9px] font-black text-slate-500 uppercase mb-2 block tracking-widest">Pilih Nama Folder / Taip Nama Baru</label>
                <div className="relative">
                    <input 
                      autoFocus value={newClassName} onFocus={() => setShowDropList(true)}
                      onChange={e => { setNewClassName(e.target.value.toUpperCase()); setShowDropList(true); }}
                      placeholder="IMBAS NAMA KELAS..."
                      className="w-full bg-black/40 border border-white/10 rounded-2xl p-4 text-xs md:text-sm font-bold uppercase outline-none focus:border-blue-500 transition-all"
                    />
                    <ChevronDown size={20} className="absolute right-4 top-4 text-slate-600 pointer-events-none" />
                </div>
                {showDropList && (
                  <div className="absolute left-6 right-6 mt-2 bg-[#1e293b] border border-white/10 rounded-2xl max-h-48 overflow-y-auto z-[110] shadow-2xl custom-scrollbar animate-in fade-in zoom-in-95">
                    {filteredSuggestions.map(c => (
                      <button key={c} onClick={() => { setNewClassName(c); setShowDropList(false); }} className="w-full text-left px-5 py-4 text-[10px] font-black uppercase hover:bg-blue-600 transition-all border-b border-white/5 last:border-0">
                        {c}
                      </button>
                    ))}
                    {filteredSuggestions.length === 0 && <div className="p-4 text-[9px] font-black text-slate-600 text-center uppercase tracking-widest">Taip untuk bina folder baru...</div>}
                  </div>
                )}
              </div>
              <div className="flex gap-3 pt-4">
                <button onClick={() => { setEditingStudent(null); setShowDropList(false); }} className="flex-1 py-4 md:py-5 bg-white/5 rounded-2xl text-[10px] font-black uppercase text-slate-500 hover:bg-white/10 transition-all">Batalkan</button>
                <button onClick={handleTransferSubmit} className="flex-1 py-4 md:py-5 bg-blue-600 rounded-2xl text-[10px] font-black uppercase shadow-lg shadow-blue-500/20 hover:bg-blue-500 transition-all flex items-center justify-center gap-2"><Check size={16}/> Sahkan Pindahan</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL TAMBAH FOLDER */}
      {showAddClass && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-xl z-[100] flex items-center justify-center p-4">
          <div className="bg-[#0f172a] border border-white/10 p-8 md:p-10 rounded-[2.5rem] md:rounded-[3.5rem] w-full max-w-sm shadow-2xl animate-in zoom-in-95 duration-300">
            <div className="flex items-center gap-4 mb-8">
              <div className="p-3 bg-blue-600/20 rounded-2xl text-blue-500">
                <Plus size={24} />
              </div>
              <div>
                <h2 className="text-3xl font-['Teko'] font-bold uppercase text-white leading-none">Bina <span className="text-blue-500">Folder</span></h2>
                <p className="text-[10px] font-black text-slate-500 uppercase mt-1 tracking-widest">Tambah Kelas Manual</p>
              </div>
            </div>
            <input 
              autoFocus value={manualClassName} onChange={e => setManualClassName(e.target.value.toUpperCase())}
              placeholder="NAMA FOLDER (CTH: PPKI AMANAH)..."
              className="w-full bg-black/40 border border-white/10 rounded-2xl p-4 md:p-5 text-xs md:text-sm font-bold outline-none focus:border-blue-500 uppercase mb-8 transition-all"
            />
            <div className="flex flex-col gap-2">
              <button onClick={handleAddManualClass} className="w-full py-4 md:py-5 bg-blue-600 rounded-2xl font-black text-[10px] uppercase shadow-lg hover:bg-blue-500 transition-all">Cipta Folder Sekarang</button>
              <button onClick={() => setShowAddClass(false)} className="w-full py-3 text-[9px] font-black uppercase text-slate-600 hover:text-white transition-all">Tutup</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentDatabaseScreen;