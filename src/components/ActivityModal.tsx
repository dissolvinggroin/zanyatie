import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import type { Activity, Category } from '../types';
import { CATEGORIES, CATEGORY_COLORS } from '../constants';
import { generateId } from '../utils';

const ICONS = ['📚','💻','🏃','🧘','🏋️','🚴','🎵','🎨','🍳','📖','🧠','🚶','🏊','💼','📝','👥','💃','🎓','🎯','⚽','🏀','🎸','🌱','✈️'];

interface Props {
  initial?: Activity | null;
  onSave: (activity: Activity) => void;
  onClose: () => void;
}

export function ActivityModal({ initial, onSave, onClose }: Props) {
  const [title, setTitle]       = useState(initial?.title ?? '');
  const [category, setCategory] = useState<Category>(initial?.category ?? 'other');
  const [duration, setDuration] = useState(initial?.duration ?? 60);
  const [description, setDescription] = useState(initial?.description ?? '');
  const [icon, setIcon]         = useState(initial?.icon ?? '📚');
  const [error, setError]       = useState('');

  useEffect(() => {
    if (!initial) setIcon(ICONS[0]);
  }, [initial]);

  const handleSave = () => {
    if (!title.trim()) { setError('Введите название занятия'); return; }
    if (duration < 5 || duration > 480) { setError('Длительность: от 5 до 480 минут'); return; }
    onSave({
      id: initial?.id ?? generateId(),
      title: title.trim(),
      category,
      duration,
      description: description.trim(),
      color: CATEGORY_COLORS[category],
      icon,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm" onClick={onClose}>
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h2 className="font-bold text-slate-800 text-lg">{initial ? '✏️ Редактировать занятие' : '➕ Новое занятие'}</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors">
            <X size={18} />
          </button>
        </div>

        <div className="p-6 space-y-4">
          {/* Icon picker */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-2">ИКОНКА</label>
            <div className="flex flex-wrap gap-2">
              {ICONS.map(ic => (
                <button
                  key={ic}
                  onClick={() => setIcon(ic)}
                  className={`text-lg w-9 h-9 rounded-lg flex items-center justify-center border-2 transition-colors ${icon === ic ? 'border-indigo-500 bg-indigo-50' : 'border-transparent hover:border-slate-200'}`}
                >
                  {ic}
                </button>
              ))}
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1">НАЗВАНИЕ *</label>
            <input
              type="text"
              value={title}
              onChange={e => { setTitle(e.target.value); setError(''); }}
              placeholder="Название занятия"
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-300 transition"
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-2">КАТЕГОРИЯ</label>
            <div className="grid grid-cols-3 gap-2">
              {CATEGORIES.map(cat => (
                <button
                  key={cat.key}
                  onClick={() => setCategory(cat.key)}
                  className={`py-1.5 px-2 rounded-lg text-xs font-medium border transition-colors ${
                    category === cat.key ? `${cat.color} ${cat.bg} border-current` : 'border-slate-200 text-slate-600 hover:border-slate-300'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* Duration */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1">
              ДЛИТЕЛЬНОСТЬ: <span className="text-indigo-600">{duration} мин</span>
            </label>
            <div className="flex items-center gap-3">
              <input
                type="range"
                min={5}
                max={480}
                step={5}
                value={duration}
                onChange={e => setDuration(Number(e.target.value))}
                className="flex-1 accent-indigo-600"
              />
              <input
                type="number"
                min={5}
                max={480}
                step={5}
                value={duration}
                onChange={e => setDuration(Number(e.target.value))}
                className="w-16 text-center px-2 py-1 border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-300"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1">ОПИСАНИЕ</label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Необязательное описание..."
              rows={2}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-300 resize-none transition"
            />
          </div>

          {error && <p className="text-sm text-rose-600 bg-rose-50 px-3 py-2 rounded-lg">{error}</p>}
        </div>

        <div className="px-6 py-4 border-t border-slate-100 flex gap-3">
          <button onClick={onClose} className="flex-1 py-2.5 border border-slate-200 rounded-xl text-slate-600 font-semibold text-sm hover:bg-slate-50 transition-colors">
            Отмена
          </button>
          <button onClick={handleSave} className="flex-1 py-2.5 bg-indigo-600 text-white rounded-xl font-semibold text-sm hover:bg-indigo-700 transition-colors shadow-sm">
            {initial ? 'Сохранить' : 'Создать'}
          </button>
        </div>
      </div>
    </div>
  );
}
