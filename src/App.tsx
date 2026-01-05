import React, { useState, createContext } from 'react';
// Import komponen utama sahaja dulu untuk elak skrin putih
import LoginScreen from './components/LoginScreen';
import AdminPanelScreen from './components/AdminPanelScreen';
import { Info, CheckCircle, AlertCircle, RefreshCw } from 'lucide-react';

// 1. Buat Speaker Sekolah (Context)
export const NotifyContext = createContext<{
  notify: (msg: string, type: "success" | "error" | "info" | "loading") => string;
  removeNotify: (id: string) => void;
} | null>(null);

export default function App() {
  const [userRole, setUserRole] = useState<'ADMIN' | 'GURU' | null>(null);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [notifications, setNotifications] = useState<any[]>([]);

  // 2. Fungsi Notify
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

  // 3. Paparan Notification
  const NotificationOverlay = () => (
    <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[9999] flex flex-col gap-3 w-full max-w-md px-4 pointer-events-none">
      {notifications.map(n => (
        <div key={n.id} className={`flex items-center gap-3 p-4 rounded-2xl shadow-2xl border backdrop-blur-xl animate-in slide-in-from-top-5 duration-300 pointer-events-auto ${
          n.type === 'success' ? 'bg-emerald-500/90 border-emerald-400 text-white' :
          n.type === 'error' ? 'bg-rose-500/90 border-rose-400 text-white' :
          n.type === 'loading' ? 'bg-blue-600/90 border-blue-400 text-white' :
          'bg-slate-800/90 border-slate-700 text-white'
        }`}>
          {n.type === 'loading' ? <RefreshCw className="animate-spin" size={18} /> : 
           n.type === 'success' ? <CheckCircle size={18} /> : 
           n.type === 'error' ? <AlertCircle size={18} /> : <Info size={18} />}
          <span className="text-[10px] font-black uppercase tracking-widest">{n.msg}</span>
        </div>
      ))}
    </div>
  );

  return (
    <NotifyContext.Provider value={{ notify, removeNotify }}>
      <div className={isDarkMode ? 'dark bg-[#020617] min-h-screen' : 'bg-[#F8FAFC] min-h-screen'}>
        {!userRole ? (
          <LoginScreen 
            onLogin={(role) => setUserRole(role)} 
            isDarkMode={isDarkMode} 
            toggleTheme={toggleTheme} 
          />
        ) : (
          <AdminPanelScreen onBack={() => setUserRole(null)} />
        )}
        <NotificationOverlay />
      </div>
    </NotifyContext.Provider>
  );
}