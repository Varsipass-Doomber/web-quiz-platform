import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Zap,
  LogOut,
  Search,
  Plus,
  Hash,
  ArrowRight,
  BookOpen,
  Globe,
  FlaskConical,
  Landmark,
  Music,
  Cpu,
  Trophy,
  Clock,
  HelpCircle,
} from "lucide-react";

const ACCENT = "#0d9488";
const ACCENT_HOVER = "#0f766e";
const FIELD_BG = "#f2f8f7";

// ─── Mock data ────────────────────────────────────────────────────────────────

type Category = "Наука" | "История" | "Технологии" | "Музыка" | "Литература" | "География";

interface Quiz {
  id: string;
  title: string;
  category: Category;
  questions: number;
  minutes: number;
  author: string;
  participants: number;
}

const CATEGORY_ICONS: Record<Category, React.ReactNode> = {
  Наука: <FlaskConical className="w-3.5 h-3.5" />,
  История: <Landmark className="w-3.5 h-3.5" />,
  Технологии: <Cpu className="w-3.5 h-3.5" />,
  Музыка: <Music className="w-3.5 h-3.5" />,
  Литература: <BookOpen className="w-3.5 h-3.5" />,
  География: <Globe className="w-3.5 h-3.5" />,
};

const CATEGORY_COLORS: Record<Category, string> = {
  Наука: "#0ea5e9",
  История: "#a855f7",
  Технологии: "#0d9488",
  Музыка: "#f59e0b",
  Литература: "#ec4899",
  География: "#22c55e",
};

const ALL_QUIZZES: Quiz[] = [
  { id: "1", title: "Великие открытия XX века", category: "Наука", questions: 15, minutes: 12, author: "maria_ivanova", participants: 134 },
  { id: "2", title: "Мировые столицы", category: "География", questions: 20, minutes: 10, author: "ivan_petrov", participants: 89 },
  { id: "3", title: "Классика русской литературы", category: "Литература", questions: 12, minutes: 15, author: "olga_smirnova", participants: 61 },
  { id: "4", title: "История Древнего Рима", category: "История", questions: 18, minutes: 14, author: "ivan_petrov", participants: 203 },
  { id: "5", title: "Основы программирования", category: "Технологии", questions: 25, minutes: 20, author: "dev_alex", participants: 312 },
  { id: "6", title: "Золотая эпоха джаза", category: "Музыка", questions: 10, minutes: 8, author: "maria_ivanova", participants: 47 },
  { id: "7", title: "Периодическая таблица", category: "Наука", questions: 30, minutes: 25, author: "olga_smirnova", participants: 178 },
  { id: "8", title: "Архитектура мира", category: "История", questions: 16, minutes: 13, author: "ivan_petrov", participants: 95 },
];

const CATEGORIES: Category[] = ["Наука", "История", "Технологии", "Музыка", "Литература", "География"];

// ─── Simulated current user (change role to see organizer view) ───────────────

const CURRENT_USER = {
  name: "ivan_petrov",
  role: "organizer" as "participant" | "organizer",
  avatar: "ИП",
};

// ─── Sub-components ───────────────────────────────────────────────────────────

function Avatar() {
  return (
    <div
      className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-semibold flex-shrink-0"
      style={{ background: ACCENT }}
    >
      {CURRENT_USER.avatar}
    </div>
  );
}

function QuizCard({ quiz }: { quiz: Quiz }) {
  const isOwner = CURRENT_USER.role === "organizer" && quiz.author === CURRENT_USER.name;
  const color = CATEGORY_COLORS[quiz.category];
  const icon = CATEGORY_ICONS[quiz.category];

  return (
    <div className="bg-card rounded-2xl shadow-[0_2px_16px_rgba(0,0,0,0.06)] border border-border p-5 flex flex-col gap-4 hover:shadow-[0_4px_24px_rgba(0,0,0,0.1)] transition-shadow duration-200">
      {/* Category badge */}
      <div className="flex items-center justify-between">
        <span
          className="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full"
          style={{ background: `${color}15`, color }}
        >
          {icon}
          {quiz.category}
        </span>
        {isOwner && (
          <span
            className="text-xs font-medium px-2 py-0.5 rounded-full"
            style={{ background: `${ACCENT}15`, color: ACCENT }}
          >
            Мой
          </span>
        )}
      </div>

      {/* Title */}
      <h3 className="text-sm font-semibold text-card-foreground leading-snug line-clamp-2 flex-1">
        {quiz.title}
      </h3>

      {/* Meta */}
      <div className="flex items-center gap-3 text-xs text-muted-foreground">
        <span className="flex items-center gap-1">
          <HelpCircle className="w-3.5 h-3.5" />
          {quiz.questions} вопросов
        </span>
        <span className="flex items-center gap-1">
          <Clock className="w-3.5 h-3.5" />
          ~{quiz.minutes} мин
        </span>
        <span className="flex items-center gap-1 ml-auto">
          <Trophy className="w-3.5 h-3.5" />
          {quiz.participants}
        </span>
      </div>

      {/* Action */}
      <button
        className="w-full py-2 rounded-xl text-sm font-medium transition-all duration-150 active:scale-[0.98] flex items-center justify-center gap-1.5"
        style={
          isOwner
            ? { background: FIELD_BG, color: ACCENT, border: `1px solid ${ACCENT}40` }
            : { background: ACCENT, color: "#fff", boxShadow: "0 1px 8px rgba(13,148,136,0.25)" }
        }
        onMouseEnter={(e) => {
          if (!isOwner) e.currentTarget.style.background = ACCENT_HOVER;
        }}
        onMouseLeave={(e) => {
          if (!isOwner) e.currentTarget.style.background = ACCENT;
        }}
      >
        {isOwner ? "Управлять" : "Присоединиться"}
        <ArrowRight className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export function HomePage() {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<Category | null>(null);
  const [roomCode, setRoomCode] = useState("");

  const filtered = ALL_QUIZZES.filter((q) => {
    const matchSearch = q.title.toLowerCase().includes(search.toLowerCase());
    const matchCategory = !activeCategory || q.category === activeCategory;
    return matchSearch && matchCategory;
  });

  return (
    <div
      className="min-h-screen bg-background"
      style={{ fontFamily: "'Inter', sans-serif" }}
    >
      {/* ── Header ── */}
      <header className="bg-card border-b border-border sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-4">
          {/* Logo */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <div
              className="w-7 h-7 rounded-lg flex items-center justify-center"
              style={{ background: ACCENT }}
            >
              <Zap className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="text-base font-semibold text-foreground tracking-tight hidden sm:block">
              QuizSpace
            </span>
          </div>

          {/* Right side */}
          <div className="flex items-center gap-3">
            {/* Create quiz — organizer only */}
            {CURRENT_USER.role === "organizer" && (
              <button
                className="hidden sm:flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-sm font-medium text-white transition-all duration-150 active:scale-[0.97]"
                style={{ background: ACCENT }}
                onMouseEnter={(e) => (e.currentTarget.style.background = ACCENT_HOVER)}
                onMouseLeave={(e) => (e.currentTarget.style.background = ACCENT)}
              >
                <Plus className="w-4 h-4" />
                Создать квиз
              </button>
            )}

            {/* User */}
            <div className="flex items-center gap-2">
              <Avatar />
              <span className="text-sm font-medium text-foreground hidden sm:block">
                {CURRENT_USER.name}
              </span>
            </div>

            {/* Sign out */}
            <Link
              to="/"
              className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition px-2 py-1.5 rounded-lg hover:bg-muted"
              title="Выйти"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:block">Выйти</span>
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-8">

        {/* ── Join by code ── */}
        <div
          className="rounded-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center gap-3"
          style={{ background: `${ACCENT}10`, border: `1px solid ${ACCENT}25` }}
        >
          <div className="flex-1">
            <p className="text-sm font-semibold text-card-foreground flex items-center gap-1.5">
              <Hash className="w-4 h-4" style={{ color: ACCENT }} />
              Есть код комнаты?
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Введите код, чтобы сразу войти в активный квиз
            </p>
          </div>
          <div className="flex gap-2 w-full sm:w-auto">
            <input
              type="text"
              placeholder="Код комнаты"
              value={roomCode}
              onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
              maxLength={8}
              className="flex-1 sm:w-36 px-3 py-2 rounded-xl border border-border bg-card text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-[#0d9488]/25 focus:border-[#0d9488] font-mono tracking-widest uppercase"
            />
            <button
              className="px-4 py-2 rounded-xl text-white text-sm font-medium flex-shrink-0 transition-all active:scale-[0.97]"
              style={{ background: ACCENT }}
              onMouseEnter={(e) => (e.currentTarget.style.background = ACCENT_HOVER)}
              onMouseLeave={(e) => (e.currentTarget.style.background = ACCENT)}
            >
              Подключиться
            </button>
          </div>
        </div>

        {/* ── Search + filters ── */}
        <div className="space-y-3">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
            <input
              type="text"
              placeholder="Поиск квизов..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border text-sm text-foreground placeholder:text-muted-foreground outline-none transition focus:ring-2 focus:ring-[#0d9488]/25 focus:border-[#0d9488]"
              style={{ background: FIELD_BG }}
            />
          </div>

          {/* Category pills */}
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => setActiveCategory(null)}
              className="px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-150"
              style={
                !activeCategory
                  ? { background: ACCENT, color: "#fff" }
                  : { background: FIELD_BG, color: "var(--muted-foreground)", border: "1px solid var(--border)" }
              }
            >
              Все
            </button>
            {CATEGORIES.map((cat) => {
              const active = activeCategory === cat;
              const color = CATEGORY_COLORS[cat];
              return (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(active ? null : cat)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-150"
                  style={
                    active
                      ? { background: color, color: "#fff" }
                      : { background: FIELD_BG, color: "var(--muted-foreground)", border: "1px solid var(--border)" }
                  }
                >
                  <span style={{ color: active ? "#fff" : color }}>
                    {CATEGORY_ICONS[cat]}
                  </span>
                  {cat}
                </button>
              );
            })}
          </div>
        </div>

        {/* ── Quiz grid ── */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-foreground">
              {activeCategory ? activeCategory : "Доступные квизы"}
            </h2>
            <span className="text-sm text-muted-foreground">
              {filtered.length} {filtered.length === 1 ? "квиз" : filtered.length < 5 ? "квиза" : "квизов"}
            </span>
          </div>

          {filtered.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filtered.map((quiz) => (
                <QuizCard key={quiz.id} quiz={quiz} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16 text-muted-foreground">
              <HelpCircle className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p className="text-sm">Квизы не найдены</p>
              <button
                className="text-sm mt-2 hover:underline"
                style={{ color: ACCENT }}
                onClick={() => { setSearch(""); setActiveCategory(null); }}
              >
                Сбросить фильтры
              </button>
            </div>
          )}
        </div>
      </main>

      {/* ── FAB: Create quiz (mobile, organizer only) ── */}
      {CURRENT_USER.role === "organizer" && (
        <button
          className="sm:hidden fixed bottom-6 right-6 w-14 h-14 rounded-full text-white shadow-[0_4px_20px_rgba(13,148,136,0.4)] flex items-center justify-center transition-all active:scale-95 z-20"
          style={{ background: ACCENT }}
          aria-label="Создать квиз"
        >
          <Plus className="w-6 h-6" />
        </button>
      )}
    </div>
  );
}
