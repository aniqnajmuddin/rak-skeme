import React from 'react';
import { Trophy, ChevronLeft, Star, User } from 'lucide-react';

const SportsScreen = ({ onBack }: { onBack: () => void }) => {
  const rumahSukan = [
    { nama: 'BIRU', ketua: 'CIKGU ANIQ', markah: 1250, warna: 'bg-blue-600', juara: true },
    { nama: 'MERAH', ketua: 'CIKGU ZUL', markah: 1100, warna: 'bg-rose-600', juara: false },
    { nama: 'HIJAU', ketua: 'CIKGU SITI', markah: 1050, warna: 'bg-emerald-600', juara: false },
    { nama: 'KUNING', ketua: 'CIKGU AMIN', markah: 980, warna: 'bg-amber-500', juara: false },
  ];

  return (
    <div className="p-6 max-w-5xl mx-auto animate-in slide-in-from-bottom-4 duration-700">
      <div className="flex items-center justify-between mb-8">
        <button onClick={onBack} className="p-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all">
          <ChevronLeft size={20} />
        </button>
        <div className="text-right">
          <h2 className="text-3xl font-['Teko'] font-bold leading-none">SUKAN <span className="text-amber-500">TAHUNAN</span></h2>
          <p className="text-[8px] font-black opacity-40 tracking-[0.3em] uppercase">Pungutan Markah Rumah Sukan</p>
        </div>
      </div>

      {/* Grid Kad Kecil (Bukan Gajah!) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {rumahSukan.map((r, i) => (
          <div key={i} className={`relative overflow-hidden rounded-[2rem] border border-white/5 bg-white/5 p-5 transition-all hover:scale-105`}>
            {r.juara && (
              <div className="absolute top-3 right-3 text-amber-500 animate-bounce">
                <Star size={16} fill="currentColor" />
              </div>
            )}
            
            <div className={`${r.warna} w-10 h-10 rounded-xl flex items-center justify-center mb-4 shadow-lg`}>
              <Trophy size={18} className="text-white" />
            </div>

            <h3 className="text-lg font-['Teko'] font-bold tracking-widest">{r.nama}</h3>
            <div className="flex items-center gap-2 mb-3">
              <User size={10} className="text-slate-500" />
              <p className="text-[9px] font-bold text-slate-400 uppercase">{r.ketua}</p>
            </div>

            <div className="border-t border-white/5 pt-3">
              <p className="text-[8px] font-black opacity-30 uppercase tracking-widest">Markah Terkumpul</p>
              <p className={`text-2xl font-['Teko'] font-bold ${r.juara ? 'text-amber-500' : 'text-white'}`}>
                {r.markah}
              </p>
            </div>

            {r.juara && (
              <div className="mt-2 bg-amber-500/10 border border-amber-500/20 rounded-lg py-1 px-2">
                <p className="text-[7px] font-black text-amber-500 uppercase text-center tracking-widest italic">Juara Bertahan</p>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Tambah Fungsi Asal: Borang Input Markah (Kecilkan) */}
      <div className="mt-8 bg-white/5 border border-white/5 rounded-[2.5rem] p-6">
        <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-500 mb-4">Kemas Kini Markah Pantas</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <select className="bg-slate-900 border border-white/10 rounded-xl p-3 text-[10px] font-bold text-white outline-none">
            <option>PILIH RUMAH</option>
            <option>BIRU</option>
            <option>MERAH</option>
          </select>
          <input type="number" placeholder="JUMLAH MARKAH" className="bg-slate-900 border border-white/10 rounded-xl p-3 text-[10px] font-bold text-white outline-none" />
          <button className="bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all">Update Markah</button>
        </div>
      </div>
    </div>
  );
};

export default SportsScreen;