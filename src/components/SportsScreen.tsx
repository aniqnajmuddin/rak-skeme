import React, { useState, useEffect, useMemo, useContext } from 'react';
import { studentDataService, AthleteStats } from '../services/studentDataService';
import { NotifyContext } from '../App'; // Panggil suis notifikasi
import { SportEvent, HouseStats, Student } from '../types';
import { 
    Trophy, ChevronRight, X, Search, Save, 
    Zap, Activity, Plus, ArrowLeft, Shield, Filter, Trash2, Edit,
    CheckCircle, Medal, Crown, User, AlertCircle, RefreshCw
} from 'lucide-react';

interface SportsScreenProps {
    onBack: () => void;
}

const SportsScreen: React.FC<SportsScreenProps> = ({ onBack }) => {
    // --- AKTIFKAN NOTIFY ---
    const notifyCtx = useContext(NotifyContext);

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
        notifyCtx?.notify(`Pemenang ${pickingFor.toUpperCase()} dipilih: ${student.name}`, "info");
    };

    const saveResult = () => {
        if (selectedEvent) {
            const loadId = notifyCtx?.notify("Mengemas kini papan skor kejohanan...", "loading");
            studentDataService.updateSportResult(selectedEvent.id, winners);
            setTimeout(() => {
                setIsEventModalOpen(false);
                refreshData();
                if (loadId) notifyCtx?.removeNotify(loadId);
                notifyCtx?.notify(`Keputusan bagi ${selectedEvent.name} berjaya dipateri!`, "success");
            }, 800);
        }
    };

    const handleDeleteEvent = (id: string) => { 
        if(confirm("Padam acara ini? Semua rekod pemenang akan hilang.")) { 
            studentDataService.deleteSportEvent(id); 
            refreshData(); 
            notifyCtx?.notify("Acara telah dipadam dari kalendar sukan.", "info");
        } 
    };

    const handleSaveHouse = () => {
        if (!houseFormData.name) return;
        const loadId = notifyCtx?.notify("Menyelaraskan data rumah sukan...", "loading");
        
        if (isEditingHouse) studentDataService.updateSportsHouse(houseFormData.id, houseFormData.name, houseFormData.color, houseFormData.captainName);
        else studentDataService.addSportsHouse(houseFormData.name, houseFormData.color, houseFormData.captainName);
        
        setTimeout(() => {
            setIsHouseFormOpen(false); 
            refreshData(); 
            if (loadId) notifyCtx?.removeNotify(loadId);
            notifyCtx?.notify(`Rumah ${houseFormData.name} berjaya dikemaskini!`, "success");
        }, 800);
    };

    return (
        <div className="flex flex-col h-full bg-[#0F172A] text-slate-100 p-4 md:p-10 pb-40 overflow-y-auto font-['Manrope'] no-scrollbar relative">
             <div className="max-w-7xl mx-auto w-full relative z-10">

                {/* Header Section */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
                    <div className="flex items-center gap-6">
                        <button onClick={onBack} className="w-12 h-12 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center text-amber-500 hover:bg-amber-500 hover:text-slate-900 transition-all active:scale-90">
                            <ArrowLeft size={24} />
                        </button>
                        <div>
                            <h2 className="text-5xl font-['Teko'] font-bold uppercase tracking-tight text-white flex items-center gap-4">
                                <Trophy className="text-amber-500" size={40} /> SUKAN <span className="text-amber-500">TAHUNAN</span>
                            </h2>
                            <p className="text-[10px] font-black text-slate-500 tracking-[0.4em] uppercase">Edisi Kejohanan Wira Kokurikulum</p>
                        </div>
                    </div>

                    <div className="flex bg-slate-900/80 backdrop-blur-xl p-1.5 rounded-2xl border border-white/10 shadow-2xl">
                        {[
                            { id: 'BOARD', label: 'KEDUDUKAN', color: 'bg-amber-500' },
                            { id: 'HOUSES', label: 'RUMAH', color: 'bg-sky-600' },
                            { id: 'EVENTS', label: 'ACARA', color: 'bg-emerald-600' }
                        ].map(tab => (
                            <button 
                                key={tab.id} 
                                onClick={() => { setActiveTab(tab.id as any); notifyCtx?.notify(`Menukar ke paparan ${tab.label}`, "info"); }} 
                                className={`px-8 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === tab.id ? `${tab.color} text-slate-900 shadow-xl` : 'text-slate-500 hover:text-white'}`}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* SCOREBOARD TAB */}
                {activeTab === 'BOARD' && (
                    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-8 duration-700">
                        {/* Jumbotron Leader */}
                        
                        {houseStats.length > 0 && (
                            <div className="bg-gradient-to-br from-slate-900 via-[#1e293b] to-slate-900 border border-white/5 p-10 rounded-[3.5rem] relative overflow-hidden text-center shadow-[0_0_80px_rgba(0,0,0,0.4)]">
                                <div className="absolute top-0 right-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10 pointer-events-none" />
                                <div className="absolute -top-24 -right-24 w-96 h-96 bg-amber-500/20 rounded-full blur-[120px] pointer-events-none" />
                                
                                <div className="relative z-10">
                                    <div className="inline-flex items-center gap-3 px-6 py-2 rounded-full bg-amber-500 text-slate-900 text-[10px] font-black uppercase tracking-[0.3em] mb-6 shadow-xl shadow-amber-500/20">
                                        <Crown size={16} /> Juara Bertahan
                                    </div>
                                    <h1 className="text-9xl font-['Teko'] font-bold text-white uppercase drop-shadow-[0_10px_10px_rgba(0,0,0,0.5)] tracking-tighter leading-none italic">{houseStats[0].name}</h1>
                                    <div className="flex items-center justify-center gap-4 mt-4">
                                        <div className="h-px w-20 bg-gradient-to-r from-transparent to-amber-500/50"></div>
                                        <div className="text-6xl font-['Teko'] font-bold text-amber-500">{houseStats[0].points} <span className="text-xl text-slate-500 tracking-widest uppercase">Mata Keseluruhan</span></div>
                                        <div className="h-px w-20 bg-gradient-to-l from-transparent to-amber-500/50"></div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Ranking Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            {houseStats.map((house, idx) => (
                                <div key={idx} className="group bg-slate-800/40 backdrop-blur-md border border-white/5 p-8 rounded-[2.5rem] flex flex-col relative overflow-hidden shadow-xl transition-all hover:-translate-y-2 hover:bg-slate-800/60">
                                    <div className="absolute top-0 left-0 w-full h-1.5 opacity-50 group-hover:opacity-100 transition-opacity" style={{ backgroundColor: house.color }} />
                                    <div className="flex justify-between items-start mb-8">
                                        <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-white font-black shadow-2xl text-lg rotate-3 group-hover:rotate-0 transition-transform" style={{ backgroundColor: house.color }}>
                                            {idx + 1}
                                        </div>
                                        <div className="text-right">
                                            <div className="text-5xl font-['Teko'] font-bold text-white leading-none tracking-tighter">{house.points}</div>
                                            <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Points</div>
                                        </div>
                                    </div>
                                    <div>
                                        <div className="text-3xl font-['Teko'] font-bold uppercase tracking-wide text-white mb-2">{house.name}</div>
                                        <div className="flex gap-2">
                                            <div className="flex items-center gap-1.5 px-3 py-1 bg-amber-500/10 rounded-full border border-amber-500/20">
                                                <div className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></div>
                                                <span className="text-[9px] font-black text-amber-500 uppercase">{house.medals.gold} Gold</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* EVENTS TAB (ACARA) */}
                {activeTab === 'EVENTS' && (
                    <div className="space-y-8 animate-in fade-in zoom-in-95 duration-500">
                        <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-slate-800/30 p-4 rounded-[2rem] border border-white/5 shadow-inner">
                            <div className="flex gap-2 overflow-x-auto no-scrollbar max-w-full">
                                <button onClick={() => setFilterCategory('ALL')} className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${filterCategory === 'ALL' ? 'bg-white text-slate-900 shadow-lg' : 'text-slate-500 hover:text-white'}`}>Semua Acara</button>
                                {uniqueCategories.map(cat => (
                                    <button key={cat} onClick={() => setFilterCategory(cat)} className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${filterCategory === cat ? 'bg-white text-slate-900 shadow-lg' : 'text-slate-500 hover:text-white'}`}>{cat}</button>
                                ))}
                            </div>
                            <button onClick={() => setIsConfigMode(!isConfigMode)} className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all ${isConfigMode ? 'bg-rose-500 border-rose-500 text-white' : 'bg-slate-900 border-white/10 text-slate-400'}`}>
                                {isConfigMode ? 'Selesai Urus' : 'Urus Acara'}
                            </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {filteredEvents.map(evt => (
                                <div key={evt.id} onClick={() => handleOpenEvent(evt)} className={`group p-8 rounded-[2.5rem] border-2 transition-all cursor-pointer relative overflow-hidden ${evt.status === 'COMPLETED' ? 'bg-emerald-500/5 border-emerald-500/20 shadow-emerald-500/5' : 'bg-slate-800/40 border-white/5 hover:border-amber-500/30 shadow-2xl'}`}>
                                    <div className="flex justify-between items-start mb-6">
                                        <div className="px-4 py-1.5 bg-slate-900/50 text-[9px] font-black text-slate-400 rounded-full uppercase tracking-[0.2em] border border-white/5">{evt.category}</div>
                                        {evt.status === 'COMPLETED' ? <CheckCircle size={22} className="text-emerald-500" /> : <RefreshCw size={18} className="text-slate-700 group-hover:text-amber-500 transition-colors" />}
                                    </div>
                                    <h4 className="text-3xl font-['Teko'] font-bold text-white uppercase leading-none mb-4 group-hover:text-amber-500 transition-colors">{evt.name}</h4>
                                    
                                    {evt.status === 'COMPLETED' && evt.winners.gold ? (
                                        <div className="flex items-center gap-3 p-3 bg-white/5 rounded-2xl border border-white/5">
                                            <div className="w-8 h-8 rounded-lg bg-amber-500/20 flex items-center justify-center text-amber-500"><Medal size={16} /></div>
                                            <div className="min-w-0">
                                                <div className="text-[10px] font-black text-white uppercase truncate">{evt.winners.gold.name}</div>
                                                <div className="text-[8px] font-bold text-amber-500 uppercase tracking-widest">{evt.winners.gold.house}</div>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="text-[9px] font-black text-slate-600 uppercase tracking-widest flex items-center gap-2 italic">Belum Mula / Menunggu Keputusan</div>
                                    )}

                                    {isConfigMode && (
                                        <div className="absolute inset-0 bg-slate-900/90 backdrop-blur-md flex items-center justify-center gap-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button onClick={(e) => { e.stopPropagation(); handleDeleteEvent(evt.id); }} className="w-12 h-12 bg-rose-600 text-white rounded-2xl flex items-center justify-center shadow-lg active:scale-90 transition-all"><Trash2 size={20}/></button>
                                        </div>
                                    )}
                                </div>
                            ))}
                            {isConfigMode && (
                                <button onClick={() => { setEventFormData({id:'',name:'',category:'',type:'TRACK'}); setIsEditingEvent(false); setIsEventFormOpen(true); }} className="h-full min-h-[160px] border-2 border-dashed border-slate-700 rounded-[2.5rem] flex flex-col items-center justify-center gap-3 text-slate-500 hover:border-amber-500 hover:text-amber-500 transition-all bg-slate-800/20">
                                    <Plus size={32} />
                                    <span className="text-[10px] font-black uppercase tracking-widest">Tambah Acara Baru</span>
                                </button>
                            )}
                        </div>
                    </div>
                )}
             </div>

             {/* MODAL KEPUTUSAN ACARA (INTELIDENT UI) */}
             {isEventModalOpen && selectedEvent && (
                 <div className="fixed inset-0 z-[2000] bg-slate-950/90 backdrop-blur-xl flex items-center justify-center p-6 animate-in fade-in">
                     <div className="bg-[#0f172a] w-full max-w-xl rounded-[3rem] border border-white/10 p-10 shadow-[0_0_100px_rgba(0,0,0,0.5)]">
                         <div className="flex justify-between items-start mb-10">
                             <div>
                                 <span className="text-[10px] font-black text-amber-500 uppercase tracking-[0.3em] mb-2 block">{selectedEvent.category}</span>
                                 <h3 className="text-5xl font-['Teko'] font-bold text-white uppercase leading-none tracking-tight">{selectedEvent.name}</h3>
                             </div>
                             <button onClick={() => setIsEventModalOpen(false)} className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center text-slate-400 hover:text-white transition-all"><X size={24}/></button>
                         </div>
                         
                         <div className="space-y-4">
                             {[
                                 { k: 'gold', l: 'JOHAN (EMAS)', c: 'text-amber-400', bg: 'bg-amber-400/5 border-amber-400/20', icon: Medal }, 
                                 { k: 'silver', l: 'NAIB JOHAN (PERAK)', c: 'text-slate-300', bg: 'bg-slate-300/5 border-slate-300/20', icon: Medal },
                                 { k: 'bronze', l: 'KETIGA (GANGSA)', c: 'text-orange-600', bg: 'bg-orange-600/5 border-orange-600/20', icon: Medal }
                             ].map((slot: any) => (
                                 <div key={slot.k} className={`flex items-center justify-between p-6 rounded-[1.5rem] border-2 transition-all ${winners[slot.k] ? 'bg-white/5 border-white/10' : slot.bg}`}>
                                     <div className="flex items-center gap-5">
                                         <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${slot.c} bg-slate-900/50 shadow-inner`}>
                                            <slot.icon size={24} />
                                         </div>
                                         <div>
                                             <div className={`text-[9px] font-black tracking-widest ${slot.c} uppercase mb-1`}>{slot.l}</div>
                                             {winners[slot.k] ? (
                                                <div className="text-white font-bold uppercase text-sm tracking-wide">{winners[slot.k].name} <span className="text-[9px] text-slate-500 ml-2">({winners[slot.k].house})</span></div>
                                             ) : (
                                                <div className="text-slate-700 text-xs font-bold uppercase italic tracking-widest">Keputusan Belum Diisi</div>
                                             )}
                                         </div>
                                     </div>
                                     {winners[slot.k] ? (
                                        <button onClick={() => { setWinners({...winners, [slot.k]: null}); notifyCtx?.notify(`Pemenang ${slot.l} dikosongkan.`, "info"); }} className="p-2 text-slate-700 hover:text-rose-500 transition-colors"><Trash2 size={18}/></button>
                                     ) : (
                                        <button onClick={() => { setPickingFor(slot.k); setStudentQuery(''); }} className="bg-white text-slate-900 px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-amber-500 transition-all shadow-lg active:scale-95">Pilih Atlet</button>
                                     )}
                                 </div>
                             ))}
                         </div>
                         
                         <button onClick={saveResult} className="w-full mt-10 bg-amber-500 hover:bg-amber-600 text-slate-900 font-['Teko'] font-bold text-3xl py-4 rounded-[1.5rem] uppercase tracking-widest shadow-xl shadow-amber-500/20 transition-all active:scale-[0.98]">
                            Materi Keputusan
                         </button>
                     </div>
                 </div>
             )}

             {/* ATHLETE PICKER MODAL */}
             {pickingFor && (
                 <div className="fixed inset-0 z-[2100] bg-slate-950/95 flex flex-col items-center justify-center p-6 animate-in zoom-in-95 duration-300">
                     <div className="w-full max-w-md bg-slate-900 rounded-[3rem] border border-white/10 p-10 shadow-[0_0_120px_rgba(245,158,11,0.15)]">
                         <div className="flex justify-between mb-8">
                             <div>
                                 <h3 className="text-3xl font-['Teko'] font-bold text-white uppercase leading-none">Carian Atlet</h3>
                                 <p className="text-[10px] font-black text-amber-500 uppercase tracking-widest mt-1">Sila masukkan nama atau IC</p>
                             </div>
                             <button onClick={() => setPickingFor(null)} className="w-10 h-10 bg-white/5 rounded-full flex items-center justify-center text-slate-500 hover:text-white"><X size={20}/></button>
                         </div>
                         <div className="relative mb-6">
                            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500" size={20} />
                            <input 
                                type="text" 
                                placeholder="NAMA MURID..." 
                                className="w-full bg-slate-950 border-2 border-white/5 rounded-2xl py-5 pl-14 pr-6 text-white uppercase font-black text-sm tracking-widest focus:border-amber-500 outline-none transition-all" 
                                value={studentQuery} 
                                onChange={e => setStudentQuery(e.target.value)} 
                                autoFocus 
                            />
                         </div>
                         <div className="space-y-3 max-h-[300px] overflow-y-auto no-scrollbar">
                             {foundStudents.map(s => (
                                 <button key={s.id} onClick={() => handleSelectWinner(s)} className="w-full text-left p-5 bg-white/5 hover:bg-amber-500 group rounded-2xl transition-all border border-white/5 flex items-center gap-4">
                                     <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center text-slate-500 group-hover:text-slate-900 font-bold"><User size={20}/></div>
                                     <div className="min-w-0">
                                         <div className="font-black text-white group-hover:text-slate-900 uppercase text-xs tracking-wide truncate">{s.name}</div>
                                         <div className="text-[9px] text-slate-500 group-hover:text-slate-800 font-black uppercase mt-1 tracking-widest">{s.house} • {s.className}</div>
                                     </div>
                                 </button>
                             ))}
                             {studentQuery.length > 2 && foundStudents.length === 0 && (
                                 <div className="text-center py-10">
                                     <AlertCircle className="mx-auto text-slate-700 mb-2" size={32} />
                                     <p className="text-[10px] font-black text-slate-700 uppercase tracking-widest">Tiada rekod ditemui</p>
                                 </div>
                             )}
                         </div>
                     </div>
                 </div>
             )}
        </div>
    );
};

export default SportsScreen;