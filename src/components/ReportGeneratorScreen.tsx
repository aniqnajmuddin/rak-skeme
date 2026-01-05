import React, { useState, useRef, useEffect } from 'react';
import { 
  ArrowLeft, Upload, Image as ImageIcon, Trash2, RefreshCw, Layers, 
  Lock, Unlock, Download, Palette, Layout, FileText, Grid, Type, Minus, Plus, 
  ChevronRight, ChevronLeft, CreditCard, Briefcase, Star, GitCommit, Share2,
  Hexagon, Columns, CircleDot, Sidebar as SidebarIcon, Table, ListOrdered, 
  Box, Target, TrendingUp, Camera, Zap, AlignLeft, Info
} from 'lucide-react';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

// --- KOMPONEN EDITABLE TEXT DENGAN KAWALAN SAIZ INDIVIDU ---
const SmartText = ({ val, setVal, fontSize, setFontSize, multi = false, className = "", placeholder }: any) => {
    const [showTool, setShowTool] = useState(false);

    return (
        <div className="relative group/text w-full h-full" onMouseEnter={() => setShowTool(true)} onMouseLeave={() => setShowTool(false)}>
            {showTool && (
                <div className="absolute -top-8 left-0 flex items-center gap-1 bg-slate-900 text-white rounded-md p-1 shadow-xl z-[100] no-print scale-90 origin-left border border-white/20">
                    <button onClick={() => setFontSize(Math.max(6, fontSize - 1))} className="hover:bg-slate-700 p-1 rounded transition-colors"><Minus size={12}/></button>
                    <span className="text-[10px] font-bold min-w-[20px] text-center font-mono">{fontSize}</span>
                    <button onClick={() => setFontSize(Math.min(60, fontSize + 1))} className="hover:bg-slate-700 p-1 rounded transition-colors"><Plus size={12}/></button>
                </div>
            )}
            
            {multi ? (
                <textarea 
                    value={val} 
                    onChange={e => setVal(e.target.value)} 
                    className={`w-full h-full bg-transparent border border-dashed border-transparent hover:border-blue-400 focus:border-blue-600 rounded px-1 outline-none transition-all resize-none text-slate-900 ${className}`}
                    style={{ fontSize: `${fontSize}px`, lineHeight: '1.4' }}
                    placeholder={placeholder}
                />
            ) : (
                <input 
                    value={val} 
                    onChange={e => setVal(e.target.value)} 
                    className={`w-full bg-transparent border border-dashed border-transparent hover:border-blue-400 focus:border-blue-600 rounded px-1 outline-none transition-all text-slate-900 ${className}`}
                    style={{ fontSize: `${fontSize}px`, lineHeight: '1.4' }}
                    placeholder={placeholder}
                />
            )}
        </div>
    );
};

const LogoBox = ({src, text}: {src: string|null, text: string}) => (
    <div className="w-full h-full flex items-center justify-center overflow-hidden bg-white/90 backdrop-blur-sm border border-slate-200 rounded-lg shadow-sm">
        {src ? <img src={src} className="w-full h-full object-contain" alt="logo"/> : <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest text-center px-1">{text}</span>}
    </div>
);

type TemplateType = 
  'CARDS_UI' | 'BENTO_GRID' | 'TIMELINE_FLOW' | 'OFFICIAL_GOVT' | 
  'CORPORATE_PRO' | 'VISUAL_MAGAZINE' | 'MINDMAP_NET' | 'SPLIT_SCREEN' |
  'COMPACT_GRID' | 'EXECUTIVE_REPORT' | 'MINUTES_STYLE' | 'TABLE_DATA' |
  'HONEYCOMB_HEX' | 'SIDEBAR_INFO' | 'CIRCLE_LENS';

const ReportGeneratorScreen: React.FC<{onBack: () => void, isDarkMode: boolean}> = ({ onBack, isDarkMode }) => {
  const [title, setTitle] = useState('LAPORAN AKTIVITI KOKURIKULUM');
  const [date, setDate] = useState('12 JANUARI 2026');
  const [content, setContent] = useState({
    objectives: '1. Memperkasa potensi kepimpinan murid.\n2. Membina disiplin tinggi.',
    summary: 'Program berjalan lancar dengan penyertaan aktif murid. Objektif tercapai 100%.',
    strengths: 'Komitmen guru tinggi.',
    weaknesses: 'Kekangan masa.',
    preparedBy: 'SETIAUSAHA KOKURIKULUM'
  });

  const [fs, setFs] = useState({
    title: 24, meta: 12, objectives: 11, summary: 11, strengths: 9, weaknesses: 9, preparedBy: 12, header: 18
  });

  const updateFs = (key: string, val: number) => setFs(prev => ({ ...prev, [key]: val }));

  const [images, setImages] = useState<string[]>([]);
  const [schoolLogo, setSchoolLogo] = useState<string | null>(null);
  const [kpmLogo, setKpmLogo] = useState<string | null>(null);

  const [selectedTemplate, setSelectedTemplate] = useState<TemplateType>('CARDS_UI');
  const [themeColor, setThemeColor] = useState('#1e3a8a'); 
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
      if (width < 768) setScale((width * 0.95) / 794); 
      else {
        const sidebarW = isSidebarOpen ? 320 : 0;
        const availW = width - sidebarW - 80;
        const availH = height - 140;
        setScale(Math.min(availW / 794, availH / 1123, 0.85));
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
        pdf.save(`Laporan_RAK.pdf`);
    } catch (err) { console.error(err); } finally { setIsGenerating(false); }
  };

  const StandardHeader = () => (
    <div className="flex items-center justify-between border-b-2 pb-3 mb-4 shrink-0" style={{ borderColor: themeColor }}>
        <div className="w-16 h-16"><LogoBox src={schoolLogo} text="LOGO"/></div>
        <div className="text-center">
            <SmartText val="SEKOLAH KEBANGSAAN MENERONG" setVal={()=>{}} fontSize={fs.header} setFontSize={(v:any)=>updateFs('header',v)} className="font-black uppercase leading-none text-center" style={{ color: themeColor }}/>
            <p className="text-[9px] font-bold uppercase tracking-widest mt-1 text-slate-500 text-center">Laporan Aktiviti Kokurikulum</p>
        </div>
        <div className="w-16 h-16"><LogoBox src={kpmLogo} text="KPM"/></div>
    </div>
  );

  const StandardFooter = () => (
    <div className="mt-auto pt-4 border-t flex justify-end shrink-0 border-slate-200">
        <div className="w-64 text-right">
            <p className="text-[9px] font-bold uppercase mb-6 text-slate-400">Disediakan Oleh:</p>
            <SmartText val={content.preparedBy} setVal={(v:any)=>setContent({...content, preparedBy:v})} fontSize={fs.preparedBy} setFontSize={(v:any)=>updateFs('preparedBy',v)} className="font-bold uppercase text-right"/>
            <div className="h-0.5 w-full mt-1 bg-slate-900"></div>
        </div>
    </div>
  );

  const renderTemplateContent = () => {
    const a4Base = "w-full h-full flex flex-col p-10";
    const bgStyle = { backgroundImage: `linear-gradient(135deg, ${themeColor}05 0%, #ffffff 50%, ${themeColor}05 100%)` };
    
    switch(selectedTemplate) {
        case 'CARDS_UI': return (
            <div className={a4Base} style={bgStyle}>
                <StandardHeader />
                <div className="grid grid-cols-3 gap-4 mb-4">
                    <div className="col-span-2 bg-white p-4 rounded-xl border-l-8 shadow-sm" style={{borderColor: themeColor}}>
                        <h6 className="text-[8px] font-bold text-slate-400 uppercase">Tajuk Program</h6>
                        <SmartText val={title} setVal={setTitle} fontSize={fs.title} setFontSize={(v:any)=>updateFs('title',v)} className="font-black uppercase" style={{color: themeColor}}/>
                    </div>
                    <div className="bg-white p-4 rounded-xl border shadow-sm flex flex-col justify-center">
                        <h6 className="text-[8px] font-bold text-slate-400 uppercase">Tarikh / Tempat</h6>
                        <SmartText val={date} setVal={setDate} fontSize={fs.meta} setFontSize={(v:any)=>updateFs('meta',v)} className="font-bold"/>
                    </div>
                </div>
                <div className="grid grid-cols-2 gap-4 flex-1 overflow-hidden">
                    <div className="flex flex-col gap-4">
                        <div className="bg-white p-5 rounded-xl border flex-1 flex flex-col shadow-sm">
                            <h3 className="font-bold uppercase text-[10px] text-slate-400 border-b pb-2 mb-2">Objektif</h3>
                            <SmartText val={content.objectives} setVal={(v:any)=>setContent({...content,objectives:v})} fontSize={fs.objectives} setFontSize={(v:any)=>updateFs('objectives',v)} multi/>
                        </div>
                        <div className="bg-white p-5 rounded-xl border flex-1 flex flex-col shadow-sm">
                            <h3 className="font-bold uppercase text-[10px] text-slate-400 border-b pb-2 mb-2">Rumusan</h3>
                            <SmartText val={content.summary} setVal={(v:any)=>setContent({...content,summary:v})} fontSize={fs.summary} setFontSize={(v:any)=>updateFs('summary',v)} multi/>
                        </div>
                    </div>
                    <div className="bg-white p-5 rounded-xl border flex flex-col shadow-sm">
                        <div className="grid grid-cols-2 gap-2 mb-4">
                            {images.slice(0,4).map((img, i) => <div key={i} className="aspect-square rounded-lg overflow-hidden border-2 border-white shadow-sm"><img src={img} className="w-full h-full object-cover"/></div>)}
                        </div>
                        <div className="space-y-2 mt-auto">
                            <div className="bg-emerald-50 p-2 rounded-lg border border-emerald-100">
                                <span className="text-[8px] font-black text-emerald-700 uppercase block mb-1">Kekuatan</span>
                                <SmartText val={content.strengths} setVal={(v:any)=>setContent({...content,strengths:v})} fontSize={fs.strengths} setFontSize={(v:any)=>updateFs('strengths',v)} multi/>
                            </div>
                        </div>
                    </div>
                </div>
                <StandardFooter />
            </div>
        );
        default: return <div className={a4Base} style={bgStyle}><StandardHeader /><div className="flex-1 flex items-center justify-center italic text-slate-400">Template "{selectedTemplate}" sedia untuk diedit...</div><StandardFooter /></div>;
    }
  };

  return (
    <div className={`h-screen flex flex-col ${isDarkMode ? 'bg-[#0F172A]' : 'bg-slate-50'} overflow-hidden relative`}>
      <nav className="h-16 bg-slate-900 border-b border-slate-800 flex items-center justify-between px-6 shrink-0 z-[1001] no-print">
        <div className="flex items-center gap-4">
             <button onClick={onBack} className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-white hover:bg-slate-700 transition-all"><ArrowLeft size={20}/></button>
             <h1 className="text-white font-['Teko'] text-2xl uppercase tracking-wider">RAK <span className="text-amber-500">DESIGNER</span></h1>
        </div>
        <div className="flex items-center gap-2">
             <button onClick={() => setIsLocked(!isLocked)} className={`px-4 py-2 rounded-lg font-bold uppercase text-xs flex items-center gap-2 transition-all ${isLocked ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-slate-400'}`}>
                {isLocked ? <Lock size={14}/> : <Unlock size={14}/>} <span className="hidden sm:inline">{isLocked ? 'View' : 'Edit'}</span>
             </button>
             <button onClick={handleDownloadPDF} disabled={isGenerating} className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-bold uppercase text-xs flex items-center gap-2 shadow-lg active:scale-95 transition-all">
                {isGenerating ? <RefreshCw className="animate-spin" size={14}/> : <Download size={14}/>} <span className="hidden sm:inline">PDF</span>
             </button>
        </div>
      </nav>

      <div className="flex flex-1 overflow-hidden relative">
        <aside className={`${isSidebarOpen ? 'w-80' : 'w-0 -translate-x-full'} absolute md:relative z-[1000] h-full bg-slate-900 border-r border-slate-800 transition-all duration-300 overflow-y-auto custom-scrollbar p-6 no-print`}>
            <button onClick={() => setIsSidebarOpen(false)} className="md:hidden absolute top-4 right-4 text-slate-400"><ChevronLeft size={24}/></button>
            <div className="space-y-6 pb-24">
                <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700">
                    <p className="text-[10px] font-black text-slate-500 uppercase flex items-center gap-2 mb-2"><Info size={14}/> Tip</p>
                    <p className="text-[9px] text-slate-400 leading-relaxed">Klik pada teks dalam laporan untuk selenggara saiz font individu.</p>
                </div>

                <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase flex items-center gap-2"><Layers size={14}/> Template</label>
                    <div className="grid grid-cols-1 gap-1.5 max-h-[350px] overflow-y-auto pr-2 custom-scrollbar">
                        {['CARDS_UI', 'BENTO_GRID', 'VISUAL_MAGAZINE', 'OFFICIAL_GOVT', 'CORPORATE_PRO', 'TIMELINE_FLOW', 'MINDMAP_NET', 'HONEYCOMB_HEX', 'SPLIT_SCREEN', 'CIRCLE_LENS', 'SIDEBAR_INFO', 'COMPACT_GRID', 'EXECUTIVE_REPORT', 'MINUTES_STYLE', 'TABLE_DATA'].map((id) => (
                            <button key={id} onClick={() => setSelectedTemplate(id as any)} className={`w-full p-2.5 rounded-xl border text-[9px] font-bold uppercase text-left transition-all ${selectedTemplate === id ? 'bg-blue-600 border-blue-500 text-white shadow-lg' : 'bg-slate-800/40 border-slate-700 text-slate-400 hover:bg-slate-800'}`}>
                                {id.replace('_', ' ')}
                            </button>
                        ))}
                    </div>
                </div>

                <div>
                    <label className="text-[10px] font-black text-slate-500 uppercase mb-3 flex items-center gap-2"><ImageIcon size={14}/> Gambar ({images.length}/6)</label>
                    <div className="grid grid-cols-3 gap-2">
                        {images.map((img, i) => (
                            <div key={i} className="aspect-square relative group rounded-lg overflow-hidden border border-slate-700 shadow-md">
                                <img src={img} className="w-full h-full object-cover" alt="preview"/>
                                <button onClick={() => setImages(images.filter((_, idx) => idx !== i))} className="absolute inset-0 bg-red-600/80 hidden group-hover:flex items-center justify-center text-white transition-all"><Trash2 size={16}/></button>
                            </div>
                        ))}
                        {images.length < 6 && (
                            <button onClick={() => fileInputRef.current?.click()} className="aspect-square border-2 border-dashed border-slate-700 rounded-lg flex items-center justify-center text-slate-500 hover:text-white bg-slate-800/30 transition-all">
                                <Plus size={20}/>
                            </button>
                        )}
                    </div>
                    <input type="file" ref={fileInputRef} multiple className="hidden" accept="image/*" onChange={handleImageUpload}/>
                </div>
            </div>
        </aside>

        <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="hidden md:flex absolute z-[1002] top-1/2 -translate-y-1/2 bg-slate-900 border border-slate-800 text-white p-1 rounded-r-xl shadow-xl transition-all hover:bg-slate-800 no-print" style={{left: isSidebarOpen ? '320px' : '0'}}>
            {isSidebarOpen ? <ChevronLeft size={20}/> : <ChevronRight size={20}/>}
        </button>

        <main className="flex-1 relative bg-slate-900/10 flex items-start justify-center overflow-auto p-4 md:p-8 no-scrollbar scroll-smooth">
            <div className="transition-transform duration-500 ease-out origin-top shadow-[0_0_100px_rgba(0,0,0,0.4)] mb-32 no-print" style={{ transform: `scale(${scale})` }}>
                <div className="w-[794px] h-[1123px] bg-white shadow-2xl overflow-hidden flex flex-col shrink-0">
                    {renderTemplateContent()}
                </div>
            </div>
        </main>
      </div>

      <div style={{ position: 'absolute', top: -9999, left: -9999 }}>
        <div ref={printRef} style={{ width: '794px', height: '1123px', backgroundColor: 'white' }}>
            {renderTemplateContent()}
        </div>
      </div>
    </div>
  );
};

export default ReportGeneratorScreen;