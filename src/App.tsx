
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
  LayoutGrid, Sun, Moon, Plus, Award, FileText 
} from 'lucide-react';

const App: React.FC = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState<'ADMIN' | 'GURU' | null>(null);
  const [currentScreen, setCurrentScreen] = useState<'HOME' | 'RECORD' | 'ADMIN' | 'ANALYSIS' | 'SPORTS' | 'TAKWIM' | 'SIJIL' | 'REPORT'>('HOME');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showHeader, setShowHeader] = useState(true);
  const [isDarkMode, setIsDarkMode] = useState(true);

  useEffect(() => {
    setShowHeader(currentScreen === 'HOME');
  }, [currentScreen]);

  const handleLoginSuccess = (role: 'ADMIN' | 'GURU') => {
      setUserRole(role);
      setIsLoggedIn(true);
  };

  const toggleTheme = () => setIsDarkMode(!isDarkMode);

  if (!isLoggedIn) {
    return <LoginScreen onLogin={handleLoginSuccess} isDarkMode={isDarkMode} toggleTheme={toggleTheme} />;
  }

  const navigate = (screen: any) => {
    setCurrentScreen(screen);
    setIsMenuOpen(false);
  };

  const bgClass = isDarkMode ? 'bg-[#0F172A]' : 'bg-[#F8FAFC]';
  const textClass = isDarkMode ? 'text-slate-100' : 'text-slate-800';

  return (
    <div className={`h-screen w-full relative overflow-hidden flex flex-col font-['Manrope'] ${bgClass} ${textClass} transition-colors duration-500`}>
      <header className={`relative z-[100] px-6 py-5 flex items-center justify-between transition-all duration-500 no-print ${showHeader ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0 h-0 overflow-hidden'}`}>
          <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-amber-400 to-orange-500 rounded-xl flex items-center justify-center shadow-lg shadow-amber-500/20">
                  <span className="font-['Teko'] text-3xl font-bold text-white pt-1 tracking-tight">RAK</span>
              </div>
              <div>
                  <h1 className="text-2xl font-['Teko'] font-bold leading-none tracking-wide uppercase">RAK SKeMe</h1>
                  <p className={`text-xs font-bold tracking-wider uppercase mt-1 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                      Rekod Aktiviti SK Menerong
                  </p>
              </div>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={toggleTheme} className={`p-3 rounded-full transition-all ${isDarkMode ? 'bg-slate-800 text-yellow-400' : 'bg-white text-slate-600 shadow-sm border border-slate-200'}`}>
                {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            <div className={`px-4 py-2 rounded-full border flex items-center gap-2 ${isDarkMode ? 'bg-slate-800/50 border-white/10' : 'bg-white border-slate-200 shadow-sm'}`}>
                <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                <span className={`text-xs font-bold tracking-wide uppercase ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>{userRole === 'ADMIN' ? 'Admin' : 'Guru'}</span>
            </div>
          </div>
      </header>

      <main className="flex-1 relative z-10 h-full overflow-hidden">
        <div className="h-full w-full overflow-y-auto page-transition no-scrollbar">
          {currentScreen === 'RECORD' && <ActivityRecordScreen onBack={() => navigate('HOME')} />}
          {currentScreen === 'ADMIN' && <AdminPanelScreen onBack={() => navigate('HOME')} />}
          {currentScreen === 'ANALYSIS' && <AnalysisScreen onBack={() => navigate('HOME')} isDarkMode={isDarkMode} />}
          {currentScreen === 'SPORTS' && <SportsScreen onBack={() => navigate('HOME')} />}
          {currentScreen === 'TAKWIM' && <TakwimScreen onBack={() => navigate('HOME')} userRole={userRole} />}
          {currentScreen === 'SIJIL' && <CertificateScreen onBack={() => navigate('HOME')} isDarkMode={isDarkMode} />}
          {currentScreen === 'REPORT' && <ReportGeneratorScreen onBack={() => navigate('HOME')} isDarkMode={isDarkMode} />}
          {currentScreen === 'HOME' && <DashboardHome onNavigate={navigate} userRole={userRole} isDarkMode={isDarkMode} />}
        </div>
      </main>

      {/* Floating Menu */}
      <div className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-[1000] transition-all duration-500 no-print ${isMenuOpen ? 'w-[95vw] max-w-2xl' : 'w-auto'}`}>
          {isMenuOpen ? (
              <div className={`${isDarkMode ? 'bg-slate-900/95 border-slate-700' : 'bg-white/95 border-slate-200'} backdrop-blur-xl border rounded-[2.5rem] p-5 shadow-2xl animate-in slide-in-from-bottom-5`}>
                  <div className="grid grid-cols-4 gap-4 mb-4">
                      <MenuButton icon={Home} label="Utama" color="text-sky-500" active={currentScreen === 'HOME'} onClick={() => navigate('HOME')} isDarkMode={isDarkMode} />
                      <MenuButton icon={Zap} label="Rekod" color="text-amber-500" active={currentScreen === 'RECORD'} onClick={() => navigate('RECORD')} isDarkMode={isDarkMode} />
                      <MenuButton icon={Award} label="Sijil" color="text-orange-500" active={currentScreen === 'SIJIL'} onClick={() => navigate('SIJIL')} isDarkMode={isDarkMode} />
                      <MenuButton icon={FileText} label="Laporan" color="text-teal-500" active={currentScreen === 'REPORT'} onClick={() => navigate('REPORT')} isDarkMode={isDarkMode} />
                      <MenuButton icon={Flag} label="Sukan" color="text-rose-500" active={currentScreen === 'SPORTS'} onClick={() => navigate('SPORTS')} isDarkMode={isDarkMode} />
                      <MenuButton icon={BarChart3} label="Analisis" color="text-violet-500" active={currentScreen === 'ANALYSIS'} onClick={() => navigate('ANALYSIS')} isDarkMode={isDarkMode} />
                      <MenuButton icon={Calendar} label="Takwim" color="text-emerald-500" active={currentScreen === 'TAKWIM'} onClick={() => navigate('TAKWIM')} isDarkMode={isDarkMode} />
                      {userRole === 'ADMIN' && (
                            <MenuButton icon={Database} label="Admin" color="text-slate-500" active={currentScreen === 'ADMIN'} onClick={() => navigate('ADMIN')} isDarkMode={isDarkMode} />
                      )}
                  </div>
                  <div className="flex justify-between items-center gap-4 pt-2 border-t border-slate-200/10">
                      <button onClick={() => { setIsLoggedIn(false); setUserRole(null); }} className="flex-1 bg-rose-500/10 hover:bg-rose-600 text-rose-500 hover:text-white py-4 rounded-2xl text-sm font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2">
                          <LogOut size={20} /> Log Keluar
                      </button>
                      <button onClick={() => setIsMenuOpen(false)} className={`w-14 h-14 rounded-full flex items-center justify-center transition-all border ${isDarkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-100 border-slate-200 text-slate-600'}`}>
                          <X size={24} />
                      </button>
                  </div>
              </div>
          ) : (
              <button onClick={() => setIsMenuOpen(true)} className={`group ${isDarkMode ? 'bg-slate-800 text-white border-slate-700' : 'bg-white text-slate-800 border-slate-200'} border pl-6 pr-8 py-4 rounded-full shadow-2xl flex items-center gap-4 transition-transform hover:scale-105`}>
                  <div className="bg-amber-500 text-white p-2.5 rounded-full shadow-lg shadow-amber-500/30">
                    <LayoutGrid size={24} />
                  </div>
                  <span className="font-['Teko'] text-xl font-medium tracking-wide pt-1">MENU UTAMA</span>
              </button>
          )}
      </div>
    </div>
  );
};

const MenuButton = ({ icon: Icon, label, color, active, onClick, isDarkMode }: any) => (
    <button onClick={onClick} className={`flex flex-col items-center justify-center p-3 rounded-2xl transition-all gap-1.5 border-2 ${active ? (isDarkMode ? 'bg-slate-800 border-slate-600' : 'bg-slate-100 border-slate-300') : 'bg-transparent border-transparent hover:bg-slate-500/5'}`}>
        <Icon size={24} className={active ? (isDarkMode ? 'text-white' : 'text-slate-900') : color} strokeWidth={1.5} />
        <span className={`text-[9px] font-bold uppercase tracking-wider truncate w-full text-center ${active ? (isDarkMode ? 'text-white' : 'text-slate-900') : (isDarkMode ? 'text-slate-400' : 'text-slate-500')}`}>{label}</span>
    </button>
);

const DashboardHome = ({ onNavigate, isDarkMode }: any) => {
    const cardClass = isDarkMode ? 'bg-slate-800/50 border-slate-700' : 'bg-white border-slate-200 shadow-md';
    return (
        <div className="w-full max-w-3xl mx-auto p-6 pb-40">
            <div className="mb-10 mt-2">
                <p className={`text-lg font-bold uppercase tracking-widest mb-1 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Selamat Datang</p>
                <h2 className={`text-5xl md:text-6xl font-['Teko'] font-medium leading-none ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                    WIRA <span className="text-amber-500">KOKURIKULUM</span>
                </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <button onClick={() => onNavigate('RECORD')} className={`relative group border p-8 rounded-[2rem] text-left transition-all hover:scale-[1.02] ${cardClass}`}>
                    <Plus size={32} className="text-blue-500 mb-4" />
                    <h3 className="text-2xl font-['Teko'] font-bold uppercase">Rekod Aktiviti</h3>
                    <p className="text-xs text-slate-500 mt-2 font-bold uppercase">Tambah penyertaan murid</p>
                </button>
                <button onClick={() => onNavigate('REPORT')} className={`relative group border p-8 rounded-[2rem] text-left transition-all hover:scale-[1.02] ${cardClass}`}>
                    <FileText size={32} className="text-emerald-500 mb-4" />
                    <h3 className="text-2xl font-['Teko'] font-bold uppercase">Laporan (OPR)</h3>
                    <p className="text-xs text-slate-500 mt-2 font-bold uppercase">Jana One Page Report</p>
                </button>
            </div>
        </div>
    );
};

export default App;
