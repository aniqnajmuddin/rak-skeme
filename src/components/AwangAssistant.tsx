import React, { useState, useRef, useEffect } from 'react';
import { X, Send, Bot, BrainCircuit } from 'lucide-react';
import { awangAI } from '../services/awangService';

const AwangAssistant: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [chat, setChat] = useState<{role: 'user' | 'awang', text: string, isStreaming?: boolean}[]>([
    { role: 'awang', text: 'Assalamualaikum Cikgu! Saya Awang SKeMe (Gemini 3 Flash). Ada nok minta tolong draf laporan ke? Kabo je bohh.' }
  ]);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [chat, isOpen]);

  const handleSend = async (customPrompt?: string) => {
    const textToSend = customPrompt || input;
    if (!textToSend.trim() || isLoading) return;
    
    // 1. Tambah mesej user
    setChat(prev => [...prev, { role: 'user', text: textToSend }]);
    setInput('');
    setIsLoading(true);

    // 2. Tambah placeholder mesej Awang yang kosong
    const awangMsgId = Date.now();
    setChat(prev => [...prev, { role: 'awang', text: '', isStreaming: true }]);

    try {
      let fullResponse = "";
      // 3. Panggil Stream dari Service
      const stream = awangAI.askEinsteinStream(textToSend);

      for await (const chunk of stream) {
        fullResponse += chunk;
        // 4. Update mesej Awang sebutir-sebutir
        setChat(prev => {
          const newChat = [...prev];
          newChat[newChat.length - 1] = { role: 'awang', text: fullResponse, isStreaming: true };
          return newChat;
        });
      }

      // 5. Selesai streaming
      setChat(prev => {
        const newChat = [...prev];
        newChat[newChat.length - 1].isStreaming = false;
        return newChat;
      });

    } catch (err) {
      setChat(prev => [...prev, { role: 'awang', text: "Maaf bohh, talian putus." }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-[9999] font-['Manrope'] no-print">
      {!isOpen && (
        <button onClick={() => setIsOpen(true)} className="w-16 h-16 bg-blue-600 rounded-full shadow-2xl flex items-center justify-center text-white hover:scale-110 transition-all border-2 border-white/20">
          <Bot size={32} />
        </button>
      )}

      {isOpen && (
        <div className="w-[350px] h-[550px] bg-[#0f172a] border border-slate-700 rounded-[2.5rem] shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom-10">
          <div className="p-5 bg-slate-900 border-b border-slate-800 flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-amber-500/10 text-amber-500">
                <BrainCircuit size={20} className={isLoading ? 'animate-pulse' : ''}/>
              </div>
              <div>
                <h4 className="font-bold text-[10px] text-white uppercase tracking-widest">Awang SKeMe AI</h4>
                <p className="text-[8px] text-emerald-500 font-black uppercase tracking-tighter">Gemini 3 Flash • Streaming</p>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-white"><X size={20}/></button>
          </div>

          <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-slate-950 no-scrollbar">
            {chat.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] p-3 rounded-2xl text-[12px] leading-relaxed shadow-sm ${
                  msg.role === 'user' ? 'bg-blue-600 text-white rounded-tr-none' : 'bg-slate-800 text-slate-200 border border-slate-700 rounded-tl-none'
                }`}>
                  {msg.text}
                  {msg.isStreaming && <span className="inline-block w-1.5 h-4 ml-1 bg-emerald-500 animate-pulse align-middle" />}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          <div className="p-4 bg-slate-900 border-t border-slate-800">
            <div className="flex gap-2">
              <input 
                value={input} 
                onChange={(e) => setInput(e.target.value)} 
                onKeyDown={(e) => e.key === 'Enter' && handleSend()} 
                placeholder="Tanya Awang..." 
                className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-[11px] text-white outline-none focus:border-blue-500"
              />
              <button onClick={() => handleSend()} disabled={isLoading} className="p-2 bg-blue-600 rounded-xl text-white hover:bg-blue-500 transition-colors">
                <Send size={18} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AwangAssistant;