import React, { useState, createContext } from 'react';
import LoginScreen from './components/LoginScreen';
import AdminPanelScreen from './components/AdminPanelScreen';
import ActivityRecordScreen from './components/ActivityRecordScreen';
import AnalysisScreen from './components/AnalysisScreen';
import TakwimScreen from './components/TakwimScreen';
import SportsScreen from './components/SportsScreen';
import StudentDatabaseScreen from './components/StudentDatabaseScreen';
import ReportGeneratorScreen from './components/ReportGeneratorScreen';
import CertificateScreen from './components/CertificateScreen';
import { 
  LayoutDashboard, ClipboardEdit, BarChart3, Calendar, 
  Trophy, Database, FileText, Award, LogOut, Bell, Zap
} from 'lucide-react';

export const NotifyContext = createContext<any>(null);

const App: React.FC = () => {
  const [userRole, setUserRole] = useState<'ADMIN' | 'GURU' | null>(null);
  const [currentScreen, setCurrentScreen] = useState('DASHBOARD');
  const [notifications, setNotifications] = useState<any[]>([]);

  const notify = (msg: string, type: string) => {
    const id = Math.random().toString(36).substr(2, 9);
    setNotifications(prev => [...prev, { id, msg, type }]);
    setTimeout(() => setNotifications(prev => prev.filter(n => n.id !== id)), 3000);
    return id;
  };

  if (!userRole) return <NotifyContext.Provider value={{ notify }}><LoginScreen onLogin={setUserRole} isDarkMode={true} toggleTheme={()=>{}} /></NotifyContext.Provider>;

  return (
    <NotifyContext.Provider value={{ notify }}>
      <div className="flex h-screen bg-[#020617] text-white font-['Manrope']">
        
        {/* SIDEBAR ASAL (Dikecilkan sikit bagi nampak Pro) */}
        <aside className="w-64 border-r border-white/5 flex flex-col p-6 bg-[#020617]">
          <div className="mb-10">
            <h1 className="text-2xl font-['Teko'] font-bold uppercase tracking-widest">rak <span className="text-amber-500">SKeMe</span></h1>
            <p className="text-[8px] font-black text-slate-500 tracking-[0.3em]">SK MENERONG • TBA5014</p>
          </div>

          <nav className="flex-1 space-y-2">
            {[
              { id: 'DASHBOARD', label: 'Dashboard', icon: LayoutDashboard, col: 'text-blue-500' },
              { id: 'RECORD', label: 'Rekod Aktiviti', icon: ClipboardEdit, col: 'text-emerald-500' },
              { id: 'ANALYSIS', label: 'Analisis', icon: BarChart3, col: 'text-purple-500' },
              { id: 'TAKWIM', label: 'Takwim', icon: Calendar, col: 'text-orange-500' },
              { id: 'SPORTS', label: 'Sukan', icon: Trophy, col: 'text-amber-500' },
              { id: 'DATABASE', label: 'Data Murid', icon: Database, col: 'text-slate-400' },
              { id: 'REPORT', label: 'Penjana OPR', icon: FileText, col: 'text-cyan-500' },
              { id: 'CERT', label: 'Sijil Digital', icon: Award, col: 'text-rose-500' },
            ].map(item => (
              <button 
                key={item.id}
                onClick={() => setCurrentScreen(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all ${currentScreen === item.id ? 'bg-white/10 text-white border border-white/10 shadow-lg' : 'text-slate-500 hover:bg-white/5 hover:text-white'}`}
              >
                <item.icon size={18} className={item.col} /> {item.label}
              </button>
            ))}
          </nav>

          <button onClick={() => setUserRole(null)} className="flex items-center gap-3 px-4 py-3 rounded-xl text-[10px] font-bold uppercase text-rose-500 hover:bg-rose-500/10 transition-all mt-auto">
            <LogOut size={18} /> Log Keluar
          </button>
        </aside>

        {/* MAIN CONTENT AREA */}
        <main className="flex-1 overflow-y-auto no-scrollbar">
          {currentScreen === 'DASHBOARD' && (
            <div className="p-10 space-y-8 animate-in fade-in duration-500">
               <div className="flex justify-between items-end">
                  <div>
                    <h2 className="text-5xl font-['Teko'] font-bold leading-none tracking-tighter uppercase">DASHBOARD <span className="text-blue-500">INTELIGENCE</span></h2>
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em]">Status & Analisis Kokurikulum Terkini</p>
                  </div>
               </div>

               {/* Hebahan (Dulu AdminPanel, Sekarang diletak di Dashboard) */}
               <div className="bg-blue-600/10 border border-blue-500/20 p-6 rounded-[2rem] flex items-center gap-6">
                  <div className="bg-blue-600 p-4 rounded-2xl text-white shadow-xl shadow-blue-500/20"><Bell size={24} /></div>
                  <div className="flex-1">
                    <p className="text-[10px] font-black text-blue-500 uppercase tracking-widest mb-1">Hebahan Makluman</p>
                    <p className="font-bold text-sm">Semua data aktiviti murid mestilah dikemaskini sebelum hujung bulan ini bagi penjanaan sijil.</p>
                  </div>
               </div>

               {/* Quick Stats Grid */}
               <div className="grid grid-cols-4 gap-4">
                  {[
                    { label: 'Aktiviti Terakam', val: '42', color: 'text-emerald-500' },
                    { label: 'Murid Berdaftar', val: '1,240', color: 'text-blue-500' },
                    { label: 'Sijil Dijana', val: '156', color: 'text-rose-500' },
                    { label: 'Rumah Juara', val: 'BIRU', color: 'text-amber-500' },
                  ].map((s, i) => (
                    <div key={i} className="bg-white/5 border border-white/5 p-5 rounded-2xl">
                      <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest">{s.label}</p>
                      <p className={`text-2xl font-['Teko'] font-bold ${s.color}`}>{s.val}</p>
                    </div>
                  ))}
               </div>
               
               {/* AdminPanel asal kita panggil sebagai sebahagian dari Dashboard */}
               <AdminPanelScreen onBack={() => {}} />
            </div>
          )}
          
          {currentScreen === 'RECORD' && <ActivityRecordScreen onBack={() => setCurrentScreen('DASHBOARD')} />}
          {currentScreen === 'ANALYSIS' && <AnalysisScreen onBack={() => setCurrentScreen('DASHBOARD')} isDarkMode={true} />}
          {currentScreen === 'TAKWIM' && <TakwimScreen onBack={() => setCurrentScreen('DASHBOARD')} userRole={userRole} />}
          {currentScreen === 'SPORTS' && <SportsScreen onBack={() => setCurrentScreen('DASHBOARD')} />}
          {currentScreen === 'DATABASE' && <StudentDatabaseScreen />}
          {currentScreen === 'REPORT' && <ReportGeneratorScreen onBack={() => setCurrentScreen('DASHBOARD')} isDarkMode={true} />}
          {currentScreen === 'CERT' && <CertificateScreen onBack={() => setCurrentScreen('DASHBOARD')} isDarkMode={true} />}
        </main>
      </div>
    </NotifyContext.Provider>
  );
};

export default App;