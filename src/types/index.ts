export type Chronotype = 'bear' | 'lion' | 'wolf' | 'dolphin';

export interface ChronotypeInfo {
  type: Chronotype;
  nameKo: string;
  subtitle: string;
  symbol: string;
  percentage: string;
  naturalWake: string;
  naturalSleep: string;
  peakEnergy: string;
  description: string;
  advice: string;
}

export interface UserProfile {
  name: string;
  chronotype: Chronotype;
  wakeTime: string; // "HH:mm" e.g., "07:00"
  sleepTime: string; // "HH:mm" e.g., "23:30"
  workStart: string; // e.g., "09:00"
  workEnd: string; // e.g., "18:00"
  primaryGoal: string;
  waterTargetMl: number;
  streakDays: number;
}

export interface CircadianPhase {
  id: string;
  title: string;
  timeRange: string;
  startMinutes: number; // 0 - 1439
  endMinutes: number; // 0 - 1439
  tag: string;
  iconName: string;
  accentColor: string;
  badgeBg: string;
  borderColor: string;
  biomarker: string; // biological mechanism
  summary: string;
  actionItems: string[];
  recommendedAction: string;
  caution?: string;
  hormoneFocus: string;
}

export interface HabitItem {
  id: string;
  title: string;
  category: 'morning' | 'day' | 'evening' | 'night';
  description: string;
  iconName: string;
  points: number;
}

export interface CaffeineLog {
  id: string;
  time: string; // "HH:mm"
  drinkName: string;
  caffeineMg: number;
}

export interface DailyLogState {
  date: string; // YYYY-MM-DD
  completedHabits: Record<string, boolean>;
  waterDrunkMl: number;
  caffeineLogs: CaffeineLog[];
  energyLevel?: number; // 1 to 5
}
