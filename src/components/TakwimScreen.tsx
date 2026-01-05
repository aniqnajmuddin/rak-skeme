import React, { useState, useEffect, useMemo, useContext } from 'react';
import { studentDataService } from '../services/studentDataService';
import { NotifyContext } from '../App'; // Panggil suis notifikasi
import { TakwimEvent } from '../types';
import { 
    ArrowLeft, Calendar, Edit, Save, Plus, Trash2, X, Flag, Clock
} from 'lucide-react';

interface TakwimScreenProps {
    onBack: () => void;
    userRole?: 'ADMIN' | 'GURU' | null;
}

const TakwimScreen: React.FC<TakwimScreenProps> = ({ onBack, userRole }) => {
    // --- AKTIFKAN NOTIFY ---
    const notifyCtx = useContext(NotifyContext);

    const [events, setEvents] = useState<TakwimEvent[]>([]);
    const [currentTime, setCurrentTime] = useState(new Date());
    const [isManageMode, setIsManageMode] = useState(false);
    
    // Form Modal State
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [formData, setFormData] = useState<Partial<TakwimEvent>>({ id: '', title: '', date: '', description: '' });
    const [isEditing, setIsEditing] = useState(false);

    useEffect(() => {
        refreshData();
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    const refreshData = () => {
        setEvents([...studentDataService.takwim]);
    };

    const sortedEvents = useMemo(() => {
        return [...events].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    }, [events]);

    const upcomingEvents = sortedEvents.filter(e => new Date(e.date).getTime() >= new Date().setHours(0,0,0,0));
    const pastEvents = sortedEvents.filter(e => new Date(e.date).getTime() < new Date().setHours(0,0,0,0));

    const handleOpenAdd = () => {
        setFormData({ id: '', title: '', date: new Date().toISOString().split('T')[0], description: '' });
        setIsEditing(false);
        setIsFormOpen(true);
        notifyCtx?.notify("Sila masukkan butiran acara baru.", "info");
    };

    const handleOpenEdit = (evt: TakwimEvent) => {
        setFormData({ ...evt });
        setIsEditing(true);
        setIsFormOpen(true);
    };

    const handleDelete = (id: string) => {
        if (confirm("Adakah anda pasti untuk memadam acara takwim ini?")) {
            studentDataService.deleteTakwim(id);
            refreshData();
            notifyCtx?.notify("Acara takwim berjaya dipadam.", "success");
        }
    };

    const handleSave = () => {
        if (!formData.title || !formData.date) {
            notifyCtx?.notify("Tajuk dan tarikh wajib diisi bohh!", "error");
            return;
        }

        const loadId = notifyCtx?.notify("Menyelaraskan kalendar kokurikulum...", "loading");

        const finalData: TakwimEvent = {
            id: formData.id || Math.random().toString(36).substr(2, 9),
            title: formData.title.toUpperCase(),
            date: formData.date,
            description: formData.description || ''
        };

        setTimeout(() => {
            studentDataService.saveTakwim(finalData);
            setIsFormOpen(false);
            refreshData();
            if (loadId) notifyCtx?.removeNotify(loadId);
            notifyCtx?.notify(`Acara "${finalData.title}" telah selamat disimpan!`, "success");
        }, 800);
    };

    return (
        <div className="flex flex-col h-full bg-[#0F172A] text-slate-100 font-['Manrope'] overflow-y-auto no-scrollbar relative">
            
            {/* Ambient Background */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-orange-500/5 rounded-full blur-[120px] pointer-events-none z-0" />

            <div className="max-w-5xl mx-auto w-full p-6 md:px-10 pb-40 relative z-10">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-12">
                    <div className="flex items-center gap-6">
                        <button 
                            onClick={onBack} 
                            className="w-12 h-12 bg-slate-800/50 border border-white/10 rounded-2xl flex items-center justify-center text-orange-500 hover:bg-orange-500 hover:text-white transition-all shadow-xl active:scale-90"
                        >
                            <ArrowLeft size={24} />
                        </button>
                        <div>
                            <h2 className="text-5xl font-['Teko'] font-bold text-white uppercase tracking-tight flex items-center gap-4">
                                <Calendar className="text-orange-500" size={40} /> TAKWIM <span className="text-orange-500">KOKU</span>
                            </h2>
                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] mt-1">Jadual Perancangan Tahunan SKeMe</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        {userRole === 'ADMIN' && (
                            <button 
                                onClick={() => {
                                    setIsManageMode(!isManageMode);
                                    notifyCtx?.notify(isManageMode ? "Mod Paparan Diaktifkan" : "Mod Pengurusan Diaktifkan", "info");
                                }}
                                className={`px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all border-2 ${isManageMode ? 'bg-rose-500 border-rose-500 text-white shadow-lg shadow-rose-500/20' : 'bg-slate-900 border-white/5 text-slate-400 hover:text-white'}`}
                            >
                                {isManageMode ? 'Selesai Urus' : 'Urus Takwim'}
                            </button>
                        )}
                        <div className="hidden sm:flex flex-col items-end bg-slate-900/50 p-4 rounded-3xl border border-white/5">
                            <div className="flex items-center gap-2 text-2xl font-['Teko'] font-bold text-white leading-none">
                                <Clock size={18} className="text-orange-500" />
                                {currentTime.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit', second: '2-digit'})}
                            </div>
                            <div className="text-[9px] font-black text-slate-500 uppercase tracking-tighter mt-1">{currentTime.toLocaleDateString('ms-MY', { weekday: 'long', day: 'numeric', month: 'long' })}</div>
                        </div>
                    </div>
                </div>

                {/* Main List */}
                <div className="space-y-12">
                    {/* UPCOMING SECTION */}
                    {upcomingEvents.length > 0 && (
                        <div className="animate-in fade-in slide-in-from-bottom-6 duration-700">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="h-px flex-1 bg-gradient-to-r from-transparent to-orange-500/20"></div>
                                <h3 className="text-2xl font-['Teko'] font-bold text-white uppercase tracking-widest">Aktiviti Akan Datang</h3>
                                <div className="h-px flex-1 bg-gradient-to-l from-transparent to-orange-500/20"></div>
                            </div>
                            <div className="grid gap-5">
                                {upcomingEvents.map((evt) => (
                                    <div key={evt.id} className="group relative bg-slate-800/40 backdrop-blur-sm border-l-4 border-orange-500 rounded-2xl p-8 shadow-xl hover:bg-slate-800/60 transition-all">
                                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-3 text-orange-500 font-black text-[10px] uppercase tracking-widest mb-3">
                                                    <Calendar size={14} />
                                                    <span>{new Date(evt.date).toLocaleDateString('ms-MY', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</span>
                                                </div>
                                                <h4 className="text-4xl font-['Teko'] font-bold text-white uppercase leading-none tracking-wide group-hover:text-orange-500 transition-colors">{evt.title}</h4>
                                                {evt.description && <p className="text-sm text-slate-400 mt-3 font-medium leading-relaxed max-w-2xl">{evt.description}</p>}
                                            </div>
                                            {isManageMode && (
                                                <div className="flex gap-2">
                                                    <button onClick={() => handleOpenEdit(evt)} className="w-12 h-12 bg-slate-900 text-blue-400 rounded-2xl flex items-center justify-center hover:bg-blue-600 hover:text-white transition-all shadow-lg"><Edit size={20} /></button>
                                                    <button onClick={() => handleDelete(evt.id)} className="w-12 h-12 bg-slate-900 text-rose-400 rounded-2xl flex items-center justify-center hover:bg-rose-600 hover:text-white transition-all shadow-lg"><Trash2 size={20} /></button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* PAST SECTION */}
                    {pastEvents.length > 0 && (
                        <div className="opacity-40 hover:opacity-100 transition-opacity duration-500">
                            <div className="flex items-center gap-3 mb-6 mt-12">
                                <div className="h-px flex-1 bg-gradient-to-r from-transparent to-slate-700"></div>
                                <h3 className="text-xl font-['Teko'] font-bold text-slate-500 uppercase tracking-widest">Arkib / Selesai</h3>
                                <div className="h-px flex-1 bg-gradient-to-l from-transparent to-slate-700"></div>
                            </div>
                            <div className="grid gap-3">
                                {pastEvents.slice().reverse().map((evt) => (
                                    <div key={evt.id} className="bg-slate-900/30 border-l-4 border-slate-700 rounded-xl p-5 flex justify-between items-center group">
                                        <div>
                                            <h4 className="text-2xl font-['Teko'] font-bold text-slate-400 uppercase leading-none">{evt.title}</h4>
                                            <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest">{new Date(evt.date).toLocaleDateString('ms-MY', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                                        </div>
                                        {isManageMode && (
                                            <button onClick={() => handleDelete(evt.id)} className="p-2 text-slate-700 hover:text-rose-500 transition-colors"><Trash2 size={18} /></button>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Floating Action Button */}
            {isManageMode && (
                <button 
                    onClick={handleOpenAdd}
                    className="fixed bottom-32 right-10 w-20 h-20 bg-orange-500 text-slate-900 rounded-[2rem] flex items-center justify-center shadow-2xl shadow-orange-500/40 hover:scale-110 active:scale-95 transition-all z-[2000] border-4 border-[#0F172A]"
                >
                    <Plus size={40} strokeWidth={3} />
                </button>
            )}

            {/* FORM MODAL */}
            {isFormOpen && (
                <div className="fixed inset-0 z-[5000] bg-slate-950/90 backdrop-blur-xl flex items-center justify-center p-6 animate-in zoom-in-95">
                    <div className="bg-[#0f172a] w-full max-w-md rounded-[3rem] p-10 shadow-[0_0_100px_rgba(249,115,22,0.15)] border border-white/10 relative">
                        <button onClick={() => setIsFormOpen(false)} className="absolute top-8 right-8 text-slate-500 hover:text-white transition-colors"><X size={28} /></button>
                        
                        <div className="mb-8 text-center">
                            <div className="w-16 h-16 bg-orange-500/10 rounded-2xl flex items-center justify-center text-orange-500 mx-auto mb-4">
                                <Calendar size={32} />
                            </div>
                            <h3 className="text-4xl font-['Teko'] font-bold text-white uppercase leading-none">
                                {isEditing ? 'Kemaskini' : 'Tambah'} <span className="text-orange-500">Acara</span>
                            </h3>
                        </div>

                        <div className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-4">Tajuk Aktiviti</label>
                                <input 
                                    className="w-full bg-slate-950 border-2 border-white/5 rounded-2xl py-5 px-6 text-white font-black text-sm outline-none focus:border-orange-500 transition-all uppercase placeholder-slate-800"
                                    placeholder="Contoh: MERENTAS DESA"
                                    value={formData.title}
                                    onChange={e => setFormData({...formData, title: e.target.value})}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-4">Tarikh Pelaksanaan</label>
                                <input 
                                    type="date"
                                    className="w-full bg-slate-950 border-2 border-white/5 rounded-2xl py-5 px-6 text-white font-black text-sm outline-none focus:border-orange-500 transition-all uppercase"
                                    value={formData.date}
                                    onChange={e => setFormData({...formData, date: e.target.value})}
                                />
                            </div>
                            <button 
                                onClick={handleSave}
                                className="w-full py-5 bg-orange-500 hover:bg-orange-600 text-slate-900 font-['Teko'] font-bold text-3xl uppercase tracking-widest rounded-2xl shadow-xl shadow-orange-500/20 transition-all active:scale-[0.98] mt-4"
                            >
                                Materi Takwim
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TakwimScreen;