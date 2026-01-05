import React, { useState, useContext } from 'react';
import { User, Lock, ArrowRight, Eye, EyeOff, ShieldCheck, Sun, Moon, RefreshCw, Sparkles } from 'lucide-react';
import { NotifyContext } from '../App'; // Speaker sekolah kita

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
      notifyCtx?.notify("Sila lengkapkan ID dan Kata Laluan bohh!", "error");
      return;
    }

    setLoading(true);
    const loadId = notifyCtx?.notify("Mengesahkan identiti...", "loading");

    setTimeout(() => {
      try {
        const inputHash = window.btoa(`${username.toLowerCase()}:${password}`);
        const adminHash = 'YWRtaW46NTQzMjE='; 
        const guruHash = 'Z3VydToxMjM0';     

        if (inputHash === adminHash) {
          notifyCtx?.notify("Akses Pentadbir Dibenarkan. Selamat datang bohh!", "success");
          setTimeout(() => onLogin('ADMIN'), 500);
        } else if (inputHash === guruHash) {
          notifyCtx?.notify("Akses Guru Dibenarkan. Senyum Sokmo!", "success");
          setTimeout(() => onLogin('GURU'), 500);
        } else {
          setLoading(false);
          notifyCtx?.notify("ID atau Kata Laluan salah. Cuba lagi bohh!", "error");
        }
      } catch (e) {
        setLoading(false);
        notifyCtx?.notify("Ralat sistem. Sila refresh.", "error");
      } finally {
        if (loadId) notifyCtx?.removeNotify(loadId);
      }
    }, 1200);
  };

  return (
    <div className={`min-h-screen flex items-center justify-center p-6 relative overflow-hidden font-['Manrope'] transition-colors duration-700 ${isDarkMode ? 'bg-[#020617]' : 'bg-[#F8FAFC]'}`}>
      
      {/* --- BACKGROUND AMBIENCE (MODERN GRADIENT BLUR) --- */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <div className={`absolute -top-[10%] -left-[10%] w-[40%] h-[40%] rounded-full blur-[120px] opacity-20 animate-pulse ${isDarkMode ? 'bg-amber-500' : 'bg-amber-300'}`} />
        <div className={`absolute -bottom-[10%] -right-[10%] w-[40%] h-[40%] rounded-full blur-[120px] opacity-20 animate-pulse delay-700 ${isDarkMode ? 'bg-blue-600' : 'bg-blue-300'}`} />
      </div>

      {/* --- THEME TOGGLE (FLOATING) --- */}
      <div className="absolute top-8 right-8 z-50">
        <button onClick={toggleTheme} className={`p-4 rounded-2xl shadow-2xl backdrop-blur-md border transition-all hover:scale-110 active:scale-90 ${isDarkMode ? 'bg-white/5 border-white/10 text-yellow-400' : 'bg-slate-900/5 border-slate-900/10 text-slate-600'}`}>
          {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
        </button>
      </div>

      <div className="relative z-10 w-full max-w-[480px] animate-in fade-in zoom-in-95 duration-700">
        
        {/* --- BRANDING SECTION --- */}
        <div className="text-center mb-10">
          <div className={`inline-flex items-center justify-center w-20 h-20 rounded-3xl shadow-2xl mb-6 border-2 transition-transform hover:rotate-6 ${isDarkMode ? 'bg-slate-900 border-white/10' : 'bg-white border-slate-100'}`}>
            <ShieldCheck size={40} className="text-amber-500" strokeWidth={1.5} />
          </div>
          <h2 className={`text-[10px] font-black tracking-[0.5em] uppercase mb-2 ${isDarkMode ? 'text-white/40' : 'text-slate-400'}`}>Unit Kokurikulum SK Menerong</h2>
          <h1 className={`text-7xl font-['Teko'] font-bold tracking-tight uppercase leading-none ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
            RAK <span className="text-amber-500">SKeMe</span>
          </h1>
        </div>

        {/* --- LOGIN CARD (GLASSMORPHISM) --- */}
        <div className={`backdrop-blur-2xl border rounded-[3rem] p-10 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.3)] ${isDarkMode ? 'bg-slate-900/60 border-white/10' : 'bg-white/80 border-slate-200'}`}>
          <div className="mb-8">
            <h3 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Log Masuk</h3>
            <p className={`text-xs mt-1 font-medium ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Sila masukkan kredential anda untuk akses sistem.</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            {/* INPUT ID */}
            <div className="space-y-2">
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none transition-colors group-focus-within:text-amber-500">
                  <User size={20} className={isDarkMode ? 'text-slate-600' : 'text-slate-400'} />
                </div>
                <input 
                  type="text" 
                  value={username} 
                  onChange={e => setUsername(e.target.value)} 
                  className={`block w-full rounded-2xl py-5 pl-14 pr-4 text-sm font-bold outline-none border-2 transition-all ${isDarkMode ? 'bg-slate-950/50 border-white/5 text-white focus:border-amber-500/50 focus:bg-slate-950' : 'bg-slate-50 border-transparent text-slate-900 focus:border-amber-500 focus:bg-white'}`} 
                  placeholder="ID Pengguna" 
                />
              </div>
            </div>

            {/* INPUT PASSWORD */}
            <div className="space-y-2">
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none transition-colors group-focus-within:text-amber-500">
                  <Lock size={20} className={isDarkMode ? 'text-slate-600' : 'text-slate-400'} />
                </div>
                <input 
                  type={showPassword ? "text" : "password"} 
                  value={password} 
                  onChange={e => setPassword(e.target.value)} 
                  className={`block w-full rounded-2xl py-5 pl-14 pr-14 text-sm font-bold outline-none border-2 transition-all ${isDarkMode ? 'bg-slate-950/50 border-white/5 text-white focus:border-amber-500/50 focus:bg-slate-950' : 'bg-slate-50 border-transparent text-slate-900 focus:border-amber-500 focus:bg-white'}`} 
                  placeholder="Kata Laluan" 
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-amber-500 transition-colors p-2">
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>
            
            {/* SUBMIT BUTTON */}
            <button 
              type="submit" 
              disabled={loading} 
              className="w-full bg-amber-500 hover:bg-amber-600 text-slate-900 font-black text-xs py-5 rounded-2xl shadow-xl shadow-amber-500/20 transition-all flex items-center justify-center gap-3 uppercase tracking-[0.2em] mt-6 active:scale-95 disabled:opacity-50"
            >
              {loading ? <RefreshCw className="animate-spin h-5 w-5" /> : <>Masuk Sekarang <ArrowRight className="h-4 w-4" /></>}
            </button>
          </form>
        </div>
        
        {/* --- FOOTER SECTION --- */}
        <div className="mt-12 text-center">
          <div className="flex items-center justify-center gap-2 mb-3">
            <Sparkles size={16} className="text-amber-500 animate-pulse" />
            <p className={`text-5xl font-['Caveat'] font-bold ${isDarkMode ? 'text-slate-200' : 'text-slate-600'}`}>
              Senyum Sokmo
            </p>
          </div>
          <p className={`text-[10px] uppercase tracking-[0.4em] font-black opacity-30 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
            Built by MANS Tech
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginScreen;