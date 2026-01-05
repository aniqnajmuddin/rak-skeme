import React, { useState, useEffect, createContext, useContext } from 'react';
import { 
  CheckCircle, AlertCircle, RefreshCw, X, Info, 
  Sun, Moon, Home, Zap, FileText, BarChart3, Flag, Calendar, Award, Settings, LayoutGrid
} from 'lucide-react';

// --- IMPORT SEMUA SKRIN ---
import LoginScreen from './components/LoginScreen';
import ActivityRecordScreen from './components/ActivityRecordScreen';
import AdminPanelScreen from './components/AdminPanelScreen';
import AnalysisScreen from './components/AnalysisScreen';
import SportsScreen from './components/SportsScreen';
import TakwimScreen from './components/TakwimScreen';
import CertificateScreen from './components/CertificateScreen';
import ReportGeneratorScreen from './components/ReportGeneratorScreen';

// --- 1. CIPTA CONTEXT NOTIFIKASI ---
interface NotifyContextType {
  notify: (msg: string, type?: 'success' | 'error' | 'loading' | 'info') => number;
  removeNotify: (id: number) => void;
}
export const NotifyContext = createContext<NotifyContextType | null>(null);

const App: React.FC = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState<'ADMIN' | 'GURU' | null>(null);
  const [currentScreen, setCurrentScreen] = useState('HOME');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [isScrolling, setIsScrolling] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);

  // --- 2. FUNGSI NOTIFY GLOBAL ---
  const notify = (msg: string, type: 'success' | 'error' | 'loading' | 'info' = 'success') => {
    const id = Date.now();
    setNotifications(prev => [...prev, { id, msg, type }]);
    if (type !== 'loading') {
      setTimeout(() => setNotifications(prev => prev.filter(n => n.id !== id)), 4000);
    }
    return id;
  };

  const removeNotify = (id: number) => setNotifications(prev => prev.filter(n => n.id !== id));

  const navigate = (screen: string) => {
    setCurrentScreen(screen);
    setIsMenuOpen(false);
    window.scrollTo(0, 0);
  };

  if (!isLoggedIn) {
    return <LoginScreen onLogin={(role:any) => {setUserRole(role); setIsLoggedIn(true);}} isDarkMode={isDarkMode} toggleTheme={() => setIsDarkMode(!isDarkMode)} />;
  }

  const getPageTitle = () => {
    switch (currentScreen) {
      case 'RECORD': return 'REKOD AKTIVITI';
      case 'REPORT': return 'PENJANA OPR';
      case 'ANALYSIS': return 'ANALISIS DATA';
      case 'ADMIN': return 'ADMIN CONTROL';
      case 'SIJIL': return 'SIJIL DIGITAL';
      default: return 'RAK SKeMe';
    }
  };

  return (
    <NotifyContext.Provider value={{ notify, removeNotify }}>
      <div className={`h-screen w-full relative overflow-hidden flex flex-col font-['Manrope'] transition-colors duration-500 ${isDarkMode ? 'bg-[#0F172A] text-white' : 'bg-slate-50 text-slate-900'}`}>
        
        {/* HEADER */}
        <header className="px-6 py-5 flex items-center justify-between z-[100] no-print shrink-0">
            <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-amber-400 to-orange-500 rounded-xl flex items-center justify-center shadow-lg shadow-amber-500/20 cursor-pointer" onClick={() => navigate('HOME')}>
                    <span className="font-['Teko'] text-3xl font-bold text-white pt-1">RAK</span>
                </div>
                <div>
                    <h1 className="text-2xl font-['Teko'] font-bold leading-none tracking-wide uppercase">{getPageTitle()}</h1>
                    <p className="text-[10px] font-bold tracking-[0.2em] uppercase opacity-40 mt-1">SK Menerong Terengganu</p>
                </div>
            </div>
            <button onClick={() => setIsDarkMode(!isDarkMode)} className={`p-3 rounded-full transition-all ${isDarkMode ? 'bg-slate-800 text-yellow-400' : 'bg-white text-slate-600 shadow-sm border border-slate-200'}`}>
                {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>
        </header>

        {/* MAIN CONTENT */}
        <main className="flex-1 relative z-10 h-full overflow-hidden">
          {currentScreen === 'HOME' && <DashboardHome onNavigate={navigate} isDarkMode={isDarkMode} />}
          {currentScreen === 'RECORD' && <ActivityRecordScreen onBack={() => navigate('HOME')} />}
          {currentScreen === 'REPORT' && <ReportGeneratorScreen onBack={() => navigate('HOME')} isDarkMode={isDarkMode} />}
          {currentScreen === 'ANALYSIS' && <AnalysisScreen onBack={() => navigate('HOME')} isDarkMode={isDarkMode} />}
          {currentScreen === 'ADMIN' && <AdminPanelScreen onBack={() => navigate('HOME')} />}
          {currentScreen === 'SIJIL' && <CertificateScreen onBack={() => navigate('HOME')} isDarkMode={isDarkMode} />}
        </main>

        {/* --- SMART TOAST OVERLAY (INTELIDENT POPUP) --- */}
        <div className="fixed top-20 right-6 z-[3000] flex flex-col gap-3 pointer-events-none">
          {notifications.map((n) => (
            <div key={n.id} className={`pointer-events-auto flex items-center gap-4 px-6 py-4 rounded-2xl border backdrop-blur-xl shadow-2xl animate-in slide-in-from-right-10 duration-500 min-w-[320px] ${isDarkMode ? 'bg-slate-900/90 border-white/10' : 'bg-white/90 border-slate-200'}`}>
              <div className={n.type === 'success' ? 'text-emerald-500' : n.type === 'error' ? 'text-rose-500' : n.type === 'loading' ? 'text-blue-500 animate-spin' : 'text-amber-500'}>
                {n.type === 'success' && <CheckCircle size={24} />}
                {n.type === 'error' && <AlertCircle size={24} />}
                {n.type === 'loading' && <RefreshCw size={24} />}
                {n.type === 'info' && <Info size={24} />}
              </div>
              <div className="flex-1">
                <p className={`text-[10px] font-black uppercase tracking-widest ${isDarkMode ? 'text-white/50' : 'text-slate-400'}`}>{n.type === 'loading' ? 'Proses...' : n.type}</p>
                <p className="text-xs font-bold">{n.msg}</p>
              </div>
              <button onClick={() => removeNotify(n.id)} className="text-slate-500 hover:text-white"><X size={16} /></button>
            </div>
          ))}
        </div>

        {/* MENU ACTION DOCK */}
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[2000] no-print">
            <button onClick={() => setIsMenuOpen(!isMenuOpen)} className={`flex items-center gap-3 border px-2 py-2 rounded-full shadow-2xl transition-all ${isDarkMode ? 'bg-slate-900 border-white/10' : 'bg-white border-slate-200'}`}>
              <div className="w-10 h-10 bg-gradient-to-tr from-amber-500 to-orange-400 rounded-full flex items-center justify-center text-white shadow-lg shadow-amber-500/30">
                {isMenuOpen ? <X size={20}/> : <LayoutGrid size={20} />}
              </div>
              <span className="font-['Teko'] text-xl tracking-widest uppercase pt-1 pr-4">Menu</span>
            </button>
            {isMenuOpen && (
              <div className={`absolute bottom-20 left-1/2 -translate-x-1/2 p-6 rounded-[2.5rem] border shadow-2xl grid grid-cols-4 gap-4 min-w-[350px] animate-in slide-in-from-bottom-10 ${isDarkMode ? 'bg-slate-900 border-white/10' : 'bg-white border-slate-200'}`}>
                <MenuIcon icon={Home} label="Home" active={currentScreen === 'HOME'} onClick={() => navigate('HOME')} color="text-sky-400" />
                <MenuIcon icon={Zap} label="Rekod" active={currentScreen === 'RECORD'} onClick={() => navigate('RECORD')} color="text-amber-400" />
                <MenuIcon icon={FileText} label="OPR" active={currentScreen === 'REPORT'} onClick={() => navigate('REPORT')} color="text-emerald-400" />
                <MenuIcon icon={Award} label="Sijil" active={currentScreen === 'SIJIL'} onClick={() => navigate('SIJIL')} color="text-orange-400" />
                <MenuIcon icon={BarChart3} label="Data" active={currentScreen === 'ANALYSIS'} onClick={() => navigate('ANALYSIS')} color="text-violet-400" />
                {userRole === 'ADMIN' && <MenuIcon icon={Settings} label="Admin" active={currentScreen === 'ADMIN'} onClick={() => navigate('ADMIN')} color="text-slate-400" />}
              </div>
            )}
        </div>
      </div>
    </NotifyContext.Provider>
  );
};

const MenuIcon = ({ icon: Icon, label, active, onClick, color }: any) => (
  <button onClick={onClick} className="flex flex-col items-center gap-1">
    <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all ${active ? 'bg-white/10 scale-110 shadow-lg shadow-white/5' : 'opacity-60 hover:opacity-100'}`}>
      <Icon size={22} className={active ? 'text-white' : color} />
    </div>
    <span className="text-[8px] font-bold uppercase">{label}</span>
  </button>
);

const DashboardHome = ({ onNavigate, isDarkMode }: any) => (
  <div className="w-full max-w-4xl mx-auto p-6 text-center md:text-left">
      <div className="mb-14 mt-10">
          <h2 className="text-7xl md:text-9xl font-['Teko'] font-medium leading-[0.8] tracking-tight uppercase">WIRA <br/><span className="text-amber-500">KOKURIKULUM</span></h2>
          <p className="text-xs font-bold uppercase tracking-[0.4em] opacity-30 mt-4">SK Menerong Dashboard System</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div onClick={() => onNavigate('RECORD')} className={`p-10 rounded-[3rem] border border-white/5 cursor-pointer group transition-all hover:-translate-y-2 ${isDarkMode ? 'bg-slate-800/40' : 'bg-white shadow-xl'}`}>
              <Zap size={40} className="text-amber-500 mb-4 group-hover:scale-110 transition-transform" />
              <h3 className="text-4xl font-['Teko'] font-bold uppercase tracking-wide leading-none">Rekod Aktiviti</h3>
              <p className="text-[10px] font-black opacity-40 uppercase tracking-widest mt-2">Daftar penyertaan murid & pencapaian</p>
          </div>
          <div onClick={() => onNavigate('REPORT')} className={`p-10 rounded-[3rem] border border-white/5 cursor-pointer group transition-all hover:-translate-y-2 ${isDarkMode ? 'bg-slate-800/40' : 'bg-white shadow-xl'}`}>
              <FileText size={40} className="text-emerald-500 mb-4 group-hover:scale-110 transition-transform" />
              <h3 className="text-4xl font-['Teko'] font-bold uppercase tracking-wide leading-none">Penjana OPR</h3>
              <p className="text-[10px] font-black opacity-40 uppercase tracking-widest mt-2">Cipta laporan bergambar profesional</p>
          </div>
      </div>
  </div>
);

export default App;