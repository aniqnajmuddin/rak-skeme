export interface Student {
  id: string;
  name: string;
  icNumber: string;
  className: string;
  gender: string;
  house: string;
}

export interface ActivityParticipant {
  name: string;
  ic: string;
  class: string;
  achievement: string;
  level: string;
}

export interface ActivityRecordModel {
  id: string;
  programName: string;
  date: string;
  category: string;
  level: string;
  participants: ActivityParticipant[];
  evidenceFiles?: string[]; 
}

export interface TakwimEvent {
  id: string;
  title: string;
  date: string;
  description: string;
  level: string; // Wajib ada
  venue: string; // Wajib ada
}

// --- DATA RUMAH SUKAN ---
export interface SportsHouse {
  id: string;
  name: string; 
  color: string; 
  captainName?: string; 
  motto?: string;
  points: number; // Wajib ada untuk simpan markah
}

// --- DATA SENARAI ACARA (KPM/MSSM) ---
export interface SportListEvent {
  id: string;
  name: string;      // Cth: "LARI 100M"
  category: string;  // Cth: "BALAPAN"
  gender: 'L' | 'P' | 'CAMPURAN';
  ageClass: 'A' | 'B' | 'C' | 'OT'; // A=Thn 6, B=Thn 5, C=Thn 4
  fullname: string;  // Cth: "LARI 100M (L) KELAS A"
}

export interface AppNotification {
  id: string;
  message: string;
  type: 'INFO' | 'ALERT' | 'URGENT';
  active: boolean;
}

export interface User {
  id: string;
  username: string;
  name: string;
  role: string;
  email: string;
}