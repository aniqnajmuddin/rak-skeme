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
  programName: string;
  date: string;
  participants: ActivityParticipant[];
  evidenceFiles: string[];
}

export interface TakwimEvent {
  id: string;
  title: string;
  date: string;
  description: string;
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

// NEW TYPES FOR SPORTS MODULE
export interface SportsHouse {
  id: string;
  name: string; // e.g., "MERAH" or "JEBAT"
  color: string; // e.g., "#FF0000"
  captainName?: string; // e.g. "Cikgu Ahmad"
  motto?: string;
}

export interface SportEvent {
  id: string;
  name: string; // e.g., "Lari 100m (L)", "Lontar Peluru (P)"
  category: string; // e.g., "TRACK", "FIELD", "SUKANEKA"
  status: 'PENDING' | 'COMPLETED';
  winners: {
    gold: { studentId: string; name: string; house: string } | null;
    silver: { studentId: string; name: string; house: string } | null;
    bronze: { studentId: string; name: string; house: string } | null;
    fourth: { studentId: string; name: string; house: string } | null;
  };
}

export interface HouseStats {
  id: string;
  name: string;
  color: string;
  captainName?: string;
  points: number;
  medals: { gold: number; silver: number; bronze: number };
}