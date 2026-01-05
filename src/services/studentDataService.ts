import { Student, ActivityRecordModel, TakwimEvent } from '../types';

class StudentDataService {
  private _allStudents: Student[] = [];
  private _activityRecords: ActivityRecordModel[] = [];
  private _takwim: TakwimEvent[] = [];
  private _suggestedActivities: string[] = ['MERENTAS DESA', 'KEJOHANAN MSSD', 'PERKHEMAHAN PERDANA', 'LATIHAN RUMAH SUKAN'];
  private _categories: string[] = ['UNIT BERUNIFORM', 'KELAB & PERSATUAN', 'SUKAN & PERMAINAN'];
  private _levels: string[] = ['SEKOLAH', 'ZON', 'DAERAH', 'NEGERI', 'KEBANGSAAN'];

  constructor() {
    this.loadDatabase();
  }

  // --- GETTERS ---
  getAllStudents() { return this._allStudents; }
  get activityRecords() { return this._activityRecords; }
  get takwim() { return this._takwim; }
  get suggestions() { return this._suggestedActivities; }
  get categories() { return this._categories; }
  get levels() { return this._levels; }

  // --- FUNGSI SIMPAN REKOD AKTIVITI (YANG HILANG TADI) ---
  addActivityRecord(record: any) {
    const newRecord: ActivityRecordModel = {
      ...record,
      id: Math.random().toString(36).substring(2, 11),
      timestamp: new Date().toISOString()
    };
    this._activityRecords.push(newRecord);
    this._saveToStorage();
  }

  // --- TAKWIM LOGIC ---
  saveTakwim(event: TakwimEvent) {
    const index = this._takwim.findIndex(e => e.id === event.id);
    if (index !== -1) {
      this._takwim[index] = event;
    } else {
      this._takwim.push(event);
    }
    this._saveToStorage();
  }

  deleteTakwim(id: string) {
    this._takwim = this._takwim.filter(e => e.id !== id);
    this._saveToStorage();
  }

  // --- DATA MANAGEMENT (JANGAN USIK DATA ASAL) ---
  bulkAddStudents(students: Student[]) {
    this._allStudents = students;
    this._saveToStorage();
  }

  private _saveToStorage() {
    const data = {
      students: this._allStudents,
      records: this._activityRecords,
      suggests: this._suggestedActivities,
      cats: this._categories,
      takwim: this._takwim
    };
    localStorage.setItem('RAK_MASTER_DB', JSON.stringify(data));
  }

  private loadDatabase() {
    const raw = localStorage.getItem('RAK_MASTER_DB');
    if (raw) {
      try {
        const p = JSON.parse(raw);
        this._allStudents = p.students || [];
        this._activityRecords = p.records || [];
        this._takwim = p.takwim || [];
        this._suggestedActivities = p.suggests || this._suggestedActivities;
        this._categories = p.cats || this._categories;
      } catch (e) {
        console.error("Gagal memuatkan pangkalan data:", e);
      }
    }
  }

  getUniqueClasses() { 
    return Array.from(new Set(this._allStudents.map(s => s.className))).filter(Boolean).sort(); 
  }
}

export const studentDataService = new StudentDataService();