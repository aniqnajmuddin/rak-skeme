import React, { useState, useRef, useEffect } from 'react';
import { 
  ArrowLeft, Upload, Image as ImageIcon, Trash2, RefreshCw, Layers, 
  Lock, Unlock, Download, Palette, Layout, FileText, Grid, Type, Minus, Plus, 
  ChevronRight, ChevronLeft, CreditCard, Briefcase, Star, GitCommit, Share2,
  Hexagon, Columns, CircleDot, Sidebar as SidebarIcon, Table, ListOrdered, 
  Box, Target, TrendingUp, Camera, Zap, AlignLeft
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

type TemplateType = 
  'CARDS_UI' | 'BENTO_GRID' | 'TIMELINE_FLOW' | 'OFFICIAL_GOVT' | 
  'CORPORATE_PRO' | 'VISUAL_MAGAZINE' | 'MINDMAP_NET' | 'SPLIT_SCREEN' |
  'COMPACT_GRID' | 'EXECUTIVE_REPORT' | 'MINUTES_STYLE' | 'TABLE_DATA' |
  'HONEYCOMB_HEX' | 'SIDEBAR_INFO' | 'CIRCLE_LENS';

const ReportGeneratorScreen: React.FC<{onBack: () => void, isDarkMode: boolean}> = ({ onBack, isDarkMode }) => {
  // --- STATE DATA ---
  const [title, setTitle] = useState('LAPORAN AKTIVITI KOKURIKULUM');
  const [date, setDate] = useState('12 JANUARI 2026');
  const [venue, setVenue] = useState('DEWAN PERDANA SK MENERONG');
  const [participants, setParticipants] = useState('SEMUA MURID TAHUN 4, 5 & 6');
  const [content, setContent] = useState({
    objectives: '1. Memperkasa potensi kepimpinan murid.\n2. Membina disiplin tinggi.',
    summary: 'Program berjalan lancar dengan penyertaan aktif murid. Objektif tercapai 100%. Murid menunjukkan komitmen yang tinggi.',
    strengths: 'Komitmen guru tinggi.',
    weaknesses: 'Kekangan masa.',
    improvement: 'Penambahbaikan masa.'
  });
  const [preparedBy, setPreparedBy] = useState('SETIAUSAHA KOKURIKULUM');
  const [images, setImages] = useState<string[]>([]);
  const [schoolLogo, setSchoolLogo] = useState<string | null>(null);
  const [kpmLogo, setKpmLogo] = useState<string | null>(null);

  // --- UI CONTROL ---
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateType>('CARDS_UI');
  const [themeColor, setThemeColor] = useState('#1e3a8a'); 
  const [fontSize, setFontSize] = useState(11); 
  const [isGenerating, setIsGenerating] = useState(false);
  const [isLocked, setIsLocked] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth > 1024);
  const [scale, setScale] = useState(1);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const printRef = useRef<HTMLDivElement>(null);

  // --- AUTO-SCALING LOGIC ---
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
        pdf.save(`RAK_Laporan.pdf`);
    } catch (err) { console.error(err); } finally { setIsGenerating(false); }
  };

  // --- TEMPLATE RENDERING ---
  const StandardHeader = ({center=false}) => (
    <div className={`flex items-center ${center ? 'justify-center text-center flex-col gap-1' : 'justify-between'} border-b-2 pb-3 mb-4 shrink-0`} style={{ borderColor: themeColor }}>
        {!center && <div className="w-14 h-14"><LogoBox src={schoolLogo} text="LOGO"/></div>}
        <div className={center ? 'text-center' : ''}>
            <h1 className="text-lg font-black uppercase leading-none" style={{ color: themeColor }}>SEKOLAH KEBANGSAAN MENERONG</h1>
            <p className="text-[9px] font-bold uppercase tracking-widest mt-1 text-slate-500 text-center">Laporan Aktiviti Kokurikulum</p>
        </div>
        {!center && <div className="w-14 h-14"><LogoBox src={kpmLogo} text="KPM"/></div>}
    </div>
  );

  const StandardFooter = () => (
    <div className="mt-auto pt-4 border-t flex justify-end shrink-0 border-slate-200">
        <div className="w-64 text-right">
            <p className="text-[9px] font-bold uppercase mb-4 text-slate-400">Disediakan Oleh:</p>
            <EditableText val={preparedBy} setVal={setPreparedBy} className="font-bold uppercase text-xs text-right text-slate-900"/>
            <div className="h-0.5 w-full mt-1 bg-slate-900"></div>
        </div>
    </div>
  );

  const renderTemplateContent = () => {
    const a4Base = "w-full h-full flex flex-col";
    const elegantBg = { backgroundImage: `linear-gradient(135deg, ${themeColor}05 0%, #ffffff 50%, ${themeColor}05 100%)` };

    switch(selectedTemplate) {
        case 'CARDS_UI': return (
            <div className={a4Base} style={elegantBg}>
                <div className="p-10 flex flex-col h-full">
                    <StandardHeader />
                    <div className="grid grid-cols-3 gap-4 mb-4">
                        <div className="col-span-2 bg-white p-4 rounded-xl border-l-8 shadow-sm" style={{borderColor: themeColor}}>
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
                            <h3 className="font-bold uppercase text-[10px] text-slate-400 border-b pb-2 mb-4">Dokumentasi</h3>
                            <div className="grid grid-cols-2 gap-2 mb-auto">
                                {images.slice(0,4).map((img, i) => <div key={i} className="aspect-square rounded-lg overflow-hidden border-2 border-white shadow-sm"><img src={img} className="w-full h-full object-cover"/></div>)}
                            </div>
                        </div>
                    </div>
                    <StandardFooter />
                </div>
            </div>
        );

        case 'BENTO_GRID': return (
            <div className={a4Base} style={{backgroundColor: '#f8fafc', padding: '30px'}}>
                <div className="grid grid-cols-3 grid-rows-4 gap-4 flex-1">
                    <div className="col-span-2 row-span-1 bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex flex-col justify-center">
                        <EditableText val={title} setVal={setTitle} className="font-black text-2xl uppercase leading-none" style={{color: themeColor}}/>
                        <p className="text-[10px] font-bold text-slate-400 mt-2 uppercase">{date} • {venue}</p>
                    </div>
                    <div className="col-span-1 row-span-1 bg-white p-4 rounded-3xl shadow-sm border border-slate-100 flex items-center justify-center gap-4">
                        <div className="w-12 h-12"><LogoBox src={schoolLogo} text="S"/></div>
                        <div className="w-12 h-12"><LogoBox src={kpmLogo} text="K"/></div>
                    </div>
                    <div className="col-span-1 row-span-2 bg-white p-5 rounded-3xl shadow-sm border border-slate-100 flex flex-col">
                        <h4 className="font-black text-[10px] text-slate-400 uppercase mb-2">Objektif</h4>
                        <EditableText val={content.objectives} setVal={(v:any)=>setContent({...content,objectives:v})} fontSize={fontSize} multi/>
                    </div>
                    <div className="col-span-2 row-span-2 rounded-3xl overflow-hidden border-4 border-white shadow-sm bg-slate-200">
                        {images[0] ? <img src={images[0]} className="w-full h-full object-cover"/> : <div className="h-full flex items-center justify-center text-slate-400 italic">Gambar Utama</div>}
                    </div>
                    <div className="col-span-3 row-span-1 grid grid-cols-3 gap-4">
                        {images.slice(1,4).map((img, i) => <div key={i} className="bg-white rounded-2xl overflow-hidden border-2 border-white shadow-sm"><img src={img} className="w-full h-full object-cover"/></div>)}
                    </div>
                </div>
                <StandardFooter />
            </div>
        );

        case 'TIMELINE_FLOW': return (
            <div className={a4Base} style={elegantBg}>
                <div className="p-10 flex flex-col h-full">
                    <StandardHeader />
                    <div className="relative flex-1 flex flex-col gap-6 pl-8 border-l-4 ml-4" style={{borderColor: themeColor}}>
                        <div className="relative">
                            <div className="absolute -left-[42px] top-0 w-5 h-5 rounded-full border-4 bg-white" style={{borderColor: themeColor}}></div>
                            <div className="bg-white p-4 rounded-xl border shadow-sm">
                                <EditableText val={title} setVal={setTitle} className="font-black text-xl uppercase" style={{color: themeColor}}/>
                                <p className="text-[10px] font-bold text-slate-400 uppercase">{date} • {venue}</p>
                            </div>
                        </div>
                        <div className="relative flex-1">
                            <div className="absolute -left-[42px] top-4 w-5 h-5 rounded-full border-4 bg-white border-slate-300"></div>
                            <div className="bg-white p-5 rounded-xl border shadow-sm h-full flex gap-4">
                                <div className="flex-1"><h4 className="text-[10px] font-bold uppercase text-slate-400 mb-2">Objektif</h4><EditableText val={content.objectives} setVal={(v:any)=>setContent({...content,objectives:v})} fontSize={fontSize} multi/></div>
                                <div className="w-px bg-slate-100"></div>
                                <div className="flex-1"><h4 className="text-[10px] font-bold uppercase text-slate-400 mb-2">Rumusan</h4><EditableText val={content.summary} setVal={(v:any)=>setContent({...content,summary:v})} fontSize={fontSize} multi/></div>
                            </div>
                        </div>
                        <div className="grid grid-cols-3 gap-2">
                             {images.slice(0,3).map((img, i) => <div key={i} className="aspect-video rounded-lg overflow-hidden border shadow-sm"><img src={img} className="w-full h-full object-cover"/></div>)}
                        </div>
                    </div>
                    <StandardFooter />
                </div>
            </div>
        );

        case 'OFFICIAL_GOVT': return (
            <div className={a4Base} style={{backgroundColor: '#ffffff', padding: '60px', color: '#000000', fontFamily: 'serif'}}>
                <div className="flex flex-col items-center border-b-2 border-black pb-4 mb-6 text-center">
                    <div className="w-20 h-20 mb-2"><LogoBox src={schoolLogo} text="JATA"/></div>
                    <h1 className="font-bold text-xl uppercase">SEKOLAH KEBANGSAAN MENERONG</h1>
                    <p className="text-sm">21200 KUALA TERENGGANU, TERENGGANU</p>
                </div>
                <EditableText val={title} setVal={setTitle} className="font-bold text-center underline uppercase mb-8 text-lg"/>
                <table className="w-full border-collapse border border-black text-sm mb-6">
                    <tbody>
                        <tr><td className="border border-black p-2 font-bold w-1/4 bg-slate-100 uppercase">Tarikh</td><td className="border border-black p-2 uppercase">{date}</td></tr>
                        <tr><td className="border border-black p-2 font-bold bg-slate-100 uppercase">Tempat</td><td className="border border-black p-2 uppercase">{venue}</td></tr>
                    </tbody>
                </table>
                <div className="space-y-6 flex-1 text-justify">
                    <div><h4 className="font-bold underline uppercase mb-2">1.0 Objektif Program</h4><EditableText val={content.objectives} setVal={(v:any)=>setContent({...content,objectives:v})} fontSize={fontSize} multi/></div>
                    <div><h4 className="font-bold underline uppercase mb-2">2.0 Laporan Ringkas</h4><EditableText val={content.summary} setVal={(v:any)=>setContent({...content,summary:v})} fontSize={fontSize} multi/></div>
                </div>
                <div className="mt-8 flex gap-2">
                    {images.slice(0,2).map((img, i) => <div key={i} className="w-1/2 aspect-video border border-black"><img src={img} className="w-full h-full object-cover"/></div>)}
                </div>
                <StandardFooter />
            </div>
        );

        case 'CORPORATE_PRO': return (
            <div className={a4Base} style={{...elegantBg, padding: '40px', borderLeft: `20px solid ${themeColor}`}}>
                <StandardHeader />
                <div className="mb-8 mt-4"><h6 className="text-[10px] font-bold text-slate-400 uppercase">Executive Summary</h6><EditableText val={title} setVal={setTitle} className="font-black text-3xl uppercase leading-none" style={{color: themeColor}}/></div>
                <div className="grid grid-cols-3 gap-8 flex-1">
                    <div className="col-span-1 space-y-6">
                        <div className="bg-white p-4 rounded-xl border-l-4 shadow-sm" style={{borderColor: themeColor}}><h4 className="text-[10px] font-bold text-slate-400 uppercase mb-1">Date</h4><p className="font-bold text-sm">{date}</p></div>
                        <div className="bg-white p-4 rounded-xl border-l-4 shadow-sm" style={{borderColor: themeColor}}><h4 className="text-[10px] font-bold text-slate-400 uppercase mb-1">Venue</h4><p className="font-bold text-sm">{venue}</p></div>
                        <div className="bg-slate-900 text-white p-4 rounded-xl shadow-lg"><h4 className="text-[10px] font-bold text-slate-400 uppercase mb-2 text-white">Objectives</h4><EditableText val={content.objectives} setVal={(v:any)=>setContent({...content,objectives:v})} fontSize={fontSize} multi className="text-white"/></div>
                    </div>
                    <div className="col-span-2 space-y-6">
                        <div className="bg-white p-6 rounded-2xl border shadow-sm flex-1"><h4 className="font-black text-xs uppercase text-slate-400 mb-4 border-b pb-2">Activity Overview</h4><EditableText val={content.summary} setVal={(v:any)=>setContent({...content,summary:v})} fontSize={fontSize} multi/></div>
                        <div className="grid grid-cols-2 gap-2">{images.slice(0,2).map((img, i) => <img key={i} src={img} className="rounded-xl aspect-video object-cover"/>)}</div>
                    </div>
                </div>
                <StandardFooter />
            </div>
        );

        case 'VISUAL_MAGAZINE': return (
            <div className={a4Base} style={{backgroundColor: '#ffffff'}}>
                <div className="h-[400px] w-full bg-slate-900 relative">
                    {images[0] ? <img src={images[0]} className="w-full h-full object-cover opacity-60"/> : <div className="h-full flex items-center justify-center text-white/20 text-4xl font-black">HERO IMAGE</div>}
                    <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent"></div>
                    <div className="absolute bottom-0 left-0 p-12 w-full">
                        <EditableText val={title} setVal={setTitle} className="text-5xl font-black uppercase text-slate-900 leading-none tracking-tighter"/>
                        <p className="text-slate-600 font-bold uppercase tracking-[0.3em] mt-2">{date} // {venue}</p>
                    </div>
                </div>
                <div className="p-12 flex-1 flex gap-10">
                    <div className="flex-1"><h3 className="text-xs font-black uppercase mb-4 border-b-2 inline-block" style={{borderColor: themeColor}}>The Story</h3><EditableText val={content.summary} setVal={(v:any)=>setContent({...content,summary:v})} fontSize={fontSize+2} multi className="leading-relaxed first-letter:text-6xl first-letter:font-black first-letter:float-left first-letter:mr-3"/></div>
                    <div className="w-1/3 space-y-6"><div className="bg-slate-100 p-6 rounded-tr-[3rem] border-r-4" style={{borderColor: themeColor}}><h4 className="text-[10px] font-black uppercase text-slate-400 mb-2">Key Targets</h4><EditableText val={content.objectives} setVal={(v:any)=>setContent({...content,objectives:v})} fontSize={fontSize} multi/></div>{images[1] && <img src={images[1]} className="rounded-2xl grayscale hover:grayscale-0 transition-all"/>}</div>
                </div>
                <div className="px-12 pb-10"><StandardFooter /></div>
            </div>
        );

        case 'MINDMAP_NET': return (
            <div className={a4Base} style={{...elegantBg, padding: '40px'}}>
                <div className="flex-1 flex flex-col items-center justify-center relative">
                    <div className="bg-white p-8 rounded-[3rem] border-4 shadow-2xl z-20 text-center w-2/3" style={{borderColor: themeColor}}>
                        <EditableText val={title} setVal={setTitle} className="font-black text-2xl uppercase" style={{color: themeColor}}/>
                    </div>
                    <div className="absolute top-1/2 left-0 w-full h-1 bg-slate-200 -z-10"></div>
                    <div className="absolute top-0 left-1/2 w-1 h-full bg-slate-200 -z-10"></div>
                    <div className="grid grid-cols-2 gap-32 mt-16 w-full">
                         <div className="bg-white p-6 rounded-2xl border shadow-lg relative"><div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-slate-900 text-white px-4 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest">Objektif</div><EditableText val={content.objectives} setVal={(v:any)=>setContent({...content,objectives:v})} fontSize={fontSize} multi/></div>
                         <div className="bg-white p-6 rounded-2xl border shadow-lg relative"><div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-slate-900 text-white px-4 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest">Rumusan</div><EditableText val={content.summary} setVal={(v:any)=>setContent({...content,summary:v})} fontSize={fontSize} multi/></div>
                    </div>
                    <div className="grid grid-cols-4 gap-4 mt-16 w-full">
                        {images.slice(0,4).map((img, i) => <img key={i} src={img} className="rounded-full aspect-square object-cover border-4 border-white shadow-md"/>)}
                    </div>
                </div>
                <StandardFooter />
            </div>
        );

        case 'HONEYCOMB_HEX': return (
            <div className={a4Base} style={{...elegantBg, padding: '50px'}}>
                <StandardHeader center/>
                <div className="flex-1 flex flex-col justify-center items-center py-10 relative overflow-hidden">
                    <div className="grid grid-cols-3 gap-2">
                        {images.slice(0,6).map((img, i) => (
                            <div key={i} className="w-32 h-32 bg-slate-200" style={{clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)'}}>
                                <img src={img} className="w-full h-full object-cover"/>
                            </div>
                        ))}
                    </div>
                    <div className="mt-12 w-full grid grid-cols-2 gap-8">
                        <div className="bg-white/80 backdrop-blur p-6 rounded-3xl border shadow-sm"><h4 className="font-black text-xs text-blue-600 uppercase mb-2">Objektif</h4><EditableText val={content.objectives} setVal={(v:any)=>setContent({...content,objectives:v})} fontSize={fontSize} multi/></div>
                        <div className="bg-white/80 backdrop-blur p-6 rounded-3xl border shadow-sm"><h4 className="font-black text-xs text-blue-600 uppercase mb-2">Impak</h4><EditableText val={content.summary} setVal={(v:any)=>setContent({...content,summary:v})} fontSize={fontSize} multi/></div>
                    </div>
                </div>
                <StandardFooter />
            </div>
        );

        case 'SPLIT_SCREEN': return (
            <div className={a4Base} style={{flexDirection: 'row'}}>
                <div className="w-2/5 h-full p-10 flex flex-col text-white" style={{backgroundColor: themeColor}}>
                    <div className="w-16 h-16 bg-white rounded-2xl mb-10 p-2"><LogoBox src={schoolLogo} text="S"/></div>
                    <EditableText val={title} setVal={setTitle} className="text-3xl font-black uppercase text-white leading-none mb-4"/>
                    <p className="font-bold opacity-60 text-sm uppercase mb-10 tracking-widest">{date}</p>
                    <div className="space-y-6 flex-1 overflow-hidden">
                        <div><h4 className="text-[10px] font-bold uppercase opacity-40 mb-2">Target</h4><EditableText val={content.objectives} setVal={(v:any)=>setContent({...content,objectives:v})} fontSize={fontSize} multi className="text-white"/></div>
                        <div><h4 className="text-[10px] font-bold uppercase opacity-40 mb-2">Review</h4><EditableText val={content.summary} setVal={(v:any)=>setContent({...content,summary:v})} fontSize={fontSize} multi className="text-white"/></div>
                    </div>
                    <StandardFooter />
                </div>
                <div className="w-3/5 h-full grid grid-cols-1 gap-2 p-2 bg-slate-50">
                    {images.slice(0,3).map((img, i) => <img key={i} src={img} className="w-full h-full object-cover rounded-xl shadow-sm"/>)}
                </div>
            </div>
        );

        case 'CIRCLE_LENS': return (
            <div className={a4Base} style={{...elegantBg, padding: '50px', alignItems: 'center'}}>
                <StandardHeader center/>
                <div className="flex gap-4 mt-8">
                    {images.slice(0,3).map((img, i) => <div key={i} className="w-32 h-32 rounded-full overflow-hidden border-4 border-white shadow-xl"><img src={img} className="w-full h-full object-cover"/></div>)}
                </div>
                <div className="bg-white p-12 rounded-[4rem] shadow-2xl mt-12 flex-1 w-full border border-slate-100 flex flex-col items-center">
                    <EditableText val={title} setVal={setTitle} className="text-3xl font-black uppercase text-center mb-6" style={{color: themeColor}}/>
                    <div className="w-16 h-1 bg-slate-200 mb-8"></div>
                    <div className="grid grid-cols-2 gap-10 w-full flex-1 overflow-hidden">
                        <div className="flex flex-col"><h4 className="font-black text-xs text-slate-400 uppercase mb-4 text-center">Objektif</h4><EditableText val={content.objectives} setVal={(v:any)=>setContent({...content,objectives:v})} fontSize={fontSize} multi className="text-center"/></div>
                        <div className="flex flex-col"><h4 className="font-black text-xs text-slate-400 uppercase mb-4 text-center">Keputusan</h4><EditableText val={content.summary} setVal={(v:any)=>setContent({...content,summary:v})} fontSize={fontSize} multi className="text-center"/></div>
                    </div>
                </div>
                <StandardFooter />
            </div>
        );

        case 'SIDEBAR_INFO': return (
            <div className={a4Base} style={{flexDirection: 'row'}}>
                <div className="w-1/3 h-full bg-slate-100 border-r-2 p-8 flex flex-col items-center gap-8">
                    <div className="w-20 h-20 rounded-full border-4 border-white shadow-lg overflow-hidden bg-white"><LogoBox src={schoolLogo} text="S"/></div>
                    <div className="text-center"><h6 className="text-[10px] font-black text-slate-400 uppercase">Tarikh</h6><p className="font-bold text-sm">{date}</p></div>
                    <div className="text-center"><h6 className="text-[10px] font-black text-slate-400 uppercase">Tempat</h6><p className="font-bold text-sm">{venue}</p></div>
                    <div className="flex-1 w-full flex flex-col gap-2">{images.slice(0,3).map((img, i) => <img key={i} src={img} className="rounded-xl aspect-square object-cover shadow-sm"/>)}</div>
                </div>
                <div className="w-2/3 h-full p-12 flex flex-col" style={elegantBg}>
                    <EditableText val={title} setVal={setTitle} className="text-3xl font-black uppercase mb-10" style={{color: themeColor}}/>
                    <div className="space-y-10 flex-1 overflow-hidden">
                        <div><h4 className="font-black text-xs text-slate-400 uppercase mb-3 border-b pb-1">Tujuan Program</h4><EditableText val={content.objectives} setVal={(v:any)=>setContent({...content,objectives:v})} fontSize={fontSize} multi/></div>
                        <div><h4 className="font-black text-xs text-slate-400 uppercase mb-3 border-b pb-1">Laporan Aktiviti</h4><EditableText val={content.summary} setVal={(v:any)=>setContent({...content,summary:v})} fontSize={fontSize} multi/></div>
                    </div>
                    <StandardFooter />
                </div>
            </div>
        );

        case 'COMPACT_GRID': return (
            <div className={a4Base} style={{...elegantBg, padding: '30px'}}>
                <div className="bg-slate-900 p-6 rounded-2xl mb-4 flex justify-between items-center text-white">
                    <EditableText val={title} setVal={setTitle} className="text-lg font-bold uppercase text-white"/>
                    <div className="text-right text-[8px] opacity-60 uppercase font-black">{date} • {venue}</div>
                </div>
                <div className="grid grid-cols-2 gap-4 flex-1">
                    <div className="grid grid-cols-2 gap-2">{images.slice(0,4).map((img, i) => <img key={i} src={img} className="rounded-lg aspect-square object-cover border-2 border-white shadow-sm"/>)}</div>
                    <div className="space-y-4">
                         <div className="bg-white p-4 rounded-xl border h-1/2 overflow-hidden flex flex-col"><h4 className="font-black text-[10px] uppercase text-slate-400 mb-2">Objektif</h4><EditableText val={content.objectives} setVal={(v:any)=>setContent({...content,objectives:v})} fontSize={fontSize-1} multi/></div>
                         <div className="bg-white p-4 rounded-xl border h-1/2 overflow-hidden flex flex-col"><h4 className="font-black text-[10px] uppercase text-slate-400 mb-2">Rumusan</h4><EditableText val={content.summary} setVal={(v:any)=>setContent({...content,summary:v})} fontSize={fontSize-1} multi/></div>
                    </div>
                </div>
                <div className="mt-4"><StandardFooter /></div>
            </div>
        );

        case 'EXECUTIVE_REPORT': return (
            <div className={a4Base} style={{backgroundColor: '#ffffff', padding: '50px', borderTop: `15px solid ${themeColor}`}}>
                <div className="flex justify-between items-start mb-10">
                    <div className="w-1/2"><h6 className="text-slate-400 text-xs font-bold uppercase mb-1">Official Report</h6><EditableText val={title} setVal={setTitle} className="text-3xl font-black uppercase" style={{color: themeColor}}/></div>
                    <div className="w-16 h-16"><LogoBox src={schoolLogo} text="S"/></div>
                </div>
                <div className="flex gap-10 flex-1">
                    <div className="w-1/3 flex flex-col gap-6">
                        <div className="bg-slate-50 p-4 border-l-4" style={{borderColor: themeColor}}><h5 className="font-black text-[9px] uppercase text-slate-400">Date/Time</h5><p className="text-sm font-bold">{date}</p></div>
                        <div className="bg-slate-50 p-4 border-l-4" style={{borderColor: themeColor}}><h5 className="font-black text-[9px] uppercase text-slate-400">Location</h5><p className="text-sm font-bold">{venue}</p></div>
                        <div className="flex flex-col gap-2 mt-auto">{images.slice(0,2).map((img, i) => <img key={i} src={img} className="rounded-lg shadow-md grayscale"/>)}</div>
                    </div>
                    <div className="w-2/3 flex flex-col gap-6">
                        <div className="flex-1 overflow-hidden flex flex-col"><h5 className="font-black text-xs uppercase text-slate-400 border-b pb-1 mb-3">Activities Summary</h5><EditableText val={content.summary} setVal={(v:any)=>setContent({...content,summary:v})} fontSize={fontSize} multi/></div>
                        <div className="h-1/3 overflow-hidden flex flex-col"><h5 className="font-black text-xs uppercase text-slate-400 border-b pb-1 mb-3">Key Objectives</h5><EditableText val={content.objectives} setVal={(v:any)=>setContent({...content,objectives:v})} fontSize={fontSize} multi/></div>
                    </div>
                </div>
                <StandardFooter />
            </div>
        );

        case 'MINUTES_STYLE': return (
            <div className={a4Base} style={{padding: '50px', backgroundColor: '#ffffff', color: '#000', fontFamily: 'serif'}}>
                <h1 className="text-center font-bold text-lg uppercase border-b-4 border-black pb-2 mb-6">Minit Curai Aktiviti</h1>
                <div className="border-2 border-black flex-1 flex flex-col">
                    <div className="flex border-b-2 border-black"><div className="w-40 border-r-2 border-black p-2 bg-slate-100 font-bold uppercase text-[10px]">Perkara</div><div className="flex-1 p-2 font-bold uppercase"><EditableText val={title} setVal={setTitle}/></div></div>
                    <div className="flex border-b-2 border-black"><div className="w-40 border-r-2 border-black p-2 bg-slate-100 font-bold uppercase text-[10px]">Tarikh/Tempat</div><div className="flex-1 p-2 uppercase text-[10px]">{date} @ {venue}</div></div>
                    <div className="flex-1 flex border-b-2 border-black"><div className="w-40 border-r-2 border-black p-2 bg-slate-100 font-bold uppercase text-[10px]">Laporan Ringkas</div><div className="flex-1 p-2"><EditableText val={content.summary} setVal={(v:any)=>setContent({...content,summary:v})} fontSize={fontSize} multi/></div></div>
                    <div className="p-2 bg-slate-100 font-bold uppercase text-center text-[10px] border-b-2 border-black">Lampiran Gambar</div>
                    <div className="grid grid-cols-4 gap-2 p-2">{images.slice(0,4).map((img, i) => <div key={i} className="aspect-square border border-black"><img src={img} className="w-full h-full object-cover"/></div>)}</div>
                </div>
                <StandardFooter />
            </div>
        );

        case 'TABLE_DATA': return (
            <div className={a4Base} style={{...elegantBg, padding: '40px'}}>
                <StandardHeader />
                <h2 className="text-xl font-black uppercase mb-6" style={{color: themeColor}}>Jadual Laporan Aktiviti</h2>
                <div className="flex-1 overflow-hidden">
                    <table className="w-full border-2 border-slate-300">
                        <thead><tr className="bg-slate-900 text-white"><th className="p-3 border text-left text-[10px] uppercase">Kategori</th><th className="p-3 border text-left text-[10px] uppercase">Butiran Laporan</th></tr></thead>
                        <tbody>
                            <tr><td className="p-3 border font-bold text-xs bg-slate-50 uppercase">Program</td><td className="p-3 border font-bold uppercase text-xs"><EditableText val={title} setVal={setTitle}/></td></tr>
                            <tr><td className="p-3 border font-bold text-xs bg-slate-50 uppercase">Objektif</td><td className="p-3 border"><EditableText val={content.objectives} setVal={(v:any)=>setContent({...content,objectives:v})} fontSize={fontSize} multi/></td></tr>
                            <tr><td className="p-3 border font-bold text-xs bg-slate-50 uppercase">Ringkasan</td><td className="p-3 border"><EditableText val={content.summary} setVal={(v:any)=>setContent({...content,summary:v})} fontSize={fontSize} multi/></td></tr>
                            <tr><td className="p-3 border font-bold text-xs bg-slate-50 uppercase">Gambar</td><td className="p-3 border"><div className="grid grid-cols-3 gap-2">{images.slice(0,3).map((img, i) => <img key={i} src={img} className="rounded aspect-video object-cover"/>)}</div></td></tr>
                        </tbody>
                    </table>
                </div>
                <StandardFooter />
            </div>
        );

        default: return <div className="p-10 h-full flex items-center justify-center italic text-slate-400">Template "{selectedTemplate}" sedang dikemaskini...</div>;
    }
  };

  return (
    <div className={`h-screen flex flex-col ${isDarkMode ? 'bg-[#0F172A]' : 'bg-slate-50'} overflow-hidden relative`}>
      
      {/* NAVBAR */}
      <nav className="h-16 bg-slate-900 border-b border-slate-800 flex items-center justify-between px-6 shrink-0 z-[1001] no-print">
        <div className="flex items-center gap-4">
             <button onClick={onBack} className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-white hover:bg-slate-700 transition-all"><ArrowLeft size={20}/></button>
             <h1 className="text-white font-['Teko'] text-2xl uppercase tracking-wider">RAK <span className="text-amber-500">DESIGNER</span></h1>
        </div>
        
        <div className="flex items-center gap-2">
             <button onClick={() => setIsLocked(!isLocked)} className={`px-4 py-2 rounded-lg font-bold uppercase text-xs flex items-center gap-2 transition-all ${isLocked ? 'bg-emerald-600 text-white shadow-lg' : 'bg-slate-800 text-slate-400'}`}>
                {isLocked ? <Lock size={14}/> : <Unlock size={14}/>} <span className="hidden sm:inline">{isLocked ? 'View' : 'Edit'}</span>
             </button>
             <button onClick={handleDownloadPDF} disabled={isGenerating} className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-bold uppercase text-xs flex items-center gap-2 shadow-lg active:scale-95 transition-all">
                {isGenerating ? <RefreshCw className="animate-spin" size={14}/> : <Download size={14}/>} <span className="hidden sm:inline">PDF</span>
             </button>
        </div>
      </nav>

      <div className="flex flex-1 overflow-hidden relative">
        
        {/* SIDEBAR */}
        <aside className={`${isSidebarOpen ? 'w-80' : 'w-0 -translate-x-full'} absolute md:relative z-[1000] h-full bg-slate-900 border-r border-slate-800 transition-all duration-300 overflow-y-auto custom-scrollbar p-6 no-print`}>
            <button onClick={() => setIsSidebarOpen(false)} className="md:hidden absolute top-4 right-4 text-slate-400"><ChevronLeft size={24}/></button>

            <div className="space-y-6 pb-24">
                <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700">
                    <label className="text-[10px] font-black text-slate-500 uppercase mb-3 flex items-center gap-2"><Type size={14}/> Saiz Tulisan</label>
                    <div className="flex items-center justify-between bg-slate-900 rounded-lg p-1">
                        <button onClick={() => setFontSize(Math.max(8, fontSize - 1))} className="w-8 h-8 flex items-center justify-center hover:bg-slate-700 rounded text-slate-300 transition-all"><Minus size={14}/></button>
                        <span className="text-xs font-bold text-white font-mono">{fontSize}px</span>
                        <button onClick={() => setFontSize(Math.min(16, fontSize + 1))} className="w-8 h-8 flex items-center justify-center hover:bg-slate-700 rounded text-slate-300 transition-all"><Plus size={14}/></button>
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase flex items-center gap-2"><Layers size={14}/> Pilih Template (15 Gaya)</label>
                    <div className="grid grid-cols-1 gap-1.5 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                        {[
                            {id:'CARDS_UI', name: 'Cards Modern', icon: CreditCard},
                            {id:'BENTO_GRID', name: 'Bento Style', icon: Grid},
                            {id:'OFFICIAL_GOVT', name: 'Rasmi Kerajaan', icon: FileText},
                            {id:'CORPORATE_PRO', name: 'Korporat Pro', icon: Briefcase},
                            {id:'VISUAL_MAGAZINE', name: 'Majalah Visual', icon: Layout},
                            {id:'TIMELINE_FLOW', name: 'Timeline Flow', icon: GitCommit},
                            {id:'MINDMAP_NET', name: 'Mindmap Net', icon: Share2},
                            {id:'HONEYCOMB_HEX', name: 'Honeycomb Hex', icon: Hexagon},
                            {id:'SPLIT_SCREEN', name: 'Split Screen', icon: Columns},
                            {id:'CIRCLE_LENS', name: 'Circle Lens', icon: CircleDot},
                            {id:'SIDEBAR_INFO', name: 'Sidebar Info', icon: SidebarIcon},
                            {id:'COMPACT_GRID', name: 'Compact Grid', icon: Box},
                            {id:'EXECUTIVE_REPORT', name: 'Executive Report', icon: Star},
                            {id:'MINUTES_STYLE', name: 'Minit Curai', icon: ListOrdered},
                            {id:'TABLE_DATA', name: 'Data Jadual', icon: Table},
                        ].map((t) => (
                            <button key={t.id} onClick={() => setSelectedTemplate(t.id as any)} className={`w-full p-2.5 rounded-xl border text-[9px] font-bold uppercase text-left flex items-center gap-3 transition-all ${selectedTemplate === t.id ? 'bg-blue-600 border-blue-500 text-white shadow-lg' : 'bg-slate-800/40 border-slate-700 text-slate-400 hover:bg-slate-800 hover:text-white'}`}>
                                <t.icon size={14}/> {t.name}
                            </button>
                        ))}
                    </div>
                </div>

                <div>
                    <label className="text-[10px] font-black text-slate-500 uppercase mb-3 flex items-center gap-2"><Palette size={14}/> Tema Warna</label>
                    <div className="flex gap-2 flex-wrap">
                        {['#1e3a8a', '#b91c1c', '#047857', '#d97706', '#7e22ce', '#000000'].map(c => (
                            <button key={c} onClick={() => setThemeColor(c)} className={`w-7 h-7 rounded-full border-2 transition-transform hover:scale-110 ${themeColor === c ? 'border-white scale-110 shadow-lg' : 'border-transparent opacity-40 hover:opacity-100'}`} style={{backgroundColor: c}}/>
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
                            <button onClick={() => fileInputRef.current?.click()} className="aspect-square border-2 border-dashed border-slate-700 rounded-lg flex items-center justify-center text-slate-500 hover:text-white hover:border-slate-500 transition-all bg-slate-800/30 hover:bg-slate-800/60"><Plus size={20}/></button>
                        )}
                    </div>
                    <input type="file" ref={fileInputRef} multiple className="hidden" accept="image/*" onChange={handleImageUpload}/>
                </div>
            </div>
        </aside>

        {/* TOGGLE BUTTON */}
        <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="hidden md:flex absolute z-[1002] top-1/2 -translate-y-1/2 bg-slate-900 border border-slate-800 text-white p-1 rounded-r-xl shadow-xl transition-all hover:bg-slate-800 no-print" style={{left: isSidebarOpen ? '320px' : '0'}}>
            {isSidebarOpen ? <ChevronLeft size={20}/> : <ChevronRight size={20}/>}
        </button>

        {/* PREVIEW AREA */}
        <main className="flex-1 relative bg-slate-900/10 flex items-start justify-center overflow-auto p-4 md:p-8 no-scrollbar scroll-smooth">
            <div 
                className="transition-transform duration-500 ease-out origin-top shadow-[0_0_100px_rgba(0,0,0,0.4)] mb-32 no-print"
                style={{ transform: `scale(${scale})` }}
            >
                <div className="w-[794px] h-[1123px] bg-white shadow-2xl overflow-hidden flex flex-col shrink-0">
                    {renderTemplateContent()}
                </div>
            </div>
        </main>
      </div>

      {/* HIDDEN PRINT ENGINE */}
      <div style={{ position: 'absolute', top: -9999, left: -9999 }}>
        <div ref={printRef} style={{ width: '794px', height: '1123px', backgroundColor: 'white' }}>
            {renderTemplateContent()}
        </div>
      </div>
    </div>
  );
};

export default ReportGeneratorScreen;