import React, { useState, useRef, useEffect } from 'react';
import { Search, X, ChevronDown, Sparkles } from 'lucide-react';

interface TechAutocompleteProps {
  label: string;
  suggestions: string[];
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  error?: string;
}

const TechAutocomplete: React.FC<TechAutocompleteProps> = ({ 
  label, suggestions, value, onChange, placeholder, error
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Tapis cadangan berdasarkan apa yang ditaip
  const filtered = suggestions.filter(s => 
    s.toLowerCase().includes(value.toLowerCase())
  );

  // Fungsi untuk tutup dropdown bila klik luar kawasan
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) { 
        setIsOpen(false); 
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [wrapperRef]);

  return (
    <div className="relative w-full group" ref={wrapperRef}>
      {/* Label dengan gaya Inteligent */}
      <label className={`flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] mb-2.5 ml-1 transition-colors ${error ? 'text-rose-500' : 'text-blue-500 group-focus-within:text-blue-400'}`}>
        <Sparkles size={12} className={isOpen ? 'animate-pulse' : ''} />
        {label}
      </label>
      
      <div className="relative">
        {/* Ikon Kiri (Carian) */}
        <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
          <Search className={`h-5 w-5 transition-colors ${error ? 'text-rose-500' : isOpen ? 'text-blue-500' : 'text-slate-600'}`} />
        </div>
        
        {/* Input Utama */}
        <input
          ref={inputRef}
          type="text"
          className={`w-full bg-slate-950 text-white border-2 rounded-2xl pl-14 pr-12 py-5 text-xl font-['Teko'] font-bold uppercase tracking-widest outline-none transition-all placeholder-slate-800 shadow-inner ${
            error 
              ? 'border-rose-500/50 bg-rose-500/5 focus:border-rose-500' 
              : 'border-white/5 focus:border-blue-500/50 focus:bg-slate-900'
          }`}
          placeholder={placeholder || "Mula menaip..."}
          value={value}
          onChange={(e) => { onChange(e.target.value); setIsOpen(true); }}
          onFocus={() => setIsOpen(true)}
          autoComplete="off"
        />
        
        {/* Ikon Kanan (Clear / Arrow) */}
        <div className="absolute inset-y-0 right-0 pr-5 flex items-center gap-3">
            {value && (
              <button 
                type="button"
                onClick={() => { onChange(''); inputRef.current?.focus(); }} 
                className="text-slate-600 hover:text-rose-500 transition-colors p-1"
              >
                <X className="h-5 w-5" />
              </button>
            )}
            <ChevronDown className={`h-5 w-5 text-slate-700 transition-transform duration-300 ${isOpen ? 'rotate-180 text-blue-500' : ''}`} />
        </div>
      </div>
      
      {/* --- DROPDOWN SUGGESTIONS (MODERN UI) --- */}
      {isOpen && filtered.length > 0 && (
        <div className="absolute z-[200] w-full mt-3 bg-[#0f172a] border-2 border-white/10 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] max-h-64 overflow-y-auto no-scrollbar animate-in fade-in slide-in-from-top-4 duration-200 backdrop-blur-xl">
          <div className="p-2">
            {filtered.map((suggestion, index) => (
              <div
                key={index}
                className="group/item px-5 py-4 cursor-pointer rounded-2xl hover:bg-blue-600 transition-all flex items-center justify-between mb-1 last:mb-0 border border-transparent hover:border-blue-400/50"
                onClick={() => { onChange(suggestion); setIsOpen(false); }}
              >
                <div className="flex flex-col">
                  <span className="text-sm font-black uppercase tracking-widest text-slate-300 group-hover/item:text-white transition-colors">
                    {suggestion}
                  </span>
                  <span className="text-[8px] font-bold text-slate-600 group-hover/item:text-blue-200 uppercase tracking-tighter">
                    Padanan Pangkalan Data
                  </span>
                </div>
                <ChevronRight size={16} className="text-slate-800 group-hover/item:text-white transition-all transform group-hover/item:translate-x-1" />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Ralat (Jika Ada) */}
      {error && (
        <p className="mt-2 ml-4 text-[10px] font-black text-rose-500 uppercase tracking-widest flex items-center gap-1 animate-pulse">
           Sila pilih dari senarai atau isi dengan betul.
        </p>
      )}
    </div>
  );
};

// Ikon tambahan untuk estetika
const ChevronRight = ({ size, className }: { size: number, className: string }) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="3" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <path d="m9 18 6-6-6-6"/>
  </svg>
);

export default TechAutocomplete;