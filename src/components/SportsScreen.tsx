import React, { useState, useEffect, useContext } from 'react';
import { studentDataService } from '../services/studentDataService';
import { NotifyContext } from '../App';
import { Trophy, ChevronLeft, Star, User, Plus, ListFilter, Zap, Trash2, Settings, Activity } from 'lucide-react';
import { SportListEvent } from '../types';

const SportsScreen = ({ onBack }: { onBack: () => void }) => {
  const notifyCtx = useContext(NotifyContext);
  const [houses, setHouses] = useState<any[]>([]);
  const [eventsList, setEventsList] = useState<SportListEvent[]>([]);
  
  // FILTER KELAS (DEFAULT KELAS A)
  const [activeClass, setActiveClass] = useState<'A' | 'B' | 'C' | 'OT'>('A');

  // STATE URUS
  const [isManageMode, setIsManageMode] = useState(false);
  const [newEventName, setNewEventName] = useState('');
  const [newEventCat, setNewEventCat] = useState('BALAPAN');
  const [newEventClass, setNewEventClass] = useState<'A'|'B'|'C'|'OT'>('A');
  const [newEventGender, setNewEventGender] = useState<'L'|'P'|'CAMPURAN'>('L');

  // STATE INPUT MARKAH
  const [selectedHouse, setSelectedHouse] = useState('BIRU');
  const [pointsInput, setPointsInput] = useState('');
  const [selectedEventId, setSelectedEventId] = useState('');

  useEffect(() => {
    refreshData();
  }, []);

  const refreshData = () => {
    const data = studentDataService.sportsHouses;
    const maxPoints = Math.max(...data.map(h => h.points || 0));
    setHouses(data.map(h => ({ ...h, juara: (h.points || 0) > 0 && (h.points || 0) === maxPoints })));
    setEventsList(studentDataService.sportEventsList);
  };

  const handleSavePoints = () => {
    if (!pointsInput || isNaN(Number(pointsInput))) return notifyCtx?.notify("Markah tidak sah!", "error");
    if (!selectedEventId) return notifyCtx?.notify("Sila pilih acara!", "error");
    
    studentDataService.updateHousePoints(selectedHouse, Number(pointsInput));
    notifyCtx?.notify(`Markah ${selectedHouse} ditambah!`, "success");
    setPointsInput('');
    refreshData();
  };

  const handleAddEvent = () => {
    if(!newEventName) return notifyCtx?.notify("Nama acara wajib isi!", "error");
    studentDataService.addSportEvent(newEventName, newEventCat, newEventGender, newEventClass);
    setNewEventName('');
    refreshData();
    notifyCtx?.notify("Acara berjaya ditambah.", "success");
  };

  const handleDeleteEvent = (id: string) => {
    if(confirm("Padam acara ini?")) {
      studentDataService.deleteSportEvent(id);
      refreshData();
    }
  };

  // Filter Events based on Active Class Tab
  const filteredEvents = eventsList.filter(e => e.ageClass === activeClass);

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto animate-in fade-in zoom-in duration-500 overflow-y-auto h-full pb-40">
      
      {/* HEADER */}
      <div className="flex items-center justify-between mb-8">
        <button onClick={onBack} className="p-3 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all text-slate-400 hover:text-white shadow-lg"><ChevronLeft size={24} /></button>
        <div className="text-right">
          <h2 className="text-4xl md:text-5xl font-['Teko'] font-bold leading-none tracking-tighter uppercase">Kejohanan <span className="text-amber-500">Olahraga</span></h2>
          <p className="text-[9px] font-black opacity-40 tracking-[0.4em] uppercase">Sistem Pengurusan Markah</p>
        </div>
      </div>

      {/* RUMAH SUKAN */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        {houses.map((r) => (
          <div key={r.id} className={`relative overflow-hidden rounded-[2rem] border ${r.juara ? 'border-amber-500/50 bg-amber-500/10 shadow-[0_0_30px_rgba(245,158,11,0.2)]' : 'border-white/5 bg-white/5'} p-6 transition-all hover:-translate-y-1 hover:bg-white/10`}>
            {r.juara && <div className="absolute top-4 right-4 text-amber-500 animate-pulse"><Star size={20} fill="currentColor" /></div>}
            <div className={`${r.color} w-12 h-12 rounded-2xl flex items-center justify-center mb-4 shadow-lg`}><Trophy size={20} className="text-white" /></div>
            <h3 className="text-2xl font-['Teko'] font-bold tracking-widest text-white">{r.name}</h3>
            <div className="pt-4 border-t border-white/10 mt-4">
              <p className="text-[8px] font-black opacity-40 uppercase tracking-[0.2em] mb-1">Mata Terkini</p>
              <p className={`text-5xl font-['Teko'] font-bold leading-none ${r.juara ? 'text-amber-400' : 'text-white'}`}>{r.points || 0}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* SENARAI ACARA & FILTER KELAS */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex flex-col md:flex-row justify-between items-center bg-white/5 p-3 rounded-2xl border border-white/5 gap-4">
             {/* CLASS TABS */}
             <div className="flex bg-black/40 p-1 rounded-xl">
                {['A','B','C','OT'].map((cls: any) => (
                   <button 
                     key={cls} 
                     onClick={() => setActiveClass(cls)}
                     className={`px-6 py-2 rounded-lg text-[10px] font-black uppercase transition-all ${activeClass === cls ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-500 hover:text-white'}`}
                   >
                     {cls === 'OT' ? 'Terbuka' : `Kelas ${cls}`}
                   </button>
                ))}
             </div>

             <button 
               onClick={() => setIsManageMode(!isManageMode)} 
               className={`text-[9px] font-bold uppercase tracking-widest px-4 py-2 rounded-xl border transition-all flex items-center gap-2 ${isManageMode ? 'bg-rose-500 text-white border-rose-500' : 'bg-slate-800 text-slate-400 border-white/10'}`}
             >
               <Settings size={12}/> {isManageMode ? 'Tutup' : 'Urus'}
             </button>
          </div>

          {/* ADD EVENT FORM */}
          {isManageMode && (
            <div className="bg-slate-900/50 border border-dashed border-slate-700 p-4 rounded-2xl flex flex-col gap-3 animate-in slide-in-from-top-2">
               <div className="flex gap-2">
                 <input value={newEventName} onChange={e => setNewEventName(e.target.value)} placeholder="NAMA ACARA" className="flex-1 bg-black/40 border border-white/10 rounded-xl px-4 py-2 text-xs font-bold uppercase text-white outline-none focus:border-blue-500" />
                 <select value={newEventCat} onChange={e => setNewEventCat(e.target.value)} className="bg-black/40 border border-white/10 rounded-xl px-2 py-2 text-xs font-bold uppercase text-white outline-none">
                    <option value="BALAPAN">BALAPAN</option><option value="PADANG">PADANG</option><option value="SUKANEKA">SUKANEKA</option>
                 </select>
               </div>
               <div className="flex gap-2">
                 <select value={newEventGender} onChange={e => setNewEventGender(e.target.value as any)} className="flex-1 bg-black/40 border border-white/10 rounded-xl px-2 py-2 text-xs font-bold uppercase text-white outline-none">
                    <option value="L">LELAKI (L)</option><option value="P">PEREMPUAN (P)</option><option value="CAMPURAN">CAMPURAN</option>
                 </select>
                 <select value={newEventClass} onChange={e => setNewEventClass(e.target.value as any)} className="flex-1 bg-black/40 border border-white/10 rounded-xl px-2 py-2 text-xs font-bold uppercase text-white outline-none">
                    <option value="A">KELAS A</option><option value="B">KELAS B</option><option value="C">KELAS C</option><option value="OT">TERBUKA</option>
                 </select>
                 <button onClick={handleAddEvent} className="bg-emerald-600 px-6 rounded-xl font-bold text-xs uppercase hover:bg-emerald-500 transition-colors">Tambah</button>
               </div>
            </div>
          )}

          {/* EVENTS LIST */}
          <div className="space-y-2 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
            {filteredEvents.map((acara) => (
              <div key={acara.id} className="bg-white/5 border border-white/5 rounded-2xl p-4 flex items-center justify-between hover:bg-white/[0.07] transition-all group">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                     <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded text-slate-900 ${acara.gender === 'L' ? 'bg-blue-400' : acara.gender === 'P' ? 'bg-rose-400' : 'bg-purple-400'}`}>
                       {acara.gender}
                     </span>
                     <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest">{acara.category}</span>
                  </div>
                  <h5 className="font-bold text-sm tracking-tight text-slate-200 group-hover:text-white">{acara.name}</h5>
                </div>
                {isManageMode && (
                  <button onClick={() => handleDeleteEvent(acara.id)} className="p-2 bg-white/5 rounded-lg text-slate-500 hover:text-rose-500 hover:bg-rose-500/10 transition-all">
                    <Trash2 size={16} />
                  </button>
                )}
              </div>
            ))}
            {filteredEvents.length === 0 && <p className="text-center text-slate-500 text-xs py-10 uppercase">Tiada acara untuk kategori ini.</p>}
          </div>
        </div>

        {/* INPUT MARKAH */}
        <div className="space-y-6">
          <div className="bg-blue-600/10 border border-blue-500/20 rounded-[2.5rem] p-8 sticky top-8 backdrop-blur-md shadow-2xl">
            <h4 className="text-[11px] font-black uppercase tracking-[0.2em] text-blue-400 mb-8 flex items-center gap-2">
              <Zap size={16} fill="currentColor" /> Kemas Kini Markah
            </h4>
            
            <div className="space-y-5">
              <div className="space-y-2">
                <label className="text-[9px] font-black text-slate-500 uppercase ml-2 tracking-widest">Pilih Rumah</label>
                <select value={selectedHouse} onChange={(e) => setSelectedHouse(e.target.value)} className="w-full bg-slate-900 border border-white/10 rounded-2xl p-4 text-xs font-bold text-white focus:border-blue-500 outline-none uppercase shadow-inner">
                  {houses.map(r => <option key={r.id} value={r.name}>{r.name}</option>)}
                </select>
              </div>

              {/* AUTO-FILTER DROPDOWN BERDASARKAN TAB */}
              <div className="space-y-2">
                <label className="text-[9px] font-black text-slate-500 uppercase ml-2 tracking-widest flex justify-between">
                   <span>Pilih Acara</span>
                   <span className="text-blue-400">({activeClass === 'OT' ? 'TERBUKA' : 'KELAS '+activeClass})</span>
                </label>
                <select 
                  value={selectedEventId} 
                  onChange={(e) => setSelectedEventId(e.target.value)} 
                  className="w-full bg-slate-900 border border-white/10 rounded-2xl p-4 text-xs font-bold text-white focus:border-blue-500 outline-none uppercase shadow-inner"
                >
                  <option value="">-- PILIH ACARA --</option>
                  {filteredEvents.map(e => <option key={e.id} value={e.id}>{e.fullname}</option>)}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-[9px] font-black text-slate-500 uppercase ml-2 tracking-widest">Mata Diperoleh</label>
                <input type="number" value={pointsInput} onChange={(e) => setPointsInput(e.target.value)} placeholder="0" className="w-full bg-slate-900 border border-white/10 rounded-2xl p-4 text-lg font-bold text-white outline-none focus:border-blue-500 shadow-inner font-['Teko'] tracking-wide" />
              </div>

              <button onClick={handleSavePoints} className="w-full py-5 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl text-[12px] font-black uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-3 shadow-xl shadow-blue-500/20 active:scale-[0.98] mt-2">
                <Plus size={18} /> Simpan Mata
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default SportsScreen;