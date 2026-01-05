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

  // Efek Smart Scroll untuk Menu
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
    window.scrollTo(0, 0); // Reset skrol ke atas
  };

  if (!isLoggedIn) {
    return <LoginScreen onLogin={handleLoginSuccess} isDarkMode={isDarkMode} toggleTheme={() => setIsDarkMode(!isDarkMode)} />;
  }

  // Komponen pembungkus skrin dengan Animasi
  const ScreenWrapper = ({ children, id }: { children: React.ReactNode, id: string }) => (
    <div key={id} className="page-transition h-full w-full overflow-y-auto no-scrollbar">
      {children}
    </div>
  );

  return (
    <div className={`h-screen w-full relative overflow-hidden flex flex-col font-['Manrope'] transition-colors duration-500 ${isDarkMode ? 'bg-[#0F172A] text-white' : 'bg-slate-50 text-slate-900'}`}>
      
      {/* HEADER: Muncul ikut keadaan */}
      {currentScreen === 'HOME' && (
        <header className="px-6 py-5 flex items-center justify-between animate-in fade-in slide-in-from-top-4 duration-700">
          <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-amber-400 to-orange-500 rounded-xl flex items-center justify-center shadow-lg shadow-amber-500/20">
                  <span className="font-['Teko'] text-3xl font-bold text-white pt-1 tracking-tight">RAK</span>
              </div>
              <div>
                  <h1 className="text-2xl font-['Teko'] font-bold leading-none tracking-wide uppercase">RAK SKeMe</h1>
                  <p className="text-[10px] font-bold tracking-widest uppercase opacity-50 mt-1">SK Menerong</p>
              </div>
          </div>
          <button onClick={() => setIsDarkMode(!isDarkMode)} className={`p-3 rounded-full transition-all ${isDarkMode ? 'bg-slate-800 text-yellow-400' : 'bg-white text-slate-600 shadow-sm border border-slate-200'}`}>
                {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
          </button>
      </header>
      )}

      {/* RENDER SKRIN DENGAN ANIMASI TRANSISI */}
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

      {/* --- CANGGIH ACTION DOCK (MENU) --- */}
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
                <button onClick={() => setIsLoggedIn(false)} className="text-[10px] font-black uppercase tracking-widest text-rose-500 hover:text-white px-4 py-2 rounded-lg transition-colors">Log Out</button>
                <button onClick={() => setIsMenuOpen(false)} className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white"><X size={20} /></button>
              </div>
            </div>
          ) : (
            <button onClick={() => setIsMenuOpen(true)} className={`group flex items-center gap-3 border px-2 py-2 rounded-full shadow-2xl transition-all active:scale-90 ${isDarkMode ? 'bg-slate-900 border-white/10' : 'bg-white border-slate-200'}`}>
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

const MenuIcon = ({ icon: Icon, label, active, onClick, color }: any) => (
  <button onClick={onClick} className="flex flex-col items-center gap-1 group">
    <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all ${active ? 'bg-white/10 scale-110 shadow-lg' : 'hover:bg-white/5 opacity-60'}`}>
      <Icon size={22} className={active ? 'text-white' : color} />
    </div>
    <span className={`text-[8px] font-bold uppercase tracking-tighter ${active ? 'text-white' : 'text-slate-500'}`}>{label}</span>
  </button>
);

const DashboardHome = ({ onNavigate, isDarkMode }: any) => {
  const cardClass = isDarkMode ? 'bg-slate-800/40 border-white/5' : 'bg-white border-slate-200 shadow-sm';
  return (
    <div className="w-full max-w-4xl mx-auto p-6 pb-32">
        <div className="mb-12 mt-4">
            <h2 className="text-5xl md:text-7xl font-['Teko'] font-medium leading-none tracking-tight">WIRA <span className="text-amber-500">KOKU</span></h2>
            <p className="text-sm font-bold uppercase tracking-[0.3em] opacity-40 mt-2">SK Menerong Dashboard</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div onClick={() => onNavigate('RECORD')} className={`p-8 rounded-[2.5rem] border cursor-pointer group transition-all hover:-translate-y-1 ${cardClass}`}>
                <Zap size={32} className="text-amber-500 mb-4 group-hover:scale-110 transition-transform" />
                <h3 className="text-2xl font-['Teko'] font-bold uppercase">Rekod Baru</h3>
                <p className="text-xs opacity-50 mt-1 uppercase font-bold">Input aktiviti harian</p>
            </div>
            <div onClick={() => onNavigate('REPORT')} className={`p-8 rounded-[2.5rem] border cursor-pointer group transition-all hover:-translate-y-1 ${cardClass}`}>
                <FileText size={32} className="text-emerald-500 mb-4 group-hover:scale-110 transition-transform" />
                <h3 className="text-2xl font-['Teko'] font-bold uppercase">Penjana OPR</h3>
                <p className="text-xs opacity-50 mt-1 uppercase font-bold">Jana laporan bergambar</p>
            </div>
        </div>
    </div>
  );
};

export default App;