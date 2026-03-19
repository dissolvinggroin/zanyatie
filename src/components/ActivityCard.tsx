import React from 'react';
import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { Clock, Plus, Pencil, Trash2 } from 'lucide-react';
import type { Activity } from '../types';
import { formatDuration, getCategoryInfo } from '../utils';

interface Props {
  activity: Activity;
  onAddToSchedule: (activity: Activity) => void;
  onEdit: (activity: Activity) => void;
  onDelete: (id: string) => void;
}

export function ActivityCard({ activity, onAddToSchedule, onEdit, onDelete }: Props) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: `library:${activity.id}`,
    data: { type: 'library', activityId: activity.id },
  });

  const style: React.CSSProperties = {
    transform: CSS.Translate.toString(transform),
    opacity: isDragging ? 0.4 : 1,
    zIndex: isDragging ? 50 : undefined,
  };

  const cat = getCategoryInfo(activity.category);

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="group relative bg-white border border-slate-200 rounded-xl p-3 shadow-sm hover:shadow-md transition-all cursor-grab active:cursor-grabbing select-none"
      {...listeners}
      {...attributes}
    >
      <div className="flex items-start gap-2">
        <span className="text-xl shrink-0 mt-0.5">{activity.icon}</span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-1">
            <p className="font-semibold text-sm text-slate-800 truncate leading-tight">{activity.title}</p>
            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
              <button
                onPointerDown={e => e.stopPropagation()}
                onClick={e => { e.stopPropagation(); onEdit(activity); }}
                className="p-1 rounded-md text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                title="Редактировать"
              >
                <Pencil size={12} />
              </button>
              <button
                onPointerDown={e => e.stopPropagation()}
                onClick={e => { e.stopPropagation(); onDelete(activity.id); }}
                className="p-1 rounded-md text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                title="Удалить"
              >
                <Trash2 size={12} />
              </button>
            </div>
          </div>
          <div className="flex items-center gap-1.5 mt-1 flex-wrap">
            <span className={`text-xs px-1.5 py-0.5 rounded-full font-medium ${cat.color} ${cat.bg}`}>
              {cat.label}
            </span>
            <span className="flex items-center gap-0.5 text-xs text-slate-500">
              <Clock size={10} />
              {formatDuration(activity.duration)}
            </span>
          </div>
          {activity.description && (
            <p className="text-xs text-slate-400 mt-1 line-clamp-1">{activity.description}</p>
          )}
        </div>
      </div>
      <button
        onPointerDown={e => e.stopPropagation()}
        onClick={e => { e.stopPropagation(); onAddToSchedule(activity); }}
        className="absolute bottom-2 right-2 p-1 rounded-full bg-indigo-600 text-white opacity-0 group-hover:opacity-100 transition-all hover:bg-indigo-700 shadow-sm"
        title="Добавить в расписание"
      >
        <Plus size={12} />
      </button>
    </div>
  );
}
