import React, { useState, useContext } from 'react';
import { User, Lock, ArrowRight, Eye, EyeOff, ShieldCheck, Sun, Moon, RefreshCw, Cpu } from 'lucide-react';
import { NotifyContext } from '../App';

interface LoginScreenProps {
  onLogin: (role: 'ADMIN' | 'GURU') => void;
  isDarkMode: boolean;
  toggleTheme: () => void;
}

const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin, isDarkMode, toggleTheme }) => {
  const notifyCtx = useContext(NotifyContext);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      notifyCtx?.notify("Sila lengkapkan maklumat bohh!", "error");
      return;
    }

    setLoading(true);
    const loadId = notifyCtx?.notify("Mengesahkan akses...", "loading");

    setTimeout(() => {
      try {
        const inputHash = window.btoa(`${username.toLowerCase()}:${password}`);
        const adminHash = 'YWRtaW46NTQzMjE='; 
        const guruHash = 'Z3VydToxMjM0';     

        if (inputHash === adminHash) {
          notifyCtx?.notify("Akses Pentadbir Dibenarkan.", "success");
          setTimeout(() => onLogin('ADMIN'), 500);
        } else if (inputHash === guruHash) {
          notifyCtx?.notify("Akses Guru Dibenarkan.", "success");
          setTimeout(() => onLogin('GURU'), 500);
        } else {
          setLoading(false);
          notifyCtx?.notify("ID atau Kata Laluan salah.", "error");
        }
      } catch (e) {
        setLoading(false);
        notifyCtx?.notify("Ralat sistem.", "error");
      } finally {
        if (loadId) notifyCtx?.removeNotify(loadId);
      }
    }, 1000);
  };

  return (
    <div className={`min-h-screen flex items-center justify-center p-6 relative overflow-hidden transition-colors duration-700 ${isDarkMode ? 'bg-[#020617]' : 'bg-[#F8FAFC]'}`}>
      
      {/* Efek Glow Belakang - Lebih Subtle & Pro */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <div className={`absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full blur-[150px] opacity-20 ${isDarkMode ? 'bg-blue-600' : 'bg-blue-200'}`} />
        <div className={`absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full blur-[150px] opacity-20 ${isDarkMode ? 'bg-amber-600' : 'bg-amber-200'}`} />
      </div>

      {/* Theme Toggle */}
      <div className="absolute top-8 right-8 z-50">
        <button onClick={toggleTheme} className={`p-3 rounded-2xl backdrop-blur-md border transition-all hover:scale-110 active:scale-90 ${isDarkMode ? 'bg-white/5 border-white/10 text-amber-500' : 'bg-slate-900/5 border-slate-900/10 text-slate-600'}`}>
          {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
        </button>
      </div>

      <div className="relative z-10 w-full max-w-[420px] animate-in fade-in slide-in-from-bottom-4 duration-1000">
        
        {/* Info Sekolah & Unit */}
        <div className="text-center mb-10">
          <div className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl shadow-xl mb-6 border transition-transform hover:rotate-6 ${isDarkMode ? 'bg-slate-900 border-white/10' : 'bg-white border-slate-100'}`}>
            <ShieldCheck size={32} className="text-amber-500" strokeWidth={1.5} />
          </div>
          
          <div className="space-y-1">
            <h2 className={`text-[12px] font-black tracking-[0.3em] uppercase ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
              Sekolah Kebangsaan Menerong
            </h2>
            <p className="text-[10px] font-bold text-amber-500 tracking-[0.2em]">TBA5014</p>
            <p className={`text-[9px] font-medium uppercase tracking-[0.4em] opacity-40 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
              Unit Kokurikulum
            </p>
          </div>

          <h1 className={`text-5xl font-['Teko'] font-light tracking-tight uppercase leading-none mt-6 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
            rak <span className="text-amber-500 font-bold">SKeMe</span>
          </h1>
        </div>

        {/* Login Card - Glassmorphism */}
        <div className={`backdrop-blur-3xl border rounded-[2.5rem] p-8 md:p-10 shadow-2xl ${isDarkMode ? 'bg-slate-900/40 border-white/5 shadow-black/50' : 'bg-white/70 border-slate-200 shadow-slate-200'}`}>
          <form onSubmit={handleLogin} className="space-y-5">
            <div className="space-y-4">
              <div className="relative group">
                <User className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-amber-500 transition-colors" size={18} />
                <input 
                  type="text" 
                  value={username} 
                  onChange={e => setUsername(e.target.value)} 
                  className={`w-full rounded-2xl py-4 pl-12 pr-4 text-sm font-bold outline-none border transition-all ${isDarkMode ? 'bg-slate-950/50 border-white/5 text-white focus:border-amber-500/50' : 'bg-slate-100/50 border-transparent text-slate-900 focus:border-amber-500'}`} 
                  placeholder="ID PENGGUNA" 
                />
              </div>

              <div className="relative group">
                <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-amber-500 transition-colors" size={18} />
                <input 
                  type={showPassword ? "text" : "password"} 
                  value={password} 
                  onChange={e => setPassword(e.target.value)} 
                  className={`w-full rounded-2xl py-4 pl-12 pr-12 text-sm font-bold outline-none border transition-all ${isDarkMode ? 'bg-slate-950/50 border-white/5 text-white focus:border-amber-500/50' : 'bg-slate-100/50 border-transparent text-slate-900 focus:border-amber-500'}`} 
                  placeholder="KATA LALUAN" 
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-amber-500 transition-colors">
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
            
            <button 
              type="submit" 
              disabled={loading} 
              className="w-full bg-amber-500 hover:bg-amber-600 text-slate-900 font-bold text-[11px] py-4 rounded-2xl shadow-lg shadow-amber-500/20 transition-all flex items-center justify-center gap-3 uppercase tracking-[0.2em] active:scale-95 disabled:opacity-50"
            >
              {loading ? <RefreshCw className="animate-spin h-4 w-4" /> : <>Log Masuk <ArrowRight className="h-4 w-4" /></>}
            </button>
          </form>
        </div>
        
        {/* Footer Creative */}
        <div className="mt-12 text-center space-y-4">
          <div className="flex flex-col items-center">
            {/* Gaya Tulisan Tangan Kreatif */}
            <p className={`text-3xl font-['Caveat',_cursive] tracking-tight ${isDarkMode ? 'text-slate-200' : 'text-slate-600'}`}>
              Senyum Sokmo
            </p>
          </div>
          
          <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full border ${isDarkMode ? 'bg-white/5 border-white/5' : 'bg-slate-100 border-slate-200'}`}>
            <Cpu size={10} className="text-amber-500" />
            <p className={`text-[8px] font-mono font-medium tracking-tighter ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>
              Built by <span className={isDarkMode ? 'text-slate-300' : 'text-slate-600'}>MANS</span> <span className="opacity-50">v2.0</span>
            </p>
          </div>
        </div>

      </div>
    </div>
  );
};

export default LoginScreen;