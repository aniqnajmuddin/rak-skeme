import React, { useState, useRef, useEffect } from 'react';
import { 
  ArrowLeft, Upload, Image as ImageIcon, Trash2, RefreshCw, Layers, 
  Lock, Unlock, Download, Palette, Layout, FileText, Grid, Type, Minus, Plus, 
  ChevronRight, ChevronLeft, CreditCard, Briefcase, Star, GitCommit, Share2,
  Hexagon, Columns, CircleDot, Sidebar as SidebarIcon, Table, Info, Target, TrendingUp
} from 'lucide-react';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

// --- KOMPONEN BANTUAN ---
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

type TemplateType = 'CARDS_UI' | 'INFOGRAPHIC_PRO' | 'MAGAZINE_STYLE' | 'OFFICIAL_GOVT';

const ReportGeneratorScreen: React.FC<{onBack: () => void, isDarkMode: boolean}> = ({ onBack, isDarkMode }) => {
  const [title, setTitle] = useState('LAPORAN AKTIVITI KOKURIKULUM');
  const [date, setDate] = useState('12 JANUARI 2026');
  const [venue, setVenue] = useState('DEWAN PERDANA SK MENERONG');
  const [content, setContent] = useState({
    objectives: '1. Memperkasa potensi kepimpinan murid.\n2. Membina disiplin tinggi.',
    summary: 'Program berjalan lancar dengan penyertaan aktif murid. Objektif tercapai 100%. Murid menunjukkan minat yang sangat mendalam dalam setiap modul yang disediakan.',
    strengths: 'Komitmen guru tinggi.',
    weaknesses: 'Kekangan masa.'
  });
  const [preparedBy, setPreparedBy] = useState('SETIAUSAHA KOKURIKULUM');
  const [images, setImages] = useState<string[]>([]);
  const [schoolLogo, setSchoolLogo] = useState<string | null>(null);
  const [kpmLogo, setKpmLogo] = useState<string | null>(null);

  const [selectedTemplate, setSelectedTemplate] = useState<TemplateType>('CARDS_UI');
  const [themeColor, setThemeColor] = useState('#1e3a8a'); 
  const [fontSize, setFontSize] = useState(11); 
  const [isGenerating, setIsGenerating] = useState(false);
  const [isLocked, setIsLocked] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth > 1024);
  const [scale, setScale] = useState(1);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const printRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      if (width < 768) setScale((width * 0.9) / 794); 
      else {
        const targetScale = ((height - 150) / 1123);
        setScale(Math.min(targetScale, 0.9)); 
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

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
        pdf.save(`Laporan_RAK_${date}.pdf`);
    } catch (err) { console.error(err); } finally { setIsGenerating(false); }
  };

  const StandardHeader = ({center=false}) => (
    <div className={`flex items-center ${center ? 'justify-center text-center flex-col gap-1' : 'justify-between'} border-b-2 pb-3 mb-4 shrink-0`} style={{ borderColor: themeColor }}>
        {!center && <div className="w-14 h-14"><LogoBox src={schoolLogo} text="LOGO"/></div>}
        <div className={center ? 'text-center' : ''}>
            <h1 className="text-lg font-black uppercase leading-none" style={{ color: themeColor }}>SEKOLAH KEBANGSAAN MENERONG</h1>
            <p className="text-[9px] font-bold uppercase tracking-widest mt-1 text-slate-500">Laporan Aktiviti Kokurikulum</p>
        </div>
        {!center && <div className="w-14 h-14"><LogoBox src={kpmLogo} text="KPM"/></div>}
    </div>
  );

  const StandardFooter = () => (
    <div className="mt-auto pt-2 border-t flex justify-end shrink-0 border-slate-200">
        <div className="w-56 text-right">
            <p className="text-[9px] font-bold uppercase mb-4 text-slate-400">Disediakan Oleh:</p>
            <EditableText val={preparedBy} setVal={setPreparedBy} className="font-bold uppercase text-xs text-right text-slate-900"/>
            <div className="h-0.5 w-full mt-1 bg-slate-900"></div>
        </div>
    </div>
  );

  const renderTemplate = () => {
    const base = "w-[794px] h-[1123px] bg-white shadow-2xl overflow-hidden flex flex-col mx-auto shrink-0";
    const bgStyle = { backgroundImage: `linear-gradient(135deg, ${themeColor}08 0%, #ffffff 50%, ${themeColor}08 100%)` };

    switch(selectedTemplate) {
        // --- TEMPLATE 1: CARDS UI ---
        case 'CARDS_UI': return (
            <div className={base} style={bgStyle}>
                <div className="p-10 h-full flex flex-col relative">
                    <StandardHeader />
                    <div className="grid grid-cols-3 gap-4 mb-4">
                        <div className="col-span-2 bg-white p-4 rounded-xl border-l-4 shadow-sm" style={{borderColor: themeColor}}>
                            <h6 className="text-[8px] font-bold text-slate-400 uppercase">Tajuk Program</h6>
                            <EditableText val={title} setVal={setTitle} className="font-black text-xl uppercase" style={{color: themeColor}}/>
                        </div>
                        <div className="bg-white p-4 rounded-xl border shadow-sm flex flex-col justify-center">
                            <h6 className="text-[8px] font-bold text-slate-400 uppercase">Tarikh</h6>
                            <EditableText val={date} setVal={setDate} className="font-bold text-sm"/>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4 flex-1 overflow-hidden">
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
                            <div className="grid grid-cols-2 gap-2">
                                {images.slice(0,4).map((img, i) => <div key={i} className="aspect-square rounded-lg overflow-hidden border-2 border-white shadow-sm"><img src={img} className="w-full h-full object-cover"/></div>)}
                            </div>
                        </div>
                    </div>
                    <StandardFooter />
                </div>
            </div>
        );

        // --- TEMPLATE 2: INFOGRAPHIC PRO ---
        case 'INFOGRAPHIC_PRO': return (
            <div className={base} style={{backgroundColor: '#f8fafc'}}>
                <div className="h-full flex flex-col">
                    <div className="p-8 text-white flex justify-between items-center" style={{backgroundColor: themeColor}}>
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-white rounded-lg p-1"><LogoBox src={schoolLogo} text="L"/></div>
                            <div>
                                <EditableText val={title} setVal={setTitle} className="font-black text-2xl text-white uppercase leading-none"/>
                                <p className="text-[10px] opacity-80 mt-1 uppercase font-bold tracking-widest">{date} • {venue}</p>
                            </div>
                        </div>
                        <div className="w-12 h-12 bg-white/20 rounded-lg p-1 backdrop-blur"><LogoBox src={kpmLogo} text="K"/></div>
                    </div>
                    
                    <div className="p-8 flex-1 grid grid-cols-12 gap-6">
                        <div className="col-span-4 space-y-6">
                            <div className="bg-white p-5 rounded-2xl shadow-sm border-t-4" style={{borderColor: themeColor}}>
                                <div className="flex items-center gap-2 mb-3 text-slate-400"><Target size={18}/><h4 className="font-black text-xs uppercase">Objektif</h4></div>
                                <EditableText val={content.objectives} setVal={(v:any)=>setContent({...content,objectives:v})} fontSize={fontSize} multi/>
                            </div>
                            <div className="bg-white p-5 rounded-2xl shadow-sm border-t-4" style={{borderColor: themeColor}}>
                                <div className="flex items-center gap-2 mb-3 text-slate-400"><TrendingUp size={18}/><h4 className="font-black text-xs uppercase">Impak</h4></div>
                                <EditableText val={content.summary} setVal={(v:any)=>setContent({...content,summary:v})} fontSize={fontSize} multi/>
                            </div>
                        </div>
                        <div className="col-span-8 flex flex-col gap-6">
                            <div className="bg-white p-6 rounded-2xl shadow-sm flex-1">
                                <h4 className="font-black text-xs uppercase text-slate-400 mb-4 flex items-center gap-2"><ImageIcon size={18}/> Dokumentasi Visual</h4>
                                <div className="grid grid-cols-2 gap-4 h-[500px]">
                                    {images.slice(0,2).map((img, i) => (
                                        <div key={i} className="rounded-2xl overflow-hidden shadow-md border-4 border-slate-50">
                                            <img src={img} className="w-full h-full object-cover"/>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="px-8 pb-8"><StandardFooter /></div>
                </div>
            </div>
        );

        // --- TEMPLATE 3: MAGAZINE STYLE ---
        case 'MAGAZINE_STYLE': return (
            <div className={base} style={{backgroundColor: '#ffffff'}}>
                <div className="relative h-[450px] w-full bg-slate-900">
                    {images[0] ? <img src={images[0]} className="w-full h-full object-cover opacity-70"/> : <div className="w-full h-full flex items-center justify-center text-white/20 font-black text-4xl">GAMBAR UTAMA</div>}
                    <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-transparent"></div>
                    <div className="absolute bottom-0 left-0 p-12 w-full">
                        <div className="flex gap-4 mb-4">
                            <div className="w-12 h-12 bg-white p-1 rounded shadow-xl"><LogoBox src={schoolLogo} text="S"/></div>
                            <div className="w-12 h-12 bg-white p-1 rounded shadow-xl"><LogoBox src={kpmLogo} text="K"/></div>
                        </div>
                        <EditableText val={title} setVal={setTitle} className="text-5xl font-black text-slate-900 leading-none mb-2 uppercase tracking-tighter"/>
                        <p className="text-slate-600 font-bold uppercase tracking-[0.3em] text-sm">{date} — {venue}</p>
                    </div>
                </div>
                <div className="p-12 flex-1 flex gap-10">
                    <div className="w-2/3">
                        <h3 className="text-xs font-black text-slate-400 uppercase mb-4 border-b-2 pb-2 inline-block" style={{borderColor: themeColor}}>Laporan Eksekutif</h3>
                        <div className="columns-1 gap-8">
                            <EditableText val={content.summary} setVal={(v:any)=>setContent({...content,summary:v})} fontSize={fontSize + 2} multi className="text-slate-800 leading-relaxed first-letter:text-5xl first-letter:font-black first-letter:mr-2 first-letter:float-left"/>
                        </div>
                    </div>
                    <div className="w-1/3 flex flex-col gap-6">
                        <div className="bg-slate-50 p-6 rounded-tr-[3rem] border-r-4" style={{borderColor: themeColor}}>
                            <h4 className="text-[10px] font-black uppercase text-slate-400 mb-2">Matlamat</h4>
                            <EditableText val={content.objectives} setVal={(v:any)=>setContent({...content,objectives:v})} fontSize={fontSize} multi/>
                        </div>
                        <div className="grid grid-cols-1 gap-4">
                            {images.slice(1,3).map((img, i) => <img key={i} src={img} className="w-full h-40 object-cover rounded-2xl shadow-lg grayscale hover:grayscale-0 transition-all cursor-pointer"/>)}
                        </div>
                    </div>
                </div>
                <div className="px-12 pb-8 flex justify-between items-end">
                    <div className="text-[10px] font-bold text-slate-300 uppercase">RAK Designer • SKeMe SK Menerong</div>
                    <StandardFooter />
                </div>
            </div>
        );

        default: return <div className={base}><div className="p-10"><StandardHeader /></div></div>;
    }
  };

  return (
    <div className={`h-screen flex flex-col ${isDarkMode ? 'bg-[#0F172A]' : 'bg-slate-100'} overflow-hidden relative`}>
      <nav className="h-14 bg-slate-900 border-b border-slate-800 flex items-center justify-between px-4 shrink-0 z-[1001]">
        <div className="flex items-center gap-3">
             <button onClick={onBack} className="w-9 h-9 rounded-full bg-slate-800 flex items-center justify-center text-white hover:bg-slate-700 active:scale-90 transition-all"><ArrowLeft size={18}/></button>
             <h1 className="text-white font-['Teko'] text-xl md:text-2xl uppercase tracking-wider hidden xs:block">RAK <span className="text-amber-500">Designer</span></h1>
        </div>
        <div className="flex items-center gap-2">
             <button onClick={() => setIsLocked(!isLocked)} className={`px-3 py-1.5 rounded-lg font-bold uppercase text-[10px] flex items-center gap-2 transition-all ${isLocked ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-slate-400'}`}>
                {isLocked ? <Lock size={14}/> : <Unlock size={14}/>} <span className="hidden sm:inline">{isLocked ? 'Pratonton' : 'Edit'}</span>
             </button>
             <button onClick={handleDownloadPDF} disabled={isGenerating} className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-bold uppercase text-[10px] flex items-center gap-2 shadow-lg active:scale-95 transition-all">
                {isGenerating ? <RefreshCw className="animate-spin" size={14}/> : <Download size={14}/>} <span>PDF</span>
             </button>
        </div>
      </nav>

      <div className="flex flex-1 overflow-hidden relative">
        <aside className={`${isSidebarOpen ? 'w-full md:w-72 lg:w-80' : 'w-0 -translate-x-full'} absolute md:relative z-[1000] h-full bg-slate-900 border-r border-slate-800 transition-all duration-300 ease-in-out overflow-y-auto custom-scrollbar p-6`}>
            <button onClick={() => setIsSidebarOpen(false)} className="md:hidden absolute top-4 right-4 text-slate-400"><ChevronLeft size={24}/></button>
            <div className="space-y-6 pb-20">
                <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700">
                    <label className="text-[10px] font-black text-slate-500 uppercase mb-3 flex items-center gap-2"><Type size={14}/> Saiz Tulisan</label>
                    <div className="flex items-center justify-between bg-slate-900 rounded-lg p-1">
                        <button onClick={() => setFontSize(Math.max(8, fontSize - 1))} className="w-8 h-8 flex items-center justify-center hover:bg-slate-700 rounded text-slate-300"><Minus size={14}/></button>
                        <span className="text-xs font-bold text-white font-mono">{fontSize}px</span>
                        <button onClick={() => setFontSize(Math.min(16, fontSize + 1))} className="w-8 h-8 flex items-center justify-center hover:bg-slate-700 rounded text-slate-300"><Plus size={14}/></button>
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase flex items-center gap-2"><Layers size={14}/> Pilih Gaya (New)</label>
                    <button onClick={() => setSelectedTemplate('CARDS_UI')} className={`w-full p-3 rounded-xl border text-[10px] font-bold uppercase text-left flex items-center gap-3 transition-all ${selectedTemplate === 'CARDS_UI' ? 'bg-blue-600 border-blue-500 text-white shadow-lg' : 'bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-700'}`}><CreditCard size={16}/> Cards Classic</button>
                    <button onClick={() => setSelectedTemplate('INFOGRAPHIC_PRO')} className={`w-full p-3 rounded-xl border text-[10px] font-bold uppercase text-left flex items-center gap-3 transition-all ${selectedTemplate === 'INFOGRAPHIC_PRO' ? 'bg-blue-600 border-blue-500 text-white shadow-lg' : 'bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-700'}`}><TrendingUp size={16}/> Infografik Pro</button>
                    <button onClick={() => setSelectedTemplate('MAGAZINE_STYLE')} className={`w-full p-3 rounded-xl border text-[10px] font-bold uppercase text-left flex items-center gap-3 transition-all ${selectedTemplate === 'MAGAZINE_STYLE' ? 'bg-blue-600 border-blue-500 text-white shadow-lg' : 'bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-700'}`}><Layout size={16}/> Magazine Visual</button>
                </div>

                <div>
                    <label className="text-[10px] font-black text-slate-500 uppercase mb-3 flex items-center gap-2"><Palette size={14}/> Warna Tema</label>
                    <div className="flex gap-2 flex-wrap">
                        {['#1e3a8a', '#b91c1c', '#047857', '#d97706', '#7e22ce', '#000000'].map(c => (
                            <button key={c} onClick={() => setThemeColor(c)} className={`w-7 h-7 rounded-full border-2 ${themeColor === c ? 'border-white scale-110 shadow-lg' : 'border-transparent opacity-50 hover:opacity-100'}`} style={{backgroundColor: c}}/>
                        ))}
                    </div>
                </div>

                <div>
                    <label className="text-[10px] font-black text-slate-500 uppercase mb-3 flex items-center gap-2"><ImageIcon size={14}/> Gambar ({images.length}/6)</label>
                    <div className="grid grid-cols-3 gap-2">
                        {images.map((img, i) => (
                            <div key={i} className="aspect-square relative group rounded-lg overflow-hidden border border-slate-700">
                                <img src={img} className="w-full h-full object-cover"/>
                                <button onClick={() => setImages(images.filter((_, idx) => idx !== i))} className="absolute inset-0 bg-red-600/80 hidden group-hover:flex items-center justify-center text-white"><Trash2 size={16}/></button>
                            </div>
                        ))}
                        {images.length < 6 && (
                            <button onClick={() => fileInputRef.current?.click()} className="aspect-square border-2 border-dashed border-slate-700 rounded-lg flex items-center justify-center text-slate-500 hover:text-white hover:border-slate-500 bg-slate-800/50"><Plus size={20}/></button>
                        )}
                    </div>
                    <input type="file" ref={fileInputRef} multiple className="hidden" accept="image/*" onChange={handleImageUpload}/>
                </div>
            </div>
        </aside>

        <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="hidden md:flex absolute left-0 top-1/2 -translate-y-1/2 z-[1001] bg-slate-900 border border-slate-800 text-white p-1 rounded-r-xl shadow-xl hover:bg-slate-800 transition-all">
            {isSidebarOpen ? <ChevronLeft size={20}/> : <ChevronRight size={20}/>}
        </button>

        <main className="flex-1 relative bg-slate-900/10 flex items-start justify-center overflow-auto p-4 md:p-8 no-scrollbar scroll-smooth">
            {!isSidebarOpen && <button onClick={() => setIsSidebarOpen(true)} className="md:hidden absolute top-4 left-4 z-50 bg-slate-900 p-2 rounded-lg text-white shadow-lg"><Layers size={20}/></button>}
            <div className="transition-transform duration-500 ease-out origin-top shadow-2xl mb-32" style={{ transform: `scale(${scale})` }}>
                {renderTemplate()}
            </div>
        </main>
      </div>

      <div style={{ position: 'absolute', top: -9999, left: -9999 }}>
        <div ref={printRef} style={{ width: '794px', height: '1123px', backgroundColor: 'white' }}>{renderTemplate()}</div>
      </div>
    </div>
  );
};

export default ReportGeneratorScreen;