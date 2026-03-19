import type { Activity, Category, DayOfWeek } from './types';

export const DAYS: { key: DayOfWeek; label: string; short: string }[] = [
  { key: 'monday',    label: 'Понедельник', short: 'Пн' },
  { key: 'tuesday',  label: 'Вторник',     short: 'Вт' },
  { key: 'wednesday',label: 'Среда',       short: 'Ср' },
  { key: 'thursday', label: 'Четверг',     short: 'Чт' },
  { key: 'friday',   label: 'Пятница',     short: 'Пт' },
  { key: 'saturday', label: 'Суббота',     short: 'Сб' },
  { key: 'sunday',   label: 'Воскресенье', short: 'Вс' },
];

export const CATEGORIES: { key: Category; label: string; color: string; bg: string }[] = [
  { key: 'sport',  label: 'Спорт',       color: 'text-emerald-700', bg: 'bg-emerald-100' },
  { key: 'study',  label: 'Учёба',       color: 'text-blue-700',    bg: 'bg-blue-100'    },
  { key: 'work',   label: 'Работа',      color: 'text-violet-700',  bg: 'bg-violet-100'  },
  { key: 'health', label: 'Здоровье',    color: 'text-rose-700',    bg: 'bg-rose-100'    },
  { key: 'hobby',  label: 'Хобби',       color: 'text-amber-700',   bg: 'bg-amber-100'   },
  { key: 'social', label: 'Общение',     color: 'text-sky-700',     bg: 'bg-sky-100'     },
  { key: 'other',  label: 'Другое',      color: 'text-slate-700',   bg: 'bg-slate-100'   },
];

export const CATEGORY_COLORS: Record<Category, string> = {
  sport:  '#10b981',
  study:  '#3b82f6',
  work:   '#8b5cf6',
  health: '#f43f5e',
  hobby:  '#f59e0b',
  social: '#0ea5e9',
  other:  '#64748b',
};

export const DEFAULT_ACTIVITIES: Activity[] = [
  { id: 'a1',  title: 'Бег',              category: 'sport',  duration: 45,  color: '#10b981', icon: '🏃', description: 'Утренняя пробежка' },
  { id: 'a2',  title: 'Йога',             category: 'health', duration: 60,  color: '#f43f5e', icon: '🧘', description: 'Растяжка и медитация' },
  { id: 'a3',  title: 'Английский язык',  category: 'study',  duration: 90,  color: '#3b82f6', icon: '📖', description: 'Изучение лексики и грамматики' },
  { id: 'a4',  title: 'Программирование', category: 'study',  duration: 120, color: '#3b82f6', icon: '💻', description: 'Практика кодинга' },
  { id: 'a5',  title: 'Тренажёрный зал',  category: 'sport',  duration: 75,  color: '#10b981', icon: '🏋️', description: 'Силовые тренировки' },
  { id: 'a6',  title: 'Чтение книги',     category: 'hobby',  duration: 40,  color: '#f59e0b', icon: '📚', description: 'Художественная литература' },
  { id: 'a7',  title: 'Рабочее совещание',category: 'work',   duration: 60,  color: '#8b5cf6', icon: '💼', description: 'Встреча с командой' },
  { id: 'a8',  title: 'Готовка',          category: 'hobby',  duration: 50,  color: '#f59e0b', icon: '🍳', description: 'Приготовление пищи' },
  { id: 'a9',  title: 'Медитация',        category: 'health', duration: 20,  color: '#f43f5e', icon: '🧠', description: 'Практика осознанности' },
  { id: 'a10', title: 'Велосипед',        category: 'sport',  duration: 60,  color: '#10b981', icon: '🚴', description: 'Прогулка на велосипеде' },
  { id: 'a11', title: 'Музыка',           category: 'hobby',  duration: 45,  color: '#f59e0b', icon: '🎵', description: 'Игра на инструменте' },
  { id: 'a12', title: 'Встреча с друзьями',category:'social', duration: 120, color: '#0ea5e9', icon: '👥', description: 'Социальное время' },
  { id: 'a13', title: 'Плавание',         category: 'sport',  duration: 60,  color: '#10b981', icon: '🏊', description: 'Бассейн' },
  { id: 'a14', title: 'Онлайн-курс',      category: 'study',  duration: 90,  color: '#3b82f6', icon: '🎓', description: 'Видео-лекции' },
  { id: 'a15', title: 'Прогулка',         category: 'health', duration: 30,  color: '#f43f5e', icon: '🚶', description: 'Свежий воздух' },
  { id: 'a16', title: 'Рисование',        category: 'hobby',  duration: 60,  color: '#f59e0b', icon: '🎨', description: 'Творческий процесс' },
  { id: 'a17', title: 'Работа над проектом', category: 'work', duration: 180, color: '#8b5cf6', icon: '📝', description: 'Глубокая работа' },
  { id: 'a18', title: 'Танцы',            category: 'social', duration: 75,  color: '#0ea5e9', icon: '💃', description: 'Урок танцев' },
];

export const TIME_SLOTS: string[] = Array.from({ length: 48 }, (_, i) => {
  const h = Math.floor(i / 2);
  const m = i % 2 === 0 ? '00' : '30';
  return `${String(h).padStart(2, '0')}:${m}`;
});
