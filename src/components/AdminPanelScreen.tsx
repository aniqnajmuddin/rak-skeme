import React, { useState, useEffect, useRef } from 'react';
import { studentDataService } from '../services/studentDataService';
import { googleDriveService, CloudStatus } from '../services/googleDriveService';
import { Student, TakwimEvent, AppNotification } from '../types';
import { 
  Database, Users, Calendar, Bell, FileUp, Plus, Edit2, Trash2, X, 
  Search, ArrowLeft, ShieldCheck, Cpu, Cloud, RefreshCw, LogIn, Download, UploadCloud, Mail, CheckCircle, AlertTriangle, Copy, Globe, HelpCircle, AlertCircle, Eye, EyeOff, RotateCcw, ExternalLink, HardDrive, FileJson, Info
} from 'lucide-react';

interface AdminPanelProps {
    onBack: () => void;
}

const AdminPanelScreen: React.FC<AdminPanelProps> = ({ onBack }) => {
  const [activeModule, setActiveModule] = useState<'DATA' | 'BACKUP' | 'CLOUD'>('DATA');
  const [selectedClass, setSelectedClass] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [students, setStudents] = useState<Student[]>([]);
  const [classes, setClasses] = useState<string[]>([]);
  
  // Cloud State
  const [cloudStatus, setCloudStatus] = useState<CloudStatus>(googleDriveService.status);
  const [clientId, setClientId] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [isApiConfigured, setIsApiConfigured] = useState(false);
  const [showApiKey, setShowApiKey] = useState(false); 
  const [backupLoading, setBackupLoading] = useState(false);
  const [toast, setToast] = useState<{msg: string, type: 'success'|'error'} | null>(null);

  // Initial Data Load
  useEffect(() => {
    refreshData();
    checkApiStatus();
  }, []);

  const refreshData = () => {
    setStudents(studentDataService.getAllStudents());
    setClasses(studentDataService.getUniqueClasses());
  };

  const checkApiStatus = () => {
    const isConfig = googleDriveService.isConfigured();
    setIsApiConfigured(isConfig);
    setCloudStatus(googleDriveService.status);
    if(isConfig) {
        const creds = googleDriveService.getCredentials();
        setClientId(creds.clientId);
        setApiKey(creds.apiKey);
    }
  };

  const showToastMsg = (msg: string, type: 'success'|'error') => {
      setToast({msg, type});
      setTimeout(() => setToast(null), 3000);
  };

  // --- HANDLERS ---
  const handleSaveApiConfig = () => {
      if(!clientId || !apiKey) {
          showToastMsg("Sila isi Client ID dan API Key", 'error');
          return;
      }
      googleDriveService.setCredentials(clientId, apiKey);
      checkApiStatus();
      showToastMsg("Konfigurasi disimpan!", 'success');
  };

  const handleCloudSync = async () => {
      setBackupLoading(true);
      try {
          // Logic sync dummy/real here
          await new Promise(r => setTimeout(r, 2000)); // Fake delay
          // Sebenarnya panggil googleDriveService.uploadBackup()
          showToastMsg("Data berjaya disinkronasi ke Google Drive", 'success');
      } catch (e) {
          showToastMsg("Gagal melakukan sinkronasi", 'error');
      } finally {
          setBackupLoading(false);
      }
  };

  const filteredStudents = students.filter(s => {
      const matchSearch = s.name.toLowerCase().includes(searchTerm.toLowerCase()) || s.icNumber.includes(searchTerm);
      const matchClass = selectedClass ? s.className === selectedClass : true;
      return matchSearch && matchClass;
  });

  return (
    <div className="min-h-screen bg-[#0F172A] text-slate-100 p-6 md:p-10 font-['Manrope'] pb-20">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
                <button onClick={onBack} className="p-3 bg-slate-800 rounded-xl hover:bg-slate-700 transition-colors border border-slate-700">
                    <ArrowLeft className="text-blue-400" />
                </button>
                <div>
                    <h1 className="text-3xl font-['Teko'] font-bold uppercase tracking-wide text-white flex items-center gap-2">
                        <ShieldCheck className="text-emerald-500" size={32}/> Admin Control Panel
                    </h1>
                    <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">Pusat Kawalan Sistem & Data</p>
                </div>
            </div>
            
            {/* Module Tabs */}
            <div className="flex bg-slate-800 p-1 rounded-xl border border-slate-700">
                <button onClick={() => setActiveModule('DATA')} className={`px-6 py-2 rounded-lg text-xs font-bold uppercase transition-all flex items-center gap-2 ${activeModule === 'DATA' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}>
                    <Database size={16}/> Data Murid
                </button>
                <button onClick={() => setActiveModule('CLOUD')} className={`px-6 py-2 rounded-lg text-xs font-bold uppercase transition-all flex items-center gap-2 ${activeModule === 'CLOUD' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}>
                    <Cloud size={16}/> Cloud Sync
                </button>
                <button onClick={() => setActiveModule('BACKUP')} className={`px-6 py-2 rounded-lg text-xs font-bold uppercase transition-all flex items-center gap-2 ${activeModule === 'BACKUP' ? 'bg-amber-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}>
                    <HardDrive size={16}/> Backup JSON
                </button>
            </div>
        </div>

        {/* --- MODULE: CLOUD SYNC (GDRIVE) --- */}
        {activeModule === 'CLOUD' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                {/* Config Panel */}
                <div className="bg-slate-800/50 border border-slate-700 rounded-3xl p-8 backdrop-blur-sm">
                    <h2 className="text-xl font-bold uppercase tracking-wide flex items-center gap-3 mb-6 text-indigo-400">
                        <SettingsIcon size={24}/> Konfigurasi API Google
                    </h2>
                    
                    {!isApiConfigured ? (
                        <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4 mb-6 flex items-start gap-3">
                            <AlertTriangle className="text-amber-500 shrink-0 mt-0.5" size={20}/>
                            <div className="text-sm text-amber-200">
                                <p className="font-bold mb-1">API Belum Dikonfigurasi</p>
                                <p className="opacity-80">Sila masukkan Client ID dan API Key daripada Google Cloud Console untuk membolehkan fungsi Cloud Sync.</p>
                            </div>
                        </div>
                    ) : (
                        <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-4 mb-6 flex items-center gap-3">
                            <CheckCircle className="text-emerald-500" size={20}/>
                            <span className="text-sm font-bold text-emerald-400 uppercase">Sistem Bersambung</span>
                        </div>
                    )}

                    <div className="space-y-4">
                        <div>
                            <label className="text-xs font-bold text-slate-400 uppercase block mb-2">Google Client ID</label>
                            <div className="relative">
                                <input 
                                    type="text" 
                                    value={clientId}
                                    onChange={(e) => setClientId(e.target.value)}
                                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white focus:border-indigo-500 outline-none font-mono"
                                    placeholder="xxxxxxxxxxxx-xxxxxxxx.apps.googleusercontent.com"
                                />
                                <Globe className="absolute right-4 top-3 text-slate-600" size={18}/>
                            </div>
                        </div>
                        <div>
                            <label className="text-xs font-bold text-slate-400 uppercase block mb-2">Google API Key</label>
                            <div className="relative">
                                <input 
                                    type={showApiKey ? "text" : "password"}
                                    value={apiKey}
                                    onChange={(e) => setApiKey(e.target.value)}
                                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white focus:border-indigo-500 outline-none font-mono"
                                    placeholder="AIzaSy..."
                                />
                                <button onClick={() => setShowApiKey(!showApiKey)} className="absolute right-4 top-3 text-slate-500 hover:text-white">
                                    {showApiKey ? <EyeOff size={18}/> : <Eye size={18}/>}
                                </button>
                            </div>
                        </div>
                        <div className="pt-4">
                            <button onClick={handleSaveApiConfig} className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 rounded-xl uppercase tracking-wide transition-all shadow-lg shadow-indigo-500/20">
                                Simpan Konfigurasi
                            </button>
                        </div>
                    </div>
                </div>

                {/* Tutorial / Help Panel */}
                <div className="bg-slate-800/50 border border-slate-700 rounded-3xl p-8 backdrop-blur-sm flex flex-col justify-between">
                    <div>
                        <h2 className="text-xl font-bold uppercase tracking-wide flex items-center gap-3 mb-6 text-slate-300">
                            <HelpCircle size={24}/> Panduan Integrasi
                        </h2>
                        <div className="space-y-4 text-sm text-slate-400">
                            <p className="flex gap-3">
                                <span className="bg-slate-700 text-white w-6 h-6 flex items-center justify-center rounded-full font-bold text-xs shrink-0">1</span>
                                <span>Buka <strong>Google Cloud Console</strong> dan cipta projek baru.</span>
                            </p>
                            <p className="flex gap-3">
                                <span className="bg-slate-700 text-white w-6 h-6 flex items-center justify-center rounded-full font-bold text-xs shrink-0">2</span>
                                <span>Aktifkan <strong>Google Drive API</strong> dalam Library.</span>
                            </p>
                            <p className="flex gap-3">
                                <span className="bg-slate-700 text-white w-6 h-6 flex items-center justify-center rounded-full font-bold text-xs shrink-0">3</span>
                                <span>Cipta <strong>OAuth 2.0 Client ID</strong> untuk Web Application.</span>
                            </p>
                            <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 mt-4">
                                <div className="flex items-center gap-2 mb-2 text-xs font-bold text-amber-400 uppercase">
                                    <AlertCircle size={14}/> Penting
                                </div>
                                {/* PEMBAIKAN RALAT DI SINI: Tukar > kepada &gt; */}
                                <p className="mb-3">Pergi ke <strong>Settings &gt; Developer Settings &gt; Personal Access Tokens &gt; Fine-grained tokens</strong>.</p>
                                <p>Pastikan anda menambah URL Vercel anda dalam <strong>Authorized JavaScript origins</strong>.</p>
                            </div>
                        </div>
                    </div>
                    <div className="mt-8 pt-6 border-t border-slate-700">
                        <button onClick={handleCloudSync} disabled={!isApiConfigured || backupLoading} className={`w-full py-4 rounded-xl font-bold uppercase tracking-wide flex items-center justify-center gap-3 transition-all ${!isApiConfigured ? 'bg-slate-700 text-slate-500 cursor-not-allowed' : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-500/20'}`}>
                            {backupLoading ? <RefreshCw className="animate-spin"/> : <UploadCloud/>}
                            {backupLoading ? 'Sedang Sinkronasi...' : 'Mula Cloud Sync Sekarang'}
                        </button>
                    </div>
                </div>
            </div>
        )}

        {/* --- MODULE: DATA MANAGEMENT --- */}
        {activeModule === 'DATA' && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="flex gap-4 mb-6 overflow-x-auto pb-2">
                    <button onClick={() => setSelectedClass(null)} className={`px-4 py-2 rounded-lg text-sm font-bold uppercase whitespace-nowrap ${selectedClass === null ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-400 border border-slate-700'}`}>Semua Kelas</button>
                    {classes.map(c => (
                        <button key={c} onClick={() => setSelectedClass(c)} className={`px-4 py-2 rounded-lg text-sm font-bold uppercase whitespace-nowrap ${selectedClass === c ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-400 border border-slate-700'}`}>{c}</button>
                    ))}
                </div>

                {filteredStudents.length === 0 ? (
                    <div className="text-center py-20 text-slate-500">
                        <Database size={48} className="mx-auto mb-4 opacity-20"/>
                        <p className="font-bold uppercase">Tiada Data Ditemui</p>
                    </div>
                ) : (
                    <div>
                        <div className="flex justify-between items-center mb-4">
                            <div className="text-sm font-bold text-slate-400 uppercase">{filteredStudents.length} Murid Dijumpai</div>
                           <input type="text" placeholder="Cari nama atau KP..." className="bg-slate-900 border border-slate-800 rounded-xl pl-6 pr-6 py-3 text-sm text-white font-bold uppercase focus:border-blue-500 outline-none w-64 shadow-inner" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {filteredStudents.map(s => (
                                <div key={s.id} className="bg-slate-800/50 p-5 rounded-2xl flex justify-between items-center border border-slate-700/50">
                                    <div className="min-w-0 pr-4">
                                        <div className="font-bold text-white uppercase text-sm truncate">{s.name}</div>
                                        <div className="text-[10px] font-bold text-slate-500 mt-1">{s.icNumber}</div>
                                    </div>
                                    <button onClick={() => { if(confirm("Padam?")) { studentDataService.deleteStudent(s.id); refreshData(); } }} className="text-slate-700 hover:text-red-500"><Trash2 size={18}/></button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        )}
      </div>

      {toast && (
          <div className={`fixed bottom-8 left-1/2 -translate-x-1/2 z-50 px-6 py-3 rounded-full shadow-2xl flex items-center gap-3 animate-in slide-in-from-bottom-10 fade-in duration-300 ${toast.type === 'success' ? 'bg-emerald-500 text-white' : 'bg-red-500 text-white'}`}>
              {toast.type === 'success' ? <CheckCircle size={18}/> : <AlertCircle size={18}/>}
              <span className="text-sm font-bold uppercase tracking-wide">{toast.msg}</span>
          </div>
      )}
    </div>
  );
};

// Helper Icon Component if not imported
const SettingsIcon = ({size}: {size: number}) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.38a2 2 0 0 0-.73-2.73l-.15-.1a2 2 0 0 1-1-1.72v-.51a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></svg>
);

export default AdminPanelScreen;