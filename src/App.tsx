import React, { useState, createContext, useContext, useEffect } from 'react';
// --- IMPORT SEMUA SKRIN ---
import LoginScreen from './components/LoginScreen';
import AdminPanelScreen from './components/AdminPanelScreen';
import ActivityRecordScreen from './components/ActivityRecordScreen';
import AnalysisScreen from './components/AnalysisScreen';
import TakwimScreen from './components/TakwimScreen';
import SportsScreen from './components/SportsScreen';
import StudentDatabaseScreen from './components/StudentDatabaseScreen';
import ReportGeneratorScreen from './components/ReportGeneratorScreen';
import CertificateScreen from './components/CertificateScreen';

// --- ICONS ---
import { 
  LayoutDashboard, ClipboardEdit, BarChart3, Calendar, 
  Trophy, Database, FileText, Award, LogOut, Moon, Sun,
  CheckCircle, AlertCircle, Info, RefreshCw, Bell, Zap, TrendingUp, Users
} from 'lucide-react';

// 1. PROVIDER POPUP (Speaker Sekolah)
export const NotifyContext = createContext<{
  notify: (msg: string, type: "success" | "error" | "info" | "loading") => string;
  removeNotify: (id: string) => void;
} | null>(null);

const App: React.FC = () => {
  const [userRole, setUserRole] = useState<'ADMIN' | 'GURU' | null>(null);
  const [currentScreen, setCurrentScreen] = useState<'DASHBOARD' | 'RECORD' | 'ANALYSIS' | 'TAKWIM' | 'SPORTS' | 'DATABASE' | 'REPORT' | 'CERT'>('DASHBOARD');
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [notifications, setNotifications] = useState<any[]>([]);

  // Fungsi Popup
  const notify = (msg: string, type: "success" | "error" | "info" | "loading") => {
    const id = Math.random().toString(36).substr(2, 9);
    setNotifications(prev => [...prev, { id, msg, type }]);
    if (type !== 'loading') setTimeout(() => removeNotify(id), 4000);
    return id;
  };

  const removeNotify = (id: string) => setNotifications(prev => prev.filter(n => n.id !== id));
  const toggleTheme = () => setIsDarkMode(!isDarkMode);

  // Jika belum Login
  if (!userRole) {
    return (
      <NotifyContext.Provider value={{ notify, removeNotify }}>
        <LoginScreen onLogin={(role) => setUserRole(role)} isDarkMode={isDarkMode} toggleTheme={toggleTheme} />
        <NotificationOverlay notifications={notifications} />
      </NotifyContext.Provider>
    );
  }

  // --- KOMPONEN MENU UTAMA (SIDEBAR) ---
  const SidebarItem = ({ id, icon: Icon, label, color }: any) => (
    <button 
      onClick={() => { setCurrentScreen(id); notify(`Membuka ${label}`, "info"); }}
      className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl transition-all mb-2 ${
        currentScreen === id 
        ? `${color} text-white shadow-lg shadow-blue-500/20` 
        : 'text-slate-500 hover:bg-white/5 hover:text-slate-200'
      }`}
    >
      <Icon size={20} />
      <span className="text-[11px] font-black uppercase tracking-widest">{label}</span>
    </button>
  );

  return (
    <NotifyContext.Provider value={{ notify, removeNotify }}>
      <div className={`min-h-screen flex ${isDarkMode ? 'bg-[#020617] text-white' : 'bg-[#F8FAFC] text-slate-900'} font-['Manrope'] transition-colors duration-500`}>
        
        {/* --- SIDEBAR --- */}
        <aside className={`w-80 border-r p-8 hidden lg:flex flex-col ${isDarkMode ? 'border-white/5 bg-[#020617]' : 'border-slate-200 bg-white'}`}>
          <div className="mb-12">
            <h1 className="text-4xl font-['Teko'] font-bold uppercase leading-none italic">rak <span className="text-amber-500">SKeMe</span></h1>
            <p className="text-[9px] font-black text-slate-500 uppercase tracking-[0.4em] mt-1">Intelligent Hub v2.0</p>
          </div>

          <nav className="flex-1 space-y-1">
            <SidebarItem id="DASHBOARD" icon={LayoutDashboard} label="Utama" color="bg-blue-600" />
            <SidebarItem id="RECORD" icon={ClipboardEdit} label="Rekod Aktiviti" color="bg-emerald-600" />
            <SidebarItem id="ANALYSIS" icon={BarChart3} label="Analisis" color="bg-purple-600" />
            <SidebarItem id="TAKWIM" icon={Calendar} label="Takwim" color="bg-orange-600" />
            <SidebarItem id="SPORTS" icon={Trophy} label="Sukan" color="bg-amber-600" />
            <div className="py-4"><div className="border-t border-white/5" /></div>
            <SidebarItem id="DATABASE" icon={Database} label="Data Murid" color="bg-slate-700" />
            <SidebarItem id="REPORT" icon={FileText} label="OPR Designer" color="bg-cyan-600" />
            <SidebarItem id="CERT" icon={Award} label="Sijil" color="bg-rose-600" />
          </nav>

          <button 
            onClick={() => { setUserRole(null); notify("Sesi ditamatkan. Jumpa lagi!", "info"); }}
            className="w-full flex items-center gap-4 px-6 py-4 rounded-2xl text-rose-500 hover:bg-rose-500/10 transition-all mt-8 border border-transparent hover:border-rose-500/20"
          >
            <LogOut size={20} />
            <span className="text-[11px] font-black uppercase tracking-widest">Log Keluar</span>
          </button>
        </aside>

        {/* --- MAIN CONTENT AREA --- */}
        <main className="flex-1 h-screen overflow-hidden relative flex flex-col">
          <div className="flex-1 overflow-y-auto no-scrollbar p-6 lg:p-12">
            
            {/* 1. DASHBOARD INTELLIGENT (HOME) */}
            {currentScreen === 'DASHBOARD' && (
              <div className="space-y-10 animate-in fade-in duration-700">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                  <div className="space-y-1">
                    <h2 className="text-5xl font-['Teko'] font-bold uppercase tracking-tight leading-none">SELAMAT DATANG, <span className="text-blue-500">CIKGU</span></h2>
                    <p className={`text-[10px] font-black uppercase tracking-[0.4em] opacity-40 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>SK Menerong • Unit Kokurikulum</p>
                  </div>
                  <button onClick={toggleTheme} className="p-4 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all shadow-xl">
                    {isDarkMode ? <Sun className="text-amber-500" size={20} /> : <Moon className="text-blue-600" size={20} />}
                  </button>
                </div>

                {/* Intelligent Announcements */}
                <div className={`p-8 rounded-[2.5rem] border relative overflow-hidden flex flex-col md:flex-row items-center gap-8 ${isDarkMode ? 'bg-blue-600/10 border-blue-500/20' : 'bg-blue-50 border-blue-200'}`}>
                  <div className="absolute top-0 right-0 p-10 opacity-5"><Bell size={120} /></div>
                  <div className="bg-blue-600 text-white p-5 rounded-[2rem] shadow-2xl shadow-blue-500/40 relative z-10">
                    <Zap size={32} fill="currentColor" />
                  </div>
                  <div className="relative z-10 flex-1 text-center md:text-left">
                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-500 mb-2">Makluman Rasmi</p>
                    <p className="text-xl font-bold leading-tight">{localStorage.getItem('RAK_ANNOUNCEMENT') || "TIADA MAKLUMAN TERKINI UNTUK HARI INI. SENYUM SOKMO!"}</p>
                  </div>
                </div>

                {/* Stats Grid (Kecil & Kemas) */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                  {[
                    { label: 'Aktiviti Selesai', val: '48', icon: TrendingUp, col: 'text-emerald-500', bg: 'bg-emerald-500/10' },
                    { label: 'Peserta Aktif', val: '1,240', icon: Users, col: 'text-blue-500', bg: 'bg-blue-500/10' },
                    { label: 'Sijil Terbit', val: '312', icon: Award, col: 'text-rose-500', bg: 'bg-rose-500/10' },
                    { label: 'Rumah Pendahulu', val: 'BIRU', icon: Trophy, col: 'text-amber-500', bg: 'bg-amber-500/10' }
                  ].map((s, i) => (
                    <div key={i} className={`p-6 rounded-3xl border border-white/5 ${isDarkMode ? 'bg-white/5' : 'bg-white shadow-sm'} flex flex-col items-center text-center group hover:border-white/20 transition-all`}>
                      <div className={`w-10 h-10 ${s.bg} ${s.col} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}><s.icon size={20} /></div>
                      <p className="text-[8px] font-black uppercase opacity-40 tracking-widest mb-1">{s.label}</p>
                      <p className={`text-3xl font-['Teko'] font-bold ${s.col} leading-none tracking-wide`}>{s.val}</p>
                    </div>
                  ))}
                </div>

                {/* Quick Access Area */}
                <div className="pt-4">
                  <h3 className="text-[10px] font-black uppercase tracking-[0.4em] opacity-30 mb-6 text-center lg:text-left">Penyelenggaraan Sistem</h3>
                  <AdminPanelScreen onBack={() => notify("Gunakan sidebar untuk navigasi pantas.", "info")} />
                </div>
              </div>
            )}

            {/* 2. ROUTING SKRIN LAIN */}
            {currentScreen === 'RECORD' && <ActivityRecordScreen onBack={() => setCurrentScreen('DASHBOARD')} />}
            {currentScreen === 'ANALYSIS' && <AnalysisScreen onBack={() => setCurrentScreen('DASHBOARD')} isDarkMode={isDarkMode} />}
            {currentScreen === 'TAKWIM' && <TakwimScreen onBack={() => setCurrentScreen('DASHBOARD')} userRole={userRole} />}
            {currentScreen === 'SPORTS' && <SportsScreen onBack={() => setCurrentScreen('DASHBOARD')} />}
            {currentScreen === 'DATABASE' && <StudentDatabaseScreen />}
            {currentScreen === 'REPORT' && <ReportGeneratorScreen onBack={() => setCurrentScreen('DASHBOARD')} isDarkMode={isDarkMode} />}
            {currentScreen === 'CERT' && <CertificateScreen onBack={() => setCurrentScreen('DASHBOARD')} isDarkMode={isDarkMode} />}
          </div>
        </main>

        <NotificationOverlay notifications={notifications} />
      </div>
    </NotifyContext.Provider>
  );
};

// --- POPUP VISUAL ---
const NotificationOverlay = ({ notifications }: { notifications: any[] }) => (
  <div className="fixed top-8 left-1/2 -translate-x-1/2 z-[9999] flex flex-col gap-3 w-full max-w-sm px-6">
    {notifications.map(n => (
      <div key={n.id} className={`flex items-center gap-4 p-5 rounded-[1.5rem] shadow-2xl border backdrop-blur-2xl animate-in slide-in-from-top-10 duration-500 ${
        n.type === 'success' ? 'bg-emerald-600/90 border-emerald-400' :
        n.type === 'error' ? 'bg-rose-600/90 border-rose-400' :
        n.type === 'loading' ? 'bg-blue-600/90 border-blue-400' : 'bg-slate-900/90 border-slate-700'
      } text-white`}>
        {n.type === 'loading' ? <RefreshCw className="animate-spin" size={20} /> : 
         n.type === 'success' ? <CheckCircle size={20} /> : 
         n.type === 'error' ? <AlertCircle size={20} /> : <Info size={20} />}
        <span className="text-[10px] font-black uppercase tracking-[0.2em] leading-tight">{n.msg}</span>
      </div>
    ))}
  </div>
);

export default App;