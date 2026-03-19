import { useCallback } from 'react';
import type { Activity, ScheduledActivity, DayOfWeek } from '../types';
import { DEFAULT_ACTIVITIES } from '../constants';
import { generateId, findConflicts, addMinutesToTime } from '../utils';
import { useLocalStorage } from './useLocalStorage';

export function useSchedule() {
  const [activities, setActivities] = useLocalStorage<Activity[]>('sched:activities', DEFAULT_ACTIVITIES);
  const [scheduled, setScheduled]   = useLocalStorage<ScheduledActivity[]>('sched:scheduled', []);

  /* ── Activities ─────────────────────────────────────── */
  const addActivity = useCallback((act: Omit<Activity, 'id'>) => {
    setActivities(prev => [...prev, { ...act, id: generateId() }]);
  }, [setActivities]);

  const updateActivity = useCallback((id: string, patch: Partial<Activity>) => {
    setActivities(prev => prev.map(a => a.id === id ? { ...a, ...patch } : a));
  }, [setActivities]);

  const deleteActivity = useCallback((id: string) => {
    setActivities(prev => prev.filter(a => a.id !== id));
    setScheduled(prev => prev.filter(s => s.activityId !== id));
  }, [setActivities, setScheduled]);

  /* ── Scheduled ──────────────────────────────────────── */
  const scheduleActivity = useCallback((
    activityId: string,
    day: DayOfWeek,
    startTime: string,
    note?: string,
    excludeId?: string
  ): { success: boolean; conflicts: ScheduledActivity[] } => {
    const activity = activities.find(a => a.id === activityId);
    if (!activity) return { success: false, conflicts: [] };

    const endTime = addMinutesToTime(startTime, activity.duration);
    const candidate: ScheduledActivity = {
      id: excludeId ?? generateId(),
      activityId,
      day,
      startTime,
      endTime,
      note,
    };

    const conflicts = findConflicts(scheduled, candidate, excludeId);
    if (conflicts.length > 0) return { success: false, conflicts };

    if (excludeId) {
      setScheduled(prev => prev.map(s => s.id === excludeId ? candidate : s));
    } else {
      setScheduled(prev => [...prev, candidate]);
    }
    return { success: true, conflicts: [] };
  }, [activities, scheduled, setScheduled]);

  const removeScheduled = useCallback((id: string) => {
    setScheduled(prev => prev.filter(s => s.id !== id));
  }, [setScheduled]);

  const moveScheduled = useCallback((
    id: string,
    day: DayOfWeek,
    startTime: string
  ): { success: boolean; conflicts: ScheduledActivity[] } => {
    const item = scheduled.find(s => s.id === id);
    if (!item) return { success: false, conflicts: [] };
    return scheduleActivity(item.activityId, day, startTime, item.note, id);
  }, [scheduled, scheduleActivity]);

  const updateNote = useCallback((id: string, note: string) => {
    setScheduled(prev => prev.map(s => s.id === id ? { ...s, note } : s));
  }, [setScheduled]);

  return {
    activities,
    scheduled,
    addActivity,
    updateActivity,
    deleteActivity,
    scheduleActivity,
    removeScheduled,
    moveScheduled,
    updateNote,
  };
}
