
import React, { useState, useEffect } from 'react';
import { User, Lock, ArrowRight, Eye, ShieldCheck, Sun, Moon, Activity } from 'lucide-react';

interface LoginScreenProps {
  onLogin: (role: 'ADMIN' | 'GURU') => void;
  isDarkMode: boolean;
  toggleTheme: () => void;
}

const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin, isDarkMode, toggleTheme }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{msg: string, type: 'SUCCESS' | 'ERROR'} | null>(null);
  
  const showToastMsg = (msg: string, type: 'SUCCESS' | 'ERROR') => {
      setToast({ msg, type });
      setTimeout(() => setToast(null), 3000);
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
        showToastMsg("SILA LENGKAPKAN MAKLUMAT", 'ERROR');
        return;
    }

    setLoading(true);
    
    // Simple Base64 obfuscation to prevent plaintext passwords in codebase
    // ADMIN: admin / 54321
    // GURU: guru / 1234
    const checkAuth = () => {
        try {
            const inputHash = window.btoa(`${username.toLowerCase()}:${password}`);
            const adminHash = 'YWRtaW46NTQzMjE='; 
            const guruHash = 'Z3VydToxMjM0';     

            if (inputHash === adminHash) {
                showToastMsg("AKSES DIBENARKAN", 'SUCCESS');
                setTimeout(() => onLogin('ADMIN'), 800);
            } else if (inputHash === guruHash) {
                showToastMsg("AKSES DIBENARKAN", 'SUCCESS');
                setTimeout(() => onLogin('GURU'), 800);
            } else {
                setLoading(false);
                showToastMsg("ID ATAU KATA LALUAN SALAH", 'ERROR');
            }
        } catch (e) {
            setLoading(false);
            showToastMsg("RALAT SISTEM", 'ERROR');
        }
    };

    setTimeout(checkAuth, 1000);
  };

  // Theme-based classes
  const bgClass = isDarkMode ? 'bg-[#0F172A]' : 'bg-[#F0F4F8]';
  const cardBgClass = isDarkMode ? 'bg-[#1E293B]/80 border-slate-700' : 'bg-white border-slate-200 shadow-xl';
  const textMainClass = isDarkMode ? 'text-white' : 'text-slate-800';
  const textSubClass = isDarkMode ? 'text-slate-400' : 'text-slate-500';
  const inputBgClass = isDarkMode ? 'bg-slate-900 border-slate-700 text-white focus:border-amber-500' : 'bg-slate-50 border-slate-300 text-slate-800 focus:border-amber-500';

  return (
    <div className={`min-h-screen flex items-center justify-center p-6 relative overflow-hidden font-['Manrope'] transition-colors duration-500 ${bgClass}`}>
      
      {/* Background Ambience */}
      <div className="absolute inset-0 z-0 opacity-30 pointer-events-none">
          {isDarkMode ? (
             <div className="absolute bottom-0 right-0 w-[800px] h-[800px] bg-blue-900/20 rounded-full blur-[120px]" />
          ) : (
             <div className="absolute bottom-0 right-0 w-[800px] h-[800px] bg-blue-200/40 rounded-full blur-[120px]" />
          )}
      </div>

      {/* Theme Toggle (Top Right) */}
      <div className="absolute top-6 right-6 z-20">
        <button onClick={toggleTheme} className={`p-4 rounded-full shadow-lg transition-transform hover:scale-110 ${isDarkMode ? 'bg-slate-800 text-yellow-400' : 'bg-white text-slate-600'}`}>
            {isDarkMode ? <Sun size={24} /> : <Moon size={24} />}
        </button>
      </div>

      <div className="relative z-10 w-full max-w-[450px]">
        {/* School Info Section */}
        <div className="text-center mb-8">
            <div className={`inline-flex items-center justify-center w-24 h-24 rounded-[2rem] shadow-2xl mb-6 relative ${isDarkMode ? 'bg-slate-800 border border-slate-700' : 'bg-white border border-slate-100'}`}>
                <ShieldCheck size={48} className="text-amber-500" strokeWidth={1.5} />
            </div>
            
            <h2 className={`text-xl font-bold tracking-widest uppercase mb-1 ${textSubClass}`}>Sekolah Kebangsaan Menerong</h2>
            <p className="text-sm font-bold text-amber-500 tracking-[0.2em] mb-4">TBA5014</p>
            
            <h1 className={`text-6xl font-['Teko'] font-bold tracking-wide uppercase leading-none ${textMainClass}`}>RAK SKeMe</h1>
            <p className={`text-sm font-semibold tracking-[0.3em] uppercase mt-2 ${textSubClass}`}>Unit Kokurikulum</p>
        </div>

        {/* Login Card */}
        <div className={`backdrop-blur-xl border rounded-[2.5rem] p-8 md:p-10 shadow-2xl ${cardBgClass}`}>
            <form onSubmit={handleLogin} className="space-y-6">
                <div className="space-y-2">
                    <label className={`text-xs font-bold tracking-widest uppercase pl-4 block ${textSubClass}`}>ID Pengguna</label>
                    <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                            <User size={24} className="text-slate-400" />
                        </div>
                        <input 
                            type="text" 
                            value={username} 
                            onChange={e => setUsername(e.target.value)} 
                            className={`block w-full border-2 rounded-2xl py-5 pl-14 pr-4 text-lg font-bold outline-none transition-all placeholder-slate-400 ${inputBgClass}`} 
                            placeholder="Contoh: admin" 
                        />
                    </div>
                </div>
                <div className="space-y-2">
                    <label className={`text-xs font-bold tracking-widest uppercase pl-4 block ${textSubClass}`}>Kata Laluan</label>
                    <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                            <Lock size={24} className="text-slate-400" />
                        </div>
                        <input 
                            type={showPassword ? "text" : "password"} 
                            value={password} 
                            onChange={e => setPassword(e.target.value)} 
                            className={`block w-full border-2 rounded-2xl py-5 pl-14 pr-4 text-lg font-bold outline-none transition-all placeholder-slate-400 ${inputBgClass}`} 
                            placeholder="••••••" 
                        />
                        <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-amber-500 transition-colors p-2">
                            <Eye size={24} />
                        </button>
                    </div>
                </div>
                
                <button 
                    type="submit" 
                    disabled={loading} 
                    className="w-full bg-amber-500 hover:bg-amber-600 text-white font-['Manrope'] font-bold text-lg py-5 rounded-2xl shadow-lg hover:shadow-amber-500/30 transition-all flex items-center justify-center gap-3 uppercase tracking-wide mt-4 active:scale-95"
                >
                    {loading ? <Activity className="animate-spin h-6 w-6" /> : <>Log Masuk <ArrowRight className="h-6 w-6" /></>}
                </button>
            </form>
        </div>
        
        {/* Footer Signature */}
<div className="mt-10 text-center">
    {/* Guna font-['Caveat'] di sini 👇 */}
    <p className={`text-5xl font-['Caveat'] font-bold transform -rotate-3 mb-2 ${isDarkMode ? 'text-slate-300' : 'text-slate-500'}`}>
        Senyum Sokmo
    </p>
    <p className={`text-[10px] uppercase tracking-widest font-bold opacity-60 ${textSubClass}`}>Developed by MANS</p>
</div>
      </div>

      {toast && (
          <div className={`fixed top-8 left-1/2 -translate-x-1/2 z-50 px-8 py-4 rounded-full shadow-2xl flex items-center gap-3 animate-in slide-in-from-top-10 fade-in duration-300 ${toast.type === 'SUCCESS' ? 'bg-emerald-600 text-white' : 'bg-rose-600 text-white'}`}>
              <span className="text-sm font-bold tracking-wider uppercase">{toast.msg}</span>
          </div>
      )}
    </div>
  );
};

export default LoginScreen;
