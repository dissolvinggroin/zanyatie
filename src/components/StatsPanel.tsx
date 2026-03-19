import { useMemo } from 'react';
import { BarChart3, Clock, Calendar, TrendingUp } from 'lucide-react';
import type { Activity, ScheduledActivity } from '../types';
import { DAYS, CATEGORIES } from '../constants';
import { timeToMinutes, formatDuration, getDayLoad } from '../utils';

interface Props {
  scheduled: ScheduledActivity[];
  activities: Activity[];
}

export function StatsPanel({ scheduled, activities }: Props) {
  const stats = useMemo(() => {
    let totalMin = 0;
    const byDay: Record<string, number> = {};
    const byCat: Record<string, number> = {};

    DAYS.forEach(d => (byDay[d.key] = 0));
    CATEGORIES.forEach(c => (byCat[c.key] = 0));

    scheduled.forEach(s => {
      const start = timeToMinutes(s.startTime);
      const end   = timeToMinutes(s.endTime);
      const dur   = end - start;
      totalMin += dur;
      byDay[s.day] = (byDay[s.day] || 0) + dur;

      const act = activities.find(a => a.id === s.activityId);
      if (act) byCat[act.category] = (byCat[act.category] || 0) + dur;
    });

    const busiest = DAYS.reduce((acc, d) => byDay[d.key] > byDay[acc] ? d.key : acc, DAYS[0].key);
    const topCat  = CATEGORIES.reduce((acc, c) => byCat[c.key] > byCat[acc.key] ? c : acc, CATEGORIES[0]);

    return { totalMin, byDay, byCat, busiest, topCat };
  }, [scheduled, activities]);

  return (
    <div className="bg-white border-t border-slate-200 p-4">
      <div className="flex items-center gap-2 mb-4">
        <BarChart3 size={16} className="text-indigo-600" />
        <h3 className="font-bold text-slate-700 text-sm">Статистика недели</h3>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
        <div className="bg-indigo-50 rounded-xl p-3">
          <div className="flex items-center gap-1.5 text-indigo-600 mb-1">
            <Calendar size={13} />
            <span className="text-xs font-semibold">Занятий</span>
          </div>
          <p className="text-2xl font-bold text-indigo-700">{scheduled.length}</p>
        </div>
        <div className="bg-emerald-50 rounded-xl p-3">
          <div className="flex items-center gap-1.5 text-emerald-600 mb-1">
            <Clock size={13} />
            <span className="text-xs font-semibold">Всего часов</span>
          </div>
          <p className="text-2xl font-bold text-emerald-700">{(stats.totalMin / 60).toFixed(1)}</p>
        </div>
        <div className="bg-amber-50 rounded-xl p-3">
          <div className="flex items-center gap-1.5 text-amber-600 mb-1">
            <TrendingUp size={13} />
            <span className="text-xs font-semibold">Топ день</span>
          </div>
          <p className="text-sm font-bold text-amber-700 truncate">
            {DAYS.find(d => d.key === stats.busiest)?.short ?? '—'}
            {scheduled.length > 0 && <span className="text-xs font-normal ml-1 text-amber-600">({formatDuration(stats.byDay[stats.busiest])})</span>}
          </p>
        </div>
        <div className="bg-violet-50 rounded-xl p-3">
          <div className="flex items-center gap-1.5 text-violet-600 mb-1">
            <span className="text-xs">🏆</span>
            <span className="text-xs font-semibold">Топ категория</span>
          </div>
          <p className="text-sm font-bold text-violet-700 truncate">
            {stats.byCat[stats.topCat.key] > 0 ? stats.topCat.label : '—'}
          </p>
        </div>
      </div>

      {/* Load by day */}
      <div className="mb-4">
        <p className="text-xs font-semibold text-slate-500 mb-2">НАГРУЗКА ПО ДНЯМ</p>
        <div className="space-y-1.5">
          {DAYS.map(d => {
            const load = getDayLoad(stats.byDay[d.key]);
            const count = scheduled.filter(s => s.day === d.key).length;
            return (
              <div key={d.key} className="flex items-center gap-2">
                <span className="text-xs text-slate-500 w-6 shrink-0 font-mono">{d.short}</span>
                <div className="flex-1 bg-slate-100 rounded-full h-3 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${load.color}`}
                    style={{ width: `${load.width}%` }}
                  />
                </div>
                <span className="text-xs text-slate-500 w-20 text-right shrink-0">
                  {count > 0 ? `${count} · ${formatDuration(stats.byDay[d.key])}` : '—'}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* By category */}
      <div>
        <p className="text-xs font-semibold text-slate-500 mb-2">ПО КАТЕГОРИЯМ</p>
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.filter(c => stats.byCat[c.key] > 0).map(c => (
            <div key={c.key} className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${c.color} ${c.bg}`}>
              <span>{c.label}</span>
              <span className="opacity-75">{formatDuration(stats.byCat[c.key])}</span>
            </div>
          ))}
          {CATEGORIES.every(c => stats.byCat[c.key] === 0) && (
            <p className="text-xs text-slate-400">Добавьте занятия в расписание</p>
          )}
        </div>
      </div>
    </div>
  );
}
