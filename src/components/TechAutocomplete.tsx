
import React, { useState, useRef, useEffect } from 'react';
import { Search, X, AlertCircle, ChevronDown } from 'lucide-react';

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

  const filtered = suggestions.filter(s => s.toLowerCase().includes(value.toLowerCase()));

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) { setIsOpen(false); }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [wrapperRef]);

  return (
    <div className="relative w-full group" ref={wrapperRef}>
      <label className={`block text-xs font-bold uppercase tracking-widest mb-2 flex items-center gap-2 ${error ? 'text-red-400' : 'text-blue-400'}`}>
        {label}
      </label>
      
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <Search className={`h-5 w-5 ${error ? 'text-red-400' : 'text-slate-500'}`} />
        </div>
        
        <input
          ref={inputRef}
          type="text"
          className={`w-full bg-slate-900 text-white border rounded-xl pl-12 pr-10 py-4 text-lg font-bold uppercase font-['Teko'] tracking-wide focus:outline-none transition-all placeholder-slate-600 ${
            error ? 'border-red-500' : 'border-slate-700 focus:border-blue-500'
          }`}
          placeholder={placeholder || "Cari..."}
          value={value}
          onChange={(e) => { onChange(e.target.value); setIsOpen(true); }}
          onFocus={() => setIsOpen(true)}
          autoComplete="off"
        />
        
        <div className="absolute inset-y-0 right-0 pr-4 flex items-center gap-2">
            {value && (
            <button onClick={() => { onChange(''); inputRef.current?.focus(); }} className="text-slate-600 hover:text-white transition-colors">
                <X className="h-5 w-5" />
            </button>
            )}
        </div>
      </div>
      
      {/* Suggestions Dropdown */}
      {isOpen && filtered.length > 0 && (
        <div className="absolute z-[100] w-full mt-2 bg-slate-800 border border-slate-700 rounded-xl shadow-2xl max-h-60 overflow-y-auto custom-scrollbar">
          {filtered.map((suggestion, index) => (
            <div
              key={index}
              className="px-5 py-3 cursor-pointer hover:bg-blue-600 hover:text-white text-slate-300 font-bold uppercase text-sm border-b border-slate-700 last:border-0 transition-colors"
              onClick={() => { onChange(suggestion); setIsOpen(false); }}
            >
              {suggestion}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TechAutocomplete;
