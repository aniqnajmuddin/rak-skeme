import React, { useState, useEffect, useRef } from 'react';
import { studentDataService } from '../services/studentDataService';
import { ActivityRecordModel } from '../types';
import { 
    Award, ArrowLeft, Layout, Upload, CheckCircle, RefreshCw, Download, 
    Type, Palette, ShieldCheck, PenTool, Sparkles, Star, Crown, Minus, Plus, 
    X, Eraser, MousePointer2
} from 'lucide-react';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

// --- KOMPONEN EDITABLE TEXT ---
const SmartText = ({ val, setVal, fontSize, setFontSize, className = "", style = {} }: any) => {
    const [showTool, setShowTool] = useState(false);
    return (
        <div className="relative group/text inline-block" onMouseEnter={() => setShowTool(true)} onMouseLeave={() => setShowTool(false)}>
            {showTool && (
                <div className="absolute -top-10 left-1/2 -translate-x-1/2 flex items-center gap-1 bg-slate-900 text-white rounded-md p-1 shadow-xl z-[100] no-print scale-90 border border-white/20">
                    <button onClick={() => setFontSize(Math.max(6, fontSize - 2))} className="hover:bg-slate-700 p-1 rounded"><Minus size={14}/></button>
                    <span className="text-xs font-bold min-w-[24px] text-center font-mono">{fontSize}</span>
                    <button onClick={() => setFontSize(Math.min(120, fontSize + 2))} className="hover:bg-slate-700 p-1 rounded"><Plus size={14}/></button>
                </div>
            )}
            <input 
                value={val} 
                onChange={e => setVal(e.target.value)} 
                className={`bg-transparent border border-dashed border-transparent hover:border-blue-400 focus:border-blue-600 rounded px-2 outline-none transition-all text-center ${className}`}
                style={{ fontSize: `${fontSize}px`, ...style }}
            />
        </div>
    );
};

const CertificateScreen: React.FC<{onBack: () => void, isDarkMode?: boolean}> = ({ onBack, isDarkMode = true }) => {
    const [activities, setActivities] = useState<ActivityRecordModel[]>([]);
    const [selectedActivity, setSelectedActivity] = useState<ActivityRecordModel | null>(null);
    const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
    const [selectedTemplate, setSelectedTemplate] = useState<number>(1);
    const [schoolLogo, setSchoolLogo] = useState<string | null>(null);
    const [kpmLogo, setKpmLogo] = useState<string | null>(null);
    const [signatureImg, setSignatureImg] = useState<string | null>(null);
    const [isGenerating, setIsGenerating] = useState(false);
    const [themeColor, setThemeColor] = useState('#f59e0b');

    const [config, setConfig] = useState({
        mainTitle: 'SIJIL PENGHARGAAN',
        schoolName: 'SEKOLAH KEBANGSAAN MENERONG',
        subText: 'Dengan sukacitanya disahkan bahawa',
        achievementLabel: 'Telah menyertai dan menjayakan',
        signatureName: 'GURU BESAR',
        signatureTitle: 'Guru Besar, SK Menerong',
        dateStr: '12 JANUARI 2026'
    });

    const [fs, setFs] = useState({ title: 56, school: 28, name: 42, sub: 18, activity: 32, sign: 24 });

    useEffect(() => { setActivities(studentDataService.activityRecords); }, []);

    const handleSelectActivity = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const act = activities.find(a => a.programName === e.target.value);
        setSelectedActivity(act || null);
        if (act) {
            setSelectedStudents(act.participants.map(p => p.ic));
            setConfig(prev => ({...prev, dateStr: new Date(act.date).toLocaleDateString('ms-MY', {day:'numeric', month:'long', year:'numeric'}).toUpperCase()}));
        }
    };

    const handleDownloadPDF = async () => {
        if (!selectedActivity || selectedStudents.length === 0) return alert("Sila pilih aktiviti!");
        setIsGenerating(true);
        try {
            const pdf = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
            for (let i = 0; i < selectedStudents.length; i++) {
                const studentIc = selectedStudents[i];
                const certElement = document.getElementById(`cert-${studentIc}`);
                if (certElement) {
                    const canvas = await html2canvas(certElement, { scale: 2, useCORS: true, logging: false });
                    if (i > 0) pdf.addPage();
                    pdf.addImage(canvas.toDataURL('image/jpeg', 0.95), 'JPEG', 0, 0, 297, 210);
                }
            }
            pdf.save(`SIJIL_${selectedActivity.programName.replace(/ /g, '_')}.pdf`);
        } catch (e) { console.error(e); } finally { setIsGenerating(false); }
    };

    const BaseTemplate = ({ name, ic, activity, achievement }: any) => {
        const primary = themeColor;
        
        // --- CONTENT UI SHARED ---
        const SignatureArea = () => (
            <div className="relative flex flex-col items-center min-w-[200px]">
                {signatureImg && (
                    <img src={signatureImg} className="absolute -top-12 h-20 w-auto object-contain z-10 pointer-events-none" alt="signature" />
                )}
                <div className="border-t border-slate-900 w-full pt-2">
                    <SmartText val={config.signatureName} setVal={(v:any)=>setConfig({...config, signatureName:v})} fontSize={fs.sign} setFontSize={(v:any)=>setFs({...fs, sign:v})} className="font-bold block" />
                    <p className="text-[10px] font-bold uppercase text-slate-500">{config.signatureTitle}</p>
                </div>
            </div>
        );

        if (selectedTemplate === 1) return (
            <div className="w-full h-full bg-[#fffdf5] p-12 relative flex flex-col items-center border-[24px] border-double overflow-hidden" style={{ borderColor: primary }}>
                <div className="absolute -top-10 -left-10 w-40 h-40 rounded-full opacity-10" style={{backgroundColor: primary}}></div>
                <div className="w-full flex justify-between px-10 mb-6">
                    <img src={kpmLogo || ""} className="h-20 object-contain" />
                    <img src={schoolLogo || ""} className="h-20 object-contain" />
                </div>
                <SmartText val={config.schoolName} setVal={(v:any)=>setConfig({...config, schoolName:v})} fontSize={fs.school} setFontSize={(v:any)=>setFs({...fs, school:v})} className="font-bold uppercase mb-8" style={{color: primary}} />
                <SmartText val={config.mainTitle} setVal={(v:any)=>setConfig({...config, mainTitle:v})} fontSize={fs.title} setFontSize={(v:any)=>setFs({...fs, title:v})} className="font-black mb-10 tracking-widest" style={{color: '#1e293b'}} />
                <p className="italic text-slate-500 mb-6">{config.subText}</p>
                <SmartText val={name} setVal={()=>{}} fontSize={fs.name} setFontSize={(v:any)=>setFs({...fs, name:v})} className="font-bold border-b-2 border-slate-300 min-w-[60%] mb-2" />
                <p className="font-mono text-slate-400 mb-8">{ic}</p>
                <p className="text-xs font-bold uppercase tracking-widest opacity-50 mb-4">{config.achievementLabel}</p>
                <SmartText val={activity} setVal={()=>{}} fontSize={fs.activity} setFontSize={(v:any)=>setFs({...fs, activity:v})} className="font-bold uppercase max-w-3xl leading-tight mb-6" style={{color: primary}} />
                <div className="flex justify-between w-full mt-auto px-10 pb-4 items-end">
                    <div className="text-center"><p className="text-[10px] font-bold text-slate-400 uppercase">Tarikh</p><p className="font-bold">{config.dateStr}</p></div>
                    <SignatureArea />
                </div>
            </div>
        );

        return (
            <div className="w-full h-full bg-white flex overflow-hidden relative">
                <div className="w-[30%] h-full flex flex-col justify-between p-10 relative text-white" style={{backgroundColor: primary}}>
                    <div className="relative z-10">
                        <img src={schoolLogo || ""} className="h-20 bg-white p-2 rounded-xl mb-6 shadow-xl" />
                        <h2 className="text-5xl font-['Teko'] font-bold leading-tight uppercase">WIRA<br/>KOKU</h2>
                    </div>
                    <div className="relative z-10 border-t border-white/20 pt-6">
                        {signatureImg && <img src={signatureImg} className="absolute -top-16 left-0 h-20 invert grayscale brightness-200" />}
                        <SmartText val={config.signatureName} setVal={(v:any)=>setConfig({...config, signatureName:v})} fontSize={fs.sign} setFontSize={(v:any)=>setFs({...fs, sign:v})} className="font-bold text-white text-left block" />
                        <p className="text-[10px] uppercase font-bold text-white/60">{config.signatureTitle}</p>
                    </div>
                </div>
                <div className="w-[70%] h-full p-16 flex flex-col justify-center relative">
                    <img src={kpmLogo || ""} className="absolute top-10 right-10 h-16 opacity-30" />
                    <SmartText val={config.mainTitle} setVal={(v:any)=>setConfig({...config, mainTitle:v})} fontSize={fs.title-10} setFontSize={(v:any)=>setFs({...fs, title:v})} className="font-black text-slate-900 mb-8 text-left uppercase" />
                    <p className="text-slate-400 uppercase font-bold text-xs mb-2 tracking-widest">{config.subText}</p>
                    <SmartText val={name} setVal={()=>{}} fontSize={fs.name} setFontSize={(v:any)=>setFs({...fs, name:v})} className="font-bold text-slate-900 text-left mb-10" style={{color: primary}} />
                    <div className="pl-6 border-l-8" style={{borderColor: primary}}>
                        <p className="text-[10px] font-bold text-slate-400 uppercase mb-2">{config.achievementLabel}</p>
                        <SmartText val={activity} setVal={()=>{}} fontSize={fs.activity-4} setFontSize={(v:any)=>setFs({...fs, activity:v})} className="font-bold text-slate-800 text-left uppercase mb-4" />
                        <div className="flex gap-4 items-center">
                            <span className="px-3 py-1 text-white text-[10px] font-bold rounded uppercase" style={{backgroundColor: primary}}>{achievement}</span>
                            <span className="text-xs font-bold text-slate-400">{config.dateStr}</span>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className={`flex flex-col h-full ${isDarkMode ? 'bg-[#0F172A]' : 'bg-slate-50'}`}>
            <div className="p-6 flex justify-between items-center border-b border-white/5 no-print">
                <div className="flex items-center gap-4">
                    <button onClick={onBack} className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-white"><ArrowLeft size={20}/></button>
                    <h2 className="text-2xl font-['Teko'] font-bold uppercase tracking-wider flex items-center gap-2">
                        <Award className="text-amber-500" /> Penjana Sijil <span className="text-amber-500/50 text-xs ml-2">v2.0</span>
                    </h2>
                </div>
                <button onClick={handleDownloadPDF} disabled={isGenerating || !selectedActivity} className="bg-amber-500 hover:bg-amber-400 text-slate-900 px-6 py-2 rounded-xl font-bold uppercase text-xs flex items-center gap-2 shadow-lg active:scale-95 disabled:opacity-30">
                    {isGenerating ? <RefreshCw className="animate-spin" size={16}/> : <Download size={16}/>}
                    {isGenerating ? 'Menjana...' : `Download PDF (${selectedStudents.length})`}
                </button>
            </div>

            <div className="flex flex-1 overflow-hidden no-print">
                <div className="w-80 overflow-y-auto p-6 bg-slate-900/50 border-r border-white/5 custom-scrollbar space-y-6">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-500 uppercase flex items-center gap-2"><Sparkles size={14}/> 1. Aktiviti</label>
                        <select onChange={handleSelectActivity} className="w-full bg-slate-800 border-slate-700 text-white p-3 rounded-xl text-xs font-bold uppercase outline-none focus:ring-2 ring-amber-500/50">
                            <option value="">-- Sila Pilih --</option>
                            {activities.map((act, i) => <option key={i} value={act.programName}>{act.programName}</option>)}
                        </select>
                    </div>

                    <div className="space-y-4">
                        <label className="text-[10px] font-black text-slate-500 uppercase flex items-center gap-2"><Crown size={14}/> 2. Tema & Tanda Tangan</label>
                        <div className="flex gap-2">
                            {[1, 2].map(t => (
                                <button key={t} onClick={() => setSelectedTemplate(t)} className={`flex-1 py-3 rounded-xl border text-[10px] font-bold uppercase transition-all ${selectedTemplate === t ? 'bg-amber-500 border-amber-500 text-slate-900' : 'bg-slate-800 border-slate-700 text-slate-400'}`}>Template {t}</button>
                            ))}
                        </div>
                        <div className="flex gap-2 flex-wrap">
                            {['#f59e0b', '#3b82f6', '#10b981', '#ef4444', '#8b5cf6'].map(c => (
                                <button key={c} onClick={() => setThemeColor(c)} className={`w-7 h-7 rounded-full border-2 transition-all ${themeColor === c ? 'border-white scale-110 shadow-lg' : 'border-transparent opacity-50'}`} style={{backgroundColor: c}} />
                            ))}
                        </div>

                        {/* SIGNATURE OPTIONAL UPLOAD */}
                        <div className="bg-slate-800/50 p-4 rounded-2xl border border-slate-700 border-dashed">
                             <div className="flex justify-between items-center mb-3">
                                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Tanda Tangan (Pilihan)</label>
                                {signatureImg && <button onClick={() => setSignatureImg(null)} className="text-red-400 hover:text-red-300 transition-colors"><Eraser size={14}/></button>}
                             </div>
                             <button onClick={() => document.getElementById('sign-upload')?.click()} className="w-full h-20 bg-slate-900/50 rounded-xl flex flex-col items-center justify-center border border-slate-700 hover:border-amber-500/50 transition-all group">
                                {signatureImg ? (
                                    <img src={signatureImg} className="h-16 object-contain" />
                                ) : (
                                    <>
                                        <MousePointer2 size={20} className="text-slate-600 group-hover:text-amber-500 transition-colors mb-1"/>
                                        <span className="text-[8px] font-bold text-slate-600 uppercase">Upload PNG Saja</span>
                                    </>
                                )}
                             </button>
                             <input id="sign-upload" type="file" className="hidden" accept="image/png" onChange={e => e.target.files && setSignatureImg(URL.createObjectURL(e.target.files[0]))}/>
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                            <button onClick={() => document.getElementById('logo-s')?.click()} className="p-3 bg-slate-800 rounded-xl text-[9px] font-bold text-slate-400 uppercase border border-slate-700">Logo Sek</button>
                            <button onClick={() => document.getElementById('logo-k')?.click()} className="p-3 bg-slate-800 rounded-xl text-[9px] font-bold text-slate-400 uppercase border border-slate-700">Logo KPM</button>
                            <input id="logo-s" type="file" className="hidden" onChange={e => e.target.files && setSchoolLogo(URL.createObjectURL(e.target.files[0]))}/>
                            <input id="logo-k" type="file" className="hidden" onChange={e => e.target.files && setKpmLogo(URL.createObjectURL(e.target.files[0]))}/>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-500 uppercase flex items-center gap-2"><PenTool size={14}/> 3. Kandungan Teks</label>
                        {['mainTitle', 'schoolName', 'subText', 'achievementLabel', 'signatureName', 'signatureTitle', 'dateStr'].map((key) => (
                            <div key={key}>
                                <label className="text-[8px] font-black text-slate-600 uppercase ml-1">{key.replace(/([A-Z])/g, ' $1')}</label>
                                <input value={(config as any)[key]} onChange={e => setConfig({...config, [key]: e.target.value})} className="w-full bg-slate-800/30 border-slate-700 text-white p-2 rounded-lg text-[10px] outline-none focus:border-amber-500/50" />
                            </div>
                        ))}
                    </div>
                </div>

                <div className="flex-1 bg-slate-950/50 p-10 flex items-center justify-center overflow-auto custom-scrollbar">
                    <div className="shadow-[0_0_100px_rgba(0,0,0,0.6)] transform scale-[0.45] md:scale-[0.55] lg:scale-[0.65] xl:scale-[0.8] origin-center transition-transform duration-500">
                        <div className="w-[297mm] h-[210mm] bg-white">
                            <BaseTemplate 
                                name={selectedActivity?.participants[0]?.name || "NAMA PENERIMA"} 
                                ic={selectedActivity?.participants[0]?.ic || "NO. KAD PENGENALAN"} 
                                activity={selectedActivity?.programName || "NAMA PROGRAM / AKTIVITI"} 
                                achievement={selectedActivity?.participants[0]?.achievement || "PENYERTAAN"} 
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Hidden Generation Engine */}
            <div id="cert-print-engine" className="fixed top-[-9999mm] left-0">
                {selectedActivity && selectedStudents.map(ic => {
                    const student = selectedActivity.participants.find(p => p.ic === ic);
                    if (!student) return null;
                    return (
                        <div key={ic} id={`cert-${ic}`} className="w-[297mm] h-[210mm] bg-white">
                            <BaseTemplate name={student.name} ic={student.ic} activity={selectedActivity.programName} achievement={student.achievement} />
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default CertificateScreen;