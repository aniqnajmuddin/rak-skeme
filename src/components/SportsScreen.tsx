import React, { useState } from 'react';
import { Trophy, ChevronLeft, Star, User, Plus, ListFilter, Zap, Medal } from 'lucide-react';

const SportsScreen = ({ onBack }: { onBack: () => void }) => {
  // DATA ASAL: Rumah Sukan & Juara Bertahan
  const [rumahSukan, setRumahSukan] = useState([
    { id: 'blue', nama: 'BIRU', ketua: 'CIKGU ANIQ', markah: 1250, warna: 'bg-blue-600', juara: true },
    { id: 'red', nama: 'MERAH', ketua: 'CIKGU ZUL', markah: 1100, warna: 'bg-rose-600', juara: false },
    { id: 'green', nama: 'HIJAU', ketua: 'CIKGU SITI', markah: 1050, warna: 'bg-emerald-600', juara: false },
    { id: 'yellow', nama: 'KUNING', ketua: 'CIKGU AMIN', markah: 980, warna: 'bg-amber-500', juara: false },
  ]);

  // DATA ASAL: Senarai Acara Sukan
  const senaraiAcara = [
    { id: 1, nama: 'Larian 100m (L)', kategori: 'Balapan', emas: 'BIRU', perak: 'MERAH', gangsa: 'HIJAU' },
    { id: 2, nama: 'Lompat Jauh (P)', kategori: 'Padang', emas: 'HIJAU', perak: 'BIRU', gangsa: 'KUNING' },
    { id: 3, nama: 'Lari Berpagar (L)', kategori: 'Balapan', emas: 'BIRU', perak: 'KUNING', gangsa: 'MERAH' },
    { id: 4, nama: 'Lontar Peluru (P)', kategori: 'Padang', emas: 'MERAH', perak: 'BIRU', gangsa: 'HIJAU' },
  ];

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto animate-in fade-in zoom-in duration-500">
      
      {/* HEADER SECTION */}
      <div className="flex items-center justify-between mb-10">
        <button onClick={onBack} className="p-3 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all text-slate-400 hover:text-white">
          <ChevronLeft size={24} />
        </button>
        <div className="text-right">
          <h2 className="text-4xl font-['Teko'] font-bold leading-none tracking-tighter uppercase">Kejohanan <span className="text-amber-500">Olahraga</span></h2>
          <p className="text-[9px] font-black opacity-40 tracking-[0.4em] uppercase">Sistem Pengurusan Markah Rumah Sukan</p>
        </div>
      </div>

      {/* 1. KAD RUMAH SUKAN (SAIZ KANCIL - KEMAS) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        {rumahSukan.map((r) => (
          <div key={r.id} className={`relative overflow-hidden rounded-[2rem] border ${r.juara ? 'border-amber-500/30 bg-amber-500/5' : 'border-white/5 bg-white/5'} p-5 transition-all hover:-translate-y-1`}>
            {r.juara && (
              <div className="absolute top-4 right-4 text-amber-500 animate-pulse">
                <Star size={16} fill="currentColor" />
              </div>
            )}
            
            <div className={`${r.warna} w-10 h-10 rounded-xl flex items-center justify-center mb-4 shadow-lg shadow-black/20`}>
              <Trophy size={18} className="text-white" />
            </div>

            <h3 className="text-xl font-['Teko'] font-bold tracking-widest">{r.nama}</h3>
            <div className="flex items-center gap-2 mb-4">
              <User size={10} className="text-slate-500" />
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">{r.ketua}</p>
            </div>

            <div className="pt-3 border-t border-white/5">
              <p className="text-[8px] font-black opacity-30 uppercase tracking-[0.2em] mb-1">Mata Keseluruhan</p>
              <p className={`text-3xl font-['Teko'] font-bold ${r.juara ? 'text-amber-500' : 'text-white'}`}>
                {r.markah}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* 2. SENARAI ACARA & PEMENANG (FUNGSI ASAL) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between px-2">
            <h4 className="text-[11px] font-black uppercase tracking-[0.3em] text-blue-500 flex items-center gap-2">
              <ListFilter size={14} /> Keputusan Acara Terkini
            </h4>
            <button className="text-[9px] font-bold text-slate-500 hover:text-white uppercase tracking-widest bg-white/5 px-3 py-1 rounded-full border border-white/5">
              Lihat Semua
            </button>
          </div>

          <div className="space-y-3">
            {senaraiAcara.map((acara) => (
              <div key={acara.id} className="bg-white/5 border border-white/5 rounded-2xl p-4 flex flex-col md:flex-row md:items-center gap-4 hover:bg-white/[0.07] transition-all">
                <div className="flex-1">
                  <p className="text-[8px] font-black text-blue-400 uppercase tracking-widest mb-1">{acara.kategori}</p>
                  <h5 className="font-bold text-sm tracking-tight">{acara.nama}</h5>
                </div>
                
                {/* Pemenang Medal */}
                <div className="flex items-center gap-3">
                  <div className="flex flex-col items-center">
                    <Medal size={14} className="text-amber-400 mb-1" />
                    <span className="text-[9px] font-black text-slate-400">{acara.emas}</span>
                  </div>
                  <div className="w-px h-6 bg-white/10" />
                  <div className="flex flex-col items-center">
                    <Medal size={14} className="text-slate-300 mb-1" />
                    <span className="text-[9px] font-black text-slate-400">{acara.perak}</span>
                  </div>
                  <div className="w-px h-6 bg-white/10" />
                  <div className="flex flex-col items-center">
                    <Medal size={14} className="text-orange-600 mb-1" />
                    <span className="text-[9px] font-black text-slate-400">{acara.gangsa}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 3. INPUT MARKAH PANTAS (PULIHKAN FUNGSI ASAL) */}
        <div className="space-y-6">
          <div className="bg-blue-600/10 border border-blue-500/20 rounded-[2.5rem] p-6 sticky top-8">
            <h4 className="text-[11px] font-black uppercase tracking-[0.2em] text-blue-400 mb-6 flex items-center gap-2">
              <Zap size={14} fill="currentColor" /> Kemas Kini Markah
            </h4>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-[9px] font-black text-slate-500 uppercase ml-2">Pilih Rumah</label>
                <select className="w-full bg-slate-900 border border-white/10 rounded-xl p-3 text-xs font-bold text-white focus:border-blue-500 outline-none">
                  {rumahSukan.map(r => <option key={r.id}>{r.nama}</option>)}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-[9px] font-black text-slate-500 uppercase ml-2">Pilih Acara</label>
                <select className="w-full bg-slate-900 border border-white/10 rounded-xl p-3 text-xs font-bold text-white focus:border-blue-500 outline-none">
                  <option>Larian 100m</option>
                  <option>Lompat Jauh</option>
                  <option>Larian Berpagar</option>
                  <option>Lontar Peluru</option>
                  <option>ACARA MANUAL (Taip...)</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-[9px] font-black text-slate-500 uppercase ml-2">Kedudukan / Markah</label>
                <input type="number" placeholder="Jumlah Mata" className="w-full bg-slate-900 border border-white/10 rounded-xl p-3 text-xs font-bold text-white outline-none" />
              </div>

              <button className="w-full py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.3em] transition-all flex items-center justify-center gap-2 shadow-xl shadow-blue-500/20">
                <Plus size={16} /> Simpan Mata
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default SportsScreen;