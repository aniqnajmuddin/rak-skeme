import React, { useState, createContext, useEffect } from 'react';
import { 
  LayoutDashboard, ClipboardEdit, BarChart3, Database, Award, 
  LogOut, Bell, Zap, Menu, TrendingUp, Users, Trophy, Calendar, Clock 
} from 'lucide-react';
import { studentDataService } from './services/studentDataService';

// IMPORT SCREENS
import LoginScreen from './components/LoginScreen';
import AdminPanelScreen from './components/AdminPanelScreen';
import ActivityRecordScreen from './components/ActivityRecordScreen';
import AnalysisScreen from './components/AnalysisScreen';
import StudentDatabaseScreen from './components/StudentDatabaseScreen';
import ReportCenterScreen from './components/ReportCenterScreen';
import TakwimScreen from './components/TakwimScreen';

export const NotifyContext = createContext<any>(null);

const App: React.FC = () => {
  const [userRole, setUserRole] = useState<'ADMIN' | 'GURU' | null>(null);
  const [currentScreen, setCurrentScreen] = useState('DASHBOARD');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [nextEvent, setNextEvent] = useState<any>(null);

  useEffect(() => {
    // Cari acara takwim terdekat
    const events = studentDataService.takwim;
    const future = events
      .filter(e => new Date(e.date) >= new Date())
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    if (future.length > 0) setNextEvent(future[0]);
  }, [currentScreen]);

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
        
        {/* SIDEBAR */}
        <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-[#01040a] border-r border-white/5 transform transition-transform duration-300 lg:translate-x-0 lg:static ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
          <div className="flex flex-col h-full p-6">
            <div className="mb-10">
              <h1 className="text-2xl font-['Teko'] font-bold uppercase tracking-widest leading-none text-white">rak <span className="text-blue-500">SKeMe</span></h1>
              <p className="text-[8px] font-black text-slate-500 uppercase mt-1 italic tracking-widest">Intelligent Hub v2.0</p>
            </div>
            
            <nav className="flex-1 space-y-1 overflow-y-auto no-scrollbar">
              {[
                { id: 'DASHBOARD', label: 'Dashboard', icon: LayoutDashboard, col: 'text-blue-500' },
                { id: 'TAKWIM', label: 'Takwim Koku', icon: Calendar, col: 'text-orange-500' },
                { id: 'RECORD', label: 'Rekod Aktiviti', icon: ClipboardEdit, col: 'text-emerald-500' },
                { id: 'REPORTS', label: 'Sijil & OPR', icon: Award, col: 'text-rose-500' },
                { id: 'DATABASE', label: 'Data Murid', icon: Database, col: 'text-slate-400' },
                { id: 'ANALYSIS', label: 'Analisis', icon: BarChart3, col: 'text-purple-500' },
              ].map(item => (
                <button key={item.id} onClick={() => { setCurrentScreen(item.id); setIsMobileMenuOpen(false); }} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-[10px] font-black uppercase transition-all ${currentScreen === item.id ? 'bg-white/10 text-white border border-white/10 shadow-lg' : 'text-slate-500 hover:text-white'}`}>
                  <item.icon size={18} className={item.col} /> {item.label}
                </button>
              ))}
              {userRole === 'ADMIN' && (
                <button onClick={() => { setCurrentScreen('ADMIN_PANEL'); setIsMobileMenuOpen(false); }} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-[10px] font-black uppercase text-emerald-500 border border-emerald-500/20 mt-4 hover:bg-emerald-500/10">
                  <Zap size={18} /> Urus Sistem
                </button>
              )}
            </nav>
            <button onClick={() => setUserRole(null)} className="flex items-center gap-3 px-4 py-3 text-rose-500 text-[10px] font-black uppercase mt-auto border-t border-white/5 pt-4"><LogOut size={18}/> Log Keluar</button>
          </div>
        </aside>

        {/* MAIN AREA */}
        <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
          <header className="lg:hidden p-4 border-b border-white/5 flex items-center justify-between">
            <button onClick={() => setIsMobileMenuOpen(true)}><Menu size={20}/></button>
            <h1 className="text-xl font-['Teko'] font-bold text-blue-500 uppercase">RAK SKeMe</h1>
            <div className="w-10"></div>
          </header>

          <div className="flex-1 overflow-y-auto no-scrollbar p-6 lg:p-12 bg-[#020617]">
            {currentScreen === 'DASHBOARD' && (
              <div className="max-w-7xl mx-auto space-y-10 animate-in fade-in duration-700">
                
                {/* HEADER INFO */}
                <div className="space-y-2">
                  <h2 className="text-8xl font-['Teko'] font-bold uppercase leading-none text-white tracking-tighter">RAK <span className="text-blue-500">SKeMe</span></h2>
                  <div className="flex items-center gap-3">
                    <div className="h-[2px] w-12 bg-blue-500"></div>
                    <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.3em]">REKOD AKTIVITI KOKURIKULUM SK MENERONG</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                  {/* HEBAHAN (LEFT) */}
                  <div className="lg:col-span-7 bg-blue-600/10 border border-blue-500/20 p-8 rounded-[2.5rem] flex items-center gap-6 shadow-2xl">
                    <div className="bg-blue-600 p-5 rounded-3xl shadow-xl animate-pulse"><Bell size={32} /></div>
                    <div className="flex-1">
                      <p className="text-[10px] font-black text-blue-500 uppercase mb-1 tracking-widest">Hebahan Rasmi</p>
                      <p className="font-bold text-xl text-white leading-tight">
                        {localStorage.getItem('RAK_ANNOUNCEMENT') || "PENGKALAN DATA SEDIA UNTUK DIPROSES. SILA KEMASKINI TAKWIM."}
                      </p>
                    </div>
                  </div>

                  {/* TAKWIM COUNTDOWN (RIGHT) */}
                  <div className="lg:col-span-5 bg-orange-600/10 border border-orange-500/20 p-8 rounded-[2.5rem] flex items-center gap-6 shadow-2xl">
                    <div className="bg-orange-600 p-5 rounded-3xl shadow-xl"><Clock size={32} /></div>
                    <div className="flex-1">
                      <p className="text-[10px] font-black text-orange-500 uppercase mb-1 tracking-widest">Acara Terdekat</p>
                      {nextEvent ? (
                        <div>
                          <p className="font-bold text-lg text-white uppercase">{nextEvent.title}</p>
                          <p className="text-[10px] font-black text-slate-500 mt-1 uppercase">{new Date(nextEvent.date).toLocaleDateString('ms-MY', {day:'numeric', month:'long'})}</p>
                        </div>
                      ) : <p className="font-bold text-slate-500">TIADA ACARA TERDEKAT</p>}
                    </div>
                  </div>
                </div>

                {/* STATS CARDS */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  {[
                    { label: 'Aktiviti', val: '48', icon: TrendingUp, col: 'text-emerald-500' },
                    { label: 'Murid', val: '1,240', icon: Users, col: 'text-blue-500' },
                    { label: 'Sijil', val: '312', icon: Award, col: 'text-rose-500' },
                    { label: 'Juara', val: 'BIRU', icon: Trophy, col: 'text-amber-500' },
                  ].map((s, i) => (
                    <div key={i} className="bg-white/5 border border-white/5 p-8 rounded-[2rem] flex flex-col items-center hover:bg-white/10 transition-all">
                      <s.icon size={24} className={`${s.col} mb-3`}/>
                      <p className="text-[8px] font-black text-slate-500 uppercase mb-1 tracking-widest">{s.label}</p>
                      <p className={`text-4xl font-['Teko'] font-bold ${s.col}`}>{s.val}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* SCREEN SWITCHER */}
            {currentScreen === 'TAKWIM' && <TakwimScreen onBack={() => setCurrentScreen('DASHBOARD')} userRole={userRole} />}
            {currentScreen === 'ADMIN_PANEL' && <AdminPanelScreen onBack={() => setCurrentScreen('DASHBOARD')} />}
            {currentScreen === 'RECORD' && <ActivityRecordScreen onBack={() => setCurrentScreen('DASHBOARD')} />}
            {currentScreen === 'ANALYSIS' && <AnalysisScreen onBack={() => setCurrentScreen('DASHBOARD')} />}
            {currentScreen === 'DATABASE' && <StudentDatabaseScreen onBack={() => setCurrentScreen('DASHBOARD')} />}
            {currentScreen === 'REPORTS' && <ReportCenterScreen onBack={() => setCurrentScreen('DASHBOARD')} />}
          </div>
        </main>
      </div>
    </NotifyContext.Provider>
  );
};
export default App;