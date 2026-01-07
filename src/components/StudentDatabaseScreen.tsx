import React, { useState, useEffect, useContext } from 'react';
import { studentDataService } from '../services/studentDataService';
import { NotifyContext } from '../App';
import { 
  ArrowLeft, Search, UserPlus, Upload, Trash2, Edit2, 
  Users, Filter, FileSpreadsheet, Download
} from 'lucide-react';
import { Student } from '../types';
import * as XLSX from 'xlsx';

const StudentDatabaseScreen: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const notifyCtx = useContext(NotifyContext);
  const [students, setStudents] = useState<Student[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClass, setSelectedClass] = useState('SEMUA');
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    refreshData();
  }, []);

  const refreshData = () => {
    setStudents(studentDataService.getAllStudents());
  };

  // --- LOGIK IMPORT EXCEL (FIXED ERROR) ---
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const loadId = notifyCtx?.notify("Menganalisis data fail...", "loading");

    try {
      const extracted = await studentDataService.parseFile(file);
      
      // Pastikan data yang masuk cukup sifat (ada gender & house)
      const formattedStudents: Student[] = extracted.map(s => ({
        ...s,
        gender: s.gender || 'L/P',
        house: s.house || 'TIADA'
      }));

      studentDataService.bulkAddStudents(formattedStudents);
      refreshData();
      if (loadId) notifyCtx?.removeNotify(loadId);
      notifyCtx?.notify(`${formattedStudents.length} murid berjaya didaftarkan!`, "success");
    } catch (err) {
      if (loadId) notifyCtx?.removeNotify(loadId);
      notifyCtx?.notify("Gagal proses fail. Pastikan format betul.", "error");
    } finally {
      setIsUploading(false);
      e.target.value = '';
    }
  };

  const handleDelete = (id: string, name: string) => {
    if (window.confirm(`Hapus data ${name} dari sistem?`)) {
      studentDataService.deleteStudent(id);
      refreshData();
      notifyCtx?.notify("Rekod murid dipadam.", "info");
    }
  };

  const uniqueClasses = studentDataService.getUniqueClasses();
  const filteredStudents = students.filter(s => {
    const matchSearch = s.name.toUpperCase().includes(searchTerm.toUpperCase()) || s.icNumber.includes(searchTerm);
    const matchClass = selectedClass === 'SEMUA' || s.className === selectedClass;
    return matchSearch && matchClass;
  });

  return (
    <div className="min-h-screen bg-[#020617] text-white p-6 lg:p-10 pb-32 font-['Manrope']">
      <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in">
        
        {/* HEADER */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-4">
            <button onClick={onBack} className="p-4 bg-white/5 rounded-2xl border border-white/10 text-blue-500 hover:bg-blue-600 hover:text-white transition-all shadow-lg"><ArrowLeft/></button>
            <div>
              <h1 className="text-5xl lg:text-6xl font-['Teko'] font-bold uppercase leading-none">DATABASE <span className="text-blue-500">MURID</span></h1>
              <p className="text-[10px] font-black text-slate-500 tracking-[0.3em] uppercase mt-1">Pengurusan Master List SKeMe</p>
            </div>
          </div>
          
          <div className="flex gap-3">
            <label className="bg-emerald-600 hover:bg-emerald-500 px-6 py-4 rounded-2xl text-[10px] font-black uppercase flex items-center gap-2 shadow-2xl transition-all cursor-pointer hover:scale-105">
              <Upload size={18}/> {isUploading ? 'PROSES...' : 'IMPORT EXCEL'}
              <input type="file" className="hidden" accept=".xlsx, .xls" onChange={handleFileUpload} disabled={isUploading} />
            </label>
          </div>
        </div>

        {/* STATS & FILTER */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="bg-white/5 border border-white/5 p-6 rounded-3xl">
            <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Jumlah Murid</p>
            <p className="text-5xl font-['Teko'] font-bold text-white leading-none">{students.length}</p>
          </div>

          <div className="lg:col-span-2 bg-white/5 border border-white/5 p-4 rounded-3xl flex items-center px-6">
            <Search className="text-slate-500 mr-4" size={20}/>
            <input 
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="CARI NAMA ATAU NO. KP..." 
              className="bg-transparent border-none outline-none text-sm font-bold w-full uppercase placeholder:text-slate-700"
            />
          </div>

          <div className="bg-white/5 border border-white/5 p-4 rounded-3xl flex items-center px-6">
            <Filter className="text-slate-500 mr-4" size={20}/>
            <select 
              value={selectedClass}
              onChange={e => setSelectedClass(e.target.value)}
              className="bg-transparent border-none outline-none text-xs font-black w-full uppercase cursor-pointer"
            >
              <option value="SEMUA" className="bg-[#020617]">SEMUA KELAS</option>
              {uniqueClasses.map(c => <option key={c} value={c} className="bg-[#020617]">{c}</option>)}
            </select>
          </div>
        </div>

        {/* TABLE */}
        <div className="bg-white/5 rounded-[2.5rem] border border-white/10 overflow-hidden shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-white/5 text-[10px] font-black uppercase text-slate-500 tracking-widest">
                <tr>
                  <th className="p-6">Nama Murid</th>
                  <th className="p-6">No. Kad Pengenalan</th>
                  <th className="p-6">Kelas</th>
                  <th className="p-6 text-right">Tindakan</th>
                </tr>
              </thead>
              <tbody className="text-[11px] font-bold">
                {filteredStudents.length > 0 ? filteredStudents.map((s) => (
                  <tr key={s.id} className="border-b border-white/5 hover:bg-white/5 transition-all group">
                    <td className="p-6 uppercase text-white group-hover:text-blue-400 transition-colors">{s.name}</td>
                    <td className="p-6 text-slate-400 font-mono tracking-wider">{s.icNumber}</td>
                    <td className="p-6">
                      <span className="bg-blue-500/10 text-blue-500 px-3 py-1 rounded-lg text-[10px] font-black">{s.className}</span>
                    </td>
                    <td className="p-6 text-right">
                      <button 
                        onClick={() => handleDelete(s.id, s.name)}
                        className="p-3 bg-white/5 hover:bg-rose-600 hover:text-white text-rose-500 rounded-xl transition-all shadow-lg"
                      >
                        <Trash2 size={16}/>
                      </button>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={4} className="p-20 text-center text-slate-600 font-black uppercase tracking-widest text-xs">
                      Tiada data murid dijumpai.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
};

export default StudentDatabaseScreen;