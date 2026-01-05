
import React, { useState, useEffect, useRef } from 'react';
import { studentDataService } from '../services/studentDataService';
import { Student } from '../types';
import { Search, Plus, Trash2, Edit2, X, User, Settings, Database, FileUp, Trash } from 'lucide-react';

const StudentDatabaseScreen: React.FC = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClassFilter, setSelectedClassFilter] = useState('SEMUA');
  const [availableClasses, setAvailableClasses] = useState<string[]>([]);
  
  useEffect(() => { 
      setStudents([...studentDataService.getAllStudents()]); 
      setAvailableClasses(['SEMUA', ...studentDataService.getUniqueClasses()]);
  }, []);

  const filteredStudents = students.filter(s => {
    const matchesSearch = s.name.toLowerCase().includes(searchTerm.toLowerCase()) || s.icNumber.includes(searchTerm);
    const matchesClass = selectedClassFilter === 'SEMUA' || s.className === selectedClassFilter;
    return matchesSearch && matchesClass;
  });

  return (
    <div className="flex flex-col h-full bg-[#0F172A] text-slate-100 font-['Manrope'] p-4 md:p-8 overflow-y-auto">
      
      <div className="flex flex-col md:flex-row justify-between items-center gap-6 mb-8">
        <div>
          <h2 className="text-3xl font-['Teko'] font-bold text-white uppercase flex items-center gap-3"><Database className="text-blue-500" size={32} /> DATA MURID</h2>
          <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Pangkalan Data Utama</p>
        </div>
        <div className="flex gap-2">
            <button className="bg-slate-800 text-white px-4 py-2 rounded-lg text-xs font-bold uppercase hover:bg-slate-700">Urus Kelas</button>
            <button className="bg-blue-600 text-white px-4 py-2 rounded-lg text-xs font-bold uppercase hover:bg-blue-500 flex items-center gap-2"><Plus size={14}/> Tambah Murid</button>
        </div>
      </div>

      <div className="bg-[#1E293B] border border-slate-700 rounded-2xl p-6">
          <div className="flex gap-4 mb-6">
              <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18}/>
                  <input type="text" placeholder="Cari nama..." className="w-full bg-slate-900 border border-slate-800 rounded-lg pl-10 pr-4 py-3 text-white font-bold uppercase focus:border-blue-500 outline-none" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
              </div>
              <select value={selectedClassFilter} onChange={e => setSelectedClassFilter(e.target.value)} className="bg-slate-900 border border-slate-800 rounded-lg px-4 py-3 text-white font-bold uppercase outline-none">
                  {availableClasses.map(cls => <option key={cls} value={cls}>{cls}</option>)}
              </select>
          </div>

          <div className="overflow-x-auto">
              <table className="w-full text-left">
                  <thead className="bg-slate-800 text-slate-400 text-xs font-bold uppercase">
                      <tr><th className="p-4 rounded-l-lg">Nama</th><th className="p-4">KP</th><th className="p-4">Kelas</th><th className="p-4">Rumah</th><th className="p-4 rounded-r-lg text-right">Aksi</th></tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                      {filteredStudents.map(s => (
                          <tr key={s.id} className="hover:bg-slate-800/50 transition-colors">
                              <td className="p-4 font-bold text-white uppercase">{s.name}</td>
                              <td className="p-4 font-mono text-slate-400">{s.icNumber}</td>
                              <td className="p-4"><span className="bg-slate-800 px-2 py-1 rounded text-xs font-bold text-blue-400 uppercase">{s.className}</span></td>
                              <td className="p-4 text-xs font-bold text-slate-500 uppercase">{s.house}</td>
                              <td className="p-4 text-right flex justify-end gap-2">
                                  <button className="text-slate-500 hover:text-blue-400"><Edit2 size={16}/></button>
                                  <button className="text-slate-500 hover:text-red-500"><Trash size={16}/></button>
                              </td>
                          </tr>
                      ))}
                  </tbody>
              </table>
          </div>
      </div>
    </div>
  );
};

export default StudentDatabaseScreen;
