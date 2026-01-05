import { Student, ActivityRecordModel, TakwimEvent } from '../types';

class StudentDataService {
  private _allStudents: Student[] = [];
  private _activityRecords: ActivityRecordModel[] = [];
  private _takwim: TakwimEvent[] = [];
  private _classes: string[] = []; 
  
  private _suggestedActivities: string[] = ['MERENTAS DESA', 'KEJOHANAN MSSD', 'PERKHEMAHAN PERDANA', 'LATIHAN RUMAH SUKAN'];
  private _categories: string[] = ['UNIT BERUNIFORM', 'KELAB & PERSATUAN', 'SUKAN & PERMAINAN'];
  private _levels: string[] = ['SEKOLAH', 'ZON', 'DAERAH', 'NEGERI', 'KEBANGSAAN'];

  constructor() { this.loadDatabase(); }

  // GETTERS
  getAllStudents() { return this._allStudents; }
  get activityRecords() { return this._activityRecords; }
  get takwim() { return this._takwim; }
  get classes() { return this._classes; }
  get levels() { return this._levels; }
  get suggestions() { return this._suggestedActivities; }
  get categories() { return this._categories; }

  getUniqueClasses() {
    const fromMurid = Array.from(new Set(this._allStudents.map(s => s.className))).filter(Boolean);
    const combined = Array.from(new Set([...this._classes, ...fromMurid])).sort();
    return combined;
  }

  // ACTIONS
  deleteStudent(id: string) {
    this._allStudents = this._allStudents.filter(s => s.id !== id);
    this._saveToStorage();
  }

  bulkAddStudents(students: any[]) {
    this._allStudents = students;
    students.forEach(s => {
      const cName = s.className.toUpperCase().trim();
      if (cName && !this._classes.includes(cName)) this._classes.push(cName);
    });
    this._classes.sort();
    this._saveToStorage();
  }

  addClass(className: string) {
    const name = className.toUpperCase().trim();
    if (name && !this._classes.includes(name)) {
      this._classes.push(name);
      this._classes.sort();
      this._saveToStorage();
    }
  }

  updateClass(oldName: string, newName: string) {
    const nextName = newName.toUpperCase().trim();
    this._classes = this._classes.map(c => c === oldName ? nextName : c);
    this._allStudents = this._allStudents.map(s => s.className === oldName ? { ...s, className: nextName } : s);
    this._saveToStorage();
  }

  deleteClass(className: string) {
    this._classes = this._classes.filter(c => c !== className);
    this._saveToStorage();
  }

  addActivityRecord(record: any) {
    const newRecord: ActivityRecordModel = {
      ...record,
      id: Math.random().toString(36).substring(2, 11),
      timestamp: new Date().toISOString()
    };
    this._activityRecords.push(newRecord);
    this._saveToStorage();
  }

  saveTakwim(event: TakwimEvent) {
    const index = this._takwim.findIndex(e => e.id === event.id);
    if (index !== -1) this._takwim[index] = event;
    else this._takwim.push(event);
    this._saveToStorage();
  }

  deleteTakwim(id: string) {
    this._takwim = this._takwim.filter(e => e.id !== id);
    this._saveToStorage();
  }

  private _saveToStorage() {
    const data = {
      students: this._allStudents,
      records: this._activityRecords,
      classes: this._classes,
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
        this._classes = p.classes || [];
        this._takwim = p.takwim || [];
      } catch (e) { console.error(e); }
    }
  }
}
export const studentDataService = new StudentDataService();