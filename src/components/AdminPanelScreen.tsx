import React, { useState, useEffect, useContext, useRef } from 'react';
import { studentDataService } from '../services/studentDataService';
import { NotifyContext } from '../App';
import { toPng } from 'html-to-image';
import { 
  ArrowLeft, Megaphone, Settings, PlusCircle, Sparkles, Trash, 
  Database, Download, AlertTriangle, Image as ImageIcon, Wand2, Type, 
  MessageCircle, ShieldCheck, BarChart3, LayoutDashboard,
  Zap, Palette, Tent, Moon, Gift, Coffee, Lock, Unlock, Cpu, Globe, 
  Share2, CheckCircle2 
} from 'lucide-react';

const AdminPanelScreen: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const notifyCtx = useContext(NotifyContext);
  const [activeModule, setActiveModule] = useState<'BULLETIN' | 'CONFIG' | 'SYSTEM'>('BULLETIN');
  const [bulletin, setBulletin] = useState('');
  const [posterTheme, setPosterTheme] = useState('cyber');
  const [posterFont, setPosterFont] = useState('font-["Teko"]');
  const [fontSize, setFontSize] = useState(24);
  const [currentMood, setCurrentMood] = useState('NORMAL');
  const [regOpen, setRegOpen] = useState(true);
  const [reportOpen, setReportOpen] = useState(true);
  const [localSuggestions, setLocalSuggestions] = useState<string[]>([]);
  const posterRef = useRef<HTMLDivElement>(null);

  useEffect(() => { 
    window.scrollTo(0, 0);
    const savedMsg = localStorage.getItem('RAK_ANNOUNCEMENT');
    if (savedMsg) setBulletin(savedMsg);
    const savedMood = localStorage.getItem('RAK_SYSTEM_MOOD');
    if (savedMood) setCurrentMood(savedMood);
    setRegOpen(localStorage.getItem('RAK_REG_STATUS') !== 'CLOSED');
    setReportOpen(localStorage.getItem('RAK_REPORT_STATUS') !== 'CLOSED');
    setLocalSuggestions(studentDataService.suggestions);
  }, []);

  const toggleStatus = (type: 'REG' | 'REPORT') => {
    const key = type === 'REG' ? 'RAK_REG_STATUS' : 'RAK_REPORT_STATUS';
    const current = type === 'REG' ? regOpen : reportOpen;
    const newState = !current ? 'OPEN' : 'CLOSED';
    if (type === 'REG') setRegOpen(!current); else setReportOpen(!current);
    localStorage.setItem(key, newState);
    notifyCtx?.notify(`${type === 'REG' ? 'Pendaftaran' : 'Laporan'}: ${newState}`, "info");
  };

  const downloadPoster = async () => {
    if (!posterRef.current) return;
    const loadId = notifyCtx?.notify("Melakar Grafik HD...", "loading");
    try {
      const dataUrl = await toPng(posterRef.current, { cacheBust: true, pixelRatio: 4 });
      const link = document.createElement('a');
      link.download = `POSTER_SKM_${Date.now()}.png`;
      link.href = dataUrl;
      link.click();
      if(loadId) notifyCtx?.removeNotify(loadId);
      notifyCtx?.notify("Imej HD Berjaya!", "success");
    } catch (err) {
      if(loadId) notifyCtx?.removeNotify(loadId);
      notifyCtx?.notify("Ralat grafik.", "error");
    }
  };

  const shareToWhatsApp = async () => {
    if (!posterRef.current) return;
    const loadId = notifyCtx?.notify("Menyiapkan Gambar & WhatsApp...", "loading");
    try {
      const dataUrl = await toPng(posterRef.current, { cacheBust: true, pixelRatio: 4 });
      const link = document.createElement('a');
      link.download = `HEBAHAN_SKM_${Date.now()}.png`;
      link.href = dataUrl;
      link.click();
      const waText = `*HEBAHAN RASMI UNIT KOKURIKULUM SKM*\n\n${bulletin}\n\n_Sila sertakan imej yang dimuat turun._`;
      window.open(`https://wa.me/?text=${encodeURIComponent(waText)}`, '_blank');
      if(loadId) notifyCtx?.removeNotify(loadId);
      notifyCtx?.notify("Imej sedia dipilh dalam WhatsApp!", "success");
    } catch (err) {
      if(loadId) notifyCtx?.removeNotify(loadId);
      notifyCtx?.notify("Ralat WhatsApp.", "error");
    }
  };

  const handleRemoveSuggestion = (s: string) => {
    const updated = localSuggestions.filter(item => item !== s);
    setLocalSuggestions(updated);
    studentDataService.removeSuggestion(s);
    notifyCtx?.notify("Kamus dikemaskini", "info");
  };

  const themes: any = {
    cyber: { bg: 'bg-slate-950', accent: 'text-blue-400', border: 'border-blue-500/30', gradient: 'from-blue-600/20 to-indigo-900/40', glow: 'bg-blue-500/20' },
    emerald: { bg: 'bg-slate-900', accent: 'text-emerald-400', border: 'border-emerald-500/30', gradient: 'from-emerald-600/20 to-teal-900/40', glow: 'bg-emerald-500/20' },
    gold: { bg: 'bg-stone-950', accent: 'text-amber-400', border: 'border-amber-500/30', gradient: 'from-amber-600/20 to-orange-900/40', glow: 'bg-amber-500/20' },
    rose: { bg: 'bg-zinc-950', accent: 'text-rose-400', border: 'border-rose-500/30', gradient: 'from-rose-600/20 to-purple-900/40', glow: 'bg-rose-500/20' }
  };

  const t = themes[posterTheme] || themes.cyber;

  return (
    <div className="w-full min-h-screen bg-[#020617] text-white font-['Manrope'] pb-40 overflow-y-auto">
      <div className="max-w-7xl mx-auto p-4 md:p-10 space-y-10">
        
        {/* HEADER */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8 animate-in fade-in duration-700">
          <div className="flex items-center gap-6">
            <button onClick={onBack} className="p-4 bg-white/5 rounded-3xl text-blue-500 border border-white/10 hover:bg-blue-600 transition-all active:scale-90">
              <ArrowLeft size={28}/>
            </button>
            <div>
              <h1 className="text-6xl md:text-8xl font-['Teko'] font-bold uppercase leading-none tracking-tighter italic">ADMIN <span className="text-blue-600">HQ</span></h1>
              <p className="text-[10px] font-black text-slate-500 tracking-[0.4em] uppercase mt-2 italic flex items-center gap-2">
                <ShieldCheck size={12} className="text-emerald-500 animate-pulse"/> SKeMe Commander HQ
              </p>
            </div>
          </div>

          <div className="flex bg-white/5 p-2 rounded-3xl border border-white/5 backdrop-blur-3xl overflow-x-auto no-scrollbar shadow-2xl">
            {[
              { id: 'BULLETIN', icon: Globe, label: 'Broadcast' },
              { id: 'CONFIG', icon: Cpu, label: 'Kamus' },
              { id: 'SYSTEM', icon: Settings, label: 'Kernel' }
            ].map((tab: any) => (
              <button key={tab.id} onClick={() => setActiveModule(tab.id)} className={`px-8 py-4 rounded-2xl text-[10px] font-black uppercase flex items-center gap-3 transition-all shrink-0 ${activeModule === tab.id ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-500 hover:text-white'}`}>
                <tab.icon size={16}/> {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* STATUS BAR */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 animate-in slide-in-from-bottom-4 duration-700">
          <div className="bg-white/5 border border-white/10 p-6 rounded-[2rem]">
            <Database size={16} className="text-blue-500 mb-3" />
            <p className="text-3xl font-['Teko'] font-bold leading-none">{studentDataService.getAllStudents().length} <span className="text-[10px] opacity-30 tracking-widest">MURID</span></p>
          </div>
          <div className="bg-white/5 border border-white/10 p-6 rounded-[2rem]">
            <BarChart3 size={16} className="text-emerald-500 mb-3" />
            <p className="text-3xl font-['Teko'] font-bold leading-none">{studentDataService.activityRecords.length} <span className="text-[10px] opacity-30 tracking-widest">REKOD</span></p>
          </div>
          <button onClick={() => toggleStatus('REG')} className={`p-6 rounded-[2rem] border transition-all flex items-center justify-between group ${regOpen ? 'bg-emerald-600/10 border-emerald-500 text-emerald-500' : 'bg-rose-600/10 border-rose-500 text-rose-500'}`}>
            <span className="text-[10px] font-black uppercase tracking-widest">Pendaftaran</span>
            {regOpen ? <Unlock size={20}/> : <Lock size={20}/>}
          </button>
          <button onClick={() => toggleStatus('REPORT')} className={`p-6 rounded-[2rem] border transition-all flex items-center justify-between group ${reportOpen ? 'bg-blue-600/10 border-blue-500 text-blue-500' : 'bg-rose-600/10 border-rose-500 text-rose-500'}`}>
            <span className="text-[10px] font-black uppercase tracking-widest">Laporan GURU</span>
            {reportOpen ? <CheckCircle2 size={20}/> : <AlertTriangle size={20}/>}
          </button>
        </div>

        {activeModule === 'BULLETIN' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 animate-in fade-in duration-700">
            <div className="space-y-6">
              
              <div className="bg-white/5 p-8 rounded-[3rem] border border-white/10 shadow-2xl">
                <h3 className="text-2xl font-['Teko'] font-bold text-white uppercase mb-6 flex items-center gap-3">
                  <Palette className="text-purple-500" /> Atmosphere Control
                </h3>
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                  {[
                    { id: 'NORMAL', icon: Zap, color: 'bg-blue-600' },
                    { id: 'SUKAN', icon: BarChart3, color: 'bg-rose-600' },
                    { id: 'KEM', icon: Tent, color: 'bg-emerald-700' },
                    { id: 'RAMADAN', icon: Moon, color: 'bg-indigo-900' },
                    { id: 'RAYA', icon: Gift, color: 'bg-green-600' },
                    { id: 'CUTI', icon: Coffee, color: 'bg-orange-500' },
                  ].map(m => (
                    <button key={m.id} onClick={() => { setCurrentMood(m.id); localStorage.setItem('RAK_SYSTEM_MOOD', m.id); notifyCtx?.notify(`Vibe: ${m.id}`, "info"); }} className={`flex flex-col items-center gap-2 p-3 rounded-2xl border transition-all ${currentMood === m.id ? 'border-white bg-white/10 scale-105 shadow-xl' : 'border-white/5 opacity-40 hover:opacity-100'}`}>
                      <div className={`p-2 rounded-lg ${m.color}`}><m.icon size={12}/></div>
                      <span className="text-[7px] font-black">{m.id}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="bg-white/5 p-8 rounded-[3rem] border border-white/10 shadow-2xl">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-3xl font-['Teko'] font-bold text-white uppercase flex items-center gap-3"><Type className="text-blue-500" /> Poster Engine</h3>
                  <button onClick={() => setBulletin("MAKLUMAN: PROGRAM KOKURIKULUM MINGGU INI DIJALANKAN MENGIKUT JADUAL.")} className="p-3 bg-blue-600/10 text-blue-500 rounded-xl hover:bg-blue-600 transition-all"><Wand2 size={20}/></button>
                </div>
                <textarea value={bulletin} onChange={e => setBulletin(e.target.value.toUpperCase())} className="w-full h-32 bg-black/40 border border-white/5 rounded-2xl p-6 text-xs font-bold text-white outline-none mb-6 resize-none focus:border-blue-500/50" placeholder="MASUKKAN TEKS..." />
                
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="flex flex-col gap-2">
                      <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest leading-none mb-1">Saiz Font: {fontSize}px</span>
                      <input type="range" min="14" max="48" value={fontSize} onChange={(e)=>setFontSize(parseInt(e.target.value))} className="w-full accent-blue-600 h-1.5 bg-white/10 rounded-lg cursor-pointer" />
                    </div>
                    <div className="flex flex-col gap-2">
                      <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest leading-none mb-1">Pilihan Warna Tema</span>
                      <div className="flex gap-2">
                        {Object.keys(themes).map(colorKey => (
                          <button key={colorKey} onClick={() => setPosterTheme(colorKey)} className={`w-8 h-8 rounded-full border-2 transition-all ${posterTheme === colorKey ? 'border-white scale-110 shadow-lg' : 'border-transparent opacity-50'} bg-${colorKey === 'gold' ? 'amber-500' : colorKey === 'rose' ? 'rose-600' : colorKey === 'emerald' ? 'emerald-500' : 'blue-600'}`} />
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {[
                      { id: 'font-["Teko"]', label: 'TACTICAL' },
                      { id: 'font-mono', label: 'SECRET TYPEWRITER' },
                      { id: 'font-["Manrope"]', label: 'CLEAN' }
                    ].map(f => (
                      <button key={f.id} onClick={()=>setPosterFont(f.id)} className={`px-4 py-2 rounded-xl text-[9px] font-black border transition-all ${posterFont === f.id ? 'bg-white text-black' : 'border-white/10 text-slate-500'}`}>{f.label}</button>
                    ))}
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <button onClick={downloadPoster} className="py-4 bg-white/5 border border-white/10 rounded-2xl text-[9px] font-black uppercase flex items-center justify-center gap-2 hover:bg-white/10 transition-all"><ImageIcon size={16}/> PNG</button>
                    <button onClick={shareToWhatsApp} className="py-4 bg-emerald-600 rounded-2xl text-[9px] font-black uppercase flex items-center justify-center gap-2 hover:bg-emerald-500 transition-all shadow-lg"><MessageCircle size={16}/> WA</button>
                    <button onClick={() => { localStorage.setItem('RAK_ANNOUNCEMENT', bulletin); notifyCtx?.notify("Hebahan Live!", "success"); }} className="py-4 bg-blue-600 rounded-2xl text-[9px] font-black uppercase flex items-center justify-center gap-2 shadow-xl hover:bg-blue-500 transition-all"><Share2 size={16}/> LIVE</button>
                  </div>
                </div>
              </div>
            </div>

            {/* LIVE PREVIEW (ANIMATED) */}
            <div className="flex flex-col items-center">
                <div 
                  ref={posterRef} 
                  className={`w-full max-w-[380px] aspect-[4/5] ${t.bg} rounded-[3.5rem] p-12 flex flex-col items-center text-center shadow-2xl relative overflow-hidden border ${t.border}`}
                >
                    <div className="absolute top-6 left-6 w-8 h-8 border-t-2 border-l-2 border-white/20 rounded-tl-xl animate-pulse" />
                    <div className="absolute top-6 right-6 w-8 h-8 border-t-2 border-r-2 border-white/20 rounded-tr-xl animate-pulse" />
                    <div className="absolute bottom-6 left-6 w-8 h-8 border-b-2 border-l-2 border-white/20 rounded-bl-xl animate-pulse" />
                    <div className="absolute bottom-6 right-6 w-8 h-8 border-b-2 border-r-2 border-white/20 rounded-br-xl animate-pulse" />
                    
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/[0.05] to-transparent h-32 w-full animate-scan pointer-events-none" />
                    <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 ${t.glow} rounded-full blur-[100px] animate-pulse-slow pointer-events-none`} />

                    <div className="relative z-10 w-full mb-6">
                        <div className="bg-white text-black px-4 py-1.5 rounded-full text-[8px] font-black tracking-[0.4em] inline-block mb-6 shadow-xl animate-bounce-slow">RASMI</div>
                        <h2 className="text-white text-5xl font-['Teko'] font-bold leading-[0.8] uppercase tracking-tighter">SK MENERONG</h2>
                        <p className={`text-[11px] font-black uppercase tracking-[0.4em] mt-1 ${t.accent} opacity-90 font-['Manrope']`}>Unit Kokurikulum</p>
                    </div>

                    <div className="relative z-10 w-full flex-1 flex items-center justify-center px-4">
                        <p style={{ fontSize: `${fontSize}px` }} className={`text-white font-bold uppercase leading-tight tracking-wide drop-shadow-[0_5px_15px_rgba(0,0,0,0.5)] italic ${posterFont} transition-all`}>
                            {bulletin || 'SILA MASUKKAN DATA...'}
                        </p>
                    </div>

                    <div className="relative z-10 w-full pt-6 border-t border-white/10 text-white/30 text-[9px] font-black uppercase tracking-[0.2em] font-mono">
                      INTEL BROADCAST • {new Date().toLocaleDateString('ms-MY', { day:'numeric', month:'long', year:'numeric' }).toUpperCase()}
                    </div>
                </div>
                <div className="mt-4 flex items-center gap-3 opacity-50">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-ping" />
                  <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest italic">Encrypted Intelligence Preview</p>
                </div>
            </div>
          </div>
        )}

        {activeModule === 'CONFIG' && (
           <div className="bg-white/5 p-10 rounded-[3.5rem] border border-white/10 animate-in slide-in-from-right-10 duration-500">
              <h3 className="text-3xl font-['Teko'] font-bold uppercase mb-8 flex items-center gap-3 tracking-widest text-amber-500"><Sparkles size={24}/> Logic Library</h3>
              <div className="flex flex-col sm:flex-row gap-3 mb-10">
                <input id="newSug" placeholder="AKTIVITI BARU..." className="flex-1 bg-black/40 border border-white/10 rounded-2xl px-6 py-5 text-[11px] font-black uppercase outline-none focus:border-amber-500" />
                <button onClick={() => {
                  const el = document.getElementById('newSug') as HTMLInputElement;
                  if(el.value) { studentDataService.addSuggestion(el.value); setLocalSuggestions([...studentDataService.suggestions]); el.value=''; notifyCtx?.notify("Kamus ditambah!", "success"); }
                }} className="bg-amber-600 hover:bg-amber-500 px-10 py-5 rounded-2xl text-[11px] font-black uppercase shadow-lg transition-all">Tambah Data</button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {localSuggestions.map((s: string) => (
                  <div key={s} className="bg-white/5 border border-white/5 p-5 rounded-2xl flex items-center justify-between group hover:bg-rose-600/10 transition-all">
                    <span className="text-[10px] font-bold text-slate-300 uppercase truncate pr-4">{s}</span>
                    <button onClick={() => handleRemoveSuggestion(s)} className="text-slate-600 hover:text-rose-500 transition-colors"><Trash size={16}/></button>
                  </div>
                ))}
              </div>
           </div>
        )}

        {activeModule === 'SYSTEM' && (
           <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-in zoom-in-95 duration-500">
              <div className="bg-white/5 p-10 rounded-[3.5rem] border border-white/10">
                <h3 className="text-3xl font-['Teko'] font-bold uppercase mb-4 text-emerald-500 flex items-center gap-3 tracking-widest"><Database size={24} /> Backup Kernel</h3>
                <button onClick={() => {
                  const d = localStorage.getItem('RAK_MASTER_DB');
                  if(d){const blob=new Blob([d],{type:'application/json'}); const a=document.createElement('a'); a.href=URL.createObjectURL(blob); a.download=`BACKUP_INTEL.json`; a.click(); notifyCtx?.notify("Export Berjaya!", "success");}
                }} className="w-full py-6 bg-emerald-600 hover:bg-emerald-500 rounded-3xl text-[11px] font-black uppercase shadow-xl transition-all">Export .JSON</button>
              </div>
              <div className="bg-rose-600/5 p-10 rounded-[3.5rem] border border-rose-500/10">
                <h3 className="text-3xl font-['Teko'] font-bold uppercase mb-4 text-rose-500 flex items-center gap-3 tracking-widest"><AlertTriangle size={24} /> Reset Kernel</h3>
                <button onClick={() => { if(window.confirm("RESET SEMUA?")){localStorage.clear(); window.location.reload();} }} className="w-full py-6 bg-rose-600 hover:bg-rose-500 rounded-3xl text-[11px] font-black uppercase shadow-xl transition-all">Format HQ</button>
              </div>
           </div>
        )}
      </div>

      <style>{`
        @keyframes scan { 0% { transform: translateY(-150%); } 100% { transform: translateY(300%); } }
        @keyframes pulse-slow { 0%, 100% { opacity: 0.2; transform: translate(-50%, -50%) scale(1); } 50% { opacity: 0.5; transform: translate(-50%, -50%) scale(1.1); } }
        @keyframes bounce-slow { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-5px); } }
        .animate-scan { animation: scan 4s linear infinite; }
        .animate-pulse-slow { animation: pulse-slow 5s ease-in-out infinite; }
        .animate-bounce-slow { animation: bounce-slow 3s ease-in-out infinite; }
      `}</style>
    </div>
  );
};

export default AdminPanelScreen;