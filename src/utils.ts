import type { ScheduledActivity, Stats, DayOfWeek, Category } from './types';
import { DAYS } from './constants';

export function timeToMinutes(time: string): number {
  const [h, m] = time.split(':').map(Number);
  return h * 60 + m;
}

export function minutesToTime(minutes: number): string {
  const h = Math.floor(minutes / 60) % 24;
  const m = minutes % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

export function addMinutesToTime(time: string, minutes: number): string {
  return minutesToTime(timeToMinutes(time) + minutes);
}

export function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes} мин`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m === 0 ? `${h} ч` : `${h} ч ${m} мин`;
}

export function hasTimeConflict(
  a: { startTime: string; endTime: string },
  b: { startTime: string; endTime: string }
): boolean {
  const aStart = timeToMinutes(a.startTime);
  const aEnd   = timeToMinutes(a.endTime);
  const bStart = timeToMinutes(b.startTime);
  const bEnd   = timeToMinutes(b.endTime);
  return aStart < bEnd && bStart < aEnd;
}

export function findConflicts(
  scheduled: ScheduledActivity[],
  candidate: ScheduledActivity,
  excludeId?: string
): ScheduledActivity[] {
  return scheduled.filter(s =>
    s.id !== excludeId &&
    s.id !== candidate.id &&
    s.day === candidate.day &&
    hasTimeConflict(s, candidate)
  );
}

export function computeStats(scheduled: ScheduledActivity[]): Stats {
  const byDay = {} as Record<DayOfWeek, number>;
  const byCategory = {} as Record<Category, number>;

  DAYS.forEach(d => (byDay[d.key] = 0));

  let totalMinutes = 0;

  scheduled.forEach(s => {
    const start = timeToMinutes(s.startTime);
    const end   = timeToMinutes(s.endTime);
    const dur   = end - start;
    totalMinutes += dur;
    byDay[s.day] = (byDay[s.day] || 0) + dur;
  });

  return {
    totalScheduled: scheduled.length,
    totalMinutes,
    byDay,
    byCategory,
  };
}

export function generateId(): string {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

export function getCategoryInfo(category: string) {
  const map: Record<string, { label: string; color: string; bg: string; border: string }> = {
    sport:  { label: 'Спорт',    color: 'text-emerald-700', bg: 'bg-emerald-50',  border: 'border-emerald-300' },
    study:  { label: 'Учёба',    color: 'text-blue-700',    bg: 'bg-blue-50',     border: 'border-blue-300'    },
    work:   { label: 'Работа',   color: 'text-violet-700',  bg: 'bg-violet-50',   border: 'border-violet-300'  },
    health: { label: 'Здоровье', color: 'text-rose-700',    bg: 'bg-rose-50',     border: 'border-rose-300'    },
    hobby:  { label: 'Хобби',    color: 'text-amber-700',   bg: 'bg-amber-50',    border: 'border-amber-300'   },
    social: { label: 'Общение',  color: 'text-sky-700',     bg: 'bg-sky-50',      border: 'border-sky-300'     },
    other:  { label: 'Другое',   color: 'text-slate-700',   bg: 'bg-slate-50',    border: 'border-slate-300'   },
  };
  return map[category] ?? map.other;
}

export function getDayLoad(minutes: number): { label: string; color: string; width: number } {
  if (minutes === 0)     return { label: 'Свободен',  color: 'bg-slate-200',   width: 0 };
  if (minutes <= 60)     return { label: 'Лёгкий',    color: 'bg-emerald-400', width: Math.min((minutes / 480) * 100, 100) };
  if (minutes <= 180)    return { label: 'Умеренный', color: 'bg-amber-400',   width: Math.min((minutes / 480) * 100, 100) };
  if (minutes <= 360)    return { label: 'Насыщенный',color: 'bg-orange-500',  width: Math.min((minutes / 480) * 100, 100) };
  return                        { label: 'Плотный',   color: 'bg-rose-500',    width: Math.min((minutes / 480) * 100, 100) };
}
