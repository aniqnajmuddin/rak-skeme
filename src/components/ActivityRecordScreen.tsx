import React, { useState, useEffect } from 'react';
import { studentDataService } from '../services/studentDataService';
import { Student, ActivityParticipant } from '../types';
import TechAutocomplete from './TechAutocomplete';
import { 
  Plus, Trash2, Calendar, Save, ArrowLeft, Zap, CheckCircle, FileUp, 
  Search, Filter, UserPlus, X, GraduationCap
} from 'lucide-react';

const ActivityRecordScreen: React.FC<{ onBack?: () => void }> = ({ onBack }) => {
  const [activeTab, setActiveTab] = useState<'SEKOLAH' | 'LUAR'>('SEKOLAH');
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [programName, setProgramName] = useState('');
  const [level, setLevel] = useState('');
  const [participants, setParticipants] = useState<Partial<ActivityParticipant>[]>([]);
  
  const [isStudentPickerOpen, setIsStudentPickerOpen] = useState(false);
  const [studentSearchQuery, setStudentSearchQuery] = useState('');
  const [selectedClassFilter, setSelectedClassFilter] = useState<string>('SEMUA');
  
  const [showQuickAdd, setShowQuickAdd] = useState(false);
  const [newStudent, setNewStudent] = useState({ name: '', ic: '', class: '' });

  const [isSaving, setIsSaving] = useState(false);
  const [toast, setToast] = useState<{msg: string; type: 'success' | 'error'} | null>(null);
  const [availableClasses, setAvailableClasses] = useState<string[]>([]);

  useEffect(() => {
    setAvailableClasses(['SEMUA', ...studentDataService.getUniqueClasses()]);
  }, [isStudentPickerOpen]);

  const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleToggleParticipant = (student: any) => {
    const studentIc = student.icNumber || student.ic;
    const exists = participants.some(p => p.ic === studentIc);
    if (exists) {
      setParticipants(prev => prev.filter(p => p.ic !== studentIc));
    } else {
      setParticipants(prev => [...prev, {
        name: student.name, 
        ic: studentIc, 
        class: student.className || student.class,
        achievement: 'Penyertaan', 
        level: activeTab === 'SEKOLAH' ? 'Sekolah' : (level || 'Luar')
      }]);
    }
  };

  const handleQuickAdd = () => {
    if (!newStudent.name || !newStudent.ic || !newStudent.class) {
      showToast("Lengkapkan maklumat murid baru", "error");
      return;
    }
    // Hantar data lengkap mengikut Type Student
    const added = studentDataService.addStudent({
      id: `NEW-${Date.now()}`, // Janakan ID unik
      name: newStudent.name.toUpperCase(),
      icNumber: newStudent.ic,
      className: newStudent.class.toUpperCase(),
      gender: 'L', // Default dummy
      house: 'TIADA' // Default dummy
    });
    
    handleToggleParticipant(added);
    setNewStudent({ name: '', ic: '', class: '' });
    setShowQuickAdd(false);
    showToast("Murid baru ditambah ke sistem!");
  };

  const filteredStudents = studentDataService.getAllStudents().filter(s => {
    const matchesSearch = s.name.toLowerCase().includes(studentSearchQuery.toLowerCase()) || s.icNumber.includes(studentSearchQuery);
    const matchesClass = selectedClassFilter === 'SEMUA' || s.className === selectedClassFilter;
    return matchesSearch && matchesClass;
  });

  const handleSaveFinal = async () => {
    if (!programName || participants.length === 0) {
        showToast("Nama program & peserta diperlukan", "error");
        return;
    }
    setIsSaving(true);
    try {
        await studentDataService.saveActivityRecord(programName, participants, new Date(date));
        showToast("Rekod berjaya disimpan!");
        setParticipants([]);
        setProgramName('');
    } catch (e) {
        showToast("Gagal simpan", "error");
    } finally {
        setIsSaving(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#0F172A] text-slate-100 font-['Manrope']">
      <div className="p-6 md:px-10 flex flex-col gap-6 max-w-5xl mx-auto w-full">
         <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
                <button onClick={onBack} className="w-10 h-10 bg-slate-800 rounded-xl flex items-center justify-center text-blue-400 hover:bg-blue-600 hover:text-white transition-all"><ArrowLeft size={20}/></button>
                <h2 className="text-3xl font-['Teko'] font-bold uppercase tracking-wide leading-none">REKOD <span className="text-orange-500">AKTIVITI</span></h2>
            </div>
            <button onClick={() => setIsStudentPickerOpen(true)} className="bg-orange-500 hover:bg-orange-600 px-6 py-2.5 rounded-xl font-bold text-xs uppercase flex items-center gap-2 shadow-lg shadow-orange-500/20 transition-all">
                <UserPlus size={16}/> Pilih Peserta ({participants.length})
            </button>
         </div>

         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-slate-800/50 p-6 rounded-2xl border border-white/5">
                <label className="text-[10px] font-black text-slate-500 uppercase mb-2 block">Nama Program</label>
                <input value={programName} onChange={e => setProgramName(e.target.value.toUpperCase())} className="w-full bg-transparent text-xl font-['Teko'] text-white border-b-2 border-slate-700 focus:border-orange-500 outline-none transition-all" placeholder="CONTOH: MERENTAS DESA" />
            </div>
            <div className="bg-slate-800/50 p-6 rounded-2xl border border-white/5">
                <label className="text-[10px] font-black text-slate-500 uppercase mb-2 block">Tarikh</label>
                <input type="date" value={date} onChange={e => setDate(e.target.value)} className="w-full bg-transparent text-xl font-['Teko'] text-white outline-none" />
            </div>
         </div>

         {participants.length > 0 && (
             <div className="space-y-3 animate-in fade-in duration-500">
                <div className="flex justify-between items-center px-2">
                    <span className="text-[10px] font-black text-slate-500 uppercase">Senarai Peserta Dipilih</span>
                    <button onClick={() => setParticipants([])} className="text-[9px] font-bold text-red-400 uppercase">Padam Semua</button>
                </div>
                {participants.map((p, i) => (
                    <div key={i} className="bg-slate-800/30 p-4 rounded-xl border border-white/5 flex items-center justify-between">
                        <div>
                            <div className="text-[11px] font-black uppercase text-white">{p.name}</div>
                            <div className="text-[9px] font-bold text-slate-500 uppercase">{p.class} • {p.ic}</div>
                        </div>
                        <button onClick={() => setParticipants(prev => prev.filter(item => item.ic !== p.ic))} className="text-slate-600 hover:text-red-500 transition-colors"><Trash2 size={16}/></button>
                    </div>
                ))}
                <button onClick={handleSaveFinal} disabled={isSaving} className="w-full bg-emerald-600 hover:bg-emerald-500 py-4 rounded-2xl font-['Teko'] text-xl uppercase tracking-widest transition-all mt-4">
                    {isSaving ? "Menyimpan..." : "Simpan Rekod Aktiviti"}
                </button>
             </div>
         )}
      </div>

      {isStudentPickerOpen && (
        <div className="fixed inset-0 z-[2000] bg-slate-900 flex flex-col md:p-10">
            <div className="flex-1 bg-slate-900 border border-white/10 md:rounded-[2.5rem] flex flex-col overflow-hidden shadow-2xl">
                <div className="p-6 bg-slate-800/50 flex justify-between items-center border-b border-white/5">
                    <div className="flex items-center gap-4">
                        <div className="bg-orange-500 p-2 rounded-lg text-white"><Search size={20}/></div>
                        <input 
                            placeholder="Cari murid / IC..." 
                            className="bg-transparent text-xl font-['Teko'] text-white outline-none w-full md:w-80"
                            value={studentSearchQuery}
                            onChange={e => setStudentSearchQuery(e.target.value)}
                        />
                    </div>
                    <button onClick={() => setIsStudentPickerOpen(false)} className="bg-white/10 p-2 rounded-full text-white hover:bg-red-500 transition-all"><X/></button>
                </div>

                <div className="flex gap-2 p-4 overflow-x-auto no-scrollbar bg-slate-900/50 border-b border-white/5">
                    {availableClasses.map(cls => (
                        <button key={cls} onClick={() => setSelectedClassFilter(cls)} className={`px-5 py-2 rounded-full text-[10px] font-black uppercase whitespace-nowrap transition-all ${selectedClassFilter === cls ? 'bg-orange-500 text-white' : 'bg-slate-800 text-slate-500 hover:bg-slate-700'}`}>{cls}</button>
                    ))}
                </div>

                <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                        <button onClick={() => setShowQuickAdd(true)} className="p-4 rounded-2xl border-2 border-dashed border-slate-700 hover:border-orange-500 flex flex-col items-center justify-center gap-2 group transition-all h-[80px]">
                            <UserPlus size={20} className="text-orange-500"/>
                            <span className="text-[9px] font-black uppercase text-slate-500">Daftar Baru</span>
                        </button>

                        {filteredStudents.map(student => {
                            const isSelected = participants.some(p => p.ic === student.icNumber);
                            return (
                                <div key={student.id} onClick={() => handleToggleParticipant(student)} className={`p-4 rounded-2xl border-2 cursor-pointer transition-all flex items-center gap-4 h-[80px] ${isSelected ? 'bg-orange-500/10 border-orange-500' : 'bg-slate-800/40 border-transparent hover:border-slate-700'}`}>
                                    <div className={`w-6 h-6 rounded-full flex items-center justify-center border-2 shrink-0 ${isSelected ? 'bg-orange-500 border-orange-500 text-white' : 'border-slate-700 text-slate-700'}`}>{isSelected && <CheckCircle size={12}/>}</div>
                                    <div className="min-w-0">
                                        <div className="text-[10px] font-black uppercase text-white truncate">{student.name}</div>
                                        <div className="text-[9px] font-bold text-slate-500 uppercase">{student.className}</div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                <div className="p-6 bg-slate-800/50 flex justify-between items-center border-t border-white/5">
                    <div className="text-2xl font-['Teko'] text-white uppercase">{participants.length} <span className="text-slate-500">Dipilih</span></div>
                    <button onClick={() => setIsStudentPickerOpen(false)} className="bg-blue-600 hover:bg-blue-500 px-10 py-3 rounded-2xl font-black text-xs uppercase text-white tracking-widest active:scale-95 transition-all">Selesai</button>
                </div>
            </div>

            {showQuickAdd && (
                <div className="absolute inset-0 z-[2100] bg-slate-900/80 backdrop-blur-md flex items-center justify-center p-6">
                    <div className="bg-slate-800 w-full max-w-md rounded-[2.5rem] p-8 border border-white/10 shadow-3xl">
                        <h3 className="text-2xl font-['Teko'] font-bold text-white uppercase mb-6 flex items-center gap-2"><UserPlus className="text-orange-500"/> Daftar Murid Baru</h3>
                        <div className="space-y-4">
                            <input value={newStudent.name} onChange={e => setNewStudent({...newStudent, name: e.target.value.toUpperCase()})} className="w-full bg-slate-900 border border-white/5 p-4 rounded-xl text-white font-bold" placeholder="NAMA PENUH" />
                            <input value={newStudent.ic} onChange={e => setNewStudent({...newStudent, ic: e.target.value})} className="w-full bg-slate-900 border border-white/5 p-4 rounded-xl text-white font-bold" placeholder="NO MYKID / IC" />
                            <input value={newStudent.class} onChange={e => setNewStudent({...newStudent, class: e.target.value.toUpperCase()})} className="w-full bg-slate-900 border border-white/5 p-4 rounded-xl text-white font-bold" placeholder="KELAS (CONTOH: 6A)" />
                        </div>
                        <div className="flex gap-3 mt-8">
                            <button onClick={() => setShowQuickAdd(false)} className="flex-1 py-4 text-slate-500 font-bold uppercase text-xs">Batal</button>
                            <button onClick={handleQuickAdd} className="flex-1 py-4 bg-orange-500 rounded-2xl text-white font-black uppercase text-xs">Simpan & Pilih</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
      )}
      
      {toast && (
          <div className="fixed top-10 left-1/2 -translate-x-1/2 z-[3000] px-8 py-3 rounded-full bg-emerald-600 text-white shadow-2xl flex items-center gap-3">
              <CheckCircle size={18} />
              <span className="text-xs font-black uppercase tracking-widest">{toast.msg}</span>
          </div>
      )}
    </div>
  );
};

export default ActivityRecordScreen;