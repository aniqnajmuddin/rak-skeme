import React, { useState, useEffect, useContext } from 'react';
import { studentDataService } from '../services/studentDataService';
import { NotifyContext } from '../App';
import { ActivityRecordModel } from '../types';
// KITA TAMBAH RefreshCw KAT SINI
import { 
  FileText, ArrowLeft, Download, Camera, CheckCircle2, 
  Calendar, MapPin, Users, Award, Image as ImageIcon, RefreshCw 
} from 'lucide-react';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

// Tukar interface props supaya isDarkMode tak wajib
interface ReportGeneratorScreenProps {
  onBack: () => void;
  isDarkMode?: boolean;
}

const ReportGeneratorScreen: React.FC<ReportGeneratorScreenProps> = ({ onBack, isDarkMode }) => {
  const notifyCtx = useContext(NotifyContext);
  const [activities, setActivities] = useState<ActivityRecordModel[]>([]);
  const [selectedActivity, setSelectedActivity] = useState<ActivityRecordModel | null>(null);
  const [reportImages, setReportImages] = useState<string[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    const data = studentDataService.activityRecords || [];
    setActivities(data);
  }, []);

  const handleSelectActivity = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const act = activities.find(a => a.programName === e.target.value);
    setSelectedActivity(act || null);
    if (act) notifyCtx?.notify(`Data "${act.programName}" ditarik ke OPR.`, "success");
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files).slice(0, 4);
      const urls = files.map(file => URL.createObjectURL(file));
      setReportImages(urls);
      notifyCtx?.notify("Gambar aktiviti berjaya dimuat naik.", "info");
    }
  };

  const downloadOPR = async () => {
    if (!selectedActivity) return notifyCtx?.notify("Sila pilih aktiviti!", "error");
    setIsGenerating(true);
    const loadId = notifyCtx?.notify("Menjana Laporan OPR...", "loading");

    try {
      const element = document.getElementById('opr-template');
      if (element) {
        const canvas = await html2canvas(element, { scale: 2 });
        const pdf = new jsPDF('p', 'mm', 'a4');
        pdf.addImage(canvas.toDataURL('image/jpeg', 1.0), 'JPEG', 0, 0, 210, 297);
        pdf.save(`OPR_${selectedActivity.programName}.pdf`);
        notifyCtx?.notify("Laporan OPR berjaya dimuat turun!", "success");
      }
    } catch (err) {
      notifyCtx?.notify("Gagal menjana PDF.", "error");
    } finally {
      if (loadId) notifyCtx?.removeNotify(loadId);
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#020617] text-white p-4 md:p-10 pb-32 animate-in fade-in duration-700">
      <div className="max-w-6xl mx-auto">
        
        {/* Header - RAK SKeMe Identity */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
          <div className="flex items-center gap-4">
            <button onClick={onBack} className="p-3 rounded-2xl bg-white/5 border border-white/10 text-blue-500 hover:bg-white/10 transition-all">
              <ArrowLeft size={20} />
            </button>
            <div>
              <h2 className="text-4xl md:text-5xl font-['Teko'] font-bold uppercase leading-none">PENJANA <span className="text-cyan-500">OPR</span></h2>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-[10px] font-black text-cyan-500 tracking-[0.2em] uppercase">RAK SKeMe</span>
                <p className="text-[8px] md:text-[9px] font-bold text-slate-500 uppercase tracking-widest italic">One Page Reporting • SK Menerong</p>
              </div>
            </div>
          </div>
          <button 
            onClick={downloadOPR}
            disabled={!selectedActivity || isGenerating}
            className="w-full md:w-auto bg-cyan-600 hover:bg-cyan-500 text-white px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 shadow-xl shadow-cyan-600/20 disabled:opacity-20 transition-all"
          >
            {isGenerating ? <RefreshCw className="animate-spin" size={16}/> : <Download size={16}/>}
            Download OPR (PDF)
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Sidebar Controls */}
          <div className="space-y-6">
            <div className="bg-white/5 border border-white/10 p-6 rounded-[2rem] space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">1. Pilih Aktiviti</label>
                <select 
                  onChange={handleSelectActivity}
                  className="w-full bg-slate-900 border border-white/10 rounded-xl p-4 text-[11px] font-bold uppercase text-white outline-none focus:border-cyan-500"
                >
                  <option value="">-- Senarai Aktiviti --</option>
                  {activities.map((act, i) => (
                    <option key={i} value={act.programName}>{act.programName}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">2. Gambar Aktiviti (Max 4)</label>
                <div 
                  onClick={() => document.getElementById('opr-img')?.click()}
                  className="w-full h-32 bg-white/5 border-2 border-dashed border-white/10 rounded-2xl flex flex-col items-center justify-center cursor-pointer hover:bg-white/10 transition-all"
                >
                  <Camera size={24} className="text-slate-500 mb-2"/>
                  <span className="text-[9px] font-bold text-slate-500 uppercase">Klik untuk Upload</span>
                  <input id="opr-img" type="file" multiple accept="image/*" className="hidden" onChange={handleImageUpload} />
                </div>
              </div>
            </div>
          </div>

          {/* OPR Preview Area - Intelligent Scaling */}
          <div className="lg:col-span-2 flex justify-center overflow-auto no-scrollbar bg-black/40 rounded-[2.5rem] p-4 md:p-10 border border-white/5">
            <div className="shadow-2xl transform scale-[0.45] sm:scale-[0.6] md:scale-[0.8] lg:scale-[0.65] xl:scale-[0.85] origin-top transition-all">
              
              {/* --- THE OPR TEMPLATE (A4) --- */}
              <div id="opr-template" className="w-[210mm] h-[297mm] bg-white text-slate-900 p-[15mm] flex flex-col">
                {/* Header OPR */}
                <div className="border-b-4 border-slate-900 pb-4 mb-6 flex justify-between items-center">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-slate-200 rounded flex items-center justify-center text-[10px] font-bold">LOGO</div>
                    <div>
                      <h3 className="text-xl font-bold leading-none uppercase">One Page Reporting (OPR)</h3>
                      <p className="text-sm font-medium">Sekolah Kebangsaan Menerong, TBA5014</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-black uppercase opacity-20">RAK SKeMe v2.0</p>
                  </div>
                </div>

                {/* Info Aktiviti */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                    <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Nama Program</p>
                    <p className="font-bold text-sm uppercase">{selectedActivity?.programName || '---'}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                      <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Tarikh</p>
                      <p className="font-bold text-xs">{selectedActivity ? new Date(selectedActivity.date).toLocaleDateString('ms-MY') : '---'}</p>
                    </div>
                    <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                      <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Peringkat</p>
                      <p className="font-bold text-xs uppercase">{selectedActivity?.participants[0]?.level || 'Sekolah'}</p>
                    </div>
                  </div>
                </div>

                {/* Gambar Panel */}
                <div className="grid grid-cols-2 gap-4 mb-6 flex-1 max-h-[400px]">
                  {[0, 1, 2, 3].map(i => (
                    <div key={i} className="aspect-video bg-slate-100 rounded-lg border-2 border-dashed border-slate-200 flex items-center justify-center overflow-hidden">
                      {reportImages[i] ? (
                        <img src={reportImages[i]} className="w-full h-full object-cover" />
                      ) : (
                        <ImageIcon size={24} className="text-slate-300" />
                      )}
                    </div>
                  ))}
                </div>

                {/* Ringkasan & Impak */}
                <div className="space-y-4 mb-6">
                  <div className="border-l-4 border-cyan-500 pl-4">
                    <h4 className="text-xs font-bold uppercase text-slate-500 mb-1">Objektif & Ringkasan</h4>
                    <p className="text-sm leading-relaxed text-slate-700">Program ini bertujuan untuk mencungkil bakat murid dalam bidang kokurikulum serta memupuk semangat kesukanan yang tinggi dalam kalangan warga SK Menerong.</p>
                  </div>
                  <div className="border-l-4 border-emerald-500 pl-4">
                    <h4 className="text-xs font-bold uppercase text-slate-500 mb-1">Pencapaian & Impak</h4>
                    <p className="text-sm leading-relaxed text-slate-700">Seramai {selectedActivity?.participants.length || 0} orang murid telah terlibat secara aktif. Program berjalan dengan lancar dan mencapai objektif yang telah ditetapkan oleh Unit Kokurikulum.</p>
                  </div>
                </div>

                {/* Footer OPR */}
                <div className="mt-auto pt-6 border-t border-slate-200 grid grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="h-16 border-b border-slate-300 mb-2"></div>
                    <p className="text-[10px] font-bold uppercase text-slate-400">Disediakan Oleh</p>
                  </div>
                  <div>
                    <div className="h-16 border-b border-slate-300 mb-2"></div>
                    <p className="text-[10px] font-bold uppercase text-slate-400">Disemak Oleh</p>
                  </div>
                  <div>
                    <div className="h-16 border-b border-slate-300 mb-2"></div>
                    <p className="text-[10px] font-bold uppercase text-slate-400">Disahkan Oleh</p>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportGeneratorScreen;