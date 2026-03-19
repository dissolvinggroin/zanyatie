import { useState, useEffect } from 'react';
import { X, Clock, AlertTriangle, CheckCircle } from 'lucide-react';
import type { Activity, DayOfWeek, ScheduledActivity } from '../types';
import { DAYS, TIME_SLOTS } from '../constants';
import { addMinutesToTime, formatDuration, getCategoryInfo, findConflicts } from '../utils';

interface Props {
  activity: Activity;
  scheduled: ScheduledActivity[];
  initialDay?: DayOfWeek;
  initialTime?: string;
  editItem?: ScheduledActivity | null;
  onSave: (day: DayOfWeek, startTime: string, note?: string) => { success: boolean; conflicts: ScheduledActivity[] };
  onClose: () => void;
}

export function ScheduleModal({ activity, scheduled, initialDay, initialTime, editItem, onSave, onClose }: Props) {
  const [day, setDay]           = useState<DayOfWeek>(initialDay ?? editItem?.day ?? 'monday');
  const [startTime, setStartTime] = useState(initialTime ?? editItem?.startTime ?? '09:00');
  const [note, setNote]         = useState(editItem?.note ?? '');
  const [conflicts, setConflicts] = useState<ScheduledActivity[]>([]);
  const [saved, setSaved]       = useState(false);

  const endTime = addMinutesToTime(startTime, activity.duration);
  const cat = getCategoryInfo(activity.category);

  // Live conflict check
  useEffect(() => {
    const candidate = {
      id: editItem?.id ?? '__preview__',
      activityId: activity.id,
      day,
      startTime,
      endTime,
      note,
    };
    const found = findConflicts(scheduled, candidate, editItem?.id);
    setConflicts(found);
    setSaved(false);
  }, [day, startTime, activity.id, endTime, note, scheduled, editItem?.id]);

  const handleSave = () => {
    const result = onSave(day, startTime, note.trim() || undefined);
    if (result.success) {
      setSaved(true);
      setTimeout(onClose, 500);
    } else {
      setConflicts(result.conflicts);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm" onClick={onClose}>
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <span className="text-xl">{activity.icon}</span>
            <div>
              <p className="font-bold text-slate-800 text-sm">{activity.title}</p>
              <div className="flex items-center gap-1.5">
                <span className={`text-xs px-1.5 py-0.5 rounded-full font-medium ${cat.color} ${cat.bg}`}>{cat.label}</span>
                <span className="flex items-center gap-0.5 text-xs text-slate-500">
                  <Clock size={10} />{formatDuration(activity.duration)}
                </span>
              </div>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100">
            <X size={18} />
          </button>
        </div>

        <div className="p-5 space-y-4">
          {/* Day */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-2">ДЕНЬ НЕДЕЛИ</label>
            <div className="grid grid-cols-7 gap-1">
              {DAYS.map(d => (
                <button
                  key={d.key}
                  onClick={() => setDay(d.key)}
                  className={`py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                    day === d.key
                      ? 'bg-indigo-600 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {d.short}
                </button>
              ))}
            </div>
          </div>

          {/* Time */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1">ВРЕМЯ НАЧАЛА</label>
            <select
              value={startTime}
              onChange={e => setStartTime(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-300 bg-white"
            >
              {TIME_SLOTS.map(t => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
            <p className="text-xs text-slate-400 mt-1">
              Конец: <span className="font-semibold text-slate-600">{endTime}</span>
            </p>
          </div>

          {/* Note */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1">ЗАМЕТКА (необязательно)</label>
            <input
              type="text"
              value={note}
              onChange={e => setNote(e.target.value)}
              placeholder="Добавить заметку..."
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-300"
            />
          </div>

          {/* Conflicts */}
          {conflicts.length > 0 && (
            <div className="bg-rose-50 border border-rose-200 rounded-xl p-3 space-y-1">
              <div className="flex items-center gap-1.5 text-rose-700 font-semibold text-xs">
                <AlertTriangle size={14} />
                Конфликт времени ({conflicts.length})
              </div>
              <p className="text-xs text-rose-600">
                Это занятие пересекается с другими. Нельзя сохранить.
              </p>
            </div>
          )}

          {saved && (
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 flex items-center gap-2 text-emerald-700 text-sm font-semibold">
              <CheckCircle size={16} /> Сохранено!
            </div>
          )}
        </div>

        <div className="px-5 py-4 border-t border-slate-100 flex gap-3">
          <button onClick={onClose} className="flex-1 py-2.5 border border-slate-200 rounded-xl text-slate-600 font-semibold text-sm hover:bg-slate-50 transition-colors">
            Отмена
          </button>
          <button
            onClick={handleSave}
            disabled={conflicts.length > 0}
            className="flex-1 py-2.5 bg-indigo-600 text-white rounded-xl font-semibold text-sm hover:bg-indigo-700 disabled:bg-slate-300 disabled:cursor-not-allowed transition-colors shadow-sm"
          >
            {editItem ? 'Обновить' : 'Добавить'}
          </button>
        </div>
      </div>
    </div>
  );
}
