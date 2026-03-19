import type { CSSProperties } from 'react';
import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { X, GripVertical, Clock, AlertTriangle } from 'lucide-react';
import type { Activity, ScheduledActivity } from '../types';
import { formatDuration, getCategoryInfo } from '../utils';

interface Props {
  scheduled: ScheduledActivity;
  activity: Activity;
  onRemove: (id: string) => void;
  onEdit: (scheduled: ScheduledActivity) => void;
  isConflict?: boolean;
  pixelsPerMinute: number;
  startMinute: number;
}

export function ScheduledBlock({ scheduled, activity, onRemove, onEdit, isConflict, pixelsPerMinute, startMinute }: Props) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: `scheduled:${scheduled.id}`,
    data: { type: 'scheduled', scheduledId: scheduled.id },
  });

  const [sh, sm] = scheduled.startTime.split(':').map(Number);
  const [eh, em] = scheduled.endTime.split(':').map(Number);
  const startMin = sh * 60 + sm;
  const endMin   = eh * 60 + em;
  const duration = endMin - startMin;

  const top    = (startMin - startMinute) * pixelsPerMinute;
  const height = Math.max(duration * pixelsPerMinute, 24);

  const style: CSSProperties = {
    transform: CSS.Translate.toString(transform),
    top: `${top}px`,
    height: `${height}px`,
    opacity: isDragging ? 0.35 : 1,
    zIndex: isDragging ? 100 : 10,
  };

  const cat = getCategoryInfo(activity.category);
  const isSmall = height < 40;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`absolute left-1 right-1 rounded-lg border overflow-hidden select-none group transition-shadow ${
        isConflict
          ? 'border-rose-400 bg-rose-50 shadow-md shadow-rose-200'
          : `border-opacity-40 shadow-sm hover:shadow-md`
      }`}
      onClick={() => onEdit(scheduled)}
    >
      <div
        className="w-full h-full flex items-start gap-1 px-1.5 pt-1 pb-0.5 cursor-grab active:cursor-grabbing"
        style={{ backgroundColor: isConflict ? undefined : `${activity.color}18`, borderLeft: `3px solid ${activity.color}` }}
        {...listeners}
        {...attributes}
      >
        {!isSmall && <GripVertical size={10} className="text-slate-400 mt-0.5 shrink-0" />}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1">
            <span className="text-xs">{activity.icon}</span>
            <p className="text-xs font-semibold text-slate-800 truncate leading-tight">{activity.title}</p>
            {isConflict && <AlertTriangle size={10} className="text-rose-500 shrink-0" />}
          </div>
          {!isSmall && (
            <div className="flex items-center gap-1 mt-0.5">
              <Clock size={9} className="text-slate-400" />
              <span className="text-[10px] text-slate-500">
                {scheduled.startTime}–{scheduled.endTime} · {formatDuration(duration)}
              </span>
            </div>
          )}
          {!isSmall && (
            <span className={`text-[10px] px-1 py-0 rounded-full ${cat.color} ${cat.bg} inline-block mt-0.5`}>
              {cat.label}
            </span>
          )}
        </div>
        <button
          onPointerDown={e => e.stopPropagation()}
          onClick={e => { e.stopPropagation(); onRemove(scheduled.id); }}
          className="shrink-0 p-0.5 rounded text-slate-400 hover:text-rose-500 hover:bg-rose-100 opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <X size={10} />
        </button>
      </div>
    </div>
  );
}
