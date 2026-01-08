import React, { useState, createContext, useEffect } from 'react';
import { LayoutDashboard, ClipboardEdit, BarChart3, Database, Award, LogOut, Zap, Menu, Calendar, Medal, X, CheckCircle2, AlertCircle } from 'lucide-react';

// Import Screen Asal Bohh
import LoginScreen from './components/LoginScreen';
import AdminPanelScreen from './components/AdminPanelScreen';
import ActivityRecordScreen from './components/ActivityRecordScreen';
import AnalysisScreen from './components/AnalysisScreen';
import StudentDatabaseScreen from './components/StudentDatabaseScreen';
import ReportCenterScreen from './components/ReportCenterScreen';
import TakwimScreen from './components/TakwimScreen';
import DashboardScreen from './components/DashboardScreen';
import SportsScreen from './components/SportsScreen';

// 1. IMPORT AWANG (PASTIKAN FAIL NI ADA DALAM components)
import AwangAssistant from './components/AwangAssistant';

export const NotifyContext = createContext<any>(null);

const App: React.FC = () => {
  const [userRole, setUserRole] = useState<'ADMIN' | 'GURU' | null>(null);
  const [currentScreen, setCurrentScreen] = useState('DASHBOARD');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [currentScreen]);

  const notify = (msg: string, type: 'success' | 'error' | 'info' | 'loading') => {
    const id = Math.random().toString(36).substring(2, 11);
    setNotifications(prev => [...prev, { id, msg, type }]);
    if (type !== 'loading') {
      setTimeout(() => removeNotify(id), 4000);
    }
    return id;
  };

  const removeNotify = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  if (!userRole) {
    return (
      <NotifyContext.Provider value={{ notify, removeNotify }}>
        <LoginScreen onLogin={setUserRole} isDarkMode={true} toggleTheme={()=>{}} />
      </NotifyContext.Provider>
    );
  }

  return (
    <NotifyContext.Provider value={{ notify, removeNotify }}>
      <div className="flex min-h-screen bg-[#020617] text-white font-['Manrope'] relative">
        
        {/* SIDEBAR NAVIGATION (Kekal Macam Dulu) */}
        <aside className={`fixed inset-y-0 left-0 z-[100] w-72 bg-[#01040a]/95 backdrop-blur-xl border-r border-white/5 transform transition-transform duration-500 lg:translate-x-0 lg:static lg:block ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
          <div className="flex flex-col h-full p-8">
            <div className="mb-12 flex justify-between items-center">
              <div className="cursor-pointer" onClick={() => { setCurrentScreen('DASHBOARD'); setIsMobileMenuOpen(false); }}>
                <h1 className="text-4xl font-['Teko'] font-bold uppercase tracking-tighter leading-none text-white italic">RAK <span className="text-blue-500 underline decoration-blue-500/20 underline-offset-4">SKeMe</span></h1>
                <p className="text-[9px] font-black text-slate-500 uppercase mt-2 tracking-[0.2em] opacity-50">Intelligent Hub v2.5</p>
              </div>
              <button className="lg:hidden p-2 text-slate-500" onClick={() => setIsMobileMenuOpen(false)}><X size={24}/></button>
            </div>
            
            <nav className="flex-1 space-y-1.5 overflow-y-auto no-scrollbar">
              {[
                { id: 'DASHBOARD', label: 'Dashboard Utama', icon: LayoutDashboard, col: 'text-blue-500' },
                { id: 'TAKWIM', label: 'Takwim Koku', icon: Calendar, col: 'text-orange-500' },
                { id: 'SPORTS', label: 'Kejohanan Sukan', icon: Medal, col: 'text-amber-500' },
                { id: 'RECORD', label: 'Rekod Aktiviti', icon: ClipboardEdit, col: 'text-emerald-500' },
                { id: 'REPORTS', label: 'Sijil & OPR', icon: Award, col: 'text-rose-500' },
                { id: 'DATABASE', label: 'Database Murid', icon: Database, col: 'text-slate-400' },
                { id: 'ANALYSIS', label: 'Analisis Data', icon: BarChart3, col: 'text-purple-500' },
              ].map(item => (
                <button 
                  key={item.id} 
                  onClick={() => { setCurrentScreen(item.id); setIsMobileMenuOpen(false); }} 
                  className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl text-[10px] font-black uppercase transition-all duration-300 ${currentScreen === item.id ? 'bg-white/10 text-white border border-white/10 shadow-xl scale-[1.03]' : 'text-slate-500 hover:text-white hover:bg-white/5'}`}
                >
                  <item.icon size={18} className={`${currentScreen === item.id ? item.col : 'text-slate-600'}`} /> {item.label}
                </button>
              ))}
              
              {userRole === 'ADMIN' && (
                <button onClick={() => { setCurrentScreen('ADMIN_PANEL'); setIsMobileMenuOpen(false); }} className="w-full flex items-center gap-4 px-5 py-4 rounded-2xl text-[10px] font-black uppercase text-emerald-500 border border-emerald-500/10 mt-8 hover:bg-emerald-500/10 shadow-lg transition-all group">
                  <Zap size={18} className="group-hover:animate-pulse" /> Admin Console
                </button>
              )}
            </nav>

            <button onClick={() => setUserRole(null)} className="flex items-center gap-4 px-5 py-4 text-rose-500 text-[10px] font-black uppercase mt-10 border-t border-white/5 pt-8 hover:text-rose-400 transition-all">
                <LogOut size={18}/> Log Keluar HQ
            </button>
          </div>
        </aside>

        {/* KAWASAN KANDUNGAN UTAMA */}
        <main className="flex-1 flex flex-col min-w-0 bg-[#020617] relative">
          
          <header className="lg:hidden sticky top-0 z-[90] p-5 border-b border-white/5 flex items-center justify-between bg-[#01040a]/80 backdrop-blur-md">
            <button className="p-2 bg-white/5 rounded-xl text-blue-500" onClick={() => setIsMobileMenuOpen(true)}><Menu size={22}/></button>
            <h1 className="text-3xl font-['Teko'] font-bold text-white uppercase tracking-tighter italic">RAK <span className="text-blue-500">SKeMe</span></h1>
            <div className="w-10"></div>
          </header>

          <div className="flex-1 w-full relative">
            <div className="page-transition w-full min-h-full pb-24 lg:pb-10">
              {currentScreen === 'DASHBOARD' && <DashboardScreen onNavigate={setCurrentScreen} userRole={userRole} />}
              {currentScreen === 'TAKWIM' && <TakwimScreen onBack={() => setCurrentScreen('DASHBOARD')} userRole={userRole} />}
              {currentScreen === 'SPORTS' && <SportsScreen onBack={() => setCurrentScreen('DASHBOARD')} />}
              {currentScreen === 'ADMIN_PANEL' && <AdminPanelScreen onBack={() => setCurrentScreen('DASHBOARD')} />}
              {currentScreen === 'RECORD' && <ActivityRecordScreen onBack={() => setCurrentScreen('DASHBOARD')} />}
              {currentScreen === 'ANALYSIS' && <AnalysisScreen onBack={() => setCurrentScreen('DASHBOARD')} />}
              {currentScreen === 'DATABASE' && <StudentDatabaseScreen onBack={() => setCurrentScreen('DASHBOARD')} />}
              {currentScreen === 'REPORTS' && <ReportCenterScreen onBack={() => setCurrentScreen('DASHBOARD')} />}
            </div>
          </div>

          {/* 3. AWANG AI SENTIASA ADA KAT PENJURU (Floating) */}
          <AwangAssistant />

          {/* SISTEM NOTIFIKASI */}
          <div className="fixed top-6 right-6 z-[9999] space-y-3 pointer-events-none">
            {notifications.map(n => (
              <div key={n.id} className={`bg-[#0f172a]/95 backdrop-blur-xl border border-white/10 text-white px-6 py-5 rounded-[1.5rem] shadow-2xl flex items-center gap-4 animate-in slide-in-from-right fade-in duration-500 pointer-events-auto max-w-sm border-l-4 ${n.type === 'success' ? 'border-l-emerald-500' : n.type === 'error' ? 'border-l-rose-500' : 'border-l-blue-500'}`}>
                  <div className={`p-2 rounded-lg ${n.type === 'success' ? 'bg-emerald-500/10 text-emerald-500' : n.type === 'error' ? 'bg-rose-500/10 text-rose-500' : 'bg-blue-500/10 text-blue-500'}`}>
                    {n.type === 'success' ? <CheckCircle2 size={16}/> : <AlertCircle size={16}/>}
                  </div>
                  <p className="text-[11px] font-bold uppercase tracking-wider leading-tight">{n.msg}</p>
              </div>
            ))}
          </div>
        </main>
      </div>
    </NotifyContext.Provider>
  );
};

export default App;