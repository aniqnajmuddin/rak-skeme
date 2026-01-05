
import React, { useState, useEffect, useMemo } from 'react';
import { studentDataService } from '../services/studentDataService';
import { TakwimEvent } from '../types';
import { 
    ArrowLeft, Calendar, Edit, Save, Plus, Trash2, X, Flag
} from 'lucide-react';

interface TakwimScreenProps {
    onBack: () => void;
    userRole?: 'ADMIN' | 'GURU' | null;
}

const TakwimScreen: React.FC<TakwimScreenProps> = ({ onBack, userRole }) => {
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
    };

    const handleOpenEdit = (evt: TakwimEvent) => {
        setFormData({ ...evt });
        setIsEditing(true);
        setIsFormOpen(true);
    };

    const handleDelete = (id: string) => {
        if (confirm("Padam acara ini?")) {
            studentDataService.deleteTakwim(id);
            refreshData();
        }
    };

    const handleSave = () => {
        if (!formData.title || !formData.date) return;
        const finalData: TakwimEvent = {
            id: formData.id || Math.random().toString(36).substr(2, 9),
            title: formData.title.toUpperCase(),
            date: formData.date,
            description: formData.description || ''
        };
        studentDataService.saveTakwim(finalData);
        setIsFormOpen(false);
        refreshData();
    };

    return (
        <div className="flex flex-col h-full bg-[#0F172A] text-slate-100 font-['Manrope'] overflow-y-auto no-scrollbar">
            <div className="max-w-5xl mx-auto w-full p-6 md:px-10 pb-40">
                {/* Header */}
                <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-10">
                    <div className="flex items-center gap-4">
                        <button 
                            onClick={onBack} 
                            className="w-12 h-12 bg-slate-800 border border-slate-700 rounded-xl flex items-center justify-center text-blue-400 hover:bg-blue-600 hover:text-white transition-all shadow-lg"
                        >
                            <ArrowLeft size={24} />
                        </button>
                        <div>
                            <h2 className="text-4xl font-['Teko'] font-bold text-white uppercase tracking-wide flex items-center gap-3">
                                <Calendar className="text-orange-500" size={32} /> TAKWIM AKTIVITI
                            </h2>
                            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Jadual Tahunan Kokurikulum</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        {userRole === 'ADMIN' && (
                            <button 
                                onClick={() => setIsManageMode(!isManageMode)}
                                className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all border ${isManageMode ? 'bg-red-500 text-white border-red-500' : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-white'}`}
                            >
                                {isManageMode ? 'Tutup Edit' : 'Urus Takwim'}
                            </button>
                        )}
                        <div className="hidden sm:block text-right">
                            <div className="text-3xl font-['Teko'] font-bold text-white leading-none">{currentTime.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</div>
                            <div className="text-[10px] font-bold text-slate-500 uppercase">{currentTime.toLocaleDateString('ms-MY', { weekday: 'long', day: 'numeric', month: 'short' })}</div>
                        </div>
                    </div>
                </div>

                <div className="space-y-8">
                    {upcomingEvents.length > 0 && (
                        <div>
                            <div className="flex items-center gap-2 mb-4">
                                <div className="w-1.5 h-6 bg-orange-500 skew-x-[-12deg]" />
                                <h3 className="text-xl font-['Teko'] font-bold text-white uppercase tracking-wider">Akan Datang</h3>
                            </div>
                            <div className="grid gap-4">
                                {upcomingEvents.map((evt) => (
                                    <div key={evt.id} className="group relative bg-[#1E293B] border-l-4 border-orange-500 rounded-r-xl p-6 shadow-md hover:shadow-orange-500/10 transition-all">
                                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                            <div>
                                                <div className="flex items-center gap-3 text-orange-400 mb-1">
                                                    <Calendar size={14} />
                                                    <span className="text-xs font-bold uppercase tracking-wider">{new Date(evt.date).toLocaleDateString('ms-MY', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</span>
                                                </div>
                                                <h4 className="text-2xl font-['Teko'] font-bold text-white uppercase leading-none">{evt.title}</h4>
                                                {evt.description && <p className="text-sm text-slate-400 mt-2">{evt.description}</p>}
                                            </div>
                                            {isManageMode && (
                                                <div className="flex gap-2">
                                                    <button onClick={() => handleOpenEdit(evt)} className="p-2 bg-slate-800 text-blue-400 rounded-lg hover:bg-blue-600 hover:text-white"><Edit size={18} /></button>
                                                    <button onClick={() => handleDelete(evt.id)} className="p-2 bg-slate-800 text-red-400 rounded-lg hover:bg-red-600 hover:text-white"><Trash2 size={18} /></button>
                                                </div>
                                            )}
                                        </div>
                                        <div className="absolute top-4 right-4 opacity-10 group-hover:opacity-20 transition-opacity">
                                            <Flag size={60} />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {pastEvents.length > 0 && (
                        <div className="opacity-60">
                            <div className="flex items-center gap-2 mb-4 mt-8">
                                <div className="w-1.5 h-6 bg-slate-600 skew-x-[-12deg]" />
                                <h3 className="text-xl font-['Teko'] font-bold text-slate-400 uppercase tracking-wider">Selesai</h3>
                            </div>
                            <div className="grid gap-3">
                                {pastEvents.slice().reverse().map((evt) => (
                                    <div key={evt.id} className="bg-slate-800/50 border-l-4 border-slate-600 rounded-r-lg p-4 flex justify-between items-center">
                                        <div>
                                            <h4 className="text-lg font-['Teko'] font-bold text-slate-300 uppercase leading-none">{evt.title}</h4>
                                            <span className="text-xs font-bold text-slate-500 uppercase">{new Date(evt.date).toLocaleDateString('ms-MY', { day: 'numeric', month: 'short' })}</span>
                                        </div>
                                        {isManageMode && (
                                            <button onClick={() => handleDelete(evt.id)} className="text-slate-600 hover:text-red-500"><Trash2 size={16} /></button>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {isManageMode && (
                <button 
                    onClick={handleOpenAdd}
                    className="fixed bottom-10 right-8 w-16 h-16 bg-orange-600 text-white rounded-full flex items-center justify-center shadow-xl shadow-orange-600/40 hover:scale-110 transition-all z-50"
                >
                    <Plus size={32} />
                </button>
            )}

            {isFormOpen && (
                <div className="fixed inset-0 z-[5000] bg-slate-900/95 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-[#1E293B] w-full max-w-md rounded-2xl p-8 shadow-2xl border border-slate-700 relative">
                        <button onClick={() => setIsFormOpen(false)} className="absolute top-4 right-4 text-slate-500 hover:text-white"><X size={24} /></button>
                        <h3 className="text-2xl font-['Teko'] font-bold text-white uppercase mb-6 flex items-center gap-2">
                            <Calendar className="text-orange-500" size={24} /> 
                            {isEditing ? 'Kemaskini Acara' : 'Tambah Acara Baru'}
                        </h3>
                        <div className="space-y-5">
                            <div>
                                <label className="text-xs font-bold text-slate-400 uppercase mb-1 block">Tajuk Acara</label>
                                <input 
                                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white font-bold outline-none focus:border-orange-500 uppercase"
                                    placeholder="Contoh: KEJOHANAN BALAPAN"
                                    value={formData.title}
                                    onChange={e => setFormData({...formData, title: e.target.value})}
                                />
                            </div>
                            <div>
                                <label className="text-xs font-bold text-slate-400 uppercase mb-1 block">Tarikh</label>
                                <input 
                                    type="date"
                                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white font-bold outline-none focus:border-orange-500 uppercase"
                                    value={formData.date}
                                    onChange={e => setFormData({...formData, date: e.target.value})}
                                />
                            </div>
                            <button 
                                onClick={handleSave}
                                className="w-full py-4 bg-orange-600 hover:bg-orange-500 text-white font-['Teko'] font-bold text-xl uppercase rounded-xl shadow-lg transition-all"
                            >
                                Simpan Data
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TakwimScreen;
