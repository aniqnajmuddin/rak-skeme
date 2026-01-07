import React, { useState, createContext } from 'react';
import { LayoutDashboard, ClipboardEdit, BarChart3, Database, Award, LogOut, Zap, Menu, Calendar, Medal } from 'lucide-react';

import LoginScreen from './components/LoginScreen';
import AdminPanelScreen from './components/AdminPanelScreen';
import ActivityRecordScreen from './components/ActivityRecordScreen';
import AnalysisScreen from './components/AnalysisScreen';
import StudentDatabaseScreen from './components/StudentDatabaseScreen';
import ReportCenterScreen from './components/ReportCenterScreen';
import TakwimScreen from './components/TakwimScreen';
import DashboardScreen from './components/DashboardScreen';
import SportsScreen from './components/SportsScreen';

export const NotifyContext = createContext<any>(null);

const App: React.FC = () => {
  const [userRole, setUserRole] = useState<'ADMIN' | 'GURU' | null>(null);
  const [currentScreen, setCurrentScreen] = useState('DASHBOARD');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);

  const notify = (msg: string, type: string) => {
    const id = Math.random().toString(36).substring(2, 11);
    setNotifications(prev => [...prev, { id, msg, type }]);
    setTimeout(() => setNotifications(prev => prev.filter(n => n.id !== id)), 3000);
    return id;
  };

  if (!userRole) return <NotifyContext.Provider value={{ notify }}><LoginScreen onLogin={setUserRole} isDarkMode={true} toggleTheme={()=>{}} /></NotifyContext.Provider>;

  return (
    <NotifyContext.Provider value={{ notify }}>
      <div className="flex h-screen bg-[#020617] text-white font-['Manrope'] overflow-hidden">
        
        <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-[#01040a] border-r border-white/5 transform transition-transform duration-300 lg:translate-x-0 lg:static ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
          <div className="flex flex-col h-full p-6">
            <div className="mb-10 cursor-pointer" onClick={() => setCurrentScreen('DASHBOARD')}>
              <h1 className="text-4xl font-['Teko'] font-bold uppercase tracking-tight leading-none text-white">RAK <span className="text-blue-500">SKeMe</span></h1>
              <p className="text-[9px] font-black text-slate-500 uppercase mt-1 italic tracking-[0.2em]">Intelligent Hub v2.0</p>
            </div>
            
            <nav className="flex-1 space-y-2 overflow-y-auto no-scrollbar">
              {[
                { id: 'DASHBOARD', label: 'Dashboard', icon: LayoutDashboard, col: 'text-blue-500' },
                { id: 'TAKWIM', label: 'Takwim Koku', icon: Calendar, col: 'text-orange-500' },
                { id: 'SPORTS', label: 'Kejohanan Sukan', icon: Medal, col: 'text-amber-500' },
                { id: 'RECORD', label: 'Rekod Aktiviti', icon: ClipboardEdit, col: 'text-emerald-500' },
                { id: 'REPORTS', label: 'Sijil & OPR', icon: Award, col: 'text-rose-500' },
                { id: 'DATABASE', label: 'Data Murid', icon: Database, col: 'text-slate-400' },
                { id: 'ANALYSIS', label: 'Analisis', icon: BarChart3, col: 'text-purple-500' },
              ].map(item => (
                <button key={item.id} onClick={() => { setCurrentScreen(item.id); setIsMobileMenuOpen(false); }} className={`w-full flex items-center gap-3 px-4 py-4 rounded-2xl text-[10px] font-black uppercase transition-all ${currentScreen === item.id ? 'bg-white/10 text-white border border-white/10 shadow-lg scale-105' : 'text-slate-500 hover:text-white hover:bg-white/5'}`}>
                  <item.icon size={18} className={item.col} /> {item.label}
                </button>
              ))}
              
              {userRole === 'ADMIN' && (
                <button onClick={() => { setCurrentScreen('ADMIN_PANEL'); setIsMobileMenuOpen(false); }} className="w-full flex items-center gap-3 px-4 py-4 rounded-2xl text-[10px] font-black uppercase text-emerald-500 border border-emerald-500/20 mt-6 hover:bg-emerald-500/10 shadow-lg shadow-emerald-500/10 transition-all">
                  <Zap size={18} /> Admin Console
                </button>
              )}
            </nav>

            <button onClick={() => setUserRole(null)} className="flex items-center gap-3 px-4 py-4 text-rose-500 text-[10px] font-black uppercase mt-auto border-t border-white/5 pt-6 hover:text-rose-400 transition-colors">
                <LogOut size={18}/> Log Keluar Sistem
            </button>
          </div>
        </aside>

        <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative bg-[#020617]">
          <header className="lg:hidden p-4 border-b border-white/5 flex items-center justify-between bg-[#01040a]">
            <button onClick={() => setIsMobileMenuOpen(true)}><Menu size={20}/></button>
            <h1 className="text-2xl font-['Teko'] font-bold text-white uppercase">RAK <span className="text-blue-500">SKeMe</span></h1>
            <div className="w-10"></div>
          </header>

          <div className="flex-1 relative overflow-hidden">
            {currentScreen === 'DASHBOARD' && <DashboardScreen onNavigate={setCurrentScreen} userRole={userRole} />}
            {currentScreen === 'TAKWIM' && <TakwimScreen onBack={() => setCurrentScreen('DASHBOARD')} userRole={userRole} />}
            {currentScreen === 'SPORTS' && <SportsScreen onBack={() => setCurrentScreen('DASHBOARD')} />}
            {currentScreen === 'ADMIN_PANEL' && <AdminPanelScreen onBack={() => setCurrentScreen('DASHBOARD')} />}
            {currentScreen === 'RECORD' && <ActivityRecordScreen onBack={() => setCurrentScreen('DASHBOARD')} />}
            {currentScreen === 'ANALYSIS' && <AnalysisScreen onBack={() => setCurrentScreen('DASHBOARD')} />}
            {currentScreen === 'DATABASE' && <StudentDatabaseScreen onBack={() => setCurrentScreen('DASHBOARD')} />}
            {currentScreen === 'REPORTS' && <ReportCenterScreen onBack={() => setCurrentScreen('DASHBOARD')} />}
          </div>

          <div className="fixed top-6 right-6 z-[9999] space-y-2 pointer-events-none">
            {notifications.map(n => (
              <div key={n.id} className={`bg-[#0f172a] border border-white/10 text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 animate-in slide-in-from-right fade-in duration-300 pointer-events-auto max-w-sm`}>
                 <div className={`w-2 h-2 rounded-full ${n.type === 'success' ? 'bg-emerald-500' : n.type === 'error' ? 'bg-rose-500' : 'bg-blue-500'}`}></div>
                 <p className="text-[10px] font-black uppercase tracking-wide">{n.msg}</p>
              </div>
            ))}
          </div>
        </main>
      </div>
    </NotifyContext.Provider>
  );
};

export default App;