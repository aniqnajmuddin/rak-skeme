import React, { useState, useRef, useEffect } from 'react';
import { 
  ArrowLeft, Upload, Image as ImageIcon, Trash2, RefreshCw, Layers, 
  Lock, Unlock, Download, Palette, Layout, FileText, Grid, Type, Minus, Plus, 
  ChevronRight, ChevronLeft, CreditCard, Briefcase, Star, GitCommit, Share2,
  Hexagon, Columns, CircleDot, Sidebar as SidebarIcon, Table
} from 'lucide-react';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

// --- KOMPONEN EDITABLE TEXT (RESPONSIVE) ---
const EditableText = ({ val, setVal, className = "", multi = false, style, placeholder, fontSize = 11 }: any) => {
    const baseClass = `w-full bg-transparent border border-dashed border-transparent hover:border-slate-400 focus:border-blue-500 rounded px-1 outline-none transition-all text-slate-900 ${className}`;
    const dynamicStyle = { ...style, fontSize: `${fontSize}px`, lineHeight: '1.4' };

    if (multi) {
        return (
            <textarea 
                value={val} 
                onChange={e => setVal(e.target.value)} 
                className={`${baseClass} resize-none block h-full w-full`}
                style={dynamicStyle} 
                placeholder={placeholder}
            />
        );
    }
    return (
        <input 
            value={val} 
            onChange={e => setVal(e.target.value)} 
            className={baseClass}
            style={dynamicStyle} 
            placeholder={placeholder}
        />
    );
};

const LogoBox = ({src, text}: {src: string|null, text: string}) => (
    <div className="w-full h-full flex items-center justify-center overflow-hidden bg-white/90 backdrop-blur-sm border border-slate-200 rounded-lg shadow-sm">
        {src ? <img src={src} className="w-full h-full object-contain" alt="logo"/> : <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest text-center px-1">{text}</span>}
    </div>
);

type TemplateType = 'CARDS_UI' | 'BENTO_GRID' | 'OFFICIAL_GOVT';

const ReportGeneratorScreen: React.FC<{onBack: () => void, isDarkMode: boolean}> = ({ onBack, isDarkMode }) => {
  // --- DATA STATE ---
  const [title, setTitle] = useState('LAPORAN AKTIVITI KOKURIKULUM');
  const [date, setDate] = useState('12 JANUARI 2026');
  const [venue, setVenue] = useState('DEWAN PERDANA SK MENERONG');
  const [content, setContent] = useState({
    objectives: '1. Memperkasa potensi kepimpinan murid.\n2. Membina disiplin tinggi.',
    summary: 'Program berjalan lancar dengan penyertaan aktif murid. Objektif tercapai 100%.',
    strengths: 'Komitmen guru tinggi.',
    weaknesses: 'Kekangan masa.'
  });
  const [preparedBy, setPreparedBy] = useState('SETIAUSAHA KOKURIKULUM');
  const [images, setImages] = useState<string[]>([]);
  const [schoolLogo, setSchoolLogo] = useState<string | null>(null);
  const [kpmLogo, setKpmLogo] = useState<string | null>(null);

  // --- UI CONTROL (DYNAMIC SCALING) ---
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateType>('CARDS_UI');
  const [themeColor, setThemeColor] = useState('#1e3a8a'); 
  const [fontSize, setFontSize] = useState(11); 
  const [isGenerating, setIsGenerating] = useState(false);
  const [isLocked, setIsLocked] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth > 1024);
  const [scale, setScale] = useState(1);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const printRef = useRef<HTMLDivElement>(null);

  // LOGIK AUTO-SCALE: Kecilkan A4 ikut tinggi skrin desktop
  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      
      if (width < 768) { // Mobile
        setScale((width * 0.95) / 794); 
      } else { // Desktop - Fit to height
        const sidebarW = isSidebarOpen ? 320 : 0;
        const availW = width - sidebarW - 60;
        const availH = height - 120;
        const scaleW = availW / 794;
        const scaleH = availH / 1123;
        setScale(Math.min(scaleW, scaleH, 0.9)); // Max scale 0.9 di desktop
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isSidebarOpen]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newImages = Array.from(e.target.files).map(file => URL.createObjectURL(file));
      setImages(prev => [...prev, ...newImages].slice(0, 6)); 
    }
  };

  const handleDownloadPDF = async () => {
    if (!printRef.current || isGenerating) return;
    setIsGenerating(true);
    try {
        const element = printRef.current;
        element.style.display = 'block'; 
        const canvas = await html2canvas(element, { scale: 2, useCORS: true });
        element.style.display = 'none';
        const imgData = canvas.toDataURL('image/jpeg', 0.95);
        const pdf = new jsPDF('p', 'mm', 'a4');
        pdf.addImage(imgData, 'JPEG', 0, 0, 210, 297);
        pdf.save(`Laporan_${date}.pdf`);
    } catch (err) { console.error(err); } finally { setIsGenerating(false); }
  };

  const renderTemplate = () => {
    const base = "w-[794px] h-[1123px] bg-white shadow-2xl overflow-hidden flex flex-col mx-auto shrink-0 transition-all duration-500";
    const bgStyle = { backgroundImage: `linear-gradient(135deg, ${themeColor}08 0%, #ffffff 50%, ${themeColor}08 100%)` };

    return (
        <div className={base} style={bgStyle}>
            <div className="p-10 h-full flex flex-col relative">
                {/* Header */}
                <div className="flex items-center justify-between border-b-2 pb-3 mb-4 shrink-0" style={{ borderColor: themeColor }}>
                    <div className="w-16 h-16"><LogoBox src={schoolLogo} text="LOGO"/></div>
                    <div className="text-center px-4">
                        <h1 className="text-xl font-black uppercase leading-none" style={{ color: themeColor }}>SEKOLAH KEBANGSAAN MENERONG</h1>
                        <p className="text-[10px] font-bold uppercase tracking-widest mt-1 text-slate-500">Laporan Aktiviti Kokurikulum</p>
                    </div>
                    <div className="w-16 h-16"><LogoBox src={kpmLogo} text="KPM"/></div>
                </div>

                {/* Title Section */}
                <div className="grid grid-cols-3 gap-4 mb-4 relative z-10">
                    <div className="col-span-2 bg-white p-4 rounded-xl border-l-4 shadow-sm" style={{borderColor: themeColor}}>
                        <h6 className="text-[8px] font-bold text-slate-400 uppercase">Tajuk Program</h6>
                        <EditableText val={title} setVal={setTitle} className="font-black text-xl uppercase" style={{color: themeColor}}/>
                    </div>
                    <div className="bg-white p-4 rounded-xl border shadow-sm flex flex-col justify-center">
                        <h6 className="text-[8px] font-bold text-slate-400 uppercase">Tarikh</h6>
                        <EditableText val={date} setVal={setDate} className="font-bold text-sm"/>
                    </div>
                </div>

                {/* Content */}
                <div className="grid grid-cols-2 gap-4 flex-1 overflow-hidden relative z-10">
                    <div className="flex flex-col gap-4">
                        <div className="bg-white p-5 rounded-xl border flex-1 flex flex-col shadow-sm">
                            <h3 className="font-bold uppercase text-[10px] text-slate-400 border-b pb-2 mb-2">Objektif</h3>
                            <EditableText val={content.objectives} setVal={(v:any)=>setContent({...content,objectives:v})} fontSize={fontSize} multi/>
                        </div>
                        <div className="bg-white p-5 rounded-xl border flex-1 flex flex-col shadow-sm">
                            <h3 className="font-bold uppercase text-[10px] text-slate-400 border-b pb-2 mb-2">Rumusan</h3>
                            <EditableText val={content.summary} setVal={(v:any)=>setContent({...content,summary:v})} fontSize={fontSize} multi/>
                        </div>
                    </div>
                    <div className="bg-white p-5 rounded-xl border flex flex-col shadow-sm">
                        <h3 className="font-bold uppercase text-[10px] text-slate-400 border-b pb-2 mb-4">Galeri Aktiviti</h3>
                        <div className="grid grid-cols-2 gap-2 mb-auto">
                            {images.slice(0,4).map((img, i) => <div key={i} className="aspect-square rounded-lg overflow-hidden border-2 border-white shadow-sm"><img src={img} className="w-full h-full object-cover"/></div>)}
                        </div>
                        {images.length === 0 && <div className="h-40 flex items-center justify-center bg-slate-50 border-2 border-dashed border-slate-200 rounded-xl text-slate-400 text-[10px] italic">Upload gambar aktiviti...</div>}
                    </div>
                </div>

                {/* Footer */}
                <div className="mt-auto pt-4 border-t flex justify-end shrink-0 border-slate-200">
                    <div className="w-64 text-right">
                        <p className="text-[9px] font-bold uppercase mb-6 text-slate-400">Disediakan Oleh:</p>
                        <EditableText val={preparedBy} setVal={setPreparedBy} className="font-bold uppercase text-xs text-right text-slate-900"/>
                        <div className="h-0.5 w-full mt-1 bg-slate-900"></div>
                    </div>
                </div>
            </div>
        </div>
    );
  };

  return (
    <div className={`h-screen flex flex-col ${isDarkMode ? 'bg-[#0F172A]' : 'bg-slate-50'} overflow-hidden relative`}>
      
      {/* NAVBAR */}
      <nav className="h-14 bg-slate-900 border-b border-slate-800 flex items-center justify-between px-4 shrink-0 z-[1001] shadow-2xl">
        <div className="flex items-center gap-3">
             <button onClick={onBack} className="w-9 h-9 rounded-full bg-slate-800 flex items-center justify-center text-white hover:bg-slate-700 active:scale-90 transition-all"><ArrowLeft size={18}/></button>
             <h1 className="text-white font-['Teko'] text-xl uppercase tracking-wider hidden sm:block">RAK <span className="text-amber-500">Designer</span></h1>
        </div>
        
        <div className="flex items-center gap-2">
             <button onClick={() => setIsLocked(!isLocked)} className={`px-3 py-1.5 rounded-lg font-bold uppercase text-[10px] flex items-center gap-2 transition-all ${isLocked ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-900/20' : 'bg-slate-800 text-slate-400'}`}>
                {isLocked ? <Lock size={14}/> : <Unlock size={14}/>} {isLocked ? 'Preview' : 'Edit'}
             </button>
             <button onClick={handleDownloadPDF} disabled={isGenerating} className="px-4 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-bold uppercase text-[10px] flex items-center gap-2 shadow-lg shadow-blue-900/20 active:scale-95 transition-all">
                {isGenerating ? <RefreshCw className="animate-spin" size={14}/> : <Download size={14}/>} PDF
             </button>
        </div>
      </nav>

      <div className="flex flex-1 overflow-hidden relative">
        
        {/* SIDEBAR (Adaptive) */}
        <aside className={`
            ${isSidebarOpen ? 'w-full md:w-80' : 'w-0 -translate-x-full'}
            absolute md:relative z-[1000] h-full bg-slate-900/95 md:bg-slate-900 backdrop-blur-xl border-r border-slate-800 transition-all duration-300 ease-out
            overflow-y-auto custom-scrollbar p-6
        `}>
            {/* Butang Tutup Mobile */}
            <button onClick={() => setIsSidebarOpen(false)} className="md:hidden absolute top-4 right-4 text-slate-400"><ChevronLeft size={24}/></button>

            <div className="space-y-6 pb-20">
                <div className="glass-input p-4 rounded-xl">
                    <label className="text-[10px] font-black text-slate-500 uppercase mb-3 flex items-center gap-2"><Type size={14}/> Saiz Tulisan</label>
                    <div className="flex items-center justify-between bg-slate-900 rounded-lg p-1">
                        <button onClick={() => setFontSize(Math.max(8, fontSize - 1))} className="w-8 h-8 flex items-center justify-center hover:bg-slate-700 rounded text-slate-300"><Minus size={14}/></button>
                        <span className="text-xs font-bold text-white font-mono">{fontSize}px</span>
                        <button onClick={() => setFontSize(Math.min(16, fontSize + 1))} className="w-8 h-8 flex items-center justify-center hover:bg-slate-700 rounded text-slate-300"><Plus size={14}/></button>
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase flex items-center gap-2"><Layers size={14}/> Template Gaya</label>
                    <button onClick={() => setSelectedTemplate('CARDS_UI')} className={`w-full p-3 rounded-xl border text-[10px] font-bold uppercase text-left flex items-center gap-3 transition-all ${selectedTemplate === 'CARDS_UI' ? 'bg-blue-600 border-blue-500 text-white shadow-xl shadow-blue-900/20' : 'bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-700'}`}><CreditCard size={16}/> Cards Premium</button>
                </div>

                <div>
                    <label className="text-[10px] font-black text-slate-500 uppercase mb-3 flex items-center gap-2"><Palette size={14}/> Warna Tema</label>
                    <div className="flex gap-2 flex-wrap">
                        {['#1e3a8a', '#b91c1c', '#047857', '#d97706', '#7e22ce', '#000000'].map(c => (
                            <button key={c} onClick={() => setThemeColor(c)} className={`w-7 h-7 rounded-full border-2 transition-transform hover:scale-125 ${themeColor === c ? 'border-white scale-110 shadow-lg shadow-black/50' : 'border-transparent opacity-40 hover:opacity-100'}`} style={{backgroundColor: c}}/>
                        ))}
                    </div>
                </div>

                <div>
                    <label className="text-[10px] font-black text-slate-500 uppercase mb-3 flex items-center gap-2"><ImageIcon size={14}/> Gambar ({images.length}/6)</label>
                    <div className="grid grid-cols-3 gap-2 mb-4">
                        {images.map((img, i) => (
                            <div key={i} className="aspect-square relative group rounded-lg overflow-hidden border border-slate-700 shadow-md transition-all hover:scale-105">
                                <img src={img} className="w-full h-full object-cover"/>
                                <button onClick={() => setImages(images.filter((_, idx) => idx !== i))} className="absolute inset-0 bg-red-600/80 hidden group-hover:flex items-center justify-center text-white"><Trash2 size={16}/></button>
                            </div>
                        ))}
                        {images.length < 6 && (
                            <button onClick={() => fileInputRef.current?.click()} className="aspect-square border-2 border-dashed border-slate-700 rounded-lg flex items-center justify-center text-slate-500 hover:text-white hover:border-slate-500 bg-slate-800/30 transition-all"><Plus size={20}/></button>
                        )}
                    </div>
                    <input type="file" ref={fileInputRef} multiple className="hidden" accept="image/*" onChange={handleImageUpload}/>
                </div>
                
                <div className="grid grid-cols-2 gap-2 pt-2">
                    <button className="bg-slate-800 p-3 rounded-xl text-[9px] text-slate-400 uppercase border border-slate-700 hover:bg-slate-700 font-bold transition-all" onClick={() => document.getElementById('sl-upload')?.click()}>Logo Sek</button>
                    <button className="bg-slate-800 p-3 rounded-xl text-[9px] text-slate-400 uppercase border border-slate-700 hover:bg-slate-700 font-bold transition-all" onClick={() => document.getElementById('kpm-upload')?.click()}>Logo KPM</button>
                    <input id="sl-upload" type="file" className="hidden" onChange={(e) => e.target.files && setSchoolLogo(URL.createObjectURL(e.target.files[0]))}/>
                    <input id="kpm-upload" type="file" className="hidden" onChange={(e) => e.target.files && setKpmLogo(URL.createObjectURL(e.target.files[0]))}/>
                </div>
            </div>
        </aside>

        {/* TOGGLE SIDEBAR BUTTON (DESKTOP) */}
        <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="hidden md:flex absolute left-0 top-1/2 -translate-y-1/2 z-[1001] bg-slate-900 border border-slate-800 text-white p-1 rounded-r-xl shadow-xl hover:bg-slate-800 transition-all">
            {isSidebarOpen ? <ChevronLeft size={20}/> : <ChevronRight size={20}/>}
        </button>

        {/* MAIN PREVIEW AREA */}
        <main className="flex-1 relative bg-slate-900/10 flex items-start justify-center overflow-auto p-4 md:p-8 no-scrollbar scroll-smooth">
            {!isSidebarOpen && <button onClick={() => setIsSidebarOpen(true)} className="md:hidden absolute top-4 left-4 z-50 bg-slate-900 p-2 rounded-lg text-white shadow-lg"><Layers size={20}/></button>}

            <div 
                className="transition-transform duration-500 ease-out origin-top shadow-[0_0_100px_rgba(0,0,0,0.4)] mb-32"
                style={{ transform: `scale(${scale})` }}
            >
                {renderTemplate()}
            </div>
        </main>
      </div>

      {/* PRINT ENGINE */}
      <div style={{ position: 'absolute', top: -9999, left: -9999 }}>
        <div ref={printRef} style={{ width: '794px', height: '1123px', backgroundColor: 'white' }}>
            {renderTemplate()}
        </div>
      </div>
    </div>
  );
};

export default ReportGeneratorScreen;