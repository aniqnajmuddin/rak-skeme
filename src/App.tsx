import React, { useState, useEffect } from 'react';
import LoginScreen from './components/LoginScreen';
import ActivityRecordScreen from './components/ActivityRecordScreen';
import AdminPanelScreen from './components/AdminPanelScreen';
import AnalysisScreen from './components/AnalysisScreen';
import SportsScreen from './components/SportsScreen';
import TakwimScreen from './components/TakwimScreen';
import CertificateScreen from './components/CertificateScreen';
import ReportGeneratorScreen from './components/ReportGeneratorScreen';
import { 
  Database, Home, BarChart3, LogOut, X, Zap, Calendar, Flag, 
  LayoutGrid, Sun, Moon, Plus, Award, FileText, Settings 
} from 'lucide-react';

const App: React.FC = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState<'ADMIN' | 'GURU' | null>(null);
  const [currentScreen, setCurrentScreen] = useState('HOME');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [isScrolling, setIsScrolling] = useState(false);

  useEffect(() => {
    let timeout: any;
    const handleScroll = () => {
      setIsScrolling(true);
      clearTimeout(timeout);
      timeout = setTimeout(() => setIsScrolling(false), 1200);
    };
    window.addEventListener('scroll', handleScroll, true);
    return () => window.removeEventListener('scroll', handleScroll, true);
  }, []);

  const handleLoginSuccess = (role: 'ADMIN' | 'GURU') => {
    setUserRole(role);
    setIsLoggedIn(true);
  };

  const navigate = (screen: string) => {
    setCurrentScreen(screen);
    setIsMenuOpen(false);
    window.scrollTo(0, 0);
  };

  if (!isLoggedIn) {
    return <LoginScreen onLogin={handleLoginSuccess} isDarkMode={isDarkMode} toggleTheme={() => setIsDarkMode(!isDarkMode)} />;
  }

  // LOGIK PENYELARASAN HEADER: Ambil tajuk mengikut skrin
  const getPageTitle = () => {
    switch (currentScreen) {
      case 'HOME': return 'RAK SKeMe';
      case 'RECORD': return 'REKOD AKTIVITI';
      case 'REPORT': return 'PENJANA OPR';
      case 'ANALYSIS': return 'ANALISIS DATA';
      case 'SPORTS': return 'SUKAN & PERMAINAN';
      case 'TAKWIM': return 'TAKWIM TAHUNAN';
      case 'SIJIL': return 'SIJIL DIGITAL';
      case 'ADMIN': return 'ADMIN PANEL';
      default: return 'RAK SKeMe';
    }
  };

  const ScreenWrapper = ({ children, id }: { children: React.ReactNode, id: string }) => (
    <div key={id} className="page-transition h-full w-full overflow-y-auto no-scrollbar">
      {children}
    </div>
  );

  return (
    <div className={`h-screen w-full relative overflow-hidden flex flex-col font-['Manrope'] transition-colors duration-500 ${isDarkMode ? 'bg-[#0F172A] text-white' : 'bg-slate-50 text-slate-900'}`}>
      
      {/* GLOBAL HEADER: Selaras untuk semua skrin */}
      <header className="px-6 py-5 flex items-center justify-between z-[100] no-print shrink-0">
          <div className="flex items-center gap-4">
              {/* Logo Branding - Konsisten */}
              <div className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-br from-amber-400 to-orange-500 rounded-xl flex items-center justify-center shadow-lg shadow-amber-500/20 shrink-0 transition-transform active:scale-90" onClick={() => navigate('HOME')}>
                  <span className="font-['Teko'] text-2xl md:text-3xl font-bold text-white pt-1 tracking-tight">RAK</span>
              </div>
              
              <div className="flex flex-col">
                  {/* Dynamic Page Title */}
                  <h1 className="text-xl md:text-2xl font-['Teko'] font-bold leading-none tracking-wide uppercase transition-all duration-500">
                    {getPageTitle()}
                  </h1>
                  <p className="text-[9px] md:text-[10px] font-bold tracking-[0.2em] uppercase opacity-40 mt-1 truncate">
                    SK Menerong Terengganu
                  </p>
              </div>
          </div>

          <div className="flex items-center gap-2 md:gap-3">
            {/* Butang Dark Mode - Konsisten */}
            <button 
              onClick={() => setIsDarkMode(!isDarkMode)} 
              className={`p-2.5 md:p-3 rounded-full transition-all active:scale-90 ${isDarkMode ? 'bg-slate-800 text-yellow-400' : 'bg-white text-slate-600 shadow-sm border border-slate-200'}`}
            >
              {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
            </button>

            {/* User Indicator - Konsisten */}
            <div className={`hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full border text-[10px] font-bold uppercase tracking-wider ${isDarkMode ? 'bg-slate-800/50 border-white/10' : 'bg-white border-slate-200 shadow-sm'}`}>
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
              {userRole}
            </div>
          </div>
      </header>

      {/* RENDER SKRIN */}
      <main className="flex-1 relative z-10 h-full overflow-hidden">
        {currentScreen === 'HOME' && <ScreenWrapper id="home"><DashboardHome onNavigate={navigate} isDarkMode={isDarkMode} /></ScreenWrapper>}
        {currentScreen === 'RECORD' && <ScreenWrapper id="record"><ActivityRecordScreen onBack={() => navigate('HOME')} /></ScreenWrapper>}
        {currentScreen === 'REPORT' && <ScreenWrapper id="report"><ReportGeneratorScreen onBack={() => navigate('HOME')} isDarkMode={isDarkMode} /></ScreenWrapper>}
        {currentScreen === 'ANALYSIS' && <ScreenWrapper id="analysis"><AnalysisScreen onBack={() => navigate('HOME')} isDarkMode={isDarkMode} /></ScreenWrapper>}
        {currentScreen === 'SPORTS' && <ScreenWrapper id="sports"><SportsScreen onBack={() => navigate('HOME')} /></ScreenWrapper>}
        {currentScreen === 'TAKWIM' && <ScreenWrapper id="takwim"><TakwimScreen onBack={() => navigate('HOME')} userRole={userRole} /></ScreenWrapper>}
        {currentScreen === 'SIJIL' && <ScreenWrapper id="sijil"><CertificateScreen onBack={() => navigate('HOME')} isDarkMode={isDarkMode} /></ScreenWrapper>}
        {currentScreen === 'ADMIN' && <ScreenWrapper id="admin"><AdminPanelScreen onBack={() => navigate('HOME')} /></ScreenWrapper>}
      </main>

      {/* ACTION DOCK (MENU) */}
      <div className={`fixed bottom-8 left-1/2 -translate-x-1/2 z-[2000] transition-all duration-700 no-print 
        ${isScrolling && !isMenuOpen ? 'opacity-20 scale-75 blur-sm' : 'opacity-100 scale-100'}`}>
        <div className={`glass-panel transition-all duration-500 ${isMenuOpen ? 'bg-slate-900/90 p-6 rounded-[2.5rem] shadow-2xl border border-white/10' : 'bg-transparent'}`}>
          {isMenuOpen ? (
            <div className="flex flex-col gap-6">
              <div className="grid grid-cols-4 gap-4">
                <MenuIcon icon={Home} label="Home" active={currentScreen === 'HOME'} onClick={() => navigate('HOME')} color="text-sky-400" />
                <MenuIcon icon={Zap} label="Rekod" active={currentScreen === 'RECORD'} onClick={() => navigate('RECORD')} color="text-amber-400" />
                <MenuIcon icon={FileText} label="OPR" active={currentScreen === 'REPORT'} onClick={() => navigate('REPORT')} color="text-emerald-400" />
                <MenuIcon icon={BarChart3} label="Analisis" active={currentScreen === 'ANALYSIS'} onClick={() => navigate('ANALYSIS')} color="text-violet-400" />
                <MenuIcon icon={Flag} label="Sukan" active={currentScreen === 'SPORTS'} onClick={() => navigate('SPORTS')} color="text-rose-400" />
                <MenuIcon icon={Calendar} label="Takwim" active={currentScreen === 'TAKWIM'} onClick={() => navigate('TAKWIM')} color="text-emerald-400" />
                <MenuIcon icon={Award} label="Sijil" active={currentScreen === 'SIJIL'} onClick={() => navigate('SIJIL')} color="text-orange-400" />
                {userRole === 'ADMIN' && <MenuIcon icon={Settings} label="Admin" active={currentScreen === 'ADMIN'} onClick={() => navigate('ADMIN')} color="text-slate-400" />}
              </div>
              <div className="flex items-center justify-between pt-4 border-t border-white/5">
                <button onClick={() => {setIsLoggedIn(false); setUserRole(null);}} className="text-[10px] font-black uppercase tracking-widest text-rose-500 hover:text-white px-4 py-2 rounded-lg transition-colors">Log Out</button>
                <button onClick={() => setIsMenuOpen(false)} className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white"><X size={20} /></button>
              </div>
            </div>
          ) : (
            <button onClick={() => setIsMenuOpen(true)} className={`group flex items-center gap-3 border px-2 py-2 rounded-full shadow-2xl transition-all active:scale-90 ${isDarkMode ? 'bg-slate-900 border-white/10' : 'bg-white border-slate-200 shadow-lg'}`}>
              <div className="w-10 h-10 bg-gradient-to-tr from-amber-500 to-orange-400 rounded-full flex items-center justify-center text-white shadow-lg shadow-amber-500/30">
                <LayoutGrid size={20} />
              </div>
              <span className={`font-['Teko'] text-xl tracking-widest uppercase pt-1 pr-4 ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>Menu</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

// Komponen Kecil Menu
const MenuIcon = ({ icon: Icon, label, active, onClick, color }: any) => (
  <button onClick={onClick} className="flex flex-col items-center gap-1 group">
    <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all ${active ? 'bg-white/10 scale-110 shadow-lg' : 'hover:bg-white/5 opacity-60'}`}>
      <Icon size={22} className={active ? 'text-white' : color} />
    </div>
    <span className={`text-[8px] font-bold uppercase tracking-tighter ${active ? 'text-white' : 'text-slate-500'}`}>{label}</span>
  </button>
);

// Komponen Dashboard
const DashboardHome = ({ onNavigate, isDarkMode }: any) => {
  const cardClass = isDarkMode ? 'bg-slate-800/40 border-white/5 hover:bg-slate-800/60' : 'bg-white border-slate-200 shadow-sm hover:shadow-md';
  return (
    <div className="w-full max-w-4xl mx-auto p-6 pb-32">
        <div className="mb-10 md:mb-14 mt-4 text-center md:text-left">
            <h2 className="text-6xl md:text-8xl font-['Teko'] font-medium leading-[0.85] tracking-tight">WIRA <br className="md:hidden" /><span className="text-amber-500">KOKURIKULUM</span></h2>
            <p className="text-[10px] md:text-xs font-bold uppercase tracking-[0.4em] opacity-30 mt-4 md:mt-2">Sistem Pengurusan Aktiviti Sekolah</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
            <div onClick={() => onNavigate('RECORD')} className={`p-8 md:p-10 rounded-[2.5rem] border cursor-pointer group transition-all duration-500 hover:-translate-y-2 ${cardClass}`}>
                <div className="w-14 h-14 bg-amber-500/10 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <Zap size={32} className="text-amber-500" />
                </div>
                <h3 className="text-3xl font-['Teko'] font-bold uppercase tracking-wide">Rekod Aktiviti</h3>
                <p className="text-[10px] opacity-50 mt-1 uppercase font-black tracking-widest">Input Data Penyertaan Murid</p>
            </div>
            <div onClick={() => onNavigate('REPORT')} className={`p-8 md:p-10 rounded-[2.5rem] border cursor-pointer group transition-all duration-500 hover:-translate-y-2 ${cardClass}`}>
                <div className="w-14 h-14 bg-emerald-500/10 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <FileText size={32} className="text-emerald-500" />
                </div>
                <h3 className="text-3xl font-['Teko'] font-bold uppercase tracking-wide">Penjana OPR</h3>
                <p className="text-[10px] opacity-50 mt-1 uppercase font-black tracking-widest">Laporan Bergambar (One Page Report)</p>
            </div>
        </div>
    </div>
  );
};

export default App;