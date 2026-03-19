import { useState, useMemo } from 'react';
import { Search, Plus, SlidersHorizontal, X } from 'lucide-react';
import type { Activity, Category, FilterState } from '../types';
import { CATEGORIES } from '../constants';
import { ActivityCard } from './ActivityCard';

interface Props {
  activities: Activity[];
  onAddToSchedule: (activity: Activity) => void;
  onCreateActivity: () => void;
  onEditActivity: (activity: Activity) => void;
  onDeleteActivity: (id: string) => void;
}

const DEFAULT_FILTER: FilterState = {
  search: '',
  categories: [],
  minDuration: 0,
  maxDuration: 300,
};

export function ActivityLibrary({ activities, onAddToSchedule, onCreateActivity, onEditActivity, onDeleteActivity }: Props) {
  const [filter, setFilter] = useState<FilterState>(DEFAULT_FILTER);
  const [showFilters, setShowFilters] = useState(false);

  const filtered = useMemo(() => {
    return activities.filter(a => {
      const q = filter.search.toLowerCase();
      const matchSearch = !q || a.title.toLowerCase().includes(q) || a.category.toLowerCase().includes(q);
      const matchCat = filter.categories.length === 0 || filter.categories.includes(a.category);
      const matchDur = a.duration >= filter.minDuration && a.duration <= filter.maxDuration;
      return matchSearch && matchCat && matchDur;
    });
  }, [activities, filter]);

  const toggleCategory = (cat: Category) => {
    setFilter(f => ({
      ...f,
      categories: f.categories.includes(cat)
        ? f.categories.filter(c => c !== cat)
        : [...f.categories, cat],
    }));
  };

  const hasActiveFilters = filter.search || filter.categories.length > 0 || filter.minDuration > 0 || filter.maxDuration < 300;

  return (
    <div className="flex flex-col h-full bg-slate-50 border-r border-slate-200">
      {/* Header */}
      <div className="p-4 border-b border-slate-200 bg-white">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-bold text-slate-800 text-base">📋 Занятия</h2>
          <button
            onClick={onCreateActivity}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 text-white rounded-lg text-xs font-semibold hover:bg-indigo-700 transition-colors shadow-sm"
          >
            <Plus size={14} /> Новое
          </button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Поиск..."
            value={filter.search}
            onChange={e => setFilter(f => ({ ...f, search: e.target.value }))}
            className="w-full pl-8 pr-8 py-2 text-sm bg-slate-100 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-300 focus:bg-white transition-all"
          />
          {filter.search && (
            <button onClick={() => setFilter(f => ({ ...f, search: '' }))} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
              <X size={14} />
            </button>
          )}
        </div>

        {/* Filter toggle */}
        <button
          onClick={() => setShowFilters(v => !v)}
          className={`mt-2 flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-lg transition-colors w-full justify-center ${showFilters || hasActiveFilters ? 'bg-indigo-100 text-indigo-700 font-semibold' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}
        >
          <SlidersHorizontal size={12} />
          Фильтры {hasActiveFilters && <span className="ml-1 bg-indigo-600 text-white rounded-full px-1.5 py-0 text-xs leading-4">●</span>}
        </button>

        {/* Filters panel */}
        {showFilters && (
          <div className="mt-3 space-y-3">
            <div>
              <p className="text-xs font-semibold text-slate-500 mb-1.5">КАТЕГОРИЯ</p>
              <div className="flex flex-wrap gap-1.5">
                {CATEGORIES.map(cat => (
                  <button
                    key={cat.key}
                    onClick={() => toggleCategory(cat.key)}
                    className={`text-xs px-2 py-0.5 rounded-full border font-medium transition-colors ${
                      filter.categories.includes(cat.key)
                        ? `${cat.color} ${cat.bg} border-current`
                        : 'text-slate-500 bg-white border-slate-200 hover:border-slate-400'
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500 mb-1">ДЛИТЕЛЬНОСТЬ (мин)</p>
              <div className="flex gap-2 items-center">
                <input
                  type="number"
                  min={0}
                  max={300}
                  value={filter.minDuration}
                  onChange={e => setFilter(f => ({ ...f, minDuration: Number(e.target.value) }))}
                  className="w-16 text-xs p-1 border border-slate-200 rounded text-center"
                  placeholder="от"
                />
                <span className="text-slate-400 text-xs">—</span>
                <input
                  type="number"
                  min={0}
                  max={300}
                  value={filter.maxDuration}
                  onChange={e => setFilter(f => ({ ...f, maxDuration: Number(e.target.value) }))}
                  className="w-16 text-xs p-1 border border-slate-200 rounded text-center"
                  placeholder="до"
                />
              </div>
            </div>
            <button
              onClick={() => setFilter(DEFAULT_FILTER)}
              className="text-xs text-rose-500 hover:text-rose-700 underline"
            >
              Сбросить фильтры
            </button>
          </div>
        )}
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        <p className="text-xs text-slate-400 px-1 mb-2">
          {filtered.length} {filtered.length === 1 ? 'занятие' : filtered.length < 5 ? 'занятия' : 'занятий'} · Перетащите в расписание
        </p>
        {filtered.length === 0 ? (
          <div className="text-center py-8 text-slate-400">
            <p className="text-3xl mb-2">🔍</p>
            <p className="text-sm">Ничего не найдено</p>
          </div>
        ) : (
          filtered.map(activity => (
            <ActivityCard
              key={activity.id}
              activity={activity}
              onAddToSchedule={onAddToSchedule}
              onEdit={onEditActivity}
              onDelete={onDeleteActivity}
            />
          ))
        )}
      </div>
    </div>
  );
}
