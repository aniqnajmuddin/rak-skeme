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
import { Bell, Info, CheckCircle, AlertCircle, RefreshCw } from 'lucide-react';

// 1. BUAT CONTEXT (Speaker Sekolah)
export const NotifyContext = createContext<{
  notify: (msg: string, type: "success" | "error" | "info" | "loading") => string;
  removeNotify: (id: string) => void;
} | null>(null);

const App: React.FC = () => {
  const [userRole, setUserRole] = useState<'ADMIN' | 'GURU' | null>(null);
  const [currentScreen, setCurrentScreen] = useState<'HOME' | 'RECORD' | 'ANALYSIS' | 'TAKWIM' | 'SPORTS' | 'DATABASE' | 'REPORT' | 'CERT'>('HOME');
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [notifications, setNotifications] = useState<any[]>([]);

  // 2. FUNGSI NOTIFY (Otak untuk popup)
  const notify = (msg: string, type: "success" | "error" | "info" | "loading") => {
    const id = Math.random().toString(36).substr(2, 9);
    setNotifications(prev => [...prev, { id, msg, type }]);
    if (type !== 'loading') {
      setTimeout(() => removeNotify(id), 4000);
    }
    return id;
  };

  const removeNotify = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const toggleTheme = () => setIsDarkMode(!isDarkMode);

  // LOGIK LOGIN
  if (!userRole) {
    return (
      <NotifyContext.Provider value={{ notify, removeNotify }}>
        <LoginScreen onLogin={(role) => setUserRole(role)} isDarkMode={isDarkMode} toggleTheme={toggleTheme} />
        <NotificationOverlay notifications={notifications} />
      </NotifyContext.Provider>
    );
  }

  // LOGIK ROUTING (Tukar Skrin)
  const renderScreen = () => {
    switch (currentScreen) {
      case 'RECORD': return <ActivityRecordScreen onBack={() => setCurrentScreen('HOME')} />;
      case 'ANALYSIS': return <AnalysisScreen onBack={() => setCurrentScreen('HOME')} isDarkMode={isDarkMode} />;
      case 'TAKWIM': return <TakwimScreen onBack={() => setCurrentScreen('HOME')} userRole={userRole} />;
      case 'SPORTS': return <SportsScreen onBack={() => setCurrentScreen('HOME')} />;
      case 'DATABASE': return <StudentDatabaseScreen />;
      case 'REPORT': return <ReportGeneratorScreen onBack={() => setCurrentScreen('HOME')} isDarkMode={isDarkMode} />;
      case 'CERT': return <CertificateScreen onBack={() => setCurrentScreen('HOME')} isDarkMode={isDarkMode} />;
      default: return (
        <AdminPanelScreen 
          onBack={() => setUserRole(null)} 
          // Jika AdminPanel perlukan props tambahan, tambah di sini
        />
      );
    }
  };

  return (
    <NotifyContext.Provider value={{ notify, removeNotify }}>
      <div className={isDarkMode ? 'dark' : ''}>
        {renderScreen()}
        <NotificationOverlay notifications={notifications} />
      </div>
    </NotifyContext.Provider>
  );
};

// 3. KOMPONEN POPUP (Visual Speaker)
const NotificationOverlay = ({ notifications }: { notifications: any[] }) => {
  return (
    <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[9999] flex flex-col gap-3 w-full max-w-md px-4">
      {notifications.map(n => (
        <div key={n.id} className={`flex items-center gap-3 p-4 rounded-2xl shadow-2xl border backdrop-blur-xl animate-in slide-in-from-top-5 duration-300 ${
          n.type === 'success' ? 'bg-emerald-500/90 border-emerald-400 text-white' :
          n.type === 'error' ? 'bg-rose-500/90 border-rose-400 text-white' :
          n.type === 'loading' ? 'bg-blue-600/90 border-blue-400 text-white' :
          'bg-slate-800/90 border-slate-700 text-white'
        }`}>
          {n.type === 'loading' ? <RefreshCw className="animate-spin" size={18} /> : 
           n.type === 'success' ? <CheckCircle size={18} /> : 
           n.type === 'error' ? <AlertCircle size={18} /> : <Info size={18} />}
          <span className="text-xs font-black uppercase tracking-widest leading-none">{n.msg}</span>
        </div>
      ))}
    </div>
  );
};

export default App;