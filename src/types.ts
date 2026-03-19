export type Category =
  | 'sport'
  | 'study'
  | 'work'
  | 'health'
  | 'hobby'
  | 'social'
  | 'other';

export type DayOfWeek =
  | 'monday'
  | 'tuesday'
  | 'wednesday'
  | 'thursday'
  | 'friday'
  | 'saturday'
  | 'sunday';

export interface Activity {
  id: string;
  title: string;
  category: Category;
  duration: number; // minutes
  description?: string;
  color: string;
  icon: string;
}

export interface ScheduledActivity {
  id: string;
  activityId: string;
  day: DayOfWeek;
  startTime: string; // "HH:MM"
  endTime: string;   // "HH:MM"
  note?: string;
}

export interface FilterState {
  search: string;
  categories: Category[];
  minDuration: number;
  maxDuration: number;
}

export interface Stats {
  totalScheduled: number;
  totalMinutes: number;
  byDay: Record<DayOfWeek, number>;
  byCategory: Record<Category, number>;
}
