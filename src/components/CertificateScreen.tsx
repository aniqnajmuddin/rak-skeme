import React, { useState, useEffect, useContext } from 'react';
import { studentDataService } from '../services/studentDataService';
import { NotifyContext } from '../App';
import { ActivityRecordModel } from '../types';
import { 
    Award, ArrowLeft, Download, RefreshCw, Sparkles, 
    Crown, Minus, Plus, MousePointer2, Settings2, FileStack
} from 'lucide-react';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

// --- SMART TEXT ENGINE ---
const SmartText = ({ val, setVal, fontSize, setFontSize, className = "", style = {} }: any) => {
    const [showTool, setShowTool] = useState(false);
    return (
        <div className="relative group/text inline-block" onMouseEnter={() => setShowTool(true)} onMouseLeave={() => setShowTool(false)}>
            {showTool && (
                <div className="absolute -top-10 left-1/2 -translate-x-1/2 flex items-center gap-1 bg-slate-900 text-white rounded-md p-1 shadow-xl z-[100] no-print scale-75 border border-white/20">
                    <button onClick={() => setFontSize(Math.max(6, fontSize - 2))} className="hover:bg-slate-700 p-1 rounded"><Minus size={12}/></button>
                    <span className="text-[10px] font-bold min-w-[20px] text-center">{fontSize}</span>
                    <button onClick={() => setFontSize(Math.min(120, fontSize + 2))} className="hover:bg-slate-700 p-1 rounded"><Plus size={12}/></button>
                </div>
            )}
            <input 
                value={val} 
                onChange={e => setVal(e.target.value)} 
                className={`bg-transparent border-b border-dashed border-transparent hover:border-blue-400 focus:border-blue-500 outline-none text-center ${className}`}
                style={{ fontSize: `${fontSize}px`, ...style }}
            />
        </div>
    );
};

const CertificateScreen: React.FC<{onBack: () => void}> = ({ onBack }) => {
    const notifyCtx = useContext(NotifyContext);
    const [activities, setActivities] = useState<ActivityRecordModel[]>([]);
    const [selectedActivity, setSelectedActivity] = useState<ActivityRecordModel | null>(null);
    const [selectedTemplate, setSelectedTemplate] = useState<number>(1);
    const [schoolLogo, setSchoolLogo] = useState<string | null>(null);
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
        dateStr: ''
    });

    const [fs, setFs] = useState({ title: 50, school: 24, name: 38, sub: 16, activity: 28, sign: 20 });

    useEffect(() => { 
        const data = studentDataService.activityRecords || [];
        setActivities(data); 
    }, []);

    const handleSelectActivity = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const act = activities.find(a => a.programName === e.target.value);
        if (act) {
            setSelectedActivity(act);
            const formattedDate = new Date(act.date).toLocaleDateString('ms-MY', {day:'numeric', month:'long', year:'numeric'}).toUpperCase();
            setConfig(prev => ({...prev, dateStr: formattedDate}));
            notifyCtx?.notify(`${act.participants.length} data murid sedia ditarik.`, "success");
        }
    };

    const generateAllPDF = async () => {
        if (!selectedActivity) return notifyCtx?.notify("Pilih aktiviti dulu bohh!", "error");
        setIsGenerating(true);
        const loadId = notifyCtx?.notify(`RAK SKeMe sedang menjana ${selectedActivity.participants.length} sijil...`, "loading");

        try {
            const pdf = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
            const participants = selectedActivity.participants;

            for (let i = 0; i < participants.length; i++) {
                const element = document.getElementById(`cert-render-${i}`);
                if (element) {
                    const canvas = await html2canvas(element, { scale: 2, useCORS: true });
                    if (i > 0) pdf.addPage();
                    pdf.addImage(canvas.toDataURL('image/jpeg', 0.9), 'JPEG', 0, 0, 297, 210);
                }
            }

            pdf.save(`SIJIL_KELOMPOK_${selectedActivity.programName}.pdf`);
            notifyCtx?.notify("Semua sijil berjaya dijana!", "success");
        } catch (e) {
            notifyCtx?.notify("Gagal menjana sijil kelompok.", "error");
        } finally {
            if (loadId) notifyCtx?.removeNotify(loadId);
            setIsGenerating(false);
        }
    };

    const BaseTemplate = ({ name, ic, activity, achievement, isPreview = false }: any) => {
        const primary = themeColor;
        // Template Selection Logic
        const renderHeader = () => (
            <div className="w-full flex justify-between px-10 mb-6">
                <img src={schoolLogo || ""} className="h-20 object-contain opacity-80" />
                <div className="text-right">
                    <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">RAK SKeMe System</p>
                </div>
            </div>
        );

        return (
            <div className="w-full h-full bg-[#fffdf5] p-12 relative flex flex-col items-center border-[20px] border-double overflow-hidden" style={{ borderColor: primary }}>
                {renderHeader()}
                <SmartText val={config.schoolName} setVal={(v:any)=>setConfig({...config, schoolName:v})} fontSize={fs.school} setFontSize={(v:any)=>setFs({...fs, school:v})} className="font-bold uppercase mb-4" style={{color: primary}} />
                <SmartText val={config.mainTitle} setVal={(v:any)=>setConfig({...config, mainTitle:v})} fontSize={fs.title} setFontSize={(v:any)=>setFs({...fs, title:v})} className="font-black mb-6" style={{color: '#1e293b'}} />
                <p className="italic text-slate-500 mb-4 text-sm">{config.subText}</p>
                
                {/* Data Murid Automatik */}
                <h3 className="font-bold border-b border-slate-300 min-w-[50%] mb-2 text-center" style={{ fontSize: `${fs.name}px` }}>{name}</h3>
                <p className="font-mono text-slate-400 mb-6 text-xs">{ic}</p>
                
                <p className="text-[10px] font-bold uppercase tracking-widest opacity-50 mb-2">{config.achievementLabel}</p>
                <h4 className="font-bold uppercase max-w-2xl leading-tight mb-4 text-center" style={{fontSize: `${fs.activity}px`, color: primary}}>{activity}</h4>
                
                {/* Status Pencapaian ditarik dari Rekod */}
                <div className="px-6 py-1 rounded-full text-white font-black text-xs uppercase mb-8" style={{backgroundColor: primary}}>
                    {achievement}
                </div>

                <div className="flex justify-between w-full mt-auto px-10 items-end">
                    <div className="text-center border-t border-slate-300 pt-2 min-w-[150px]">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Tarikh</p>
                        <p className="text-sm font-bold">{config.dateStr}</p>
                    </div>
                    <div className="relative flex flex-col items-center min-w-[200px] border-t border-slate-900 pt-2">
                        {signatureImg && <img src={signatureImg} className="absolute -top-14 h-20 object-contain" />}
                        <SmartText val={config.signatureName} setVal={(v:any)=>setConfig({...config, signatureName:v})} fontSize={fs.sign} setFontSize={(v:any)=>setFs({...fs, sign:v})} className="font-bold block" />
                        <p className="text-[9px] font-bold uppercase text-slate-500">{config.signatureTitle}</p>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="h-screen flex flex-col bg-[#020617] text-white overflow-hidden font-['Manrope']">
            {/* Header */}
            <header className="p-6 border-b border-white/5 flex justify-between items-center bg-[#020617] z-50">
                <div className="flex items-center gap-4">
                    <button onClick={onBack} className="p-3 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all"><ArrowLeft size={20}/></button>
                    <div>
                        <h2 className="text-2xl font-['Teko'] font-bold uppercase tracking-widest leading-none">Penjana <span className="text-amber-500">Sijil Kelompok</span></h2>
                        <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mt-1 italic">Rekod Aktiviti Kokurikulum Sekolah Kebangsaan Menerong</p>
                    </div>
                </div>
                <button 
                    onClick={generateAllPDF} 
                    disabled={isGenerating || !selectedActivity}
                    className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-2xl font-black uppercase text-[10px] flex items-center gap-3 shadow-xl shadow-blue-600/20 active:scale-95 disabled:opacity-20 transition-all"
                >
                    {isGenerating ? <RefreshCw className="animate-spin" size={16}/> : <FileStack size={16}/>}
                    {isGenerating ? 'Sedang Memproses...' : `Cetak Semua Sijil (${selectedActivity?.participants.length || 0})`}
                </button>
            </header>

            <div className="flex flex-1 overflow-hidden">
                {/* Sidebar Controls */}
                <aside className="w-80 border-r border-white/5 p-6 space-y-8 overflow-y-auto no-scrollbar bg-[#020617]">
                    <section className="space-y-3">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2"><Sparkles size={14} className="text-amber-500"/> 1. Pilih Rekod Aktiviti</label>
                        <select onChange={handleSelectActivity} className="w-full bg-white/5 border border-white/10 text-white p-4 rounded-2xl text-[11px] font-bold uppercase outline-none focus:border-amber-500/50">
                            <option value="">-- Pilih Program --</option>
                            {activities.map((act, i) => (
                                <option key={i} value={act.programName} className="bg-slate-900">{act.programName} ({act.participants.length} Murid)</option>
                            ))}
                        </select>
                    </section>

                    <section className="space-y-4">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2"><Crown size={14} className="text-amber-500"/> 2. Kustomasi Global</label>
                        <div className="grid grid-cols-5 gap-2">
                            {['#f59e0b', '#3b82f6', '#10b981', '#ef4444', '#ffffff'].map(c => (
                                <button key={c} onClick={() => setThemeColor(c)} className={`w-8 h-8 rounded-lg border-2 transition-all ${themeColor === c ? 'border-white scale-110' : 'border-transparent opacity-40'}`} style={{backgroundColor: c}} />
                            ))}
                        </div>
                    </section>

                    <section className="space-y-4">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2"><Settings2 size={14} className="text-amber-500"/> 3. Pengesahan</label>
                        <button onClick={() => document.getElementById('logo-upload')?.click()} className="w-full py-3 bg-white/5 border border-white/10 rounded-xl text-[9px] font-black uppercase text-slate-400">Tukar Logo Sekolah</button>
                        <input id="logo-upload" type="file" className="hidden" onChange={e => e.target.files && setSchoolLogo(URL.createObjectURL(e.target.files[0]))}/>
                        
                        <button onClick={() => document.getElementById('sign-upload')?.click()} className="w-full h-24 bg-white/5 border border-dashed border-white/20 rounded-2xl flex flex-col items-center justify-center group overflow-hidden">
                            {signatureImg ? <img src={signatureImg} className="h-16 object-contain" /> : <div className="text-center"><MousePointer2 size={16} className="mx-auto text-slate-600 mb-1"/><span className="text-[8px] font-bold text-slate-600 uppercase">Upload Tanda Tangan</span></div>}
                        </button>
                        <input id="sign-upload" type="file" className="hidden" onChange={e => e.target.files && setSignatureImg(URL.createObjectURL(e.target.files[0]))}/>
                    </section>
                </aside>

                {/* Preview Area (Intelligent) */}
                <main className="flex-1 bg-black/50 p-10 flex items-center justify-center overflow-auto no-scrollbar relative">
                    {!selectedActivity ? (
                        <div className="text-center opacity-20">
                            <Award size={80} className="mx-auto mb-4" />
                            <p className="text-sm font-black uppercase tracking-[0.4em]">Sila Pilih Rekod Aktiviti</p>
                        </div>
                    ) : (
                        <div className="shadow-2xl transform scale-[0.4] lg:scale-[0.7] transition-all duration-500">
                            <div className="w-[297mm] h-[210mm] bg-white">
                                {/* Preview hanya murid pertama dalam list */}
                                <BaseTemplate 
                                    name={selectedActivity.participants[0].name}
                                    ic={selectedActivity.participants[0].ic}
                                    activity={selectedActivity.programName}
                                    achievement={selectedActivity.participants[0].achievement}
                                    isPreview={true}
                                />
                            </div>
                        </div>
                    )}
                    <div className="absolute bottom-10 px-6 py-2 bg-amber-500/10 border border-amber-500/20 rounded-full">
                        <p className="text-[9px] font-black text-amber-500 uppercase tracking-widest flex items-center gap-2"><Sparkles size={12}/> Sistem akan menjana sijil mengikut pencapaian individu murid</p>
                    </div>
                </main>
            </div>

            {/* HIDDEN ENGINE - Tempat semua sijil dirender sebelum masuk PDF */}
            <div className="fixed top-[-9999px] left-0">
                {selectedActivity && selectedActivity.participants.map((p, index) => (
                    <div key={index} id={`cert-render-${index}`} className="w-[297mm] h-[210mm] bg-white">
                        <BaseTemplate 
                            name={p.name}
                            ic={p.ic}
                            activity={selectedActivity.programName}
                            achievement={p.achievement}
                        />
                    </div>
                ))}
            </div>
        </div>
    );
};

export default CertificateScreen;