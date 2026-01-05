
import { Student, ActivityRecordModel, ActivityParticipant, TakwimEvent, AppNotification, SportEvent, HouseStats, SportsHouse } from '../types';
import * as XLSX from 'xlsx';
import { googleDriveService } from './googleDriveService';
import { githubService, GitHubConfig } from './githubService';

export interface AthleteStats {
    studentId: string;
    name: string;
    house: string;
    points: number;
    medals: { gold: number; silver: number; bronze: number; fourth: number };
}

class StudentDataService {
  private _allStudents: Student[] = [];
  private _activityRecords: ActivityRecordModel[] = [];
  private _takwim: TakwimEvent[] = [];
  private _notifications: AppNotification[] = [];
  private _sportsEvents: SportEvent[] = [];
  private _sportsHouses: SportsHouse[] = []; 

  public suggestedActivities: string[] = ['Latihan Rumah Sukan', 'Merentas Desa', 'Gotong Royong', 'Sukan Tahunan'];
  public suggestedExternalEvents: string[] = ['MSSD', 'MSSN', 'MSSM'];
  public suggestedLevels: string[] = ['Sekolah', 'Zon', 'Daerah', 'Negeri', 'Kebangsaan', 'Antarabangsa'];
  
  public isCloudEnabled = false;

  constructor() {
    this.loadDatabase();
    this.initializeSports();
    this.initializeHouses(); 
  }

  getAllStudents(): Student[] { return this._allStudents; }
  get activityRecords(): ActivityRecordModel[] { return this._activityRecords; }
  get takwim(): TakwimEvent[] { return this._takwim; }
  get notifications(): AppNotification[] { return this._notifications; }
  get sportsEvents(): SportEvent[] { return this._sportsEvents; }
  get sportsHouses(): SportsHouse[] { return this._sportsHouses; }

  // --- GITHUB INTEGRATION ---

  async saveToGitHub(config: GitHubConfig): Promise<{ success: boolean; msg: string }> {
      const fullData = this.prepareFullData();
      const content = JSON.stringify(fullData, null, 2);
      const timestamp = new Date().toLocaleString('ms-MY');
      const message = `Auto-Save RAK SKeMe: ${timestamp}`;
      
      return await githubService.saveFile(config, content, message);
  }

  async loadFromGitHub(config: GitHubConfig): Promise<{ success: boolean; msg: string }> {
      const result = await githubService.getFile(config);
      if (result.success && result.data) {
          const data = result.data;
          if (data.students) this._allStudents = data.students;
          if (data.activities) this._activityRecords = data.activities;
          if (data.takwim) this._takwim = data.takwim;
          if (data.sports) this._sportsEvents = data.sports;
          if (data.houses) this._sportsHouses = data.houses;
          this._saveToStorage(false); // Save locally but don't re-upload to cloud to avoid loops
          return { success: true, msg: "Database dikemaskini dari GitHub!" };
      }
      return { success: false, msg: result.msg };
  }

  // --- FULL BACKUP METHODS ---
  
  exportFullBackup(): void {
    const fullData = this.prepareFullData();
    const dataStr = JSON.stringify(fullData, null, 2);
    
    // Gunakan Blob untuk handling fail besar dengan lebih stabil
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const exportFileDefaultName = `RAK_SKEME_BACKUP_${new Date().toISOString().split('T')[0]}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.href = url;
    linkElement.download = exportFileDefaultName;
    document.body.appendChild(linkElement); // Penting untuk Firefox/Mobile
    linkElement.click();
    
    // Cleanup
    document.body.removeChild(linkElement);
    URL.revokeObjectURL(url);
  }

  async importFullBackup(file: File): Promise<boolean> {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const content = e.target?.result as string;
          const data = JSON.parse(content);
          
          if (data.students) this._allStudents = data.students;
          if (data.activities) this._activityRecords = data.activities;
          if (data.takwim) this._takwim = data.takwim;
          if (data.sports) this._sportsEvents = data.sports;
          if (data.houses) this._sportsHouses = data.houses;
          
          this._saveToStorage(false);
          resolve(true);
        } catch (err) {
          console.error("Import failed", err);
          resolve(false);
        }
      };
      reader.readAsText(file);
    });
  }

  // --- HELPERS ---

  private prepareFullData() {
    return {
        students: this._allStudents,
        activities: this._activityRecords,
        takwim: this._takwim,
        notif: this._notifications,
        metadata: {
            activities: this.suggestedActivities,
            external: this.suggestedExternalEvents,
            levels: this.suggestedLevels
        },
        sports: this._sportsEvents,
        houses: this._sportsHouses
    };
  }

  getUniqueClasses(): string[] {
    const classes = Array.from(new Set(this._allStudents.map(s => s.className)));
    return classes
      .filter(c => c && c.trim() !== '' && c !== "-")
      .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
  }

  extractClassName(input: string): string {
    if (!input) return 'TIADA';
    let str = input.toUpperCase().replace(/_/g, ' ').trim();
    const classRegex = /(TAHUN|TINGKATAN)?\s?(\d|SATU|DUA|TIGA|EMPAT|LIMA|ENAM)\s?([A-Z]+)?/i;
    const match = str.match(classRegex);
    if (match) {
      const prefix = match[1] ? match[1] + ' ' : '';
      const num = match[2];
      const suffix = match[3] ? ' ' + match[3] : '';
      const wordMap: { [key: string]: string } = { 'SATU': '1', 'DUA': '2', 'TIGA': '3', 'EMPAT': '4', 'LIMA': '5', 'ENAM': '6' };
      const finalNum = wordMap[num] || num;
      return `${prefix}${finalNum}${suffix}`.trim();
    }
    return this.normalizeClassName(input);
  }

  normalizeClassName(raw: string): string {
    if (!raw) return 'TIADA';
    let name = raw.toUpperCase().trim();
    name = name.replace(/SENARAI|MURID|NAMA|FAIL|DATA|KPM|DAT|UPLOAD/g, '').trim();
    const wordMap: { [key: string]: string } = { 'SATU': '1', 'DUA': '2', 'TIGA': '3', 'EMPAT': '4', 'LIMA': '5', 'ENAM': '6' };
    for (const [word, num] of Object.entries(wordMap)) {
      if (name.includes(word)) name = name.replace(word, num);
    }
    name = name.replace(/\s+/g, ' ').trim();
    return name || 'TIADA';
  }

  addStudent(s: Student): boolean {
    const normalizedClass = this.extractClassName(s.className);
    const exists = this._allStudents.some(
      x => (x.icNumber === s.icNumber && s.icNumber !== '') ||
           (x.name.toUpperCase() === s.name.toUpperCase() && x.className === normalizedClass)
    );
    if (!exists) {
      this._allStudents.push({ ...s, className: normalizedClass });
      this._allStudents.sort((a, b) => a.className.localeCompare(b.className) || a.name.localeCompare(b.name));
      this._saveToStorage();
      return true;
    }
    return false;
  }

  bulkAddStudents(students: Student[]): number {
    let addedCount = 0;
    const existingMap = new Set(this._allStudents.map(s => `${s.name.toUpperCase()}|${s.className}|${s.icNumber}`));
    students.forEach(s => {
      const normalizedClass = this.extractClassName(s.className);
      const key = `${s.name.toUpperCase()}|${normalizedClass}|${s.icNumber}`;
      if (!s.name || existingMap.has(key)) return;
      this._allStudents.push({ ...s, className: normalizedClass });
      existingMap.add(key);
      addedCount++;
    });
    if (addedCount > 0) {
        this._allStudents.sort((a, b) => a.className.localeCompare(b.className) || a.name.localeCompare(b.name));
        this._saveToStorage();
    }
    return addedCount;
  }

  deleteStudent(id: string): void {
    this._allStudents = this._allStudents.filter(s => s.id !== id);
    this._saveToStorage();
  }

  getStudentsByHouse(houseName: string): Student[] {
    return this._allStudents.filter(s => s.house.toUpperCase() === houseName.toUpperCase());
  }

  bulkUpdateStudentHouse(studentIds: string[], houseName: string): void {
    let changed = false;
    this._allStudents = this._allStudents.map(s => {
      if (studentIds.includes(s.id)) {
        changed = true;
        return { ...s, house: houseName.toUpperCase() };
      }
      return s;
    });
    if (changed) this._saveToStorage();
  }

  async parseFile(file: File): Promise<Student[]> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      const fileNameClassContext = this.extractClassName(file.name.split('.')[0]);
      reader.onload = (e) => {
        try {
          const data = e.target?.result;
          const workbook = XLSX.read(data, { type: 'binary' });
          const sheet = workbook.Sheets[workbook.SheetNames[0]];
          const json: any[] = XLSX.utils.sheet_to_json(sheet, { header: 1 });
          let headerIdx = -1;
          for (let i = 0; i < Math.min(json.length, 25); i++) {
            if (json[i] && json[i].some((cell: any) => {
              const str = String(cell || '').toUpperCase();
              return str.includes('NAMA') || str.includes('NAME');
            })) { headerIdx = i; break; }
          }
          if (headerIdx === -1) throw new Error("Gagal mengesan lajur NAMA.");
          const headers = json[headerIdx].map((h: any) => String(h || '').toUpperCase().trim());
          const nameCol = headers.findIndex((h: string) => h.includes('NAMA') || h === 'NAME');
          const icCol = headers.findIndex((h: string) => h.includes('IC') || h.includes('KP') || h.includes('MYKAD') || h.includes('IDENTITI'));
          const classCol = headers.findIndex((h: string) => h.includes('KELAS') || h.includes('TINGKATAN') || h.includes('TAHUN') || h.includes('CLASS'));
          const houseCol = headers.findIndex((h: string) => h.includes('RUMAH') || h.includes('SUKAN') || h.includes('HOUSE'));
          const students: Student[] = [];
          for (let i = headerIdx + 1; i < json.length; i++) {
            const row = json[i];
            if (!row || !row[nameCol]) continue;
            let rawClass = (classCol !== -1 && row[classCol]) ? String(row[classCol]).trim() : '';
            let finalClass = rawClass ? this.extractClassName(rawClass) : (fileNameClassContext || 'TIADA');
            let icNumber = (icCol !== -1 && row[icCol]) ? String(row[icCol]).replace(/[^0-9]/g, '') : '';
            let house = (houseCol !== -1 && row[houseCol]) ? String(row[houseCol]).toUpperCase().trim() : '-';
            
            students.push({ 
                id: Math.random().toString(36).substr(2, 9), 
                name: String(row[nameCol]).toUpperCase().trim(), 
                icNumber: icNumber, 
                className: finalClass, 
                gender: '-', 
                house: house 
            });
          }
          resolve(students);
        } catch (err) { reject(err); }
      };
      reader.readAsBinaryString(file);
    });
  }

  saveTakwim(event: TakwimEvent) {
    const idx = this._takwim.findIndex(e => e.id === event.id);
    if (idx > -1) this._takwim[idx] = event;
    else this._takwim.push(event);
    this._saveToStorage();
  }

  deleteTakwim(id: string) {
    this._takwim = this._takwim.filter(e => e.id !== id);
    this._saveToStorage();
  }

  learnNewMetadata(program: string, level: string | null): void {
    let changed = false;
    const cleanProgram = program.toUpperCase().trim();
    if (cleanProgram && !this.suggestedActivities.includes(cleanProgram) && !this.suggestedExternalEvents.includes(cleanProgram)) {
      this.suggestedActivities.push(cleanProgram);
      changed = true;
    }
    if (level && !this.suggestedLevels.includes(level)) {
      this.suggestedLevels.push(level);
      changed = true;
    }
    if (changed) this._saveToStorage();
  }

  async saveActivityRecord(programName: string, participants: Partial<ActivityParticipant>[], customDate?: Date): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 800));
    const newRecord: ActivityRecordModel = {
      programName: programName.toUpperCase(),
      date: (customDate || new Date()).toISOString(),
      participants: participants.map(p => ({
        name: (p.name || '').toUpperCase(), 
        ic: p.ic || '', 
        class: this.extractClassName(p.class || '-'), 
        achievement: p.achievement || 'Penyertaan', 
        level: p.level || 'Sekolah'
      })),
      evidenceFiles: []
    };
    this._activityRecords.push(newRecord);
    this._saveToStorage();
  }

  private initializeHouses() {
      if (this._sportsHouses.length === 0) {
          this._sportsHouses = [
              { id: 'h1', name: 'MERAH', color: '#FF3D00', captainName: 'CIKGU AZMAN' },
              { id: 'h2', name: 'BIRU', color: '#00D1FF', captainName: 'CIKGU SITI' },
              { id: 'h3', name: 'KUNING', color: '#FFD700', captainName: 'CIKGU RAJU' },
              { id: 'h4', name: 'HIJAU', color: '#39FF14', captainName: 'CIKGU WONG' }
          ];
          this._saveToStorage();
      }
  }

  private initializeSports() {
    if (this._sportsEvents.length === 0) {
        const events: any[] = [];
        const trackItems = ['100M', '200M', '4x100M', '4x200M'];
        const classes = ['LELAKI A', 'LELAKI B', 'LELAKI C', 'PEREMPUAN A', 'PEREMPUAN B', 'PEREMPUAN C'];
        
        trackItems.forEach(item => {
            classes.forEach(cat => {
                events.push({ name: item, category: cat, type: 'TRACK' });
            });
        });
        
        this._sportsEvents = events.map(evt => ({
            id: Math.random().toString(36).substr(2, 9),
            name: evt.name, 
            category: evt.category, 
            status: 'PENDING',
            winners: { gold: null, silver: null, bronze: null, fourth: null }
        }));
    }
  }

  addNewSportEvent(name: string, category: string, type: string): void {
    const newEvent: SportEvent = {
      id: Math.random().toString(36).substr(2, 9),
      name: name.toUpperCase(),
      category: category.toUpperCase(),
      status: 'PENDING',
      winners: { gold: null, silver: null, bronze: null, fourth: null }
    };
    this._sportsEvents.push(newEvent);
    this._saveToStorage();
  }

  updateSportEvent(id: string, name: string, category: string): void {
    const idx = this._sportsEvents.findIndex(e => e.id === id);
    if (idx > -1) {
      this._sportsEvents[idx] = { ...this._sportsEvents[idx], name: name.toUpperCase(), category: category.toUpperCase() };
      this._saveToStorage();
    }
  }

  deleteSportEvent(id: string): void {
    this._sportsEvents = this._sportsEvents.filter(e => e.id !== id);
    this._saveToStorage();
  }

  addSportsHouse(name: string, color: string, captainName: string): void {
    const newHouse: SportsHouse = {
      id: Math.random().toString(36).substr(2, 9),
      name: name.toUpperCase(),
      color,
      captainName: captainName.toUpperCase()
    };
    this._sportsHouses.push(newHouse);
    this._saveToStorage();
  }

  updateSportsHouse(id: string, name: string, color: string, captainName: string): void {
    const idx = this._sportsHouses.findIndex(h => h.id === id);
    if (idx > -1) {
      this._sportsHouses[idx] = { ...this._sportsHouses[idx], name: name.toUpperCase(), color, captainName: captainName.toUpperCase() };
      this._saveToStorage();
    }
  }

  deleteSportsHouse(id: string): void {
    this._sportsHouses = this._sportsHouses.filter(h => h.id !== id);
    this._saveToStorage();
  }

  updateSportResult(eventId: string, winners: any) {
    const idx = this._sportsEvents.findIndex(e => e.id === eventId);
    if (idx > -1) {
        this._sportsEvents[idx].winners = winners;
        this._sportsEvents[idx].status = 'COMPLETED';
        this._saveToStorage();
    }
  }

  getHouseStats(): HouseStats[] {
      const houses: { [key: string]: HouseStats } = {};
      this._sportsHouses.forEach(h => {
          houses[h.name] = { id: h.id, name: h.name, color: h.color, captainName: h.captainName || 'TIADA KETUA', points: 0, medals: { gold: 0, silver: 0, bronze: 0 } };
      });
      this._sportsEvents.forEach(evt => {
          if (evt.status === 'COMPLETED') {
              const addPoints = (house: string, pts: number, medal?: 'gold'|'silver'|'bronze') => {
                  if (houses[house]) {
                      houses[house].points += pts;
                      if (medal) houses[house].medals[medal]++;
                  }
              };
              if (evt.winners.gold) addPoints(evt.winners.gold.house, 10, 'gold');
              if (evt.winners.silver) addPoints(evt.winners.silver.house, 7, 'silver');
              if (evt.winners.bronze) addPoints(evt.winners.bronze.house, 5, 'bronze');
              if (evt.winners.fourth) addPoints(evt.winners.fourth.house, 3);
          }
      });
      return Object.values(houses).sort((a, b) => b.points - a.points);
  }

  getAthleteStats(): AthleteStats[] {
      const athletes: { [key: string]: AthleteStats } = {};
      this._sportsEvents.forEach(evt => {
          if (evt.status === 'COMPLETED') {
               const processWinner = (winner: any, pts: number, type: 'gold' | 'silver' | 'bronze' | 'fourth') => {
                   if (winner && winner.studentId) {
                       if (!athletes[winner.studentId]) {
                           athletes[winner.studentId] = { studentId: winner.studentId, name: winner.name, house: winner.house, points: 0, medals: { gold: 0, silver: 0, bronze: 0, fourth: 0 } };
                       }
                       athletes[winner.studentId].points += pts;
                       athletes[winner.studentId].medals[type]++;
                   }
               };
               processWinner(evt.winners.gold, 10, 'gold');
               processWinner(evt.winners.silver, 7, 'silver');
               processWinner(evt.winners.bronze, 5, 'bronze');
               processWinner(evt.winners.fourth, 3, 'fourth');
          }
      });
      return Object.values(athletes).sort((a, b) => b.points - a.points);
  }

  async importFromCloud(): Promise<boolean> {
      const data = await googleDriveService.downloadData();
      if (data) {
          this._allStudents = data.students || [];
          this._activityRecords = data.activities || [];
          this._takwim = data.takwim || [];
          this._sportsEvents = data.sports || [];
          this._sportsHouses = data.houses || [];
          this._saveToStorage(false);
          return true;
      }
      return false;
  }

  private _saveToStorage(syncToCloud: boolean = true): void {
    const fullData = this.prepareFullData();
    localStorage.setItem('rak_skeme_students', JSON.stringify(this._allStudents));
    localStorage.setItem('rak_skeme_activities', JSON.stringify(this._activityRecords));
    localStorage.setItem('rak_skeme_takwim', JSON.stringify(this._takwim));
    localStorage.setItem('rak_skeme_metadata', JSON.stringify(fullData.metadata));
    localStorage.setItem('rak_skeme_sports', JSON.stringify(this._sportsEvents));
    localStorage.setItem('rak_skeme_sports_houses', JSON.stringify(this._sportsHouses));

    if (this.isCloudEnabled && syncToCloud && googleDriveService.status.isSignedIn) {
        googleDriveService.uploadData(fullData);
    }
  }

  private loadDatabase(): void {
    const s = localStorage.getItem('rak_skeme_students');
    const a = localStorage.getItem('rak_skeme_activities');
    const t = localStorage.getItem('rak_skeme_takwim');
    const m = localStorage.getItem('rak_skeme_metadata');
    const sp = localStorage.getItem('rak_skeme_sports');
    const sh = localStorage.getItem('rak_skeme_sports_houses');
    
    if (s) this._allStudents = JSON.parse(s);
    if (a) this._activityRecords = JSON.parse(a);
    if (t) this._takwim = JSON.parse(t);
    if (m) {
      const meta = JSON.parse(m);
      this.suggestedActivities = meta.activities || this.suggestedActivities;
      this.suggestedExternalEvents = meta.external || this.suggestedExternalEvents;
      this.suggestedLevels = meta.levels || this.suggestedLevels;
    }
    if (sp) this._sportsEvents = JSON.parse(sp);
    if (sh) this._sportsHouses = JSON.parse(sh);
  }
}

export const studentDataService = new StudentDataService();
