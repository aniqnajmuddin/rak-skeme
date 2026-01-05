import React, { useState, useEffect, useContext } from 'react';
import { studentDataService } from '../services/studentDataService';
import { NotifyContext } from '../App';
import { ArrowLeft, Search, Save, ChevronRight, Trophy, CheckSquare, Square, Users } from 'lucide-react';

const ActivityRecordScreen: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const notifyCtx = useContext(NotifyContext);
  const [step, setStep] = useState(1);
  const [search, setSearch] = useState('');
  const [selClass, setSelClass] = useState('SEMUA');
  const [selStudents, setSelStudents] = useState<any[]>([]);
  const [available, setAvailable] = useState<any[]>([]);
  const [activity, setActivity] = useState({ 
    title: '', 
    date: new Date().toISOString().split('T')[0], 
    category: 'SUKAN & PERMAINAN', 
    level: 'SEKOLAH' 
  });

  useEffect(() => {
    let f = studentDataService.getAllStudents();
    // Tapis murid sistem
    f = f.filter(s => s.name !== 'SISTEM: PENANDA KELAS');
    
    if (selClass !== 'SEMUA') f = f.filter(s => s.className === selClass);
    if (search) f = f.filter(s => s.name.includes(search.toUpperCase()));
    
    setAvailable(f);
  }, [selClass, search]);

  const handleSelectAll = () => {
    if (selStudents.length === available.length) {
      setSelStudents([]); // Unselect semua
    } else {
      // Select semua yang ada dalam filter sekarang (bukan semua dalam sekolah)
      // Default achievement = PENYERTAAN
      const all = available.map(s => ({ ...s, achievement: 'PENYERTAAN' }));
      setSelStudents(all);
    }
  };

  const handleSave = () => {
    if (!activity.title || selStudents.length === 0) return notifyCtx?.notify("Sila lengkapkan maklumat & pilih murid!", "error");
    studentDataService.addActivityRecord({ ...activity, participants: selStudents });
    notifyCtx?.notify("Rekod Berhasil Disimpan!", "success");
    onBack();
  };

  return (
    <div className="min-h-screen bg-[#020617] text-white p-4 lg:p-10 pb-32 font-['Manrope']">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-10">
          <button onClick={onBack} className="p-3 bg-white/5 rounded-xl text-blue-500 border border-white/10 shadow-lg"><ArrowLeft/></button>
          <div className="flex bg-white/5 p-1 rounded-xl border border-white/10 shadow-inner">
            <button onClick={() => setStep(1)} className={`px-5 py-2 rounded-lg text-[10px] font-black uppercase transition-all ${step === 1 ? 'bg-emerald-600 shadow-lg' : 'text-slate-500'}`}>1. Pilih Peserta</button>
            <button onClick={() => selStudents.length > 0 && setStep(2)} className={`px-5 py-2 rounded-lg text-[10px] font-black uppercase transition-all ${step === 2 ? 'bg-emerald-600 shadow-lg' : 'text-slate-500'}`}>2. Edit Pencapaian</button>
          </div>
        </div>

        {step === 1 && (
          <div className="space-y-6 animate-in slide-in-from-bottom-5">
            {/* Filter Box */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-white/5 p-6 rounded-[2.5rem] border border-white/10 shadow-xl">
              <select value={selClass} onChange={e => setSelClass(e.target.value)} className="bg-black/40 border border-white/10 p-4 rounded-2xl text-xs uppercase font-bold outline-none focus:border-emerald-500">{['SEMUA', ...studentDataService.getUniqueClasses()].map(c => <option key={c} value={c}>{c}</option>)}</select>
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="CARI NAMA MURID..." className="md:col-span-2 bg-black/40 border border-white/10 p-4 rounded-2xl text-xs uppercase font-bold outline-none focus:border-emerald-500 shadow-inner" />
            </div>

            {/* List Header & Select All */}
            <div className="flex justify-between items-end px-4">
               <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{available.length} MURID DIJUMPAI</p>
               <button onClick={handleSelectAll} className="flex items-center gap-2 bg-white/10 hover:bg-emerald-600 px-4 py-2 rounded-xl transition-all border border-white/10">
                 {selStudents.length === available.length && available.length > 0 ? <CheckSquare size={16} className="text-white"/> : <Square size={16} className="text-slate-400"/>}
                 <span className="text-[10px] font-black uppercase">{selStudents.length === available.length && available.length > 0 ? 'Batal Semua' : 'Pilih Semua'}</span>
               </button>
            </div>

            {/* Student Grid */}
            <div className="bg-white/5 rounded-[2.5rem] border border-white/10 p-6 grid grid-cols-1 md:grid-cols-3 gap-3 max-h-[50vh] overflow-y-auto no-scrollbar shadow-2xl">
              {available.map(s => {
                const active = selStudents.some(x => x.id === s.id);
                return (
                  <div key={s.id} onClick={() => setSelStudents(active ? selStudents.filter(x => x.id !== s.id) : [...selStudents, {...s, achievement: 'PENYERTAAN'}])} className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-center ${active ? 'bg-emerald-600/20 border-emerald-500 shadow-lg scale-[1.02]' : 'bg-black/20 border-white/5 hover:border-white/20'}`}>
                    <div className="flex justify-between items-start mb-1">
                         <p className="text-[10px] font-black uppercase truncate flex-1">{s.name}</p>
                         {active && <div className="w-4 h-4 bg-emerald-500 rounded-full flex items-center justify-center"><Users size={10}/></div>}
                    </div>
                    <p className="text-[8px] text-slate-500 font-bold uppercase">{s.className}</p>
                  </div>
                );
              })}
            </div>

            {/* Floating Footer */}
            <div className="fixed bottom-10 left-1/2 -translate-x-1/2 w-[92%] max-w-xl bg-emerald-600 p-5 rounded-[2.5rem] shadow-2xl flex justify-between items-center z-50">
              <div className="ml-4"><p className="text-[10px] font-black text-emerald-100 uppercase leading-none">Terpilih</p><p className="text-3xl font-['Teko'] font-bold uppercase leading-none">{selStudents.length} MURID</p></div>
              <button onClick={() => setStep(2)} disabled={selStudents.length===0} className="bg-white text-emerald-600 px-10 py-4 rounded-2xl font-black text-[11px] uppercase shadow-xl hover:scale-105 transition-all disabled:opacity-50">Seterusnya <ChevronRight size={16} className="inline ml-1"/></button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="max-w-4xl mx-auto space-y-6 animate-in slide-in-from-right-5 pb-20">
            <div className="bg-white/5 border border-white/10 p-10 rounded-[3rem] shadow-2xl space-y-10">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-500 uppercase ml-2 tracking-widest">Tajuk (Auto-Suggest)</label>
                  <input list="acts" className="w-full bg-black/40 border border-white/10 p-5 rounded-2xl text-xs font-bold uppercase outline-none focus:border-emerald-500 shadow-inner" value={activity.title} onChange={e => setActivity({...activity, title: e.target.value})} />
                  <datalist id="acts">{studentDataService.suggestions.map(s => <option key={s} value={s} />)}</datalist>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-500 uppercase ml-2 tracking-widest">Peringkat</label>
                  <select className="w-full bg-black/40 border border-white/10 p-5 rounded-2xl text-xs font-bold uppercase outline-none focus:border-emerald-500" value={activity.level} onChange={e => setActivity({...activity, level: e.target.value})}>{studentDataService.levels.map(l => <option key={l} value={l}>{l}</option>)}</select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-500 uppercase ml-2 tracking-widest">Kategori Unit</label>
                  <select className="w-full bg-black/40 border border-white/10 p-5 rounded-2xl text-xs font-bold uppercase outline-none focus:border-emerald-500" value={activity.category} onChange={e => setActivity({...activity, category: e.target.value})}>{studentDataService.categories.map(c => <option key={c} value={c}>{c}</option>)}</select>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="text-[11px] font-black text-emerald-500 uppercase flex items-center gap-2 ml-2 tracking-[0.2em]"><Trophy size={16}/> Kemaskini Pencapaian Murid</h4>
                <div className="grid grid-cols-1 gap-2 max-h-[45vh] overflow-y-auto no-scrollbar pr-2">
                  {selStudents.map((s, i) => (
                    <div key={s.id} className="bg-white/5 p-5 rounded-[1.5rem] border border-white/5 flex flex-col md:flex-row justify-between items-center gap-4 hover:bg-white/10 transition-all">
                      <div className="flex-1"><p className="text-xs font-black uppercase leading-none text-white">{s.name}</p><p className="text-[9px] text-slate-500 font-bold mt-1 uppercase tracking-tighter">{s.className} | {s.icNumber}</p></div>
                      <select 
                        className="bg-emerald-600/20 border border-emerald-500/40 p-3 rounded-xl text-[10px] font-black text-emerald-500 outline-none" 
                        value={s.achievement} 
                        onChange={e => { const u = [...selStudents]; u[i].achievement = e.target.value; setSelStudents(u); }}
                      >
                        <option value="PENYERTAAN">PENYERTAAN</option>
                        <option value="JOHAN">JOHAN</option>
                        <option value="NAIB JOHAN">NAIB JOHAN</option>
                        <option value="KETIGA">KETIGA</option>
                        <option value="SAGUHATI">SAGUHATI</option>
                      </select>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <button onClick={() => setStep(1)} className="flex-1 p-5 rounded-2xl bg-white/5 text-[10px] font-black uppercase tracking-widest border border-white/10 hover:bg-white/10 transition-all">Kembali</button>
                <button onClick={handleSave} className="flex-[2] p-5 rounded-2xl bg-emerald-600 text-white font-black uppercase shadow-2xl hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3"><Save size={20}/> Simpan Rekod Aktiviti</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
export default ActivityRecordScreen;