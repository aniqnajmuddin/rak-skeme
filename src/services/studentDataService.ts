import { Student, ActivityRecordModel, ActivityParticipant, TakwimEvent, AppNotification, SportEvent, HouseStats, SportsHouse } from '../types';
import * as XLSX from 'xlsx';

class StudentDataService {
  private _allStudents: Student[] = [];
  private _activityRecords: ActivityRecordModel[] = [];
  private _takwim: TakwimEvent[] = [];
  private _sportsEvents: SportEvent[] = [];
  private _sportsHouses: SportsHouse[] = []; 

  public suggestedActivities: string[] = ['Latihan Rumah Sukan', 'Merentas Desa', 'Gotong Royong', 'Sukan Tahunan'];
  public suggestedLevels: string[] = ['Sekolah', 'Zon', 'Daerah', 'Negeri', 'Kebangsaan'];

  constructor() {
    this.loadDatabase();
    this.initializeSports();
    this.initializeHouses();
  }

  // --- GETTERS ---
  getAllStudents() { return this._allStudents; }
  get activityRecords() { return this._activityRecords; }
  get takwim() { return this._takwim; }
  get sportsEvents() { return this._sportsEvents; }
  get sportsHouses() { return this._sportsHouses; }

  // --- STUDENT METHODS ---
  addStudent(s: Student) {
    this._allStudents.push(s);
    this._saveToStorage();
  }

  bulkAddStudents(students: Student[]): number {
    let count = 0;
    students.forEach(s => {
      const exists = this._allStudents.some(x => x.icNumber === s.icNumber && s.icNumber !== '');
      if (!exists) {
        this._allStudents.push(s);
        count++;
      }
    });
    this._saveToStorage();
    return count;
  }

  deleteStudent(id: string) {
    this._allStudents = this._allStudents.filter(s => s.id !== id);
    this._saveToStorage();
  }

  getUniqueClasses(): string[] {
    return Array.from(new Set(this._allStudents.map(s => s.className))).filter(Boolean).sort();
  }

  // --- ACTIVITY METHODS (LINK TO CERT) ---
  addActivityRecord(record: any) {
    const newRecord: ActivityRecordModel = {
      programName: record.title.toUpperCase(),
      date: record.date,
      participants: record.participants.map((p: any) => ({
        name: p.name.toUpperCase(),
        ic: p.icNumber || '',
        class: p.className,
        achievement: record.achievement || 'PENYERTAAN',
        level: record.level || 'SEKOLAH'
      })),
      evidenceFiles: []
    };
    this._activityRecords.push(newRecord);
    this._saveToStorage();
  }

  // --- TAKWIM METHODS ---
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

  // --- SPORTS METHODS ---
  private initializeHouses() {
    if (this._sportsHouses.length === 0) {
      this._sportsHouses = [
        { id: 'h1', name: 'MERAH', color: '#FF3D00', captainName: 'CIKGU AZMAN' },
        { id: 'h2', name: 'BIRU', color: '#00D1FF', captainName: 'CIKGU ANIQ' },
        { id: 'h3', name: 'KUNING', color: '#FFD700', captainName: 'CIKGU RAJU' },
        { id: 'h4', name: 'HIJAU', color: '#39FF14', captainName: 'CIKGU WONG' }
      ];
      this._saveToStorage();
    }
  }

  private initializeSports() {
    if (this._sportsEvents.length === 0) {
      this._sportsEvents = [
        { id: '1', name: '100M', category: 'LELAKI A', status: 'PENDING', winners: { gold: null, silver: null, bronze: null, fourth: null } },
        { id: '2', name: '200M', category: 'PEREMPUAN A', status: 'PENDING', winners: { gold: null, silver: null, bronze: null, fourth: null } }
      ];
      this._saveToStorage();
    }
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
      houses[h.name] = { id: h.id, name: h.name, color: h.color, captainName: h.captainName, points: 0, medals: { gold: 0, silver: 0, bronze: 0 } };
    });
    this._sportsEvents.forEach(evt => {
      if (evt.status === 'COMPLETED') {
        if (evt.winners.gold) { houses[evt.winners.gold.house].points += 10; houses[evt.winners.gold.house].medals.gold++; }
        if (evt.winners.silver) { houses[evt.winners.silver.house].points += 7; houses[evt.winners.silver.house].medals.silver++; }
        if (evt.winners.bronze) { houses[evt.winners.bronze.house].points += 5; houses[evt.winners.bronze.house].medals.bronze++; }
      }
    });
    return Object.values(houses).sort((a, b) => b.points - a.points);
  }

  // --- FILE PARSER (INTELIGENT) ---
  async parseFile(file: File): Promise<Student[]> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = e.target?.result;
          const workbook = XLSX.read(data, { type: 'binary' });
          const sheet = workbook.Sheets[workbook.SheetNames[0]];
          const json: any[] = XLSX.utils.sheet_to_json(sheet);
          const students: Student[] = json.map(row => ({
            id: Math.random().toString(36).substr(2, 9),
            name: (row.NAMA || row.Name || '').toUpperCase(),
            icNumber: String(row.IC || row.KP || ''),
            className: String(row.KELAS || row.Class || 'TIADA'),
            gender: '-',
            house: String(row.RUMAH || row.House || '-')
          }));
          resolve(students);
        } catch (err) { reject(err); }
      };
      reader.readAsBinaryString(file);
    });
  }

  // --- STORAGE ---
  private _saveToStorage(): void {
    localStorage.setItem('rak_skeme_students', JSON.stringify(this._allStudents));
    localStorage.setItem('rak_skeme_activities', JSON.stringify(this._activityRecords));
    localStorage.setItem('rak_skeme_takwim', JSON.stringify(this._takwim));
    localStorage.setItem('rak_skeme_sports', JSON.stringify(this._sportsEvents));
  }

  private loadDatabase(): void {
    const s = localStorage.getItem('rak_skeme_students');
    const a = localStorage.getItem('rak_skeme_activities');
    const t = localStorage.getItem('rak_skeme_takwim');
    const sp = localStorage.getItem('rak_skeme_sports');
    if (s) this._allStudents = JSON.parse(s);
    if (a) this._activityRecords = JSON.parse(a);
    if (t) this._takwim = JSON.parse(t);
    if (sp) this._sportsEvents = JSON.parse(sp);
  }
}

export const studentDataService = new StudentDataService();