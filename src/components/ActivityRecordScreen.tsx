
import React, { useState, useEffect, useRef } from 'react';
import { studentDataService } from '../services/studentDataService';
import { Student, ActivityParticipant } from '../types';
import TechAutocomplete from './TechAutocomplete';
import { 
  Plus, Trash2, Calendar, Save, ArrowLeft, Zap, CheckCircle, FileUp, Trophy
} from 'lucide-react';

interface ActivityRecordScreenProps {
  onBack?: () => void;
}

const ActivityRecordScreen: React.FC<ActivityRecordScreenProps> = ({ onBack }) => {
  const [activeTab, setActiveTab] = useState<'SEKOLAH' | 'LUAR'>('SEKOLAH');
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [programName, setProgramName] = useState('');
  const [level, setLevel] = useState('');
  const [participants, setParticipants] = useState<Partial<ActivityParticipant>[]>([]);
  
  const [isStudentPickerOpen, setIsStudentPickerOpen] = useState(false);
  const [studentSearchQuery, setStudentSearchQuery] = useState('');
  const [selectedClassFilter, setSelectedClassFilter] = useState<string>('SEMUA');
  
  const [isSaving, setIsSaving] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [toast, setToast] = useState<{msg: string; type: 'success' | 'error'} | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [suggestedActivities, setSuggestedActivities] = useState<string[]>([]);
  const [suggestedLevels, setSuggestedLevels] = useState<string[]>([]);
  const [availableClasses, setAvailableClasses] = useState<string[]>([]);

  const achievementOptions = ['Penyertaan', 'Johan', 'Naib Johan', 'Ketiga', 'Keempat', 'Kelima', 'Emas', 'Perak', 'Gangsa'];

  useEffect(() => {
    if (activeTab === 'SEKOLAH') {
        setSuggestedActivities(studentDataService.suggestedActivities);
        setLevel('Sekolah');
    } else {
        setSuggestedActivities(studentDataService.suggestedExternalEvents);
    }
    setSuggestedLevels(studentDataService.suggestedLevels);
    setAvailableClasses(['SEMUA', ...studentDataService.getUniqueClasses()]);
  }, [activeTab]);

  const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 4000);
  };

  const handleToggleParticipant = (student: Student) => {
    const exists = participants.some(p => p.ic === student.icNumber && student.icNumber !== '');
    if (exists) {
      setParticipants(prev => prev.filter(p => p.ic !== student.icNumber));
    } else {
      setParticipants(prev => [...prev, {
        name: student.name, ic: student.icNumber, class: student.className,
        achievement: 'Penyertaan', level: activeTab === 'SEKOLAH' ? 'Sekolah' : (level || 'Luar')
      }]);
    }
  }

  const handleSmartImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsImporting(true);
    try {
        const newStudents = await studentDataService.parseFile(file);
        const count = studentDataService.bulkAddStudents(newStudents);
        showToast(`Import Berjaya: ${count} rekod ditambah.`);
        setAvailableClasses(['SEMUA', ...studentDataService.getUniqueClasses()]);
    } catch (err: any) {
        showToast(`Ralat: ${err.message}`, 'error');
    } finally {
        setIsImporting(false);
        if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleSave = async () => {
    if (!programName.trim() || participants.length === 0) {
        showToast("Sila lengkapkan nama program & peserta.", 'error');
        return;
    }
    setIsSaving(true);
    try {
        await studentDataService.saveActivityRecord(programName, participants, new Date(date));
        studentDataService.learnNewMetadata(programName, activeTab === 'LUAR' ? level : null);
        setParticipants([]); setProgramName(''); setLevel('');
        showToast("Rekod berjaya disimpan!");
    } catch (e) { showToast("Gagal menyimpan rekod.", 'error'); } finally { setIsSaving(false); }
  };

  const filteredStudents = studentDataService.getAllStudents().filter(s => {
      const matchesSearch = s.name.toLowerCase().includes(studentSearchQuery.toLowerCase()) || s.icNumber.includes(studentSearchQuery);
      const matchesClass = selectedClassFilter === 'SEMUA' || s.className === selectedClassFilter;
      return matchesSearch && matchesClass;
  });

  const isAllSelected = filteredStudents.length > 0 && filteredStudents.every(s => participants.some(p => p.ic === s.icNumber));

  return (
    <div className="flex flex-col h-full bg-[#0F172A] text-slate-100 font-['Manrope']">
      
      {/* Header */}
      <div className="p-6 md:px-10 flex flex-col gap-6 max-w-5xl mx-auto w-full">
          <div className="flex items-center gap-4">
              <button 
                onClick={onBack} 
                className="w-12 h-12 bg-slate-800 border border-slate-700 rounded-xl flex items-center justify-center text-blue-400 hover:bg-blue-600 hover:text-white hover:border-blue-600 transition-all shadow-lg"
              >
                  <ArrowLeft size={24} />
              </button>
              <div>
                <h2 className="text-4xl font-['Teko'] font-bold text-white uppercase tracking-wide leading-none flex items-center gap-2">
                    <Zap size={28} className="text-orange-500" /> REKOD AKTIVITI
                </h2>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Sistem Pangkalan Data Kokurikulum</p>
              </div>
          </div>

          {/* Sports Tabs */}
          <div className="flex bg-slate-800 p-1 rounded-xl shadow-inner border border-slate-700">
            {['SEKOLAH', 'LUAR'].map((tab) => (
              <button 
                key={tab} 
                onClick={() => { setActiveTab(tab as any); setProgramName(''); }} 
                className={`flex-1 py-3 text-lg font-['Teko'] font-medium uppercase tracking-wider rounded-lg transition-all ${activeTab === tab ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400 hover:text-white hover:bg-slate-700'}`}
              >
                  {tab}
              </button>
            ))}
          </div>
      </div>

      {/* Main Body */}
      <div className="flex-1 overflow-y-auto px-4 md:px-10 pb-40 no-scrollbar">
          <div className="max-w-5xl mx-auto space-y-6">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Date Picker */}
                  <div className="bg-[#1E293B] p-6 rounded-2xl border border-slate-700 hover:border-blue-500/50 transition-all group">
                      <label className="text-xs font-bold text-blue-400 uppercase tracking-widest flex items-center gap-2 mb-2">
                          <Calendar size={14} /> Tarikh Program
                      </label>
                      <input type="date" value={date} onChange={e => setDate(e.target.value)} className="bg-transparent border-none outline-none text-xl font-bold text-white w-full cursor-pointer uppercase font-['Teko'] tracking-wide" />
                  </div>

                  {/* File Import */}
                  <div onClick={() => fileInputRef.current?.click()} className="bg-[#1E293B] border border-dashed border-slate-600 p-6 rounded-2xl flex items-center gap-4 cursor-pointer hover:bg-slate-800 hover:border-orange-500 transition-all group">
                      <input type="file" ref={fileInputRef} onChange={handleSmartImport} className="hidden" accept=".xlsx,.csv,.xls" />
                      <div className="w-12 h-12 bg-slate-900 rounded-lg flex items-center justify-center text-orange-500 group-hover:scale-110 transition-transform"><FileUp size={24} /></div>
                      <div>
                          <div className="font-['Teko'] font-bold text-xl text-white uppercase leading-none">Import Fail</div>
                          <div className="text-xs text-slate-500 font-bold uppercase">Excel / CSV</div>
                      </div>
                  </div>
              </div>

              {/* Form Card */}
              <div className="bg-[#1E293B] border border-slate-700 p-8 rounded-3xl shadow-xl space-y-8">
                  <TechAutocomplete 
                      label={activeTab === 'SEKOLAH' ? "NAMA PROGRAM (SEKOLAH)" : "NAMA PROGRAM (LUAR)"}
                      suggestions={suggestedActivities}
                      value={programName} 
                      onChange={setProgramName} 
                      placeholder="Contoh: Merentas Desa..."
                  />
                  {activeTab === 'LUAR' && (
                      <div className="animate-in slide-in-from-top-2">
                          <TechAutocomplete label="PERINGKAT PENYERTAAN" suggestions={suggestedLevels} value={level} onChange={setLevel} placeholder="Pilih peringkat..." />
                      </div>
                  )}
              </div>

              {/* Add Student Button */}
              <button 
                onClick={() => setIsStudentPickerOpen(true)}
                className="w-full bg-slate-800 border-2 border-slate-700 hover:border-orange-500 hover:bg-slate-750 p-6 rounded-3xl flex items-center justify-between transition-all group"
              >
                  <div className="flex items-center gap-6">
                      <div className="w-14 h-14 bg-orange-500 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-orange-500/30 group-hover:scale-110 transition-transform"><Plus size={28} /></div>
                      <div className="text-left">
                          <div className="font-['Teko'] font-bold text-2xl text-white uppercase leading-none">Tambah Peserta</div>
                          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Pilih dari pangkalan data</div>
                      </div>
                  </div>
                  <div className="text-4xl font-['Teko'] font-bold text-orange-500 px-4">{participants.length}</div>
              </button>

              {/* Participant List */}
              {participants.length > 0 && (
                  <div className="space-y-3 pt-2">
                      {participants.map((p, idx) => (
                          <div key={idx} className="bg-[#1E293B] border-l-4 border-blue-500 p-5 rounded-r-xl flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm">
                              <div className="min-w-0 pr-4">
                                  <div className="text-lg font-['Teko'] font-medium text-white uppercase tracking-wide truncate">{p.name}</div>
                                  <div className="text-xs font-bold text-slate-500 uppercase flex items-center gap-2">
                                      <span className="bg-slate-800 px-2 py-0.5 rounded text-slate-300">{p.class}</span> 
                                      <span>{p.ic}</span>
                                  </div>
                              </div>
                              <div className="flex items-center gap-3">
                                  <select 
                                      className="bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-sm font-bold text-white outline-none focus:border-blue-500 w-full md:w-48 appearance-none cursor-pointer uppercase"
                                      value={p.achievement}
                                      onChange={e => setParticipants(prev => prev.map((item, i) => i === idx ? { ...item, achievement: e.target.value } : item))}
                                  >
                                      {achievementOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                                  </select>
                                  <button onClick={() => setParticipants(prev => prev.filter((_, i) => i !== idx))} className="p-2 bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white rounded-lg transition-all"><Trash2 size={20} /></button>
                              </div>
                          </div>
                      ))}
                      
                      <button 
                        onClick={handleSave}
                        disabled={isSaving}
                        className="w-full mt-8 py-4 bg-green-600 hover:bg-green-500 text-white rounded-2xl font-['Teko'] font-bold text-2xl shadow-lg hover:shadow-green-500/30 active:scale-95 transition-all flex items-center justify-center gap-2 uppercase tracking-wide"
                      >
                        {isSaving ? <span className="animate-pulse">Menyimpan...</span> : <><Save size={24} /> Simpan Rekod</>}
                      </button>
                  </div>
              )}
          </div>
      </div>

      {/* Student Picker Modal */}
      {isStudentPickerOpen && (
        <div className="fixed inset-0 z-[2000] bg-slate-900/95 backdrop-blur-sm flex flex-col animate-in slide-in-from-bottom-20">
            <div className="p-6 border-b border-slate-700 flex justify-between items-center bg-slate-800 shadow-xl">
                <h3 className="text-white font-['Teko'] font-bold text-2xl uppercase flex items-center gap-2"><Plus size={24} className="text-orange-500" /> Pilih Peserta</h3>
                <button onClick={() => setIsStudentPickerOpen(false)} className="bg-slate-700 p-2 rounded-lg text-slate-300 hover:text-white hover:bg-red-500 transition-all"><Trash2 size={24} className="rotate-45" /></button>
            </div>
            
            {/* Class Filter */}
            <div className="p-3 bg-slate-900 border-b border-slate-800 flex gap-2 overflow-x-auto no-scrollbar">
                {availableClasses.map(cls => (
                    <button key={cls} onClick={() => setSelectedClassFilter(cls)} className={`px-5 py-2 rounded-full text-xs font-bold uppercase whitespace-nowrap transition-all ${selectedClassFilter === cls ? 'bg-blue-600 text-white shadow-lg' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}>{cls}</button>
                ))}
            </div>

            <div className="flex-1 overflow-y-auto p-4 bg-slate-900">
                <div className="max-w-5xl mx-auto space-y-4">
                    <input 
                        type="text" 
                        placeholder="Cari nama atau KP..." 
                        className="w-full bg-slate-800 border border-slate-700 rounded-xl px-5 py-4 text-white focus:border-blue-500 outline-none font-bold placeholder-slate-500 sticky top-0 shadow-lg z-10" 
                        value={studentSearchQuery} 
                        onChange={e => setStudentSearchQuery(e.target.value)} 
                        autoFocus
                    />
                    
                    <button 
                        onClick={() => {
                            if (isAllSelected) {
                                setParticipants(prev => prev.filter(p => !filteredStudents.map(s => s.icNumber).includes(p.ic || '')));
                            } else {
                                filteredStudents.forEach(s => { if (!participants.some(p => p.ic === s.icNumber)) handleToggleParticipant(s); });
                            }
                        }}
                        className="w-full py-3 text-xs font-bold text-blue-400 hover:text-blue-300 uppercase tracking-widest border border-dashed border-slate-700 rounded-xl hover:border-blue-500 transition-all"
                    >
                        {isAllSelected ? 'Nyahpilih Semua' : 'Pilih Semua Senarai Ini'}
                    </button>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        {filteredStudents.map(student => {
                            const isSelected = participants.some(p => p.ic === student.icNumber);
                            return (
                                <div key={student.id} onClick={() => handleToggleParticipant(student)} className={`p-4 rounded-xl border-2 transition-all cursor-pointer flex items-center gap-4 ${isSelected ? 'bg-blue-900/20 border-blue-500' : 'bg-slate-800 border-transparent hover:border-slate-600'}`}>
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${isSelected ? 'bg-blue-500 border-blue-500 text-white' : 'border-slate-600 text-slate-600'}`}>
                                        {isSelected && <CheckCircle size={20} />}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className={`text-sm font-bold uppercase truncate ${isSelected ? 'text-white' : 'text-slate-300'}`}>{student.name}</div>
                                        <div className="text-xs text-slate-500 font-bold mt-0.5">{student.className}</div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            <div className="p-4 bg-slate-800 border-t border-slate-700 flex justify-between items-center safe-area-pb">
                <div className="text-white font-['Teko'] font-bold text-2xl uppercase">{participants.length} <span className="text-slate-500 text-lg">Dipilih</span></div>
                <button onClick={() => setIsStudentPickerOpen(false)} className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-3 rounded-xl font-bold uppercase shadow-lg transition-all">Selesai</button>
            </div>
        </div>
      )}

      {toast && (
          <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[3000] px-6 py-3 rounded-full bg-slate-800 border border-slate-700 text-white shadow-2xl flex items-center gap-3">
              <CheckCircle size={18} className="text-green-500" />
              <span className="text-sm font-bold uppercase tracking-wide">{toast.msg}</span>
          </div>
      )}
    </div>
  );
};

export default ActivityRecordScreen;
