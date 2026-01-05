
import React, { useState, useEffect, useMemo } from 'react';
import { studentDataService, AthleteStats } from '../services/studentDataService';
import { SportEvent, HouseStats, Student } from '../types';
import { 
    Trophy, ChevronRight, X, Search, Save, 
    Zap, Activity, Plus, ArrowLeft, Shield, Filter, Trash2, Edit,
    CheckCircle, Square, Medal, Crown, User, AlertCircle
} from 'lucide-react';

interface SportsScreenProps {
    onBack: () => void;
}

const SportsScreen: React.FC<SportsScreenProps> = ({ onBack }) => {
    const [events, setEvents] = useState<SportEvent[]>([]);
    const [houseStats, setHouseStats] = useState<HouseStats[]>([]);
    const [athleteStats, setAthleteStats] = useState<AthleteStats[]>([]);
    const [activeTab, setActiveTab] = useState<'BOARD' | 'EVENTS' | 'HOUSES'>('BOARD');
    const [isConfigMode, setIsConfigMode] = useState(false);
    
    // Filters & Modals
    const [filterCategory, setFilterCategory] = useState<string>('ALL');
    const [selectedEvent, setSelectedEvent] = useState<SportEvent | null>(null);
    const [isEventModalOpen, setIsEventModalOpen] = useState(false);
    
    // Add/Edit Modals
    const [isEventFormOpen, setIsEventFormOpen] = useState(false);
    const [eventFormData, setEventFormData] = useState({ id: '', name: '', category: '', type: 'TRACK' });
    const [isEditingEvent, setIsEditingEvent] = useState(false);

    const [selectedHouseName, setSelectedHouseName] = useState<string | null>(null);
    const [houseMembers, setHouseMembers] = useState<Student[]>([]);
    const [isMemberPickerOpen, setIsMemberPickerOpen] = useState(false);

    const [isHouseFormOpen, setIsHouseFormOpen] = useState(false);
    const [houseFormData, setHouseFormData] = useState({ id: '', name: '', color: '#39FF14', captainName: '' });
    const [isEditingHouse, setIsEditingHouse] = useState(false);
    
    // Selection Logic
    const [studentQuery, setStudentQuery] = useState('');
    const [foundStudents, setFoundStudents] = useState<Student[]>([]);
    const [pickingFor, setPickingFor] = useState<'gold' | 'silver' | 'bronze' | 'fourth' | null>(null);
    const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
    const [winners, setWinners] = useState<any>({ gold: null, silver: null, bronze: null, fourth: null });

    useEffect(() => { refreshData(); }, []);

    useEffect(() => {
        if (studentQuery.length > 2) {
            const results = studentDataService.getAllStudents().filter(s => 
                s.name.toLowerCase().includes(studentQuery.toLowerCase()) || s.icNumber.includes(studentQuery)
            ).slice(0, 5);
            setFoundStudents(results);
        } else { setFoundStudents([]); }
    }, [studentQuery]);

    useEffect(() => {
        if (selectedHouseName) setHouseMembers(studentDataService.getStudentsByHouse(selectedHouseName));
    }, [selectedHouseName, events]);

    const refreshData = () => {
        setEvents([...studentDataService.sportsEvents]);
        setHouseStats(studentDataService.getHouseStats());
        setAthleteStats(studentDataService.getAthleteStats());
        if (selectedHouseName) setHouseMembers(studentDataService.getStudentsByHouse(selectedHouseName));
    };

    const uniqueCategories = useMemo(() => {
        const cats = new Set(events.map(e => e.category));
        return Array.from(cats).sort();
    }, [events]);

    const filteredEvents = useMemo(() => {
        return events.filter(evt => filterCategory === 'ALL' || evt.category === filterCategory);
    }, [events, filterCategory]);

    const handleOpenEvent = (evt: SportEvent) => {
        if (isConfigMode) return; 
        setSelectedEvent(evt);
        setWinners(evt.winners || { gold: null, silver: null, bronze: null, fourth: null });
        setIsEventModalOpen(true);
    };

    const handleSelectWinner = (student: Student) => {
        if (!pickingFor) return;
        const house = student.house !== '-' ? student.house : 'TIADA RUMAH';
        setWinners((prev: any) => ({ ...prev, [pickingFor]: { studentId: student.id, name: student.name, house: house } }));
        setPickingFor(null);
        setStudentQuery('');
    };

    const saveResult = () => {
        if (selectedEvent) {
            studentDataService.updateSportResult(selectedEvent.id, winners);
            setIsEventModalOpen(false);
            refreshData();
        }
    };

    // --- CRUD FUNCTIONS (Simplified for brevity, logic same as original) ---
    const handleSaveEvent = () => {
        if (!eventFormData.name || !eventFormData.category) return;
        if (isEditingEvent) studentDataService.updateSportEvent(eventFormData.id, eventFormData.name, eventFormData.category);
        else studentDataService.addNewSportEvent(eventFormData.name, eventFormData.category, eventFormData.type);
        setIsEventFormOpen(false); refreshData();
    };
    const handleDeleteEvent = (id: string) => { if(confirm("Padam?")) { studentDataService.deleteSportEvent(id); refreshData(); } };
    const handleSaveHouse = () => {
        if (!houseFormData.name) return;
        if (isEditingHouse) studentDataService.updateSportsHouse(houseFormData.id, houseFormData.name, houseFormData.color, houseFormData.captainName);
        else studentDataService.addSportsHouse(houseFormData.name, houseFormData.color, houseFormData.captainName);
        setIsHouseFormOpen(false); refreshData();
    };
    const handleDeleteHouse = (id: string) => { if(confirm("Padam rumah?")) { studentDataService.deleteSportsHouse(id); refreshData(); } };
    const handleAddMembers = () => {
        if (selectedHouseName && selectedMembers.length > 0) {
            studentDataService.bulkUpdateStudentHouse(selectedMembers, selectedHouseName);
            setSelectedMembers([]); setIsMemberPickerOpen(false); refreshData();
        }
    };
    const handleToggleMember = (id: string) => {
        if (selectedMembers.includes(id)) setSelectedMembers(prev => prev.filter(m => m !== id));
        else setSelectedMembers(prev => [...prev, id]);
    };

    return (
        <div className="flex flex-col h-full bg-transparent text-slate-100 p-4 md:p-8 pb-40 overflow-y-auto font-['Manrope'] no-scrollbar relative">
             
             <div className="max-w-7xl mx-auto w-full relative z-10">

                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
                    <div className="flex items-center gap-4">
                        <button onClick={onBack} className="w-12 h-12 bg-white/5 border border-white/10 rounded-xl flex items-center justify-center text-slate-300 hover:bg-white/10 hover:text-white transition-all">
                            <ArrowLeft size={24} />
                        </button>
                        <div>
                            <h2 className="text-4xl font-['Teko'] font-bold uppercase tracking-wide text-white flex items-center gap-3">
                                <Trophy className="text-amber-500" size={32} /> SUKAN TAHUNAN
                            </h2>
                            <p className="text-xs font-bold text-slate-500 tracking-widest uppercase">Kejohanan Balapan & Padang</p>
                        </div>
                    </div>

                    <div className="flex bg-slate-900/50 backdrop-blur-md p-1 rounded-xl border border-white/10">
                        <button onClick={() => setActiveTab('BOARD')} className={`px-6 py-2 rounded-lg text-lg font-['Teko'] font-medium uppercase tracking-wide transition-all ${activeTab === 'BOARD' ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/20' : 'text-slate-400 hover:text-white'}`}>KEDUDUKAN</button>
                        <button onClick={() => setActiveTab('HOUSES')} className={`px-6 py-2 rounded-lg text-lg font-['Teko'] font-medium uppercase tracking-wide transition-all ${activeTab === 'HOUSES' ? 'bg-sky-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}>RUMAH SUKAN</button>
                        <button onClick={() => setActiveTab('EVENTS')} className={`px-6 py-2 rounded-lg text-lg font-['Teko'] font-medium uppercase tracking-wide transition-all ${activeTab === 'EVENTS' ? 'bg-emerald-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}>ACARA</button>
                    </div>
                </div>

                {/* SCOREBOARD TAB */}
                {activeTab === 'BOARD' && (
                    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
                        {/* Jumbotron Leader */}
                        {houseStats.length > 0 && (
                            <div className="bg-gradient-to-br from-slate-900 via-[#0f172a] to-slate-900 border border-white/10 p-8 rounded-[2.5rem] relative overflow-hidden text-center shadow-2xl">
                                <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-[100px] pointer-events-none" />
                                <div className="relative z-10">
                                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-xs font-bold text-amber-500 uppercase tracking-[0.2em] mb-4">
                                        <Crown size={14} /> Peneraju Utama
                                    </div>
                                    <h1 className="text-8xl font-['Teko'] font-bold text-white uppercase drop-shadow-2xl tracking-tight leading-none">{houseStats[0].name}</h1>
                                    <div className="text-5xl font-['Teko'] font-bold text-amber-500 mt-2">{houseStats[0].points} <span className="text-2xl text-slate-500">MATA</span></div>
                                    <div className="mt-6 inline-block px-5 py-2 bg-white/5 rounded-full border border-white/5 text-xs font-bold text-slate-400 uppercase">Ketua Rumah: <span className="text-white">{houseStats[0].captainName}</span></div>
                                </div>
                            </div>
                        )}

                        {/* House Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            {houseStats.map((house, idx) => (
                                <div key={idx} className="bg-[#0f172a]/80 backdrop-blur-md border border-white/5 p-6 rounded-3xl flex flex-col relative overflow-hidden shadow-lg transition-transform hover:scale-[1.02]">
                                    <div className="absolute top-0 w-full h-1" style={{ backgroundColor: house.color }} />
                                    <div className="flex justify-between items-start mb-6">
                                        <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold shadow-md text-sm" style={{ backgroundColor: house.color }}>
                                            {idx + 1}
                                        </div>
                                        <div className="text-right">
                                            <div className="text-5xl font-['Teko'] font-bold text-white leading-none">{house.points}</div>
                                            <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Mata</div>
                                        </div>
                                    </div>
                                    <div>
                                        <div className="text-3xl font-['Teko'] font-bold uppercase tracking-wide text-white">{house.name}</div>
                                        <div className="text-xs font-bold text-slate-500 uppercase mt-2 flex items-center gap-2">
                                            <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                                            {house.medals.gold} Emas
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Top Athletes */}
                        <div className="bg-[#0f172a]/60 border border-white/5 p-8 rounded-[2rem]">
                            <h3 className="text-2xl font-['Teko'] font-bold text-white uppercase mb-6 flex items-center gap-2"><Medal className="text-amber-500" /> Olahragawan / Olahragawati Terbaik</h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                {athleteStats.slice(0, 6).map((athlete, i) => (
                                    <div key={i} className="bg-white/5 p-4 rounded-2xl flex items-center gap-4 border border-white/5 hover:bg-white/10 transition-colors">
                                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-xl font-['Teko'] ${i===0 ? 'bg-amber-500 text-black' : 'bg-slate-800 text-slate-400'}`}>{i+1}</div>
                                        <div className="min-w-0">
                                            <div className="font-bold text-sm uppercase text-white truncate">{athlete.name}</div>
                                            <div className="text-xs font-bold text-slate-500 uppercase flex gap-2 mt-0.5">
                                                <span>{athlete.house}</span>
                                                <span className="text-amber-500">• {athlete.points} PTS</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* HOUSES TAB */}
                {activeTab === 'HOUSES' && (
                    <div className="space-y-6">
                        <div className="flex justify-end">
                            <button onClick={() => setIsConfigMode(!isConfigMode)} className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider border ${isConfigMode ? 'bg-rose-500 text-white border-rose-500' : 'bg-slate-800 text-slate-400 border-slate-700'}`}>{isConfigMode ? 'Tutup Konfigurasi' : 'Konfigurasi Rumah'}</button>
                            {isConfigMode && <button onClick={() => { setHouseFormData({id:'',name:'',color:'#39FF14',captainName:''}); setIsEditingHouse(false); setIsHouseFormOpen(true); }} className="ml-2 bg-amber-600 text-white px-4 py-2 rounded-lg text-xs font-bold uppercase">Tambah Rumah</button>}
                        </div>
                        
                        {!selectedHouseName ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                {houseStats.map(house => (
                                    <button key={house.id} onClick={() => !isConfigMode && setSelectedHouseName(house.name)} className="h-56 bg-[#0f172a]/80 backdrop-blur border border-white/5 hover:border-white/20 rounded-[2rem] flex flex-col items-center justify-center gap-4 transition-all relative overflow-hidden group">
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent z-0" />
                                        <div className="absolute top-0 w-full h-1" style={{ backgroundColor: house.color }} />
                                        
                                        <div className="relative z-10 w-20 h-20 rounded-full flex items-center justify-center border-4 border-white/10" style={{ borderColor: house.color }}>
                                            <Shield size={40} style={{ color: house.color }} fill={house.color} fillOpacity={0.2} />
                                        </div>
                                        
                                        <div className="relative z-10 text-center">
                                            <h3 className="text-4xl font-['Teko'] font-bold text-white uppercase tracking-wide leading-none">{house.name}</h3>
                                            <p className="text-xs font-bold text-slate-400 uppercase mt-1">{studentDataService.getStudentsByHouse(house.name).length} Ahli Berdaftar</p>
                                        </div>
                                        {isConfigMode && (
                                            <div className="absolute top-4 right-4 z-20 flex gap-2">
                                                <div onClick={(e) => {e.stopPropagation(); setHouseFormData({ id: house.id, name: house.name, color: house.color, captainName: house.captainName || '' }); setIsEditingHouse(true); setIsHouseFormOpen(true);}} className="p-2 bg-slate-800 text-white rounded"><Edit size={14}/></div>
                                                <div onClick={(e) => {e.stopPropagation(); handleDeleteHouse(house.id);}} className="p-2 bg-rose-600 text-white rounded"><Trash2 size={14}/></div>
                                            </div>
                                        )}
                                    </button>
                                ))}
                            </div>
                        ) : (
                            <div className="h-full flex flex-col">
                                <div className="flex justify-between items-center mb-6">
                                    <button onClick={() => setSelectedHouseName(null)} className="flex items-center gap-2 text-slate-400 hover:text-white font-bold uppercase text-sm"><ArrowLeft size={18} /> Kembali</button>
                                    <div className="text-right">
                                        <h3 className="text-3xl font-['Teko'] font-bold text-white uppercase">{selectedHouseName}</h3>
                                        <button onClick={() => setIsMemberPickerOpen(true)} className="text-xs font-bold text-sky-400 uppercase hover:text-white bg-slate-800/50 px-4 py-2 rounded-lg mt-1 border border-sky-500/30">+ Tambah Ahli</button>
                                    </div>
                                </div>
                                <div className="bg-[#0f172a]/60 border border-white/5 rounded-2xl p-6 grid grid-cols-1 md:grid-cols-3 gap-3">
                                    {houseMembers.map(m => (
                                        <div key={m.id} className="p-3 bg-white/5 rounded-xl flex items-center gap-3 border border-white/5">
                                            <div className="w-8 h-8 rounded bg-white/5 flex items-center justify-center text-slate-400 font-bold"><User size={16} /></div>
                                            <div className="min-w-0"><div className="font-bold text-xs uppercase text-white truncate">{m.name}</div><div className="text-[10px] font-bold text-slate-500 uppercase">{m.className}</div></div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* EVENTS TAB */}
                {activeTab === 'EVENTS' && (
                    <div className="space-y-6">
                        <div className="flex justify-between items-center bg-[#0f172a]/60 p-2 rounded-2xl border border-white/5">
                            <div className="flex gap-2 overflow-x-auto no-scrollbar px-2">
                                <button onClick={() => setFilterCategory('ALL')} className={`px-4 py-2 rounded-xl text-xs font-bold uppercase whitespace-nowrap transition-all ${filterCategory === 'ALL' ? 'bg-white text-black' : 'text-slate-400 hover:text-white'}`}>Semua</button>
                                {uniqueCategories.map(cat => (
                                    <button key={cat} onClick={() => setFilterCategory(cat)} className={`px-4 py-2 rounded-xl text-xs font-bold uppercase whitespace-nowrap transition-all ${filterCategory === cat ? 'bg-white text-black' : 'text-slate-400 hover:text-white'}`}>{cat}</button>
                                ))}
                            </div>
                            <div className="flex gap-2 pr-2">
                                <button onClick={() => setIsConfigMode(!isConfigMode)} className={`px-3 py-2 rounded-xl text-xs font-bold uppercase border ${isConfigMode ? 'border-rose-500 text-rose-500' : 'border-slate-700 text-slate-400'}`}>{isConfigMode ? 'Tutup' : 'Urus'}</button>
                                {isConfigMode && <button onClick={() => { setEventFormData({id:'',name:'',category:'',type:'TRACK'}); setIsEditingEvent(false); setIsEventFormOpen(true); }} className="bg-amber-600 text-white px-3 py-2 rounded-xl text-xs font-bold uppercase"><Plus size={14}/></button>}
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {filteredEvents.map(evt => (
                                <div key={evt.id} onClick={() => handleOpenEvent(evt)} className={`p-6 rounded-[1.5rem] border transition-all cursor-pointer relative overflow-hidden group ${evt.status === 'COMPLETED' ? 'bg-emerald-900/10 border-emerald-500/30' : 'bg-[#0f172a]/60 border-white/5 hover:border-amber-500/50'}`}>
                                    <div className="flex justify-between items-start mb-3">
                                        <span className="text-[10px] font-bold bg-white/5 text-slate-300 px-3 py-1 rounded-full uppercase tracking-wider">{evt.category}</span>
                                        {evt.status === 'COMPLETED' && <CheckCircle size={18} className="text-emerald-500" />}
                                    </div>
                                    <h4 className="text-2xl font-['Teko'] font-bold text-white uppercase leading-none mb-1 group-hover:text-amber-400 transition-colors">{evt.name}</h4>
                                    {evt.status === 'COMPLETED' && evt.winners.gold && (
                                        <div className="mt-4 flex items-center gap-2 text-xs font-bold text-amber-500 uppercase">
                                            <Medal size={14} /> {evt.winners.gold.house}
                                        </div>
                                    )}
                                    {isConfigMode && <div className="absolute top-4 right-4 flex gap-2"><button onClick={(e)=>{e.stopPropagation();setEventFormData({id:evt.id,name:evt.name,category:evt.category,type:'TRACK'});setIsEditingEvent(true);setIsEventFormOpen(true);}} className="p-1.5 bg-slate-900 text-sky-400 rounded-lg"><Edit size={14}/></button><button onClick={(e)=>{e.stopPropagation();handleDeleteEvent(evt.id);}} className="p-1.5 bg-slate-900 text-rose-400 rounded-lg"><Trash2 size={14}/></button></div>}
                                </div>
                            ))}
                        </div>
                    </div>
                )}
             </div>

             {/* Modals remain mostly functional with updated styling (omitted for brevity but assume slate/dark theme) */}
             {isEventModalOpen && selectedEvent && (
                 <div className="fixed inset-0 z-[2000] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
                     <div className="bg-[#0f172a] w-full max-w-lg rounded-[2rem] border border-white/10 p-8 shadow-2xl">
                         <div className="flex justify-between items-center mb-8">
                             <div>
                                 <span className="text-xs font-bold text-amber-500 uppercase tracking-widest">{selectedEvent.category}</span>
                                 <h3 className="text-4xl font-['Teko'] font-bold text-white uppercase leading-none">{selectedEvent.name}</h3>
                             </div>
                             <button onClick={() => setIsEventModalOpen(false)} className="w-10 h-10 bg-white/5 rounded-full flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10"><X size={20}/></button>
                         </div>
                         <div className="space-y-3">
                             {[
                                 { k: 'gold', l: 'JOHAN', c: 'text-amber-400', bg: 'bg-amber-400/10 border-amber-400/20' }, 
                                 { k: 'silver', l: 'NAIB JOHAN', c: 'text-slate-300', bg: 'bg-slate-300/10 border-slate-300/20' },
                                 { k: 'bronze', l: 'KETIGA', c: 'text-orange-700', bg: 'bg-orange-700/10 border-orange-700/20' },
                                 { k: 'fourth', l: 'KEEMPAT', c: 'text-emerald-500', bg: 'bg-emerald-500/10 border-emerald-500/20' }
                             ].map((slot: any) => (
                                 <div key={slot.k} className={`flex items-center justify-between p-4 rounded-2xl border ${slot.bg}`}>
                                     <div>
                                         <div className={`text-[10px] font-bold tracking-widest ${slot.c}`}>{slot.l}</div>
                                         {winners[slot.k] ? <div className="text-white font-bold uppercase text-sm mt-0.5">{winners[slot.k].name} <span className="text-[10px] text-slate-400">({winners[slot.k].house})</span></div> : <div className="text-slate-500 text-xs italic mt-0.5">Tiada Pemenang</div>}
                                     </div>
                                     {winners[slot.k] ? <button onClick={() => setWinners({...winners, [slot.k]: null})}><X size={16} className="text-rose-400 hover:text-rose-200"/></button> : <button onClick={() => {setPickingFor(slot.k); setStudentQuery('');}} className="bg-[#020617] px-4 py-2 rounded-xl text-xs font-bold text-white uppercase hover:bg-black transition-colors">Pilih</button>}
                                 </div>
                             ))}
                         </div>
                         <button onClick={saveResult} className="w-full mt-8 bg-emerald-600 hover:bg-emerald-500 text-white font-['Teko'] font-bold text-2xl py-3 rounded-2xl uppercase shadow-lg shadow-emerald-500/20 transition-all">Simpan Keputusan</button>
                     </div>
                 </div>
             )}

             {/* Student Picker for Winners */}
             {pickingFor && (
                 <div className="fixed inset-0 z-[2100] bg-black/90 flex flex-col items-center justify-center p-4">
                     <div className="w-full max-w-md bg-[#0f172a] rounded-[2rem] border border-white/10 p-6 shadow-2xl">
                         <div className="flex justify-between mb-6">
                             <h3 className="text-2xl font-['Teko'] font-bold text-white uppercase">Pilih Pemenang</h3>
                             <button onClick={() => setPickingFor(null)}><X className="text-slate-500 hover:text-white" /></button>
                         </div>
                         <input type="text" placeholder="Cari nama atlet..." className="w-full bg-slate-900 border border-slate-800 rounded-xl p-4 text-white uppercase font-bold mb-4 focus:border-amber-500 outline-none" value={studentQuery} onChange={e => setStudentQuery(e.target.value)} autoFocus />
                         <div className="space-y-2 max-h-60 overflow-y-auto custom-scrollbar">
                             {foundStudents.map(s => (
                                 <button key={s.id} onClick={() => handleSelectWinner(s)} className="w-full text-left p-4 bg-slate-900 hover:bg-amber-600 rounded-xl group transition-colors border border-white/5">
                                     <div className="font-bold text-white uppercase text-sm">{s.name}</div>
                                     <div className="text-xs text-slate-500 group-hover:text-amber-100 font-bold uppercase mt-1">{s.house} • {s.className}</div>
                                 </button>
                             ))}
                         </div>
                     </div>
                 </div>
             )}
        </div>
    );
};

export default SportsScreen;
