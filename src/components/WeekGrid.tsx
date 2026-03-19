import { useMemo } from 'react';
import { useDroppable } from '@dnd-kit/core';
import type { Activity, DayOfWeek, ScheduledActivity } from '../types';
import { DAYS } from '../constants';
import { ScheduledBlock } from './ScheduledBlock';
import { hasTimeConflict } from '../utils';

const START_HOUR = 6;
const END_HOUR   = 23;
const PX_PER_MIN = 1.4; // pixels per minute
const START_MIN  = START_HOUR * 60;

function DayColumn({
  day,
  label,
  short,
  scheduledItems,
  activities,
  onRemove,
  onEdit,
}: {
  day: DayOfWeek;
  label: string;
  short: string;
  scheduledItems: ScheduledActivity[];
  activities: Activity[];
  onRemove: (id: string) => void;
  onEdit: (s: ScheduledActivity) => void;
}) {
  const { setNodeRef, isOver } = useDroppable({
    id: `day:${day}`,
    data: { type: 'day', day },
  });

  const totalHeight = (END_HOUR - START_HOUR) * 60 * PX_PER_MIN;

  const conflictIds = useMemo(() => {
    const ids = new Set<string>();
    for (let i = 0; i < scheduledItems.length; i++) {
      for (let j = i + 1; j < scheduledItems.length; j++) {
        if (hasTimeConflict(scheduledItems[i], scheduledItems[j])) {
          ids.add(scheduledItems[i].id);
          ids.add(scheduledItems[j].id);
        }
      }
    }
    return ids;
  }, [scheduledItems]);

  const isWeekend = day === 'saturday' || day === 'sunday';

  return (
    <div className="flex flex-col min-w-0">
      {/* Day header */}
      <div className={`sticky top-0 z-20 text-center py-2 border-b border-slate-200 text-xs font-bold ${
        isWeekend ? 'bg-violet-50 text-violet-700' : 'bg-white text-slate-700'
      }`}>
        <span className="hidden md:block">{label}</span>
        <span className="md:hidden">{short}</span>
        {scheduledItems.length > 0 && (
          <span className="ml-1 bg-indigo-500 text-white rounded-full px-1.5 text-[10px]">
            {scheduledItems.length}
          </span>
        )}
      </div>

      {/* Time grid */}
      <div
        ref={setNodeRef}
        className={`relative border-l border-slate-200 transition-colors ${isOver ? 'bg-indigo-50/40' : isWeekend ? 'bg-violet-50/30' : 'bg-white'}`}
        style={{ height: `${totalHeight}px` }}
      >
        {/* Hour lines */}
        {Array.from({ length: END_HOUR - START_HOUR + 1 }, (_, i) => (
          <div
            key={i}
            className="absolute left-0 right-0 border-t border-slate-100"
            style={{ top: `${i * 60 * PX_PER_MIN}px` }}
          />
        ))}
        {/* Half-hour lines */}
        {Array.from({ length: END_HOUR - START_HOUR }, (_, i) => (
          <div
            key={`h${i}`}
            className="absolute left-0 right-0 border-t border-dashed border-slate-100"
            style={{ top: `${(i + 0.5) * 60 * PX_PER_MIN}px` }}
          />
        ))}

        {/* Scheduled blocks */}
        {scheduledItems.map(s => {
          const act = activities.find(a => a.id === s.activityId);
          if (!act) return null;
          return (
            <ScheduledBlock
              key={s.id}
              scheduled={s}
              activity={act}
              onRemove={onRemove}
              onEdit={onEdit}
              isConflict={conflictIds.has(s.id)}
              pixelsPerMinute={PX_PER_MIN}
              startMinute={START_MIN}
            />
          );
        })}
      </div>
    </div>
  );
}

interface Props {
  scheduled: ScheduledActivity[];
  activities: Activity[];
  onRemove: (id: string) => void;
  onEdit: (s: ScheduledActivity) => void;
}

export function WeekGrid({ scheduled, activities, onRemove, onEdit }: Props) {
  const totalHeight = (END_HOUR - START_HOUR) * 60 * PX_PER_MIN;

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="flex flex-1 overflow-auto">
        {/* Time axis */}
        <div className="shrink-0 w-14 bg-slate-50 border-r border-slate-200 relative" style={{ marginTop: '37px' }}>
          <div className="relative" style={{ height: `${totalHeight}px` }}>
            {Array.from({ length: END_HOUR - START_HOUR + 1 }, (_, i) => {
              const hour = START_HOUR + i;
              return (
                <div
                  key={hour}
                  className="absolute right-2 text-xs text-slate-400 font-mono"
                  style={{ top: `${i * 60 * PX_PER_MIN - 7}px` }}
                >
                  {String(hour).padStart(2, '0')}:00
                </div>
              );
            })}
          </div>
        </div>

        {/* Day columns */}
        <div className="flex-1 grid min-w-0" style={{ gridTemplateColumns: `repeat(${DAYS.length}, minmax(0, 1fr))` }}>
          {DAYS.map(({ key, label, short }) => (
            <DayColumn
              key={key}
              day={key}
              label={label}
              short={short}
              scheduledItems={scheduled.filter(s => s.day === key)}
              activities={activities}
              onRemove={onRemove}
              onEdit={onEdit}
            />
          ))}
        </div>
      </div>

      {/* Drop hint at bottom */}
      <div className="shrink-0 py-1.5 text-center text-xs text-slate-400 bg-slate-50 border-t border-slate-200">
        Перетащите занятие из библиотеки или нажмите <kbd className="px-1 py-0 bg-white border border-slate-200 rounded text-[10px]">+</kbd> для добавления
      </div>
    </div>
  );
}


