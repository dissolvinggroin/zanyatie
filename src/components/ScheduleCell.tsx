import { useDroppable } from '@dnd-kit/core';
import type { DayOfWeek } from '../types';

interface Props {
  day: DayOfWeek;
  time: string;
  children?: React.ReactNode;
}

export function ScheduleCell({ day, time, children }: Props) {
  const { setNodeRef, isOver } = useDroppable({
    id: `cell:${day}:${time}`,
    data: { type: 'cell', day, time },
  });

  return (
    <div
      ref={setNodeRef}
      className={`relative min-h-[28px] border-b border-slate-100 transition-colors ${
        isOver ? 'bg-indigo-50 ring-1 ring-inset ring-indigo-300' : 'hover:bg-slate-50'
      }`}
    >
      {children}
    </div>
  );
}
