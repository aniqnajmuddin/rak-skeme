import React, { useState, useRef } from 'react';
import { 
  ArrowLeft, Upload, Image as ImageIcon, Trash2, RefreshCw, Layers, 
  Lock, Unlock, Download, Palette, Layout, FileText, Grid, Camera, Zap, Star,
  Share2, GitCommit, ListOrdered, CircleDot, Hexagon, CreditCard, Sidebar,
  Columns, AlignLeft, Box, Table, Type, Minus, Plus, Briefcase
} from 'lucide-react';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

// --- KOMPONEN BANTUAN ---

// EditableText kini terima prop 'fontSize'
const EditableText = ({ val, setVal, className = "", multi = false, style, placeholder, fontSize = 11 }: any) => {
    // FIX KRITIKAL: Paksa text jadi hitam (#000) supaya jelas bila print PDF
    // Walaupun dark mode, input ini akan kekal gelap atas kertas cerah.
    const baseClass = `w-full bg-transparent border border-dashed border-transparent hover:border-slate-400 focus:border-blue-500 rounded px-1 outline-none transition-all text-slate-900 ${className}`;

    // Style tambahan untuk font size dynamic
    const dynamicStyle = { ...style, fontSize: `${fontSize}px`, lineHeight: '1.4' };

    if (multi) {
        return (
            <textarea 
                value={val} 
                onChange={e => setVal(e.target.value)} 
                className={`${baseClass} resize-none block h-full`}
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
    <div className="w-full h-full flex items-center justify-center overflow-hidden bg-white/90 backdrop-blur-sm border-2 border-slate-100 rounded-xl shadow-sm">
        {src ? <img src={src} className="w-full h-full object-contain"/> : <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{text}</span>}
    </div>
);

// --- SENARAI TEMPLATE ---
type TemplateType = 
  'CARDS_UI' | 'BENTO_GRID' | 'TIMELINE_FLOW' | 'OFFICIAL_GOVT' | 
  'CORPORATE_PRO' | 'VISUAL_MAGAZINE' | 'MINDMAP_NET' | 'SPLIT_SCREEN' |
  'COMPACT_GRID' | 'EXECUTIVE_REPORT' | 'MINUTES_STYLE' | 'TABLE_DATA' |
  'HONEYCOMB_HEX' | 'SIDEBAR_INFO' | 'CIRCLE_LENS';

interface ReportGeneratorProps {
  onBack: () => void;
  isDarkMode?: boolean;
}

const ReportGeneratorScreen: React.FC<ReportGeneratorProps> = ({ onBack, isDarkMode = true }) => {
  // --- STATE ---
  const [title, setTitle] = useState('LAPORAN AKTIVITI KOKURIKULUM');
  const [date, setDate] = useState('12 JANUARI 2026');
  const [venue, setVenue] = useState('DEWAN PERDANA SK MENERONG');
  const [participants, setParticipants] = useState('SEMUA MURID TAHUN 4, 5 & 6');
  
  const [content, setContent] = useState({
    objectives: '1. Memperkasa potensi kepimpinan murid.\n2. Membina disiplin tinggi.\n3. Semangat kerjasama.',
    summary: 'Program berjalan lancar dengan penyertaan aktif murid. Objektif tercapai 100%. Murid menunjukkan komitmen yang tinggi sepanjang program dijalankan.',
    strengths: 'Komitmen guru tinggi & peralatan lengkap. Kerjasama murid sangat baik.',
    weaknesses: 'Masa aktiviti agak padat menyebabkan sedikit kekangan masa.',
    improvement: 'Memanjangkan masa pada masa hadapan.'
  });
  const [preparedBy, setPreparedBy] = useState('SETIAUSAHA KOKURIKULUM');
  
  const [images, setImages] = useState<string[]>([]);
  const [schoolLogo, setSchoolLogo] = useState<string | null>(null);
  const [kpmLogo, setKpmLogo] = useState<string | null>(null);
  
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateType>('CARDS_UI');
  const [themeColor, setThemeColor] = useState('#1e3a8a'); 
  const [fontSize, setFontSize] = useState(11); // State untuk saiz font (Default 11px)
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [isLocked, setIsLocked] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const printRef = useRef<HTMLDivElement>(null);

  // --- HANDLERS ---
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
        const canvas = await html2canvas(element, {
            scale: 2, useCORS: true, logging: false,
            width: 794, height: 1123, windowWidth: 794, windowHeight: 1123,
            backgroundColor: '#ffffff'
        });
        element.style.display = 'none';
        const imgData = canvas.toDataURL('image/jpeg', 0.95);
        const pdf = new jsPDF('p', 'mm', 'a4');
        pdf.addImage(imgData, 'JPEG', 0, 0, 210, 297);
        pdf.save(`OPR_${title.substring(0, 10)}.pdf`);
    } catch (err) {
        console.error(err);
        alert("Gagal menjana PDF.");
    } finally {
        setIsGenerating(false);
    }
  };

  // --- UI PARTS ---
  
  const StandardHeader = ({center=false, whiteText=false}) => (
    <div className={`flex items-center ${center ? 'justify-center text-center flex-col gap-2' : 'justify-between'} border-b-2 pb-4 mb-4 shrink-0 relative z-10`} style={{ borderColor: whiteText ? 'rgba(255,255,255,0.3)' : themeColor }}>
            {!center && <div className="w-16 h-16"><LogoBox src={schoolLogo} text="LOGO"/></div>}
            <div className={center ? 'text-center' : ''}>
                <h1 className={`text-xl font-black uppercase leading-none ${whiteText ? 'text-white' : ''}`} style={{ color: whiteText ? undefined : themeColor }}>SEKOLAH KEBANGSAAN MENERONG</h1>
                <p className={`text-[10px] font-bold uppercase tracking-widest mt-1 ${whiteText ? 'text-slate-300' : 'text-slate-500'}`}>Laporan Aktiviti Kokurikulum</p>
            </div>
            {!center && <div className="w-16 h-16"><LogoBox src={kpmLogo} text="KPM"/></div>}
    </div>
  );

  const StandardFooter = ({whiteText=false}) => (
    <div className={`mt-auto pt-2 border-t flex justify-end shrink-0 relative z-10`} style={{ borderColor: whiteText ? 'rgba(255,255,255,0.3)' : '#94a3b8' }}>
        <div className="w-56 text-right">
            <p className={`text-[9px] font-bold uppercase mb-6 ${whiteText ? 'text-slate-300' : 'text-slate-500'}`}>Disediakan Oleh:</p>
            <EditableText val={preparedBy} setVal={setPreparedBy} className={`font-bold uppercase text-xs text-right ${whiteText ? 'text-white' : 'text-slate-900'}`}/>
            <div className={`h-0.5 w-full mt-1 ${whiteText ? 'bg-slate-400' : 'bg-slate-800'}`}></div>
        </div>
    </div>
  );

  const StandardImageGrid = ({limit=4, cols=2}) => (
    <div className={`grid ${cols === 3 ? 'grid-cols-3' : 'grid-cols-2'} gap-3 mb-4`}>
            {images.slice(0,limit).map((img, i) => (
                <div key={i} className="aspect-video bg-white overflow-hidden border-2 border-white shadow-md rounded-lg relative group">
                    <img src={img} className="w-full h-full object-cover"/>
                </div>
            ))}
            {images.length === 0 && <div className="col-span-full h-24 flex items-center justify-center bg-white/50 text-xs text-slate-400 italic border-2 border-dashed border-slate-300 rounded-lg">Ruang Gambar (Sila Upload)</div>}
    </div>
  );

  // Helper untuk hasilkan background warna elegant
  const getElegantBg = () => ({
      backgroundImage: `linear-gradient(135deg, ${themeColor}10 0%, #ffffff 100%)`
  });

  // --- TEMPLATE RENDERER ---
  const renderTemplate = () => {
    switch(selectedTemplate) {
        
        // 1. CARDS UI (Gaya Kad Moden)
        case 'CARDS_UI': return (
            <div className="w-full h-full p-8 font-sans flex flex-col relative overflow-hidden" style={getElegantBg()}>
                <div className="absolute inset-0 opacity-[0.05]" style={{backgroundImage: `radial-gradient(${themeColor} 1px, transparent 1px)`, backgroundSize: '24px 24px'}}></div>
                <StandardHeader />
                <div className="grid grid-cols-3 gap-4 mb-4 relative z-10">
                    <div className="col-span-2 bg-white p-4 rounded-xl shadow-sm border-l-4" style={{borderColor: themeColor}}>
                        <h6 className="text-[9px] font-bold uppercase text-slate-400 mb-1">Tajuk Program</h6>
                        <EditableText val={title} setVal={setTitle} className="font-black text-xl uppercase leading-tight" style={{color: themeColor}}/>
                    </div>
                    <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100">
                        <h6 className="text-[9px] font-bold uppercase text-slate-400 mb-1">Tarikh</h6>
                        <p className="font-bold text-slate-800 text-sm">{date}</p>
                    </div>
                </div>
                <div className="grid grid-cols-2 gap-4 flex-1 relative z-10">
                    <div className="flex flex-col gap-4">
                        <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-100 flex-1 flex flex-col">
                            <h3 className="font-bold uppercase text-xs mb-2 flex items-center gap-2 text-slate-500 border-b pb-2"><Layout size={14}/> Objektif</h3>
                            <EditableText val={content.objectives} setVal={(v:string)=>setContent({...content,objectives:v})} fontSize={fontSize} multi/>
                        </div>
                        <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-100 flex-1 flex flex-col">
                            <h3 className="font-bold uppercase text-xs mb-2 flex items-center gap-2 text-slate-500 border-b pb-2"><FileText size={14}/> Rumusan</h3>
                            <EditableText val={content.summary} setVal={(v:string)=>setContent({...content,summary:v})} fontSize={fontSize} multi/>
                        </div>
                    </div>
                    <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-100 flex flex-col">
                         <h3 className="font-bold uppercase text-xs mb-3 text-slate-500 border-b pb-2">Galeri Aktiviti</h3>
                         <div className="grid grid-cols-2 gap-3 mb-auto">
                            {images.slice(0,4).map((img, i) => (
                                <div key={i} className="aspect-square rounded-lg overflow-hidden border border-slate-100 shadow-sm">
                                    <img src={img} className="w-full h-full object-cover"/>
                                </div>
                            ))}
                         </div>
                         <div className="mt-4 pt-4 border-t border-dashed">
                             <div className="grid grid-cols-2 gap-4">
                                 <div className="bg-green-50 p-2 rounded border border-green-100"><span className="text-[9px] font-bold text-green-700 uppercase block mb-1">Kekuatan</span><EditableText val={content.strengths} setVal={(v:string)=>setContent({...content,strengths:v})} fontSize={fontSize-2} multi/></div>
                                 <div className="bg-red-50 p-2 rounded border border-red-100"><span className="text-[9px] font-bold text-red-700 uppercase block mb-1">Kekangan</span><EditableText val={content.weaknesses} setVal={(v:string)=>setContent({...content,weaknesses:v})} fontSize={fontSize-2} multi/></div>
                             </div>
                         </div>
                    </div>
                </div>
                <StandardFooter />
            </div>
        );

        // 2. BENTO GRID
        case 'BENTO_GRID': return (
            <div className="w-full h-full p-8 font-sans flex flex-col relative" style={getElegantBg()}>
                <div className="absolute inset-0 opacity-[0.05]" style={{backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '20px 20px'}}></div>
                <div className="relative z-10 grid grid-cols-3 grid-rows-5 gap-3 flex-1">
                    <div className="col-span-2 row-span-1 bg-white p-5 rounded-2xl shadow-sm border border-slate-200 flex flex-col justify-center relative overflow-hidden">
                        <div className="absolute right-0 top-0 w-24 h-24 opacity-10 rounded-full -mr-8 -mt-8" style={{backgroundColor: themeColor}}></div>
                        <EditableText val={title} setVal={setTitle} className="font-black text-2xl uppercase leading-none relative z-10" style={{color: themeColor}}/>
                        <div className="flex gap-2 mt-2 relative z-10">
                            <span className="bg-slate-100 px-2 py-0.5 rounded text-[10px] font-bold uppercase text-slate-500">{date}</span>
                            <span className="bg-slate-100 px-2 py-0.5 rounded text-[10px] font-bold uppercase text-slate-500">{venue}</span>
                        </div>
                    </div>
                    <div className="col-span-1 row-span-1 bg-white p-3 rounded-2xl shadow-sm border border-slate-200 flex items-center justify-center gap-3">
                         <div className="w-10 h-10"><LogoBox src={schoolLogo} text="S"/></div>
                         <div className="w-10 h-10"><LogoBox src={kpmLogo} text="K"/></div>
                    </div>
                    <div className="col-span-2 row-span-2 bg-white p-5 rounded-2xl shadow-sm border border-slate-200 flex gap-4">
                        <div className="flex-1 flex flex-col">
                             <h3 className="font-bold uppercase text-xs text-slate-400 mb-2">Objektif</h3>
                             <EditableText val={content.objectives} setVal={(v:string)=>setContent({...content,objectives:v})} fontSize={fontSize} multi/>
                        </div>
                        <div className="w-px bg-slate-100"></div>
                        <div className="flex-1 flex flex-col">
                             <h3 className="font-bold uppercase text-xs text-slate-400 mb-2">Impak</h3>
                             <EditableText val={content.summary} setVal={(v:string)=>setContent({...content,summary:v})} fontSize={fontSize} multi/>
                        </div>
                    </div>
                    <div className="col-span-1 row-span-2 bg-slate-200 rounded-2xl overflow-hidden border-2 border-white shadow-sm">
                        {images[0] ? <img src={images[0]} className="w-full h-full object-cover"/> : <div className="flex h-full items-center justify-center text-xs text-slate-400">Gambar 1</div>}
                    </div>
                    <div className="col-span-3 row-span-2 grid grid-cols-3 gap-3">
                         {images.slice(1,4).map((img, i) => (
                             <div key={i} className="bg-slate-200 rounded-2xl overflow-hidden border-2 border-white shadow-sm">
                                 <img src={img} className="w-full h-full object-cover"/>
                             </div>
                         ))}
                    </div>
                </div>
                <div className="mt-2 text-right relative z-10"><p className="text-[9px] font-bold uppercase text-slate-400">Disediakan: {preparedBy}</p></div>
            </div>
        );

        // 3. TIMELINE FLOW
        case 'TIMELINE_FLOW': return (
            <div className="w-full h-full p-10 font-sans flex flex-col relative overflow-hidden" style={getElegantBg()}>
                <div className="absolute inset-0 opacity-[0.03]" style={{backgroundImage: 'linear-gradient(90deg, transparent 50%, #000 50%)', backgroundSize: '4px 100%'}}></div>
                <StandardHeader />
                <div className="relative flex-1 flex flex-col gap-4 pl-8 border-l-4 ml-4" style={{borderColor: themeColor}}>
                    <div className="relative group">
                        <div className="absolute -left-[42px] top-0 w-5 h-5 rounded-full border-4 bg-white z-10" style={{borderColor: themeColor}}></div>
                        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm group-hover:shadow-md transition-shadow">
                             <EditableText val={title} setVal={setTitle} className="font-black text-xl uppercase mb-1" style={{color: themeColor}}/>
                             <p className="text-xs font-bold text-slate-500 uppercase">{date} @ {venue}</p>
                        </div>
                    </div>
                    <div className="relative flex-1 group">
                        <div className="absolute -left-[42px] top-4 w-5 h-5 rounded-full border-4 bg-white border-slate-300 z-10"></div>
                        <h3 className="text-xs font-black uppercase mb-1 text-slate-400 ml-1">Laporan Program</h3>
                        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm h-full flex flex-col">
                             <div className="flex gap-4 flex-1">
                                 <div className="w-1/2 border-r pr-4">
                                     <h4 className="text-[10px] font-bold uppercase text-slate-400 mb-2">Objektif</h4>
                                     <EditableText val={content.objectives} setVal={(v:string)=>setContent({...content,objectives:v})} fontSize={fontSize} multi/>
                                 </div>
                                 <div className="w-1/2">
                                     <h4 className="text-[10px] font-bold uppercase text-slate-400 mb-2">Rumusan</h4>
                                     <EditableText val={content.summary} setVal={(v:string)=>setContent({...content,summary:v})} fontSize={fontSize} multi/>
                                 </div>
                             </div>
                        </div>
                    </div>
                     <div className="relative">
                        <div className="absolute -left-[42px] top-4 w-5 h-5 rounded-full border-4 bg-white border-slate-300 z-10"></div>
                        <h3 className="text-xs font-black uppercase mb-1 text-slate-400 ml-1">Galeri</h3>
                        <StandardImageGrid limit={4} cols={2}/>
                    </div>
                </div>
                <StandardFooter />
            </div>
        );

        // 4. OFFICIAL GOVT
        case 'OFFICIAL_GOVT': return (
            <div className="w-full h-full bg-white p-12 font-serif flex flex-col text-slate-900 relative">
                <div className="absolute inset-0 opacity-[0.02] pointer-events-none" style={{backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M54.627 0l.83.828-1.415 1.415-.828-.828-.828.828-1.415-1.415.828-.828-.828-.828 1.415-1.415.828.828.828-.828 1.415 1.415-.828.828zM22.485 0l.83.828-1.415 1.415-.828-.828-.828.828-1.415-1.415.828-.828-.828-.828 1.415-1.415.828.828.828-.828 1.415 1.415-.828.828zM0 22.485l.828.83-1.415 1.415-.828-.828-.828.828L-3.658 22.485l.828-.828-.828-.828 1.415-1.415.828.828.828-.828 1.415 1.415-.828.828zM0 54.627l.828.83-1.415 1.415-.828-.828-.828.828L-3.658 54.627l.828-.828-.828-.828 1.415-1.415.828.828.828-.828 1.415 1.415-.828.828zM54.627 32.142l.83.828-1.415 1.415-.828-.828-.828.828-1.415-1.415.828-.828-.828-.828 1.415-1.415.828.828.828-.828 1.415 1.415-.828.828zM22.485 32.142l.83.828-1.415 1.415-.828-.828-.828.828-1.415-1.415.828-.828-.828-.828 1.415-1.415.828.828.828-.828 1.415 1.415-.828.828z' fill='%23000000' fill-opacity='1' fill-rule='evenodd'/%3E%3C/svg%3E")`}}></div>
                <div className="flex flex-col items-center mb-6 text-slate-900 relative z-10 border-b-2 border-slate-900 pb-4">
                    <div className="w-20 h-20 mb-2"><LogoBox src={schoolLogo} text="JATA"/></div>
                    <h2 className="font-bold uppercase text-xl text-center text-slate-900 leading-tight">SEKOLAH KEBANGSAAN MENERONG</h2>
                    <p className="text-sm text-center w-full text-slate-900">21200 KUALA TERENGGANU, TERENGGANU</p>
                </div>
                <div className="flex-1 text-slate-900 flex flex-col gap-4 relative z-10">
                    <EditableText val={title} setVal={setTitle} className="font-bold uppercase underline text-center text-lg mb-4 text-slate-900"/>
                    <div className="bg-white border-2 border-slate-900 p-1">
                        <table className="w-full text-sm border-collapse">
                            <tbody>
                                <tr className="border-b border-slate-300"><td className="p-2 font-bold w-1/4 bg-slate-100">1. TARIKH</td><td className="p-2 uppercase">{date}</td></tr>
                                <tr className="border-b border-slate-300"><td className="p-2 font-bold bg-slate-100">2. TEMPAT</td><td className="p-2 uppercase">{venue}</td></tr>
                                <tr><td className="p-2 font-bold bg-slate-100">3. SASARAN</td><td className="p-2 uppercase">{participants}</td></tr>
                            </tbody>
                        </table>
                    </div>
                    <div className="flex-1 flex flex-col gap-4 mt-2">
                         <div className="border border-slate-400 p-4 rounded bg-white flex-1 shadow-sm">
                             <h3 className="font-bold text-sm uppercase mb-2 underline bg-slate-100 inline-block px-2">4.0 Objektif Program</h3>
                             <EditableText val={content.objectives} setVal={(v:string)=>setContent({...content,objectives:v})} fontSize={fontSize} multi/>
                         </div>
                         <div className="border border-slate-400 p-4 rounded bg-white flex-1 shadow-sm">
                             <h3 className="font-bold text-sm uppercase mb-2 underline bg-slate-100 inline-block px-2">5.0 Rumusan / Impak</h3>
                             <EditableText val={content.summary} setVal={(v:string)=>setContent({...content,summary:v})} fontSize={fontSize} multi/>
                         </div>
                    </div>
                </div>
                <StandardFooter />
            </div>
        );

        // 5. CORPORATE PRO
        case 'CORPORATE_PRO': return (
            <div className="w-full h-full p-10 font-sans flex flex-col relative border-r-[20px]" style={{borderColor: themeColor, ...getElegantBg()}}>
                <StandardHeader />
                <div className="mb-6 bg-white p-6 border-l-4 rounded-r-xl shadow-sm" style={{borderColor: themeColor}}>
                    <h6 className="text-[10px] font-bold uppercase text-slate-400 mb-1">Laporan Eksekutif</h6>
                    <EditableText val={title} setVal={setTitle} className="font-black text-2xl uppercase leading-none text-slate-800"/>
                </div>
                <div className="flex gap-6 flex-1">
                    <div className="w-1/3 flex flex-col gap-4">
                        <div className="bg-white p-4 rounded-xl border border-slate-200">
                             <h4 className="font-bold text-xs uppercase text-slate-400 mb-2">Maklumat</h4>
                             <div className="space-y-3">
                                 <div><span className="text-[10px] block font-bold text-slate-400">Tarikh</span><span className="text-sm font-bold">{date}</span></div>
                                 <div><span className="text-[10px] block font-bold text-slate-400">Tempat</span><span className="text-sm font-bold">{venue}</span></div>
                             </div>
                        </div>
                        <div className="bg-white p-4 rounded-xl border border-slate-200 flex-1">
                             <h4 className="font-bold text-xs uppercase text-slate-400 mb-2">Analisis</h4>
                             <div className="space-y-4">
                                 <div><span className="text-[10px] block font-bold text-green-600">Kekuatan</span><EditableText val={content.strengths} setVal={(v:string)=>setContent({...content,strengths:v})} fontSize={fontSize-1} multi/></div>
                                 <div><span className="text-[10px] block font-bold text-red-600">Kekangan</span><EditableText val={content.weaknesses} setVal={(v:string)=>setContent({...content,weaknesses:v})} fontSize={fontSize-1} multi/></div>
                             </div>
                        </div>
                    </div>
                    <div className="w-2/3 flex flex-col gap-4">
                         <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex-1 flex flex-col">
                             <h4 className="font-bold text-xs uppercase text-slate-400 border-b pb-2 mb-2">Laporan Penuh</h4>
                             <EditableText val={content.summary} setVal={(v:string)=>setContent({...content,summary:v})} fontSize={fontSize} multi/>
                         </div>
                         <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                             <StandardImageGrid limit={2} cols={2}/>
                         </div>
                    </div>
                </div>
                <StandardFooter />
            </div>
        );

        // 6. VISUAL MAGAZINE
        case 'VISUAL_MAGAZINE': return (
            <div className="w-full h-full bg-white font-serif flex flex-col">
                <div className="h-72 relative w-full bg-slate-900 shrink-0">
                    {images[0] ? <img src={images[0]} className="w-full h-full object-cover opacity-80"/> : <div className="w-full h-full flex items-center justify-center text-white/50 text-xl font-bold uppercase">Gambar Utama</div>}
                    <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-transparent"></div>
                    <div className="absolute bottom-0 left-0 p-8 w-full">
                        <span className="bg-black text-white text-[10px] font-bold uppercase px-2 py-1 mb-2 inline-block">Laporan Khas</span>
                        <EditableText val={title} setVal={setTitle} className="text-4xl font-bold uppercase text-slate-900 leading-none shadow-white drop-shadow-md"/>
                    </div>
                </div>
                <div className="p-8 pt-4 flex-1 columns-2 gap-8 text-justify">
                    <div className="break-inside-avoid mb-6 font-sans">
                         <p className="font-bold text-xs text-slate-500 uppercase border-b pb-1 mb-1">Tarikh / Tempat</p>
                         <p className="font-bold text-sm">{date} • {venue}</p>
                    </div>
                    <div className="mb-4 text-sm leading-relaxed first-letter:text-5xl first-letter:font-bold first-letter:float-left first-letter:mr-2">
                        <EditableText val={content.summary} setVal={(v:string)=>setContent({...content,summary:v})} fontSize={fontSize} multi className="text-slate-900"/>
                    </div>
                    <div className="break-inside-avoid bg-slate-100 p-4 border-l-4 border-black mb-6 mt-4">
                        <h4 className="font-bold uppercase text-xs mb-2">Objektif Utama</h4>
                        <EditableText val={content.objectives} setVal={(v:string)=>setContent({...content,objectives:v})} fontSize={fontSize} multi/>
                    </div>
                    <div className="break-inside-avoid grid grid-cols-2 gap-2 mt-4">
                        {images.slice(1,3).map((img, i) => <img key={i} src={img} className="w-full h-32 object-cover grayscale hover:grayscale-0 transition-all"/>)}
                    </div>
                </div>
                <div className="px-8 pb-4"><StandardFooter /></div>
            </div>
        );

        // 7. MINDMAP NET
        case 'MINDMAP_NET': return (
            <div className="w-full h-full p-8 font-sans flex flex-col items-center justify-center relative" style={getElegantBg()}>
                 <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#ccc_1px,transparent_1px)] [background-size:20px_20px]"></div>
                 <StandardHeader center/>
                 <div className="flex-1 w-full flex flex-col justify-center gap-8 relative z-10">
                     <div className="mx-auto bg-white p-6 rounded-2xl shadow-xl border-2 w-2/3 text-center relative" style={{borderColor: themeColor}}>
                         <EditableText val={title} setVal={setTitle} className="font-black text-2xl uppercase text-center" style={{color: themeColor}}/>
                         <div className="absolute top-1/2 -left-8 w-8 h-1 bg-slate-300"></div>
                         <div className="absolute top-1/2 -right-8 w-8 h-1 bg-slate-300"></div>
                         <div className="absolute bottom-0 left-1/2 w-1 h-8 bg-slate-300"></div>
                     </div>
                     <div className="grid grid-cols-2 gap-12">
                         <div className="bg-white p-5 rounded-xl shadow-md border-l-8 flex flex-col" style={{borderColor: themeColor}}>
                             <h3 className="font-bold uppercase text-xs mb-2 flex items-center gap-2">Objektif</h3>
                             <EditableText val={content.objectives} setVal={(v:string)=>setContent({...content,objectives:v})} fontSize={fontSize} multi/>
                         </div>
                         <div className="bg-white p-5 rounded-xl shadow-md border-r-8 flex flex-col" style={{borderColor: themeColor}}>
                             <h3 className="font-bold uppercase text-xs mb-2 flex items-center gap-2 justify-end">Rumusan</h3>
                             <EditableText val={content.summary} setVal={(v:string)=>setContent({...content,summary:v})} className="text-right" fontSize={fontSize} multi/>
                         </div>
                     </div>
                     <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
                         <StandardImageGrid limit={4} cols={2}/>
                     </div>
                 </div>
                 <StandardFooter />
            </div>
        );

        // 8. COMPACT GRID
        case 'COMPACT_GRID': return (
            <div className="w-full h-full p-10 font-sans flex flex-col" style={getElegantBg()}>
                <StandardHeader />
                <EditableText val={title} setVal={setTitle} className="font-black text-center text-xl uppercase mb-6 p-2 bg-white rounded shadow-sm" style={{color: themeColor}}/>
                <div className="grid grid-cols-3 gap-6 flex-1">
                     <div className="col-span-1 flex flex-col gap-4">
                         <div className="bg-white p-4 rounded border h-1/2 overflow-hidden flex flex-col shadow-sm">
                            <h3 className="font-bold text-xs uppercase mb-2 underline">Objektif</h3>
                            <EditableText val={content.objectives} setVal={(v:string)=>setContent({...content,objectives:v})} fontSize={fontSize} multi/>
                         </div>
                         <div className="bg-white p-4 rounded border h-1/2 overflow-hidden flex flex-col shadow-sm">
                            <h3 className="font-bold text-xs uppercase mb-2 underline">Impak</h3>
                            <EditableText val={content.summary} setVal={(v:string)=>setContent({...content,summary:v})} fontSize={fontSize} multi/>
                         </div>
                     </div>
                     <div className="col-span-2 grid grid-cols-2 gap-2 content-start">
                         {images.map((img, i) => <div key={i} className="aspect-square bg-slate-200 rounded border border-slate-300 overflow-hidden"><img src={img} className="w-full h-full object-cover"/></div>)}
                     </div>
                </div>
                <StandardFooter />
            </div>
        );

        // 9. EXECUTIVE REPORT
        case 'EXECUTIVE_REPORT': return (
            <div className="w-full h-full bg-white p-12 font-sans flex flex-col">
                 <div className="flex items-center gap-4 mb-8 border-b-4 pb-4" style={{borderColor: themeColor}}>
                     <div className="w-20 h-20 bg-slate-100 rounded-lg"><LogoBox src={schoolLogo} text="LOGO"/></div>
                     <div>
                         <EditableText val={title} setVal={setTitle} className="text-3xl font-black uppercase tracking-tighter" style={{color: themeColor}}/>
                         <p className="text-sm font-bold text-slate-500">LAPORAN EKSEKUTIF PENGURUSAN KOKURIKULUM</p>
                     </div>
                 </div>
                 <div className="grid grid-cols-3 gap-8 flex-1">
                     <div className="col-span-1 space-y-6 border-r pr-6">
                         <div><h4 className="font-bold text-xs uppercase text-slate-400 mb-1">Tarikh & Masa</h4><p className="font-bold">{date}</p></div>
                         <div><h4 className="font-bold text-xs uppercase text-slate-400 mb-1">Lokasi</h4><p className="font-bold">{venue}</p></div>
                         <div className="pt-4 border-t"><h4 className="font-bold text-xs uppercase text-slate-400 mb-1">Objektif Utama</h4><EditableText val={content.objectives} setVal={(v:string)=>setContent({...content,objectives:v})} fontSize={fontSize} multi/></div>
                     </div>
                     <div className="col-span-2 flex flex-col">
                         <div className="mb-6 bg-slate-50 p-4 rounded"><h4 className="font-bold uppercase mb-2 text-sm">Rumusan Program</h4><EditableText val={content.summary} setVal={(v:string)=>setContent({...content,summary:v})} fontSize={fontSize} multi/></div>
                         <StandardImageGrid limit={2} cols={2}/>
                     </div>
                 </div>
                 <StandardFooter />
            </div>
        );

        // 10. SPLIT SCREEN
        case 'SPLIT_SCREEN': return (
            <div className="w-full h-full bg-white flex font-sans">
                <div className="w-[45%] p-10 flex flex-col border-r border-slate-200" style={getElegantBg()}>
                    <div className="mb-8">
                         <div className="w-16 h-16 mb-4"><LogoBox src={schoolLogo} text="LOGO"/></div>
                         <EditableText val={title} setVal={setTitle} className="font-black text-3xl uppercase leading-tight text-slate-900"/>
                         <p className="text-sm font-bold text-slate-500 mt-2">{date}</p>
                         <p className="text-sm font-bold text-slate-500">{venue}</p>
                    </div>
                    <div className="flex-1 space-y-6 overflow-hidden flex flex-col">
                        <div className="bg-white p-4 rounded-lg shadow-sm border border-slate-100 flex-1 flex flex-col">
                            <h4 className="font-bold uppercase text-xs text-slate-400 mb-2">Laporan</h4>
                            <EditableText val={content.summary} setVal={(v:string)=>setContent({...content,summary:v})} fontSize={fontSize} multi/>
                        </div>
                    </div>
                    <div className="mt-4"><StandardFooter /></div>
                </div>
                <div className="w-[55%] p-4 grid grid-cols-1 gap-4 bg-white">
                    {images.slice(0,3).map((img, i) => (
                        <div key={i} className="w-full h-full rounded-2xl overflow-hidden shadow-sm relative border border-slate-100"><img src={img} className="w-full h-full object-cover absolute inset-0"/></div>
                    ))}
                    {images.length === 0 && <div className="flex items-center justify-center h-full text-slate-300 font-bold text-2xl bg-slate-50 rounded-2xl">RUANG GAMBAR</div>}
                </div>
            </div>
        );
        
        // 11. HONEYCOMB HEX
        case 'HONEYCOMB_HEX': return (
            <div className="w-full h-full p-8 font-sans flex flex-col relative overflow-hidden" style={getElegantBg()}>
                <StandardHeader />
                <div className="flex justify-center flex-wrap gap-4 py-6 relative z-10 min-h-[250px]">
                     {images.length > 0 ? images.map((src, i) => (
                        <div key={i} className="w-32 h-32 relative drop-shadow-lg transition-transform hover:scale-105" style={{ marginTop: i % 2 !== 0 ? '40px' : '0' }}>
                            <div className="w-full h-full object-cover bg-white" style={{ 
                                clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)',
                                backgroundImage: `url(${src})`, backgroundSize: 'cover', backgroundPosition: 'center'
                            }} />
                        </div>
                    )) : <div className="w-full text-center text-slate-400 italic">Sila upload gambar</div>}
                </div>
                <div className="flex-1 bg-white p-6 rounded-2xl shadow-sm border border-slate-100 mt-6 z-10 flex flex-col">
                    <div className="grid grid-cols-2 gap-8 h-full">
                        <div className="flex flex-col"><h3 className="font-black uppercase text-xs mb-2 text-blue-600">Objektif</h3><EditableText val={content.objectives} setVal={(v:string)=>setContent({...content,objectives:v})} fontSize={fontSize} multi/></div>
                        <div className="flex flex-col"><h3 className="font-black uppercase text-xs mb-2 text-blue-600">Rumusan</h3><EditableText val={content.summary} setVal={(v:string)=>setContent({...content,summary:v})} fontSize={fontSize} multi/></div>
                    </div>
                </div>
                <div className="mt-6"><StandardFooter /></div>
            </div>
        );

        // 12. CIRCLE LENS
        case 'CIRCLE_LENS': return (
            <div className="w-full h-full bg-white p-10 font-sans flex flex-col">
                 <StandardHeader center/>
                 <div className="text-center mb-8">
                     <EditableText val={title} setVal={setTitle} className="font-black text-2xl uppercase text-center" style={{color: themeColor}}/>
                     <p className="text-xs font-bold text-slate-400 mt-2">{date} • {venue}</p>
                 </div>
                 <div className="flex justify-center gap-6 mb-8">
                     {images.slice(0,3).map((img, i) => (
                         <div key={i} className="w-32 h-32 rounded-full overflow-hidden border-4 border-slate-100 shadow-lg"><img src={img} className="w-full h-full object-cover"/></div>
                     ))}
                 </div>
                 <div className="bg-slate-50 p-8 rounded-3xl flex-1 text-center flex flex-col border border-slate-100" style={getElegantBg()}>
                     <h3 className="font-bold uppercase text-sm mb-4 text-slate-400 tracking-widest">Laporan Penuh</h3>
                     <EditableText val={content.summary} setVal={(v:string)=>setContent({...content,summary:v})} fontSize={fontSize} multi/>
                     <div className="mt-8 pt-8 border-t border-slate-200"><StandardFooter /></div>
                 </div>
            </div>
        );

        // 13. SIDEBAR INFO
        case 'SIDEBAR_INFO': return (
            <div className="w-full h-full bg-white flex font-sans">
                <div className="w-1/3 bg-slate-50 p-8 border-r border-slate-200 flex flex-col gap-6" style={getElegantBg()}>
                    <div className="w-20 h-20 bg-white rounded-full p-2 mx-auto shadow-sm"><LogoBox src={schoolLogo} text="LOGO"/></div>
                    <div className="text-center"><h6 className="text-[10px] font-bold uppercase text-slate-400">Tarikh</h6><p className="font-bold text-sm">{date}</p></div>
                    <div className="text-center"><h6 className="text-[10px] font-bold uppercase text-slate-400">Tempat</h6><p className="font-bold text-sm">{venue}</p></div>
                    <div className="mt-auto grid grid-cols-1 gap-2">
                        {images.slice(0,2).map((img, i) => <div key={i} className="aspect-video rounded overflow-hidden border bg-white"><img src={img} className="w-full h-full object-cover"/></div>)}
                    </div>
                </div>
                <div className="w-2/3 p-10 flex flex-col">
                    <EditableText val={title} setVal={setTitle} className="font-black text-3xl uppercase mb-6 leading-tight" style={{color: themeColor}}/>
                    <div className="space-y-8 flex-1 flex flex-col">
                        <div className="flex-1"><h3 className="font-bold uppercase text-xs border-b pb-1 mb-2">Laporan Penuh</h3><EditableText val={content.summary} setVal={(v:string)=>setContent({...content,summary:v})} fontSize={fontSize} multi/></div>
                        <div className="h-1/3"><h3 className="font-bold uppercase text-xs border-b pb-1 mb-2">Objektif</h3><EditableText val={content.objectives} setVal={(v:string)=>setContent({...content,objectives:v})} fontSize={fontSize} multi/></div>
                    </div>
                    <StandardFooter />
                </div>
            </div>
        );

        // 14. MINUTES STYLE
        case 'MINUTES_STYLE': return (
            <div className="w-full h-full bg-white p-10 font-serif text-slate-900">
                <h1 className="text-center font-bold text-lg uppercase mb-2">Minit Curai / Laporan Ringkas</h1>
                <div className="border border-black flex-1 flex flex-col">
                    <div className="flex border-b border-black"><div className="w-32 p-2 border-r border-black font-bold bg-slate-100 text-xs">Program</div><div className="flex-1 p-2 font-bold uppercase"><EditableText val={title} setVal={setTitle}/></div></div>
                    <div className="flex border-b border-black"><div className="w-32 p-2 border-r border-black font-bold bg-slate-100 text-xs">Tarikh/Tempat</div><div className="flex-1 p-2 uppercase text-xs">{date} @ {venue}</div></div>
                    <div className="flex border-b border-black h-40"><div className="w-32 p-2 border-r border-black font-bold bg-slate-100 text-xs">Objektif</div><div className="flex-1 p-2"><EditableText val={content.objectives} setVal={(v:string)=>setContent({...content,objectives:v})} fontSize={fontSize} multi/></div></div>
                    <div className="flex border-b border-black h-40"><div className="w-32 p-2 border-r border-black font-bold bg-slate-100 text-xs">Ulasan</div><div className="flex-1 p-2"><EditableText val={content.summary} setVal={(v:string)=>setContent({...content,summary:v})} fontSize={fontSize} multi/></div></div>
                    <div className="p-2 border-b border-black font-bold bg-slate-100 text-xs text-center">Lampiran Gambar</div>
                    <div className="p-4 grid grid-cols-4 gap-2 flex-1">{images.slice(0,4).map((img, i) => <div key={i} className="aspect-square border border-black"><img src={img} className="w-full h-full object-cover"/></div>)}</div>
                </div>
                <StandardFooter />
            </div>
        );

        // 15. TABLE DATA
        case 'TABLE_DATA': return (
            <div className="w-full h-full bg-white p-10 font-sans flex flex-col">
                <StandardHeader />
                <h1 className="font-bold text-xl uppercase mb-4 border-l-4 pl-4" style={{borderColor: themeColor}}>Laporan Data Aktiviti</h1>
                <table className="w-full border border-slate-300 mb-6">
                    <tbody>
                        <tr className="bg-slate-100"><td className="p-3 border font-bold w-1/4">Nama Program</td><td className="p-3 border"><EditableText val={title} setVal={setTitle}/></td></tr>
                        <tr><td className="p-3 border font-bold">Tarikh</td><td className="p-3 border">{date}</td></tr>
                        <tr className="bg-slate-100"><td className="p-3 border font-bold">Tempat</td><td className="p-3 border">{venue}</td></tr>
                        <tr><td className="p-3 border font-bold">Objektif</td><td className="p-3 border"><EditableText val={content.objectives} setVal={(v:string)=>setContent({...content,objectives:v})} fontSize={fontSize} multi/></td></tr>
                        <tr className="bg-slate-100"><td className="p-3 border font-bold">Rumusan</td><td className="p-3 border"><EditableText val={content.summary} setVal={(v:string)=>setContent({...content,summary:v})} fontSize={fontSize} multi/></td></tr>
                    </tbody>
                </table>
                <StandardImageGrid limit={2}/>
                <StandardFooter />
            </div>
        );
        
        default: return <div className="flex items-center justify-center h-full">PILIH TEMPLATE</div>;
    }
  };

  return (
    <div className={`h-screen flex flex-col ${isDarkMode ? 'bg-[#0F172A]' : 'bg-slate-100'} font-['Manrope'] overflow-hidden`}>
      {/* HEADER UI */}
      <div className="h-16 bg-slate-900 border-b border-slate-800 flex items-center justify-between px-6 shrink-0 z-50">
        <div className="flex items-center gap-4">
             <button onClick={onBack} className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-white hover:bg-slate-700"><ArrowLeft size={20}/></button>
             <h1 className="text-white font-['Teko'] text-2xl uppercase tracking-wide">RAK Designer <span className="text-amber-500 text-sm align-middle ml-2 border border-amber-500 px-2 rounded">PREMIUM</span></h1>
        </div>
        <div className="flex gap-3">
             <button onClick={() => setIsLocked(!isLocked)} className={`px-4 py-2 rounded-lg font-bold uppercase text-xs flex items-center gap-2 ${isLocked ? 'bg-emerald-600 text-white' : 'bg-slate-700 text-slate-300'}`}>
                {isLocked ? <><Lock size={14}/> Preview</> : <><Unlock size={14}/> Edit</>}
             </button>
             <button onClick={handleDownloadPDF} disabled={isGenerating} className="px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-bold uppercase text-xs flex items-center gap-2 shadow-lg">
                {isGenerating ? <RefreshCw className="animate-spin" size={16}/> : <Download size={16}/>} PDF
             </button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* SIDEBAR TOOLS */}
        <div className={`w-80 bg-slate-900 border-r border-slate-800 p-6 overflow-y-auto custom-scrollbar transition-all duration-300 ${isLocked ? '-ml-80' : 'ml-0'}`}>
            <div className="space-y-8 pb-20">
                
                {/* 1. FONT SIZE CONTROLLER (PENYELESAIAN MASALAH TEKS TERPOTONG) */}
                <div className="bg-slate-800 p-4 rounded-xl border border-slate-700">
                    <label className="text-xs font-bold text-slate-400 uppercase mb-3 flex items-center gap-2"><Type size={14}/> Saiz Tulisan</label>
                    <div className="flex items-center justify-between bg-slate-900 rounded-lg p-1">
                        <button onClick={() => setFontSize(Math.max(8, fontSize - 1))} className="p-2 hover:bg-slate-700 rounded text-slate-300"><Minus size={16}/></button>
                        <span className="text-sm font-bold text-white font-mono">{fontSize}px</span>
                        <button onClick={() => setFontSize(Math.min(16, fontSize + 1))} className="p-2 hover:bg-slate-700 rounded text-slate-300"><Plus size={16}/></button>
                    </div>
                </div>

                {/* Template Selector */}
                <div>
                    <label className="text-xs font-bold text-slate-500 uppercase mb-3 block flex items-center gap-2"><Layers size={14}/> Pilihan Template</label>
                    <div className="grid grid-cols-1 gap-2">
                        <p className="text-[10px] font-bold text-slate-600 uppercase mt-2">Moden & Grid</p>
                        <button onClick={() => setSelectedTemplate('CARDS_UI')} className="p-3 rounded-xl border border-slate-700 bg-slate-800 text-[10px] font-bold uppercase text-left text-slate-300 hover:bg-blue-600 hover:text-white flex items-center gap-3"><CreditCard size={14}/> Cards Modern</button>
                        <button onClick={() => setSelectedTemplate('BENTO_GRID')} className="p-3 rounded-xl border border-slate-700 bg-slate-800 text-[10px] font-bold uppercase text-left text-slate-300 hover:bg-blue-600 hover:text-white flex items-center gap-3"><Grid size={14}/> Bento Grid</button>
                        <button onClick={() => setSelectedTemplate('COMPACT_GRID')} className="p-3 rounded-xl border border-slate-700 bg-slate-800 text-[10px] font-bold uppercase text-left text-slate-300 hover:bg-blue-600 hover:text-white flex items-center gap-3"><Layout size={14}/> Compact Grid</button>
                        
                        <p className="text-[10px] font-bold text-slate-600 uppercase mt-2">Formal & Rasmi</p>
                        <button onClick={() => setSelectedTemplate('OFFICIAL_GOVT')} className="p-3 rounded-xl border border-slate-700 bg-slate-800 text-[10px] font-bold uppercase text-left text-slate-300 hover:bg-blue-600 hover:text-white flex items-center gap-3"><FileText size={14}/> Rasmi Kerajaan</button>
                        <button onClick={() => setSelectedTemplate('CORPORATE_PRO')} className="p-3 rounded-xl border border-slate-700 bg-slate-800 text-[10px] font-bold uppercase text-left text-slate-300 hover:bg-blue-600 hover:text-white flex items-center gap-3"><Briefcase size={14}/> Korporat Pro</button>
                        <button onClick={() => setSelectedTemplate('EXECUTIVE_REPORT')} className="p-3 rounded-xl border border-slate-700 bg-slate-800 text-[10px] font-bold uppercase text-left text-slate-300 hover:bg-blue-600 hover:text-white flex items-center gap-3"><Star size={14}/> Eksekutif</button>
                        <button onClick={() => setSelectedTemplate('MINUTES_STYLE')} className="p-3 rounded-xl border border-slate-700 bg-slate-800 text-[10px] font-bold uppercase text-left text-slate-300 hover:bg-blue-600 hover:text-white flex items-center gap-3"><ListOrdered size={14}/> Minit Curai</button>
                        <button onClick={() => setSelectedTemplate('TABLE_DATA')} className="p-3 rounded-xl border border-slate-700 bg-slate-800 text-[10px] font-bold uppercase text-left text-slate-300 hover:bg-blue-600 hover:text-white flex items-center gap-3"><Table size={14}/> Data Table</button>

                        <p className="text-[10px] font-bold text-slate-600 uppercase mt-2">Kreatif & Visual</p>
                        <button onClick={() => setSelectedTemplate('TIMELINE_FLOW')} className="p-3 rounded-xl border border-slate-700 bg-slate-800 text-[10px] font-bold uppercase text-left text-slate-300 hover:bg-blue-600 hover:text-white flex items-center gap-3"><GitCommit size={14}/> Timeline Flow</button>
                        <button onClick={() => setSelectedTemplate('MINDMAP_NET')} className="p-3 rounded-xl border border-slate-700 bg-slate-800 text-[10px] font-bold uppercase text-left text-slate-300 hover:bg-blue-600 hover:text-white flex items-center gap-3"><Share2 size={14}/> Mindmap</button>
                        <button onClick={() => setSelectedTemplate('VISUAL_MAGAZINE')} className="p-3 rounded-xl border border-slate-700 bg-slate-800 text-[10px] font-bold uppercase text-left text-slate-300 hover:bg-blue-600 hover:text-white flex items-center gap-3"><ImageIcon size={14}/> Magazine Cover</button>
                        <button onClick={() => setSelectedTemplate('HONEYCOMB_HEX')} className="p-3 rounded-xl border border-slate-700 bg-slate-800 text-[10px] font-bold uppercase text-left text-slate-300 hover:bg-blue-600 hover:text-white flex items-center gap-3"><Hexagon size={14}/> Honeycomb</button>
                        <button onClick={() => setSelectedTemplate('SIDEBAR_INFO')} className="p-3 rounded-xl border border-slate-700 bg-slate-800 text-[10px] font-bold uppercase text-left text-slate-300 hover:bg-blue-600 hover:text-white flex items-center gap-3"><Sidebar size={14}/> Sidebar Info</button>
                        <button onClick={() => setSelectedTemplate('SPLIT_SCREEN')} className="p-3 rounded-xl border border-slate-700 bg-slate-800 text-[10px] font-bold uppercase text-left text-slate-300 hover:bg-blue-600 hover:text-white flex items-center gap-3"><Columns size={14}/> Split Screen</button>
                        <button onClick={() => setSelectedTemplate('CIRCLE_LENS')} className="p-3 rounded-xl border border-slate-700 bg-slate-800 text-[10px] font-bold uppercase text-left text-slate-300 hover:bg-blue-600 hover:text-white flex items-center gap-3"><CircleDot size={14}/> Circle Lens</button>
                    </div>
                </div>

                {/* Color Picker */}
                <div>
                    <label className="text-xs font-bold text-slate-500 uppercase mb-3 block flex items-center gap-2"><Palette size={14}/> Warna Tema</label>
                    <div className="flex gap-2 flex-wrap">
                        {['#1e3a8a', '#b91c1c', '#047857', '#d97706', '#7e22ce', '#000000', '#ec4899'].map(c => (
                            <button key={c} onClick={() => setThemeColor(c)} className={`w-8 h-8 rounded-full border-2 ${themeColor === c ? 'border-white scale-110 shadow-lg' : 'border-transparent opacity-50 hover:opacity-100'}`} style={{backgroundColor: c}}/>
                        ))}
                    </div>
                </div>

                {/* Image Upload */}
                <div>
                    <label className="text-xs font-bold text-slate-500 uppercase mb-3 block flex items-center gap-2"><ImageIcon size={14}/> Gambar ({images.length}/6)</label>
                    <div className="grid grid-cols-3 gap-2 mb-2">
                        {images.map((img, i) => (
                            <div key={i} className="aspect-square relative group rounded overflow-hidden">
                                <img src={img} className="w-full h-full object-cover"/>
                                <button onClick={() => setImages(images.filter((_, idx) => idx !== i))} className="absolute inset-0 bg-black/50 hidden group-hover:flex items-center justify-center text-red-400"><Trash2 size={16}/></button>
                            </div>
                        ))}
                        <button onClick={() => fileInputRef.current?.click()} className="aspect-square border-2 border-dashed border-slate-700 rounded-xl flex items-center justify-center text-slate-500 hover:text-white hover:border-slate-500 transition-colors"><Upload size={20}/></button>
                    </div>
                    <input type="file" ref={fileInputRef} multiple className="hidden" accept="image/*" onChange={handleImageUpload}/>
                </div>

                {/* Logo Upload */}
                <div>
                    <label className="text-xs font-bold text-slate-500 uppercase mb-3 block flex items-center gap-2"><Upload size={14}/> Logo Rasmi</label>
                    <div className="grid grid-cols-2 gap-2">
                        <button className="bg-slate-800 p-3 rounded-xl text-[10px] text-slate-400 uppercase border border-slate-700 hover:bg-slate-700 hover:text-white transition-colors" onClick={() => document.getElementById('sl-upload')?.click()}>
                            {schoolLogo ? 'Tukar Logo Sek' : 'Upload Logo Sek'}
                        </button>
                        <button className="bg-slate-800 p-3 rounded-xl text-[10px] text-slate-400 uppercase border border-slate-700 hover:bg-slate-700 hover:text-white transition-colors" onClick={() => document.getElementById('kpm-upload')?.click()}>
                             {kpmLogo ? 'Tukar Logo KPM' : 'Upload Logo KPM'}
                        </button>
                        <input id="sl-upload" type="file" className="hidden" onChange={(e) => e.target.files && setSchoolLogo(URL.createObjectURL(e.target.files[0]))}/>
                        <input id="kpm-upload" type="file" className="hidden" onChange={(e) => e.target.files && setKpmLogo(URL.createObjectURL(e.target.files[0]))}/>
                    </div>
                </div>
            </div>
        </div>

        {/* PREVIEW AREA */}
        <div className="flex-1 bg-slate-800/50 p-8 overflow-auto flex justify-center relative">
            <div className={`w-[210mm] min-h-[297mm] h-[297mm] bg-white shadow-2xl transition-transform origin-top duration-300 ${isLocked ? 'scale-100 mb-20' : 'scale-[0.55] lg:scale-[0.70] xl:scale-[0.85]'}`}>
                 {renderTemplate()}
            </div>
        </div>
      </div>

      {/* HIDDEN PRINT ENGINE */}
      <div style={{ position: 'absolute', top: -9999, left: -9999 }}>
          <div ref={printRef} style={{ width: '794px', height: '1123px', backgroundColor: 'white' }}>
              {renderTemplate()}
          </div>
      </div>
    </div>
  );
};

export default ReportGeneratorScreen;