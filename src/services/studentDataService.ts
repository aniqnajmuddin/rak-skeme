import { Student, ActivityRecordModel, TakwimEvent, SportsHouse, SportListEvent } from '../types';
import * as XLSX from 'xlsx';

class StudentDataService {
  private _allStudents: Student[] = [];
  private _activityRecords: ActivityRecordModel[] = [];
  private _takwim: TakwimEvent[] = [];
  private _sportsHouses: SportsHouse[] = [];
  private _sportEventsList: SportListEvent[] = [];
  
  private _suggestedActivities: string[] = ['Latihan Rumah Sukan', 'Merentas Desa', 'Gotong Royong', 'Sukan Tahunan'];
  private _categories: string[] = ['UNIT BERUNIFORM', 'KELAB & PERSATUAN', 'SUKAN & PERMAINAN'];
  private _levels: string[] = ['Sekolah', 'Zon', 'Daerah', 'Negeri', 'Kebangsaan', 'Antarabangsa'];

  constructor() {
    this.loadDatabase();
    this.initSportsData();
  }

  // --- GETTERS ---
  getAllStudents() { return this._allStudents; }
  get activityRecords() { return this._activityRecords; }
  get takwim() { return this._takwim; }
  get sportsHouses() { return this._sportsHouses; }
  get sportEventsList() { return this._sportEventsList; }
  get suggestions() { return this._suggestedActivities; }
  get categories() { return this._categories; }
  get levels() { return this._levels; }

  // --- FUNGSI BARU UNTUK KAMUS (MENCEGAH ERROR) ---
  addSuggestion(text: string) { 
    const val = text.toUpperCase().trim();
    if (val && !this._suggestedActivities.includes(val)) {
      this._suggestedActivities.push(val); 
      this._saveToStorage(); 
    }
  }

  removeSuggestion(text: string) {
    this._suggestedActivities = this._suggestedActivities.filter(s => s !== text);
    this._saveToStorage();
  }

  // --- INIT DATA SUKAN ---
  private initSportsData() {
    if (this._sportsHouses.length === 0) {
      this._sportsHouses = [
        { id: 'blue', name: 'BIRU', color: 'bg-blue-600', captainName: 'CIKGU ANIQ', points: 0, motto: 'Laut Biru Tak Bertepi' },
        { id: 'red', name: 'MERAH', color: 'bg-rose-600', captainName: 'CIKGU ZUL', points: 0, motto: 'Merah Membara' },
        { id: 'green', name: 'HIJAU', color: 'bg-emerald-600', captainName: 'CIKGU SITI', points: 0, motto: 'Hutan Belantara' },
        { id: 'yellow', name: 'KUNING', color: 'bg-amber-500', captainName: 'CIKGU AMIN', points: 0, motto: 'Raja Kuning' },
      ];
      this._saveToStorage();
    }

    if (this._sportEventsList.length === 0) {
      const baseEvents = [
        { name: 'LARI 100M', cat: 'BALAPAN', classes: ['A', 'B', 'C'] },
        { name: 'LARI 200M', cat: 'BALAPAN', classes: ['A', 'B', 'C'] },
        { name: 'LARI 4x100M', cat: 'BALAPAN', classes: ['A', 'B', 'C'] },
        { name: 'LARI 4x200M', cat: 'BALAPAN', classes: ['OT'] },
        { name: 'LOMPAT JAUH', cat: 'PADANG', classes: ['A', 'B', 'C'] },
        { name: 'LOMPAT TINGGI', cat: 'PADANG', classes: ['A', 'B', 'C'] },
        { name: 'LONTAR PELURU', cat: 'PADANG', classes: ['A', 'B', 'C'] },
        { name: 'TARIK TALI', cat: 'SUKANEKA', classes: ['OT'] },
        { name: 'SUKANEKA TAHAP 1', cat: 'SUKANEKA', classes: ['OT'] },
      ];

      const generated: SportListEvent[] = [];
      const genders: ('L'|'P')[] = ['L', 'P'];

      baseEvents.forEach(evt => {
        evt.classes.forEach(cls => {
            if (evt.cat === 'SUKANEKA') {
                 generated.push({
                    id: `evt_${Date.now()}_${Math.random()}`,
                    name: evt.name, category: evt.cat, gender: 'CAMPURAN', ageClass: cls as any,
                    fullname: `${evt.name} (${cls === 'OT' ? 'TERBUKA' : 'KELAS '+cls})`
                 });
            } else {
                genders.forEach(g => {
                    generated.push({
                        id: `evt_${Date.now()}_${Math.random()}`,
                        name: evt.name, category: evt.cat, gender: g, ageClass: cls as any,
                        fullname: `${evt.name} (${g}) ${cls === 'OT' ? 'TERBUKA' : 'KELAS '+cls}`
                    });
                });
            }
        });
      });

      this._sportEventsList = generated;
      this._saveToStorage();
    }
  }

  // --- LOGIK EXCEL & SMART DETECT ---
  private normalizeYear(val: string): string { 
    const map: any = {'SATU':'1','DUA':'2','TIGA':'3','EMPAT':'4','LIMA':'5','ENAM':'6'}; 
    return map[String(val).toUpperCase().trim()] || String(val).toUpperCase().trim(); 
  }

  private findMatchingClass(dY: string, dC: string): string { 
      const existing = this.getUniqueClasses(); 
      const y = this.normalizeYear(dY); 
      const n = dC.toUpperCase().trim();
      const mFull = existing.find(c => { 
        const u = c.toUpperCase(); 
        return (u.includes(y) || (y==='4'&&u.includes('EMPAT'))||(y==='5'&&u.includes('LIMA'))||(y==='6'&&u.includes('ENAM'))) && u.includes(n); 
      });
      if (mFull) return mFull;
      if (y === "PPKI") return `PPKI ${n}`.trim();
      if (y === "PRA") return `PRA ${n}`.trim();
      return `TAHUN ${y} ${n}`.trim();
  }

  async parseFile(file: File): Promise<Student[]> { 
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = e.target?.result;
          const workbook = XLSX.read(data, { type: 'array' });
          const allExtractedStudents: Student[] = [];
          const icRegex = /(\d{12}|\d{6}-\d{2}-\d{4})/;

          workbook.SheetNames.forEach(sheetName => {
            const sheet = workbook.Sheets[sheetName];
            const rows: any[][] = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: "" });
            const upperSheetName = sheetName.toUpperCase();
            let sheetYear = ""; let sheetClass = "";

            if (upperSheetName.includes("PPKI")) {
              sheetYear = "PPKI"; sheetClass = upperSheetName.replace("PPKI", "").trim() || "INTEGRASI";
            } else if (upperSheetName.includes("PRA") || upperSheetName.includes("PRASEKOLAH")) {
              sheetYear = "PRA"; sheetClass = upperSheetName.replace("PRASEKOLAH", "").replace("PRA", "").trim() || "BESTARI";
            } else {
              const nameMatch = upperSheetName.match(/(\d+|SATU|DUA|TIGA|EMPAT|LIMA|ENAM)\s*(.*)/);
              if (nameMatch) {
                sheetYear = this.normalizeYear(nameMatch[1]); sheetClass = nameMatch[2].trim();
              }
            }

            rows.forEach(r => {
              let rowName = ""; let rowIC = "";
              r.forEach(c => {
                let v = String(c).trim();
                if (v.includes('E+')) v = Number(v).toLocaleString('fullwide', { useGrouping: false });
                const im = v.match(icRegex);
                if (im && !rowIC) rowIC = im[0].replace(/-/g, "");
                if (v.length > 3 && !v.match(/^\d/) && !v.includes(":") && !rowName) {
                  const u = v.toUpperCase();
                  if (!['BIL', 'NAMA', 'IC', 'KELAS', 'NO. KP', 'IDENTITI'].some(h => u.includes(h))) rowName = u;
                }
              });

              if (rowName && rowIC && rowIC.length >= 10) {
                let finalYear = sheetYear;
                if (!finalYear) {
                  if (rowIC.startsWith('19')) finalYear = "1";
                  else if (rowIC.startsWith('18')) finalYear = "2";
                  else if (rowIC.startsWith('17')) finalYear = "3";
                  else if (rowIC.startsWith('16')) finalYear = "4";
                  else if (rowIC.startsWith('15')) finalYear = "5";
                  else if (rowIC.startsWith('14')) finalYear = "6";
                  else if (rowIC.startsWith('20') || rowIC.startsWith('21')) finalYear = "PRA";
                }
                allExtractedStudents.push({
                  id: Math.random().toString(36).substr(2, 9),
                  name: rowName, icNumber: rowIC,
                  className: this.findMatchingClass(finalYear || "1", sheetClass || "UMUM"),
                  gender: 'L/P', house: 'TIADA'
                });
              }
            });
          });
          const uniqueOnes = allExtractedStudents.filter((v, i, a) => a.findIndex(t => (t.icNumber === v.icNumber)) === i);
          resolve(uniqueOnes);
        } catch (err) { reject("Gagal proses fail."); }
      };
      reader.readAsArrayBuffer(file);
    });
  }

  // --- FUNGSI ADMIN & URUS DATA ---
  addManualClass(c: string) { 
    this._allStudents.push({
      id: 'REF_' + Date.now(), 
      name: 'SISTEM: PENANDA KELAS', 
      icNumber: '0', 
      className: c.toUpperCase(), 
      gender: 'L/P', house: 'TIADA'
    }); 
    this._saveToStorage(); 
  }

  updateClassName(oldName: string, newName: string) { 
    this._allStudents = this._allStudents.map(s => 
      s.className === oldName ? { ...s, className: newName.toUpperCase() } : s
    ); 
    this._saveToStorage(); 
  }

  deleteClassName(c: string) { 
    this._allStudents = this._allStudents.filter(s => s.className !== c); 
    this._saveToStorage(); 
  }

  transferStudent(studentId: string, newClassName: string) {
    const index = this._allStudents.findIndex(s => s.id === studentId);
    if (index !== -1) {
      this._allStudents[index].className = newClassName.toUpperCase();
      this._saveToStorage();
    }
  }

  bulkAddStudents(s: Student[]) { 
    s.forEach(x => {
      const idx = this._allStudents.findIndex(y => y.icNumber === x.icNumber);
      if (idx === -1) this._allStudents.push(x);
      else this._allStudents[idx] = { ...this._allStudents[idx], className: x.className };
    }); 
    this._saveToStorage(); 
  }

  addActivityRecord(r: Omit<ActivityRecordModel, 'id'>) { this._activityRecords.push({id:Date.now().toString(), ...r}); this._saveToStorage(); }
  deleteActivityRecord(id: string) { this._activityRecords = this._activityRecords.filter(r=>r.id!==id); this._saveToStorage(); }
  saveTakwim(e: TakwimEvent) { const i=this._takwim.findIndex(t=>t.id===e.id); if(i>=0)this._takwim[i]=e; else this._takwim.push(e); this._saveToStorage(); }
  deleteTakwim(id: string) { this._takwim=this._takwim.filter(t=>t.id!==id); this._saveToStorage(); }
  deleteStudent(id: string) { this._allStudents=this._allStudents.filter(s=>s.id!==id); this._saveToStorage(); }
  getUniqueClasses() { return Array.from(new Set(this._allStudents.map(s=>s.className))).filter(Boolean).sort(); }

  private _saveToStorage() { 
    localStorage.setItem('RAK_MASTER_DB', JSON.stringify({
      students:this._allStudents, records:this._activityRecords, takwim:this._takwim, 
      suggests:this._suggestedActivities, cats:this._categories, 
      houses:this._sportsHouses, sportEvents:this._sportEventsList
    })); 
  }

  private loadDatabase() { 
    const r=localStorage.getItem('RAK_MASTER_DB'); 
    if(r){ 
      try{ 
        const p=JSON.parse(r); 
        this._allStudents=p.students||[]; this._activityRecords=p.records||[]; this._takwim=p.takwim||[]; this._sportsHouses=p.houses||[]; this._sportEventsList=p.sportEvents||[]; 
        if(p.suggests) this._suggestedActivities = p.suggests;
      } catch(e) { this._allStudents=[]; } 
    } 
  }
}

export const studentDataService = new StudentDataService();