export interface Student {
  id: string;
  name: string;
  icNumber: string;
  className: string;
  house: string;
  gender: string;
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
}

export interface TakwimEvent {
  id: string;
  title: string;
  date: string;
  category: string;
}

export interface ReportGeneratorScreenProps {
  onBack: () => void;
  isDarkMode?: boolean; 
}