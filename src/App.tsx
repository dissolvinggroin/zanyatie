import { useState, useCallback } from 'react';
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  closestCenter,
} from '@dnd-kit/core';
import { CalendarDays, BarChart3, ChevronDown, ChevronUp } from 'lucide-react';
import type { Activity, DayOfWeek, ScheduledActivity } from './types';
import { useSchedule } from './hooks/useSchedule';
import { ActivityLibrary } from './components/ActivityLibrary';
import { WeekGrid } from './components/WeekGrid';
import { StatsPanel } from './components/StatsPanel';
import { ActivityModal } from './components/ActivityModal';
import { ScheduleModal } from './components/ScheduleModal';
import { timeToMinutes, addMinutesToTime } from './utils';

interface DragState {
  type: 'library' | 'scheduled';
  activityId?: string;
  scheduledId?: string;
}

export default function App() {
  const schedule = useSchedule();

  const [dragState, setDragState] = useState<DragState | null>(null);
  const [showStats, setShowStats] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Modals
  const [activityModal, setActivityModal] = useState<{ open: boolean; edit?: Activity | null }>({ open: false });
  const [scheduleModal, setScheduleModal] = useState<{
    open: boolean;
    activity?: Activity;
    day?: DayOfWeek;
    time?: string;
    editItem?: ScheduledActivity | null;
  }>({ open: false });

  const [conflictToast, setConflictToast] = useState<string | null>(null);

  const showConflict = (msg: string) => {
    setConflictToast(msg);
    setTimeout(() => setConflictToast(null), 3000);
  };

  // DnD sensors
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor,   { activationConstraint: { delay: 200, tolerance: 6 } })
  );

  const handleDragStart = useCallback((event: DragStartEvent) => {
    const data = event.active.data.current as { type: string; activityId?: string; scheduledId?: string };
    if (data.type === 'library') {
      setDragState({ type: 'library', activityId: data.activityId });
    } else if (data.type === 'scheduled') {
      setDragState({ type: 'scheduled', scheduledId: data.scheduledId });
    }
  }, []);

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    setDragState(null);
    const { active, over } = event;
    if (!over) return;

    const activeData = active.data.current as { type: string; activityId?: string; scheduledId?: string };
    const overData   = over.data.current   as { type: string; day?: DayOfWeek; time?: string } | undefined;

    // Calculate drop time from pointer position if dropping on day column
    const overId = String(over.id);

    // Drop on day column (broad drop zone)
    if (overId.startsWith('day:')) {
      const day = overId.replace('day:', '') as DayOfWeek;

      if (activeData.type === 'library' && activeData.activityId) {
        const act = schedule.activities.find(a => a.id === activeData.activityId);
        if (act) {
          setScheduleModal({ open: true, activity: act, day, time: '09:00' });
        }
      } else if (activeData.type === 'scheduled' && activeData.scheduledId) {
        const item = schedule.scheduled.find(s => s.id === activeData.scheduledId);
        if (item) {
          const result = schedule.moveScheduled(item.id, day, item.startTime);
          if (!result.success) showConflict('Конфликт времени! Занятие пересекается с другим.');
        }
      }
      return;
    }

    // Drop on cell
    if (overId.startsWith('cell:')) {
      const [, day, time] = overId.split(':');

      if (activeData.type === 'library' && activeData.activityId) {
        const act = schedule.activities.find(a => a.id === activeData.activityId);
        if (act) {
          const endTime = addMinutesToTime(time, act.duration);
          const endMin = timeToMinutes(endTime);
          // Check if end time goes beyond 23:59
          if (endMin > 23 * 60 + 59) {
            showConflict('Занятие выходит за пределы дня. Выберите более раннее время.');
            return;
          }
          const result = schedule.scheduleActivity(activeData.activityId, day as DayOfWeek, time);
          if (!result.success) {
            showConflict('Конфликт времени! Занятие пересекается с другим.');
          }
        }
      } else if (activeData.type === 'scheduled' && activeData.scheduledId) {
        const result = schedule.moveScheduled(activeData.scheduledId, day as DayOfWeek, time);
        if (!result.success) showConflict('Конфликт времени! Перемещение невозможно.');
      }
      return;
    }

    // overData-based handling
    if (overData?.type === 'cell' && overData.day && overData.time) {
      if (activeData.type === 'library' && activeData.activityId) {
        const act = schedule.activities.find(a => a.id === activeData.activityId);
        if (act) {
          const result = schedule.scheduleActivity(activeData.activityId, overData.day, overData.time);
          if (!result.success) showConflict('Конфликт времени! Занятие пересекается с другим.');
        }
      } else if (activeData.type === 'scheduled' && activeData.scheduledId) {
        const result = schedule.moveScheduled(activeData.scheduledId, overData.day, overData.time);
        if (!result.success) showConflict('Конфликт времени! Перемещение невозможно.');
      }
    }
  }, [schedule]);

  // Open schedule modal when clicking "+" on a card
  const handleAddToSchedule = useCallback((activity: Activity) => {
    setScheduleModal({ open: true, activity, day: 'monday', time: '09:00' });
  }, []);

  // Edit a scheduled item
  const handleEditScheduled = useCallback((item: ScheduledActivity) => {
    const act = schedule.activities.find(a => a.id === item.activityId);
    if (act) {
      setScheduleModal({ open: true, activity: act, editItem: item });
    }
  }, [schedule.activities]);

  const handleScheduleSave = useCallback((day: DayOfWeek, startTime: string, note?: string) => {
    if (!scheduleModal.activity) return { success: false, conflicts: [] };
    const result = schedule.scheduleActivity(
      scheduleModal.activity.id,
      day,
      startTime,
      note,
      scheduleModal.editItem?.id
    );
    return result;
  }, [scheduleModal, schedule]);

  // Dragged item overlay
  const dragActivity = dragState?.type === 'library'
    ? schedule.activities.find(a => a.id === dragState.activityId)
    : dragState?.type === 'scheduled'
      ? schedule.activities.find(a => a.id === schedule.scheduled.find(s => s.id === dragState.scheduledId)?.activityId)
      : null;

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="h-screen flex flex-col bg-slate-100 overflow-hidden">
        {/* Top bar */}
        <header className="shrink-0 bg-gradient-to-r from-indigo-700 to-violet-700 text-white px-4 py-3 flex items-center justify-between shadow-lg">
          <div className="flex items-center gap-2.5">
            <CalendarDays size={22} className="text-indigo-200" />
            <div>
              <h1 className="font-extrabold text-lg leading-tight">Конструктор расписания</h1>
              <p className="text-indigo-200 text-xs">Планируй неделю эффективно</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setSidebarOpen(v => !v)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-white/10 hover:bg-white/20 rounded-lg text-xs font-semibold transition-colors"
            >
              📋 {sidebarOpen ? 'Скрыть' : 'Занятия'}
            </button>
            <button
              onClick={() => setShowStats(v => !v)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-white/10 hover:bg-white/20 rounded-lg text-xs font-semibold transition-colors"
            >
              <BarChart3 size={14} />
              {showStats ? 'Скрыть статистику' : 'Статистика'}
              {showStats ? <ChevronDown size={12} /> : <ChevronUp size={12} />}
            </button>
          </div>
        </header>

        {/* Conflict toast */}
        {conflictToast && (
          <div className="shrink-0 mx-4 mt-2 px-4 py-2 bg-rose-100 border border-rose-300 text-rose-700 rounded-xl text-sm font-medium flex items-center gap-2 shadow-sm animate-pulse">
            ⚠️ {conflictToast}
          </div>
        )}

        {/* Main area */}
        <div className="flex-1 flex overflow-hidden min-h-0">
          {/* Sidebar - Activity Library */}
          {sidebarOpen && (
            <div className="w-72 shrink-0 flex flex-col min-h-0 shadow-md">
              <div className="flex-1 min-h-0 overflow-hidden">
                <ActivityLibrary
                  activities={schedule.activities}
                  onAddToSchedule={handleAddToSchedule}
                  onCreateActivity={() => setActivityModal({ open: true, edit: null })}
                  onEditActivity={(act) => setActivityModal({ open: true, edit: act })}
                  onDeleteActivity={schedule.deleteActivity}
                />
              </div>
            </div>
          )}

          {/* Week grid + stats */}
          <div className="flex-1 flex flex-col min-h-0 min-w-0">
            <div className="flex-1 min-h-0 overflow-hidden">
              <WeekGrid
                scheduled={schedule.scheduled}
                activities={schedule.activities}
                onRemove={schedule.removeScheduled}
                onEdit={handleEditScheduled}
              />
            </div>

            {/* Stats panel */}
            {showStats && (
              <div className="shrink-0 max-h-64 overflow-y-auto border-t border-slate-200 shadow-inner">
                <StatsPanel
                  scheduled={schedule.scheduled}
                  activities={schedule.activities}
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Drag overlay */}
      <DragOverlay>
        {dragActivity && (
          <div className="bg-white border-2 border-indigo-400 rounded-xl px-3 py-2 shadow-2xl flex items-center gap-2 opacity-90 rotate-2 scale-105">
            <span className="text-xl">{dragActivity.icon}</span>
            <div>
              <p className="text-sm font-bold text-slate-800">{dragActivity.title}</p>
              <p className="text-xs text-slate-500">{dragActivity.duration} мин</p>
            </div>
          </div>
        )}
      </DragOverlay>

      {/* Activity modal */}
      {activityModal.open && (
        <ActivityModal
          initial={activityModal.edit}
          onSave={act => {
            if (activityModal.edit) {
              schedule.updateActivity(act.id, act);
            } else {
              schedule.addActivity(act);
            }
          }}
          onClose={() => setActivityModal({ open: false })}
        />
      )}

      {/* Schedule modal */}
      {scheduleModal.open && scheduleModal.activity && (
        <ScheduleModal
          activity={scheduleModal.activity}
          scheduled={schedule.scheduled}
          initialDay={scheduleModal.day}
          initialTime={scheduleModal.time}
          editItem={scheduleModal.editItem}
          onSave={handleScheduleSave}
          onClose={() => setScheduleModal({ open: false })}
        />
      )}
    </DndContext>
  );
}
