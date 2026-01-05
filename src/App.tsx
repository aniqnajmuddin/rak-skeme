import React, { useState, createContext, useContext } from 'react';
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
  CheckCircle, AlertCircle, Info, RefreshCw
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

  // --- KOMPONEN MENU UTAMA (SIDEBAR/NAV) ---
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
      <div className={`min-h-screen flex ${isDarkMode ? 'bg-[#020617] text-white' : 'bg-[#F8FAFC] text-slate-900'} font-['Manrope']`}>
        
        {/* --- MENU SAMPING (SIDEBAR) --- */}
        <aside className={`w-80 border-r p-6 hidden lg:flex flex-col ${isDarkMode ? 'border-white/5 bg-[#020617]' : 'border-slate-200 bg-white'}`}>
          <div className="mb-10 px-4">
            <h1 className="text-3xl font-['Teko'] font-bold uppercase leading-none">rak <span className="text-amber-500">SKeMe</span></h1>
            <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mt-1">Sistem Kokurikulum v2.0</p>
          </div>

          <nav className="flex-1">
            <SidebarItem id="DASHBOARD" icon={LayoutDashboard} label="Dashboard" color="bg-blue-600" />
            <SidebarItem id="RECORD" icon={ClipboardEdit} label="Rekod Aktiviti" color="bg-emerald-600" />
            <SidebarItem id="ANALYSIS" icon={BarChart3} label="Analisis Data" color="bg-purple-600" />
            <SidebarItem id="TAKWIM" icon={Calendar} label="Takwim" color="bg-orange-600" />
            <SidebarItem id="SPORTS" icon={Trophy} label="Sukan Tahunan" color="bg-amber-600" />
            <div className="my-4 border-t border-white/5 mx-4" />
            <SidebarItem id="DATABASE" icon={Database} label="Pangkalan Data" color="bg-slate-700" />
            <SidebarItem id="REPORT" icon={FileText} label="Penjana OPR" color="bg-blue-500" />
            <SidebarItem id="CERT" icon={Award} label="Sijil Digital" color="bg-rose-600" />
          </nav>

          <button 
            onClick={() => { setUserRole(null); notify("Anda telah log keluar.", "info"); }}
            className="w-full flex items-center gap-4 px-6 py-4 rounded-2xl text-rose-500 hover:bg-rose-500/10 transition-all mt-auto"
          >
            <LogOut size={20} />
            <span className="text-[11px] font-black uppercase tracking-widest">Log Keluar</span>
          </button>
        </aside>

        {/* --- KAWASAN KANDUNGAN (MAIN CONTENT) --- */}
        <main className="flex-1 h-screen overflow-hidden relative flex flex-col">
          <div className="flex-1 overflow-y-auto no-scrollbar">
            {currentScreen === 'DASHBOARD' && <AdminPanelScreen onBack={() => setUserRole(null)} />}
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
  <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[9999] flex flex-col gap-3 w-full max-w-md px-4">
    {notifications.map(n => (
      <div key={n.id} className={`flex items-center gap-3 p-4 rounded-2xl shadow-2xl border backdrop-blur-xl animate-in slide-in-from-top-5 duration-300 ${
        n.type === 'success' ? 'bg-emerald-500/90 border-emerald-400' :
        n.type === 'error' ? 'bg-rose-500/90 border-rose-400' :
        n.type === 'loading' ? 'bg-blue-600/90 border-blue-400' : 'bg-slate-800/90 border-slate-700'
      } text-white`}>
        {n.type === 'loading' ? <RefreshCw className="animate-spin" size={18} /> : 
         n.type === 'success' ? <CheckCircle size={18} /> : 
         n.type === 'error' ? <AlertCircle size={18} /> : <Info size={18} />}
        <span className="text-[10px] font-black uppercase tracking-widest">{n.msg}</span>
      </div>
    ))}
  </div>
);

export default App;