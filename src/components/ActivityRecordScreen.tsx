import React, { useState, useContext } from 'react';
import { Save, ChevronLeft, Calendar, Users, MapPin, Tag, Plus, MessageSquare } from 'lucide-react';
import { NotifyContext } from '../App';
import TechAutocomplete from './TechAutocomplete';

interface ActivityRecordScreenProps {
  onBack: () => void;
}

const ActivityRecordScreen: React.FC<ActivityRecordScreenProps> = ({ onBack }) => {
  const notifyCtx = useContext(NotifyContext);
  
  // LOGIK ASAL: Data yang admin dah tetapkan
  const activitySuggestions = [
    "Mesyuarat Agung Tahunan", "Latihan Mingguan", "Kejohanan Sukan Tahunan",
    "Perkhemahan Perdana", "Kursus Kepimpinan", "Karnival Ko-Kurikulum"
  ];

  const [formData, setFormData] = useState({
    title: '',
    category: 'Sukan/Permainan', // Default kategori
    type: 'Sekolah', // Luar / Sekolah
    date: new Date().toISOString().split('T')[0],
    location: '',
    attendance: '',
    notes: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title || !formData.location || !formData.attendance) {
      notifyCtx?.notify("Lengkapkan maklumat wajib bohh!", "error");
      return;
    }

    const loadId = notifyCtx?.notify("Menyimpan rekod aktiviti...", "loading");

    // Simulasi simpan data
    setTimeout(() => {
      notifyCtx?.removeNotify(loadId!);
      notifyCtx?.notify("Rekod Aktiviti Berjaya Disimpan!", "success");
      onBack();
    }, 1500);
  };

  return (
    <div className="min-h-screen p-4 md:p-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="max-w-4xl mx-auto flex items-center justify-between mb-10">
        <button onClick={onBack} className="p-3 rounded-2xl bg-white/5 border border-white/10 text-slate-400 hover:text-white transition-all">
          <ChevronLeft size={24} />
        </button>
        <div className="text-right">
          <h1 className="text-4xl font-['Teko'] font-bold uppercase leading-none tracking-tighter">Rekod <span className="text-blue-500">Aktiviti</span></h1>
          <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">Unit Kokurikulum TBA5014</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="max-w-4xl mx-auto space-y-6">
        
        {/* Bahagian 1: Maklumat Utama */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Autocomplete dengan Kebolehan Taip Manual */}
          <div className="space-y-2">
            <TechAutocomplete 
              label="Nama Acara / Program / Aktiviti"
              suggestions={activitySuggestions}
              value={formData.title}
              onChange={(val) => setFormData({...formData, title: val})}
              placeholder="Cari atau taip nama aktiviti..."
            />
            <p className="text-[9px] text-slate-500 italic ml-2">*Boleh taip secara manual jika tiada dalam senarai</p>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase text-blue-500 tracking-widest flex items-center gap-2">
              <Calendar size={12} /> Tarikh Aktiviti
            </label>
            <input 
              type="date"
              className="w-full bg-slate-900 border border-white/10 rounded-2xl p-4 text-white font-bold outline-none focus:border-blue-500 transition-all"
              value={formData.date}
              onChange={(e) => setFormData({...formData, date: e.target.value})}
            />
          </div>
        </div>

        {/* Bahagian 2: Kategori & Jenis (PENTING UNTUK ANALISIS) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-white/5 p-6 rounded-[2.5rem] border border-white/5">
          <div className="space-y-3">
            <label className="text-[10px] font-black uppercase text-blue-500 tracking-widest flex items-center gap-2">
              <Tag size={12} /> Kategori Unit
            </label>
            <div className="grid grid-cols-2 gap-2">
              {['Sukan/Permainan', 'Kelab/Persatuan', 'Unit Beruniform', 'Lain-lain'].map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setFormData({...formData, category: cat})}
                  className={`py-3 px-4 rounded-xl text-[10px] font-bold uppercase tracking-tighter transition-all border ${
                    formData.category === cat 
                    ? 'bg-blue-600 border-blue-400 text-white shadow-lg shadow-blue-500/20' 
                    : 'bg-slate-950 border-white/5 text-slate-500 hover:border-white/20'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <label className="text-[10px] font-black uppercase text-blue-500 tracking-widest flex items-center gap-2">
              <MapPin size={12} /> Peringkat / Jenis
            </label>
            <div className="flex gap-2">
              {['Sekolah', 'Zon/Daerah', 'Negeri', 'Kebangsaan'].map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setFormData({...formData, type: t})}
                  className={`flex-1 py-3 px-2 rounded-xl text-[10px] font-bold uppercase transition-all border ${
                    formData.type === t 
                    ? 'bg-amber-500 border-amber-400 text-slate-900 shadow-lg shadow-amber-500/20' 
                    : 'bg-slate-950 border-white/5 text-slate-500 hover:border-white/20'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Bahagian 3: Lokasi & Kehadiran */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase text-blue-500 tracking-widest">Lokasi Kejadian</label>
            <input 
              type="text"
              placeholder="Cth: Padang Sekolah / Zoo Negara"
              className="w-full bg-slate-900 border border-white/10 rounded-2xl p-4 text-white font-bold outline-none focus:border-blue-500"
              value={formData.location}
              onChange={(e) => setFormData({...formData, location: e.target.value})}
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase text-blue-500 tracking-widest">Jumlah Kehadiran Murid</label>
            <div className="relative">
              <Users className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600" size={18} />
              <input 
                type="number"
                placeholder="0"
                className="w-full bg-slate-900 border border-white/10 rounded-2xl p-4 pl-12 text-white font-bold outline-none focus:border-blue-500"
                value={formData.attendance}
                onChange={(e) => setFormData({...formData, attendance: e.target.value})}
              />
            </div>
          </div>
        </div>

        {/* Bahagian 4: Catatan Tambahan */}
        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase text-blue-500 tracking-widest flex items-center gap-2">
            <MessageSquare size={12} /> Catatan / Laporan Ringkas
          </label>
          <textarea 
            rows={4}
            className="w-full bg-slate-900 border border-white/10 rounded-3xl p-5 text-white font-medium outline-none focus:border-blue-500 no-scrollbar"
            placeholder="Taip catatan aktiviti di sini..."
            value={formData.notes}
            onChange={(e) => setFormData({...formData, notes: e.target.value})}
          ></textarea>
        </div>

        {/* Submit Button */}
        <button 
          type="submit"
          className="w-full py-6 bg-blue-600 hover:bg-blue-500 text-white rounded-[2rem] font-black uppercase tracking-[0.3em] flex items-center justify-center gap-3 transition-all active:scale-95 shadow-2xl shadow-blue-500/20"
        >
          <Save size={20} /> Simpan Rekod Penuh
        </button>

      </form>
    </div>
  );
};

export default ActivityRecordScreen;