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

  // GETTERS
  getAllStudents() { return this._allStudents; }
  get activityRecords() { return this._activityRecords; }
  get takwim() { return this._takwim; }
  get sportsHouses() { return this._sportsHouses; }
  get sportEventsList() { return this._sportEventsList; }
  get suggestions() { return this._suggestedActivities; }
  get categories() { return this._categories; }
  get levels() { return this._levels; }

  // --- INIT DATA SUKAN (AUTO GENERATE) ---
  private initSportsData() {
    // 1. Init Rumah Sukan (Jika tiada)
    if (this._sportsHouses.length === 0) {
      this._sportsHouses = [
        { id: 'blue', name: 'BIRU', color: 'bg-blue-600', captainName: 'CIKGU ANIQ', points: 0, motto: 'Laut Biru Tak Bertepi' },
        { id: 'red', name: 'MERAH', color: 'bg-rose-600', captainName: 'CIKGU ZUL', points: 0, motto: 'Merah Membara' },
        { id: 'green', name: 'HIJAU', color: 'bg-emerald-600', captainName: 'CIKGU SITI', points: 0, motto: 'Hutan Belantara' },
        { id: 'yellow', name: 'KUNING', color: 'bg-amber-500', captainName: 'CIKGU AMIN', points: 0, motto: 'Raja Kuning' },
      ];
      this._saveToStorage();
    }

    // 2. Init Acara Standard KPM (A/B/C/OT)
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

  updateHousePoints(houseName: string, pointsToAdd: number) {
    const index = this._sportsHouses.findIndex(h => h.name === houseName);
    if (index !== -1) {
      this._sportsHouses[index].points = (this._sportsHouses[index].points || 0) + Number(pointsToAdd);
      this._saveToStorage();
    }
  }

  addSportEvent(name: string, category: string, gender: 'L'|'P'|'CAMPURAN', ageClass: 'A'|'B'|'C'|'OT') {
    const newEvent: SportListEvent = {
      id: Date.now().toString(),
      name: name.toUpperCase(),
      category: category.toUpperCase(),
      gender,
      ageClass,
      fullname: `${name.toUpperCase()} (${gender}) ${ageClass === 'OT' ? 'TERBUKA' : 'KELAS '+ageClass}`
    };
    this._sportEventsList.push(newEvent);
    this._saveToStorage();
  }

  deleteSportEvent(id: string) {
    this._sportEventsList = this._sportEventsList.filter(e => e.id !== id);
    this._saveToStorage();
  }

  // --- HELPER LAIN ---
  private normalizeYear(val: string): string { const map: any = {'SATU':'1','DUA':'2','TIGA':'3','EMPAT':'4','LIMA':'5','ENAM':'6'}; return map[String(val).toUpperCase().trim()] || String(val).toUpperCase().trim(); }
  private findMatchingClass(dY: string, dC: string): string { 
      const existing = this.getUniqueClasses(); const y = this.normalizeYear(dY); const n = dC.toUpperCase().trim();
      const mFull = existing.find(c => { const u = c.toUpperCase(); return (u.includes(y) || (y==='4'&&u.includes('EMPAT'))||(y==='5'&&u.includes('LIMA'))||(y==='6'&&u.includes('ENAM'))) && u.includes(n); });
      if (mFull) return mFull;
      const mYear = existing.find(c => { const u = c.toUpperCase(); return u.includes(y) || (y==='4'&&u.includes('EMPAT'))||(y==='5'&&u.includes('LIMA'))||(y==='6'&&u.includes('ENAM')); });
      if (mYear) return mYear;
      return `TAHUN ${y} ${n}`.trim();
  }
  
  async parseFile(file: File): Promise<Student[]> { 
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
           try {
              const data = e.target?.result; const workbook = XLSX.read(data, {type:'array'});
              const sheet = workbook.Sheets[workbook.SheetNames[0]]; const rows:any[][] = XLSX.utils.sheet_to_json(sheet, {header:1, defval:""});
              let fY="", fC=""; const fN=file.name.toUpperCase(); const fM=fN.match(/TAHUN\s+(\d+|SATU|DUA|TIGA|EMPAT|LIMA|ENAM)\s+([A-Z]+)/);
              if(fM){fY=this.normalizeYear(fM[1]); fC=fM[2].trim();} else { const k=['NILAM','AKID','INTAN','DELIMA','MAWAR','ZAMRUD','ANGGERIK']; fC=k.find(x=>fN.includes(x))||""; }
              
              for(let i=0;i<Math.min(rows.length,15);i++){ const s=rows[i].join(" ").toUpperCase(); const yM=s.match(/TAHUN\s*(\d+)/); if(yM&&!fY)fY=yM[1]; if(s.includes("KELAS")){ const m=s.match(/KELAS[:\s]+([A-Z0-9\s]+)/); if(m&&!fC)fC=m[1].trim().split('|')[0].trim(); }}

              const ext: Student[] = []; const icR = /(\d{12}|\d{6}-\d{2}-\d{4})/;
              rows.forEach(r => {
                 let rN="", rI="";
                 r.forEach(c => {
                    let v=String(c).trim(); if(v.includes('E+'))v=Number(v).toLocaleString('fullwide',{useGrouping:false});
                    const im=v.match(icR); if(im&&!rI)rI=im[0].replace(/-/g,"");
                    if(v.length>3 && !v.match(/^\d/) && !v.includes(":") && !rN) { const u=v.toUpperCase(); if(!['BIL','NAMA','IC','KELAS'].includes(u)) rN=u; }
                 });
                 if(rN&&rI&&rI.length>=10) { 
                    const iY = rI.startsWith('15')?'4':rI.startsWith('14')?'5':rI.startsWith('13')?'6':'';
                    ext.push({id:Math.random().toString(36).substr(2,9), name:rN, icNumber:rI, className:this.findMatchingClass(fY||iY, fC), gender:'L/P', house:'TIADA'});
                 }
              });
              resolve(ext);
           } catch (err) { reject("Fail rosak."); }
        };
        reader.readAsArrayBuffer(file);
      });
  }

  // STANDARD METHODS
  addActivityRecord(r: Omit<ActivityRecordModel, 'id'>) { this._activityRecords.push({id:Date.now().toString(), ...r}); this._saveToStorage(); }
  deleteActivityRecord(id: string) { this._activityRecords = this._activityRecords.filter(r=>r.id!==id); this._saveToStorage(); }
  saveTakwim(e: TakwimEvent) { const i=this._takwim.findIndex(t=>t.id===e.id); if(i>=0)this._takwim[i]=e; else this._takwim.push(e); this._saveToStorage(); }
  deleteTakwim(id: string) { this._takwim=this._takwim.filter(t=>t.id!==id); this._saveToStorage(); }
  addSuggestion(t: string) { if(!this._suggestedActivities.includes(t.toUpperCase())) { this._suggestedActivities.push(t.toUpperCase()); this._saveToStorage(); } }
  bulkAddStudents(s: Student[]) { s.forEach(x=>{if(!this._allStudents.some(y=>y.icNumber===x.icNumber))this._allStudents.push(x)}); this._saveToStorage(); }
  deleteStudent(id: string) { this._allStudents=this._allStudents.filter(s=>s.id!==id); this._saveToStorage(); }
  updateClassName(o: string, n: string) { this._allStudents=this._allStudents.map(s=>s.className===o?{...s, className:n.toUpperCase()}:s); this._saveToStorage(); }
  deleteClassName(c: string) { this._allStudents=this._allStudents.filter(s=>s.className!==c); this._saveToStorage(); }
  getUniqueClasses() { return Array.from(new Set(this._allStudents.map(s=>s.className))).filter(Boolean).sort(); }
  addManualClass(c: string) { this._allStudents.push({id:'M_'+Date.now(), name:'SISTEM', icNumber:'0', className:c.toUpperCase(), gender:'L/P', house:'TIADA'}); this._saveToStorage(); }

  private _saveToStorage() { localStorage.setItem('RAK_MASTER_DB', JSON.stringify({students:this._allStudents, records:this._activityRecords, takwim:this._takwim, suggests:this._suggestedActivities, cats:this._categories, houses:this._sportsHouses, sportEvents:this._sportEventsList})); }
  private loadDatabase() { const r=localStorage.getItem('RAK_MASTER_DB'); if(r){ try{ const p=JSON.parse(r); this._allStudents=p.students||[]; this._activityRecords=p.records||[]; this._takwim=p.takwim||[]; this._sportsHouses=p.houses||[]; this._sportEventsList=p.sportEvents||[]; }catch(e){this._allStudents=[];} } }
}

export const studentDataService = new StudentDataService();