import React, { useState, useContext, useEffect } from 'react';
import { 
  Save, ChevronLeft, Calendar, Users, MapPin, Tag, 
  Search, X, UserPlus, CheckCircle2, ShieldCheck 
} from 'lucide-react';
import { NotifyContext } from '../App';
import { studentDataService } from '../services/studentDataService';
import TechAutocomplete from './TechAutocomplete';
import { Student } from '../types';

interface ActivityRecordScreenProps {
  onBack: () => void;
}

const ActivityRecordScreen: React.FC<ActivityRecordScreenProps> = ({ onBack }) => {
  const notifyCtx = useContext(NotifyContext);
  
  // 1. DATA ASAL: State untuk simpan rekod
  const [formData, setFormData] = useState({
    title: '',
    category: 'Sukan/Permainan',
    level: 'Sekolah',
    date: new Date().toISOString().split('T')[0],
    location: 'SK MENERONG',
    achievement: 'PENYERTAAN'
  });

  // 2. STATE UNTUK STUDENT PICKER (INTELIGENT)
  const [selectedParticipants, setSelectedParticipants] = useState<Student[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [foundStudents, setFoundStudents] = useState<Student[]>([]);

  // 3. LOGIK CARIAN MURID (CERDIK)
  useEffect(() => {
    if (searchQuery.length > 1) {
      const results = studentDataService.getAllStudents().filter(s => 
        s.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        s.icNumber.includes(searchQuery)
      ).slice(0, 5); // Tunjuk 5 teratas sahaja supaya kemas
      setFoundStudents(results);
    } else {
      setFoundStudents([]);
    }
  }, [searchQuery]);

  const addParticipant = (student: Student) => {
    if (!selectedParticipants.find(p => p.id === student.id)) {
      setSelectedParticipants([...selectedParticipants, student]);
      notifyCtx?.notify(`${student.name} ditambah ke senarai.`, "success");
    }
    setSearchQuery('');
  };

  const removeParticipant = (id: string) => {
    setSelectedParticipants(selectedParticipants.filter(p => p.id !== id));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || selectedParticipants.length === 0) {
      notifyCtx?.notify("Sila masukkan tajuk dan sekurang-kurangnya seorang peserta!", "error");
      return;
    }

    const loadId = notifyCtx?.notify("Menghubungkan data ke pangkalan sijil...", "loading");

    // SIMPAN DATA KE SERVICE (Supaya Sijil & Analisis nampak)
    const newRecord = {
      ...formData,
      id: Math.random().toString(36).substr(2, 9),
      participants: selectedParticipants.map(p => ({
        ...p,
        achievement: formData.achievement,
        level: formData.level
      }))
    };

    setTimeout(() => {
      studentDataService.addActivityRecord(newRecord as any);
      notifyCtx?.removeNotify(loadId!);
      notifyCtx?.notify("Rekod Berjaya! Data sedia untuk dijana sijil.", "success");
      onBack();
    }, 1500);
  };

  return (
    <div className="min-h-screen p-4 md:p-10 animate-in fade-in duration-500 pb-40">
      <div className="max-w-6xl mx-auto flex items-center justify-between mb-12">
        <button onClick={onBack} className="p-3 rounded-2xl bg-white/5 border border-white/10 text-slate-400 hover:text-white transition-all">
          <ChevronLeft size={24} />
        </button>
        <div className="text-right">
          <h1 className="text-4xl font-['Teko'] font-bold uppercase leading-none">REKOD <span className="text-blue-500">PEMARKAHAN</span></h1>
          <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em]">Input Data Hubungan Sijil & Analisis</p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-10">
        
        {/* KIRI: FORM MAKLUMAT AKTIVITI */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white/5 border border-white/5 rounded-[2.5rem] p-8 space-y-6">
            <TechAutocomplete 
              label="Tajuk Aktiviti (Untuk Sijil)"
              suggestions={["Latihan Mingguan", "Merentas Desa", "Kejohanan Balapan"]}
              value={formData.title}
              onChange={(val) => setFormData({...formData, title: val})}
            />

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-blue-500 tracking-widest">Kategori</label>
              <select 
                value={formData.category} 
                onChange={e => setFormData({...formData, category: e.target.value})}
                className="w-full bg-slate-900 border border-white/5 rounded-2xl p-4 text-xs font-bold text-white outline-none focus:border-blue-500"
              >
                <option>Sukan/Permainan</option>
                <option>Kelab/Persatuan</option>
                <option>Unit Beruniform</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-blue-500 tracking-widest">Peringkat & Pencapaian</label>
              <div className="grid grid-cols-2 gap-2">
                <select 
                  value={formData.level} 
                  onChange={e => setFormData({...formData, level: e.target.value})}
                  className="bg-slate-900 border border-white/5 rounded-xl p-3 text-[10px] font-bold text-white outline-none"
                >
                  <option>Sekolah</option>
                  <option>Daerah</option>
                  <option>Negeri</option>
                  <option>Kebangsaan</option>
                </select>
                <select 
                  value={formData.achievement} 
                  onChange={e => setFormData({...formData, achievement: e.target.value})}
                  className="bg-slate-900 border border-white/5 rounded-xl p-3 text-[10px] font-bold text-white outline-none"
                >
                  <option>PENYERTAAN</option>
                  <option>JOHAN</option>
                  <option>NAIB JOHAN</option>
                  <option>KETIGA</option>
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-blue-500 tracking-widest">Tarikh & Lokasi</label>
              <input type="date" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} className="w-full bg-slate-900 border border-white/5 rounded-2xl p-4 text-xs font-bold text-white mb-2" />
              <input type="text" value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} className="w-full bg-slate-900 border border-white/5 rounded-2xl p-4 text-xs font-bold text-white uppercase" placeholder="LOKASI" />
            </div>
          </div>
        </div>

        {/* KANAN: INTELIGENT STUDENT PICKER (HUBUNGAN DATA) */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white/5 border border-white/5 rounded-[2.5rem] p-8 flex flex-col h-full min-h-[500px]">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-['Teko'] font-bold uppercase tracking-widest flex items-center gap-2">
                <Users className="text-blue-500" /> Senarai Peserta <span className="text-blue-500 text-sm">({selectedParticipants.length})</span>
              </h3>
            </div>

            {/* SEARCH INPUT */}
            <div className="relative mb-6">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500" size={20} />
              <input 
                type="text"
                placeholder="CARI NAMA MURID / NO. MYKID DARI PANGKALAN DATA..."
                className="w-full bg-slate-950 border-2 border-white/5 rounded-2xl py-5 pl-14 pr-6 text-sm font-bold uppercase tracking-widest focus:border-blue-500 outline-none transition-all"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
              
              {/* HASIL CARIAN (FLOATING) */}
              {foundStudents.length > 0 && (
                <div className="absolute z-50 w-full mt-2 bg-slate-900 border border-white/10 rounded-2xl shadow-2xl overflow-hidden">
                  {foundStudents.map(s => (
                    <button 
                      key={s.id} 
                      onClick={() => addParticipant(s)}
                      className="w-full flex items-center justify-between p-4 hover:bg-blue-600 transition-all border-b border-white/5 last:border-0"
                    >
                      <div className="text-left">
                        <p className="font-bold text-xs text-white uppercase">{s.name}</p>
                        <p className="text-[10px] text-slate-400 uppercase">{s.className} • {s.icNumber}</p>
                      </div>
                      <UserPlus size={18} className="text-blue-400 group-hover:text-white" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* SENARAI TERPILIH */}
            <div className="flex-1 overflow-y-auto no-scrollbar space-y-2">
              {selectedParticipants.length > 0 ? selectedParticipants.map(p => (
                <div key={p.id} className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5 group hover:bg-white/10 transition-all">
                  <div className="flex items-center gap-4">
                    <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center text-blue-500 font-bold text-xs uppercase">
                      {p.name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-bold text-xs uppercase">{p.name}</p>
                      <p className="text-[9px] font-black text-slate-500 uppercase tracking-tighter">{p.className}</p>
                    </div>
                  </div>
                  <button onClick={() => removeParticipant(p.id)} className="p-2 text-slate-600 hover:text-rose-500 transition-colors">
                    <X size={18} />
                  </button>
                </div>
              )) : (
                <div className="h-full flex flex-col items-center justify-center opacity-20">
                  <Users size={64} className="mb-4" />
                  <p className="text-xs font-black uppercase tracking-[0.3em]">Belum ada peserta dipilih</p>
                </div>
              )}
            </div>

            {/* SUBMIT BUTTON */}
            <button 
              onClick={handleSubmit}
              className="mt-8 w-full py-6 bg-blue-600 hover:bg-blue-500 text-white rounded-[2rem] font-black uppercase tracking-[0.3em] flex items-center justify-center gap-3 transition-all active:scale-95 shadow-2xl shadow-blue-500/40"
            >
              <CheckCircle2 size={20} /> Simpan & Hubung Sijil
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ActivityRecordScreen;