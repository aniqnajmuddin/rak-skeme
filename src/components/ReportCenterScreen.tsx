import React, { useState, useEffect } from 'react';
import { studentDataService } from '../services/studentDataService';
import { 
  ArrowLeft, Award, Download, Image as ImageIcon, Plus, Minus, 
  Settings2, Upload, LayoutGrid, FileText, Edit3, CheckCircle2
} from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

const ReportCenterScreen: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const [activeTab, setActiveTab] = useState<'CERT' | 'OPR'>('CERT');
  const [records, setRecords] = useState<any[]>([]);
  const [selectedRecord, setSelectedRecord] = useState<any>(null);
  
  // LOGO & ASET
  const [logoKPM] = useState("https://upload.wikimedia.org/wikipedia/commons/b/be/Logo_KPM.png");
  const [logoSekolah, setLogoSekolah] = useState<string | null>(null);
  const [signImg, setSignImg] = useState<string | null>(null);

  // STATE TEMPLATE
  const [certTemplate, setCertTemplate] = useState(1);
  const [oprTemplate, setOprTemplate] = useState(1);
  const [fontSize, setFontSize] = useState(11);

  // DATA STATE
  const [certEdit, setCertEdit] = useState({ title: 'SIJIL PENGHARGAAN', sub: 'Dengan ini dianugerahkan kepada', signatory: 'GURU BESAR' });
  const [oprData, setOprData] = useState({ title: '', objective: '', preparedBy: '', images: [] as string[] });

  useEffect(() => { setRecords(studentDataService.activityRecords || []); }, []);

  const handleImgUpload = (e: any, set: any) => {
    const file = e.target.files?.[0];
    if (file) { const reader = new FileReader(); reader.onloadend = () => set(reader.result as string); reader.readAsDataURL(file); }
  };

  const handleBulkImg = (e: any) => {
    const files = Array.from(e.target.files) as File[];
    const loaded: string[] = [];
    // Hadkan 10 gambar paling atas
    files.slice(0, 10).forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        loaded.push(reader.result as string);
        if (loaded.length === Math.min(files.length, 10)) {
          setOprData(prev => ({ ...prev, images: loaded }));
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const exportPDF = async (id: string, name: string, orient: 'p'|'l') => {
    const el = document.getElementById(id); if (!el) return;
    const canvas = await html2canvas(el, { scale: 2, useCORS: true, allowTaint: true });
    const pdf = new jsPDF(orient, 'mm', 'a4');
    pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, 0, pdf.internal.pageSize.getWidth(), pdf.internal.pageSize.getHeight());
    pdf.save(`${name}.pdf`);
  };

  // --- LOGIK DESIGN SIJIL (15 STYLES) ---
  const renderCertDesign = () => {
    const student = selectedRecord?.participants[0] || { name: 'NAMA PENUH MURID', icNumber: '000000-00-0000' };
    const isDark = [2, 4, 6, 8, 10, 12, 14].includes(certTemplate);
    
    return (
      <div id="cert-canvas" className="w-[842px] h-[595px] relative flex flex-col items-center justify-center bg-white overflow-hidden shadow-2xl">
        {/* DESIGN LAYERS */}
        <div className={`absolute inset-0 border-[25px] m-4 ${isDark ? 'border-blue-900 bg-blue-950' : 'border-blue-900 bg-white'}`}>
           <div className={`absolute inset-2 border-2 ${isDark ? 'border-red-500/30' : 'border-red-600'}`}></div>
           {certTemplate === 3 && <div className="absolute left-0 top-0 h-full w-32 bg-red-700"></div>}
           {certTemplate === 5 && <div className="absolute top-0 w-full h-20 bg-blue-900"></div>}
        </div>

        <div className="absolute top-12 w-full flex justify-center gap-40 z-20">
          <img src={logoKPM} className="h-20 object-contain" />
          {logoSekolah && <img src={logoSekolah} className="h-20 object-contain" />}
        </div>

        <div className={`relative z-10 text-center w-[80%] p-10 rounded-[2.5rem] ${isDark ? 'bg-black/20 backdrop-blur-md text-white' : 'text-blue-950'} space-y-6 mt-10`}>
          <h1 className="text-6xl font-['Teko'] font-bold uppercase tracking-widest leading-none">{certEdit.title}</h1>
          <p className="text-xl italic font-serif opacity-70">{certEdit.sub}</p>
          <div className="py-4 border-y-2 border-current w-[90%] mx-auto">
            <h2 className="text-5xl font-bold uppercase text-red-600 drop-shadow-md leading-tight">{student.name}</h2>
            <p className="text-xl font-bold opacity-50 mt-1">{student.icNumber}</p>
          </div>
          <h3 className="text-3xl font-black uppercase">{selectedRecord?.programName || "TAJUK PROGRAM / AKTIVITI"}</h3>
          <div className="flex justify-between items-end w-full px-12 pt-16">
            <div className="text-center relative">
              {signImg && <img src={signImg} className="h-20 absolute -top-16 left-1/2 -translate-x-1/2 object-contain" />}
              <div className="w-48 border-b-2 border-current mb-2"></div>
              <p className="font-black text-[10px] uppercase">{certEdit.signatory}</p>
            </div>
            <p className="font-black text-[10px] uppercase">{selectedRecord?.date || "06 JANUARI 2026"}</p>
          </div>
        </div>
      </div>
    );
  };

  // --- LOGIK DESIGN OPR (15 LAYOUTS) ---
  const renderOPRDesign = () => {
    const imgs = oprData.images;
    return (
      <div id="opr-canvas" className="w-[595px] h-[842px] bg-white text-black p-10 flex flex-col border relative overflow-hidden">
        {/* Header Rasmi */}
        <div className="flex items-center justify-between border-b-4 border-blue-900 pb-4 mb-6">
          <img src={logoKPM} className="h-16" />
          <div className="text-center flex-1">
            <h2 className="text-2xl font-['Teko'] font-bold leading-none uppercase text-blue-900">Laporan Aktiviti Kokurikulum</h2>
            <p className="text-[10px] font-black text-slate-500 uppercase">SK Menerong, Terengganu</p>
          </div>
          {logoSekolah && <img src={logoSekolah} className="h-16" />}
        </div>

        <div className="space-y-4 flex-1">
          <div className="bg-blue-900 text-white p-4 rounded-xl shadow-lg border-l-[10px] border-red-700">
            <h3 className="text-lg font-bold uppercase leading-tight">{oprData.title || "NAMA PROGRAM / AKTIVITI"}</h3>
          </div>
          
          <div className="border-2 border-slate-100 p-6 rounded-2xl bg-slate-50 min-h-[150px] relative">
            <div className="absolute top-[-10px] left-6 bg-blue-900 text-white px-3 py-0.5 rounded-full text-[8px] font-black uppercase">Laporan & Objektif</div>
            <p className="whitespace-pre-wrap leading-relaxed" style={{ fontSize: `${fontSize}px` }}>{oprData.objective || "Isi kandungan laporan di sini..."}</p>
          </div>

          {/* GRID GAMBAR IKUT TEMPLATE (6-10 GAMBAR) */}
          <div className={`grid gap-2 flex-1 ${oprTemplate % 2 === 0 ? 'grid-cols-2' : 'grid-cols-3'}`}>
             {imgs.map((img, i) => (
               <div key={i} className={`border rounded-lg overflow-hidden bg-slate-100 shadow-sm ${i === 0 && oprTemplate === 3 ? 'col-span-2 row-span-2' : ''}`}>
                 <img src={img} className="w-full h-full object-cover" />
               </div>
             ))}
             {imgs.length === 0 && <div className="col-span-full h-40 border-2 border-dashed border-slate-200 rounded-3xl flex items-center justify-center text-slate-300 font-black uppercase text-[10px]">Tiada Foto Lampiran</div>}
          </div>
        </div>

        {/* Pengesahan */}
        <div className="mt-6 pt-6 border-t-2 border-slate-100 flex justify-between">
          <div className="text-center w-[40%]"><div className="h-10 border-b border-black mb-2"></div><p className="text-[10px] font-black uppercase text-blue-900">{oprData.preparedBy || "DISEDIAKAN OLEH"}</p></div>
          <div className="text-center w-[40%]"><div className="h-10 border-b border-black mb-2"></div><p className="text-[10px] font-black uppercase text-blue-900">DISAHKAN OLEH</p></div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#020617] text-white p-4 lg:p-10 font-['Manrope'] pb-32">
      <div className="max-w-[1700px] mx-auto space-y-6">
        
        {/* NAVIGASI */}
        <div className="flex justify-between items-center bg-white/5 p-4 rounded-[2.5rem] border border-white/10 shadow-2xl">
          <div className="flex items-center gap-4">
            <button onClick={onBack} className="p-3 bg-white/10 rounded-xl text-blue-500 hover:bg-blue-600 hover:text-white transition-all"><ArrowLeft/></button>
            <h1 className="text-4xl font-['Teko'] font-bold uppercase tracking-tight">RAK <span className="text-blue-500 italic">STUDIO</span></h1>
          </div>
          <div className="flex bg-black/40 p-1.5 rounded-2xl border border-white/10">
            <button onClick={() => setActiveTab('CERT')} className={`px-10 py-3 rounded-xl font-black text-[10px] uppercase transition-all flex items-center gap-2 ${activeTab==='CERT'?'bg-blue-600 shadow-lg text-white':'text-slate-500 hover:text-white'}`}><Award size={18}/> Sijil Digital</button>
            <button onClick={() => setActiveTab('OPR')} className={`px-10 py-3 rounded-xl font-black text-[10px] uppercase transition-all flex items-center gap-2 ${activeTab==='OPR'?'bg-red-600 shadow-lg text-white':'text-slate-500 hover:text-white'}`}><LayoutGrid size={18}/> OPR Generator</button>
          </div>
        </div>
        
        <div className="grid grid-cols-12 gap-8 animate-in fade-in duration-500">
          {/* EDITOR (KIRI) */}
          <div className="col-span-12 lg:col-span-3 space-y-4">
            <div className="bg-white/5 p-8 rounded-[2.5rem] border border-white/10 shadow-xl space-y-6">
              <h3 className="text-[10px] font-black uppercase text-blue-500 border-b border-white/5 pb-4 tracking-widest"><Settings2 size={16} className="inline mr-2"/> Konfigurasi Lab</h3>
              
              <div className="space-y-4">
                 <div className="space-y-1">
                   <label className="text-[9px] font-black text-slate-500 uppercase ml-2">Tajuk Utama</label>
                   <input value={activeTab==='CERT'?certEdit.title:oprData.title} onChange={e=>activeTab==='CERT'?setCertEdit({...certEdit, title:e.target.value.toUpperCase()}):setOprData({...oprData, title:e.target.value.toUpperCase()})} className="w-full bg-black/40 border border-white/10 p-3 rounded-xl text-xs font-bold outline-none focus:border-blue-500" placeholder="MASUKKAN TAJUK..." />
                 </div>

                 {activeTab === 'OPR' && (
                    <div className="space-y-4">
                       <textarea value={oprData.objective} onChange={e=>setOprData({...oprData, objective: e.target.value})} className="w-full h-32 bg-black/40 border border-white/10 p-4 rounded-xl text-xs outline-none focus:border-red-500 resize-none" placeholder="ISI LAPORAN..." />
                       <div className="flex items-center justify-between bg-black/40 p-3 rounded-xl">
                          <span className="text-[10px] font-black uppercase text-slate-500">Saiz Font</span>
                          <div className="flex gap-2"><button onClick={()=>setFontSize(f=>f-1)} className="p-1 hover:bg-white/10 rounded"><Minus size={14}/></button><button onClick={()=>setFontSize(f=>f+1)} className="p-1 hover:bg-white/10 rounded"><Plus size={14}/></button></div>
                       </div>
                    </div>
                 )}

                 <div className="grid grid-cols-2 gap-2">
                    <label className="bg-white/5 border border-dashed border-white/20 p-4 rounded-xl text-center cursor-pointer text-[8px] font-black uppercase hover:bg-white/10 transition-all">
                       <ImageIcon size={14} className="mx-auto mb-1 text-blue-500"/> Logo Sekolah
                       <input type="file" hidden onChange={e => handleImgUpload(e, setLogoSekolah)} />
                    </label>
                    <label className="bg-white/5 border border-dashed border-white/20 p-4 rounded-xl text-center cursor-pointer text-[8px] font-black uppercase hover:bg-white/10 transition-all">
                       <Edit3 size={14} className="mx-auto mb-1 text-emerald-500"/> {activeTab==='CERT'?'Tandatangan':'Foto Pukal'}
                       <input type="file" hidden multiple={activeTab==='OPR'} onChange={e => activeTab==='CERT'?handleImgUpload(e, setSignImg):handleBulkImg(e)} />
                    </label>
                 </div>
              </div>

              {/* BUTANG T1-T15 */}
              <div className="grid grid-cols-5 gap-2 pt-4">
                 {[1,2,3,4,5,6,7,8,9,10,11,12,13,14,15].map(i => (
                   <button key={i} onClick={()=>activeTab==='CERT'?setCertTemplate(i):setOprTemplate(i)} className={`py-2 rounded-lg text-[9px] font-black border transition-all ${activeTab==='CERT'? (certTemplate===i?'bg-blue-600 border-white':'bg-white/5 border-white/10'):(oprTemplate===i?'bg-red-600 border-white':'bg-white/5 border-white/10')}`}>T{i}</button>
                 ))}
              </div>
            </div>
          </div>

          {/* PREVIEW (TENGAH) */}
          <div className="col-span-12 lg:col-span-6 flex flex-col items-center">
            <div className="w-full bg-slate-900 border border-white/10 rounded-[4rem] p-10 flex flex-col items-center overflow-hidden shadow-inner relative group">
              <div className="transform scale-[0.6] lg:scale-[0.55] origin-top shadow-2xl">
                {activeTab === 'CERT' ? renderCertDesign() : renderOPRDesign()}
              </div>
              <button onClick={() => exportPDF(activeTab==='CERT'?'cert-canvas':'opr-canvas', activeTab==='CERT'?'SIJIL':'OPR', activeTab==='CERT'?'l':'p')} className="mt-[-200px] z-50 bg-blue-600 hover:bg-blue-500 px-14 py-5 rounded-3xl font-black uppercase shadow-2xl hover:scale-105 transition-all flex items-center gap-3 border-4 border-white/20"><Download size={24}/> Muat Turun PDF</button>
            </div>
          </div>

          {/* LIST (KANAN) */}
          <div className="col-span-12 lg:col-span-3 bg-white/5 p-6 rounded-[2.5rem] border border-white/10 max-h-[85vh] overflow-y-auto no-scrollbar">
             <h3 className="text-[10px] font-black uppercase text-slate-500 mb-6 border-b border-white/5 pb-4 tracking-widest"><FileText size={14} className="inline mr-2"/> Senarai Rekod</h3>
             {records.map(r => (
                <div key={r.id} onClick={() => setSelectedRecord(r)} className={`p-5 rounded-3xl border-2 mb-3 cursor-pointer transition-all ${selectedRecord?.id === r.id ? 'bg-blue-600 border-blue-400 shadow-lg scale-105' : 'bg-black/40 border-white/5 hover:border-white/10'}`}>
                  <p className="text-[11px] font-black uppercase leading-tight text-white mb-2">{r.programName}</p>
                  <div className="flex justify-between items-center text-[8px] font-black text-slate-500 uppercase"><span>{r.date}</span><span>{r.level}</span></div>
                </div>
             ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportCenterScreen;