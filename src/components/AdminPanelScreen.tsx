import React, { useState, useEffect, useContext } from 'react';
import { studentDataService } from '../services/studentDataService';
import { NotifyContext } from '../App';
import { ArrowLeft, Plus, Trash2, Edit3, Save, X, School } from 'lucide-react';

const AdminPanelScreen: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const notifyCtx = useContext(NotifyContext);
  const [classList, setClassList] = useState<string[]>([]);
  const [newClassName, setNewClassName] = useState('');
  const [editingClass, setEditingClass] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');

  useEffect(() => { setClassList(studentDataService.classes); }, []);

  const handleAddClass = () => {
    if (!newClassName) return;
    studentDataService.addClass(newClassName);
    setClassList([...studentDataService.classes]);
    setNewClassName('');
    notifyCtx?.notify("Kelas berjaya ditambah!", "success");
  };

  const handleDeleteClass = (name: string) => {
    if (confirm(`Padam kelas ${name}? Data murid dalam kelas ini akan kekal tetapi label kelas perlu dikemaskini.`)) {
      studentDataService.deleteClass(name);
      setClassList([...studentDataService.classes]);
      notifyCtx?.notify("Kelas dipadam.", "info");
    }
  };

  const startEdit = (name: string) => {
    setEditingClass(name);
    setEditValue(name);
  };

  const saveEdit = (oldName: string) => {
    studentDataService.updateClass(oldName, editValue);
    setClassList([...studentDataService.classes]);
    setEditingClass(null);
    notifyCtx?.notify("Nama kelas dikemaskini!", "success");
  };

  return (
    <div className="min-h-screen bg-[#020617] text-white p-6 lg:p-12 font-['Manrope']">
      <div className="max-w-4xl mx-auto space-y-10">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="p-4 bg-white/5 rounded-2xl border border-white/10 text-blue-500 hover:bg-blue-600 hover:text-white transition-all shadow-xl"><ArrowLeft/></button>
          <h1 className="text-6xl font-['Teko'] font-bold uppercase italic leading-none text-white">ADMIN <span className="text-blue-500">PANEL</span></h1>
        </div>

        <div className="bg-white/5 p-10 rounded-[3rem] border border-white/10 shadow-2xl space-y-8">
          <div className="flex items-center gap-3 border-b border-white/5 pb-6">
            <School className="text-blue-500" size={32}/>
            <h2 className="text-3xl font-['Teko'] font-bold uppercase tracking-widest">Pengurusan Kelas SK Menerong</h2>
          </div>

          <div className="flex gap-4">
            <input 
              value={newClassName}
              onChange={e => setNewClassName(e.target.value.toUpperCase())}
              placeholder="CONTOH: 6 ANGGERIK..."
              className="flex-1 bg-black/40 border border-white/10 p-5 rounded-2xl text-sm font-bold outline-none focus:border-blue-500 transition-all"
            />
            <button onClick={handleAddClass} className="bg-blue-600 hover:bg-blue-500 px-8 py-5 rounded-2xl text-xs font-black uppercase flex items-center gap-2 shadow-xl">
              <Plus size={20}/> Tambah Kelas
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
            {classList.map(c => (
              <div key={c} className="bg-white/5 border border-white/5 p-6 rounded-2xl flex items-center justify-between group hover:border-blue-500/50 transition-all">
                {editingClass === c ? (
                  <div className="flex gap-2 w-full">
                    <input value={editValue} onChange={e => setEditValue(e.target.value.toUpperCase())} className="flex-1 bg-black p-2 rounded-lg text-xs font-bold outline-none border border-blue-500" />
                    <button onClick={() => saveEdit(c)} className="text-emerald-500"><Save size={18}/></button>
                    <button onClick={() => setEditingClass(null)} className="text-slate-500"><X size={18}/></button>
                  </div>
                ) : (
                  <>
                    <span className="font-black text-white tracking-widest uppercase">{c}</span>
                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-all">
                      <button onClick={() => startEdit(c)} className="p-2 text-slate-400 hover:text-blue-500"><Edit3 size={16}/></button>
                      <button onClick={() => handleDeleteClass(c)} className="p-2 text-slate-400 hover:text-red-500"><Trash2 size={16}/></button>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
export default AdminPanelScreen;