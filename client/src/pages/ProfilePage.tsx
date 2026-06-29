import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Zap,
  Trophy,
  Calendar,
  ChevronRight,
  LogOut,
  Award,
  Users,
  Star,
  BarChart3,
  Edit,
  Copy,
  Check,
} from "lucide-react";

const ACCENT = "#0d9488";
const ACCENT_HOVER = "#0f766e";

// ─── Mock user data ──────────────────────────────────────────────────────────

const MOCK_USER = {
  id: "u1",
  full_name: "Иван Петров",
  email: "ivan@example.com",
  role: "organizer" as "organizer" | "participant",
  avatar: "ИП",
  joinedAt: "2025-01-15",
  stats: {
    totalQuizzes: 12,
    totalScore: 2450,
    averageScore: 82,
    correctAnswers: 42,
    wrongAnswers: 18,
    bestCategory: "Наука",
    favoriteQuiz: "Великие открытия XX века",
  },
};

const RECENT_QUIZZES = [
  {
    id: "q1",
    title: "Великие открытия XX века",
    category: "Наука",
    date: "2026-06-25",
    score: 85,
    total: 100,
    participants: 8,
    role: "organizer" as "organizer" | "participant",
  },
  {
    id: "q2",
    title: "История Древнего Рима",
    category: "История",
    date: "2026-06-24",
    score: 70,
    total: 100,
    participants: 5,
    role: "participant" as "organizer" | "participant",
  },
  {
    id: "q3",
    title: "Основы программирования",
    category: "Технологии",
    date: "2026-06-22",
    score: 90,
    total: 100,
    participants: 12,
    role: "participant" as "organizer" | "participant",
  },
  {
    id: "q4",
    title: "Классика русской литературы",
    category: "Литература",
    date: "2026-06-20",
    score: 65,
    total: 100,
    participants: 6,
    role: "participant" as "organizer" | "participant",
  },
  {
    id: "q5",
    title: "Музыка 90-х",
    category: "Музыка",
    date: "2026-06-18",
    score: 95,
    total: 100,
    participants: 10,
    role: "organizer" as "organizer" | "participant",
  },
];

// ─── Helper components ──────────────────────────────────────────────────────

function StatCard({
  icon,
  label,
  value,
  subtitle,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  subtitle?: string;
}) {
  return (
    <div className="bg-card rounded-2xl border border-border p-5 flex items-start gap-4 hover:shadow-[0_4px_20px_rgba(0,0,0,0.06)] transition-shadow">
      <div
        className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
        style={{ background: `${ACCENT}15` }}
      >
        {icon}
      </div>
      <div>
        <p className="text-2xl font-bold text-card-foreground">{value}</p>
        <p className="text-xs text-muted-foreground">{label}</p>
        {subtitle && (
          <p className="text-xs mt-0.5" style={{ color: ACCENT }}>
            {subtitle}
          </p>
        )}
      </div>
    </div>
  );
}

function QuizHistoryItem({
  quiz,
}: {
  quiz: (typeof RECENT_QUIZZES)[0];
}) {
  const isOrganizer = quiz.role === "organizer";

  return (
    <div className="flex items-center gap-4 py-3 border-b border-border last:border-b-0 group hover:bg-muted/30 px-3 rounded-xl transition">
      <div
        className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
        style={{ background: `${ACCENT}12` }}
      >
        {isOrganizer ? (
          <Users className="w-4 h-4" style={{ color: ACCENT }} />
        ) : (
          <Award className="w-4 h-4" style={{ color: ACCENT }} />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-card-foreground truncate">
          {quiz.title}
        </p>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span>{quiz.category}</span>
          <span className="text-border">·</span>
          <span className="flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            {new Date(quiz.date).toLocaleDateString("ru-RU")}
          </span>
          <span className="text-border">·</span>
          <span className="flex items-center gap-1">
            <Users className="w-3 h-3" />
            {quiz.participants}
          </span>
        </div>
      </div>
      <div className="flex items-center gap-3 flex-shrink-0">
        <div className="text-right">
          <span className="text-sm font-semibold text-card-foreground">
            {quiz.score}
          </span>
          <span className="text-xs text-muted-foreground">/100</span>
        </div>

        {/* Кнопка "Редактировать" — только для организатора */}
        {isOrganizer && (
          <Link
            to={`/quiz/edit/${quiz.id}`}
            className="px-3 py-1.5 rounded-xl text-xs font-medium text-white transition hover:opacity-80 flex items-center gap-1"
            style={{ background: ACCENT }}
          >
            <Edit className="w-3 h-3" />
            <span className="hidden sm:inline">Редактировать</span>
          </Link>
        )}

        <ChevronRight className="w-4 h-4 text-muted-foreground/30 group-hover:text-muted-foreground transition" />
      </div>
    </div>
  );
}

// ─── Page ──────────────────────────────────────────────────────────────────

export function ProfilePage() {
  const [user] = useState(MOCK_USER);
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<"overview" | "history" | "created">("overview");

  const copyEmail = () => {
    navigator.clipboard.writeText(user.email);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const isOrganizer = user.role === "organizer";

  const createdQuizzes = RECENT_QUIZZES.filter((q) => q.role === "organizer");
  const participatedQuizzes = RECENT_QUIZZES.filter((q) => q.role === "participant");

  return (
    <div
      className="min-h-screen bg-background"
      style={{ fontFamily: "'Inter', sans-serif" }}
    >
      {/* ── Header ── */}
      <header className="bg-card border-b border-border sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          {/* Левая часть — кликабельный логотип */}
          <Link
            to="/home"
            className="flex items-center gap-2 hover:opacity-80 transition"
            aria-label="На главную"
          >
            <div
              className="w-7 h-7 rounded-lg flex items-center justify-center"
              style={{ background: ACCENT }}
            >
              <Zap className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="text-base font-semibold text-foreground tracking-tight hidden sm:block">
              QuizSpace
            </span>
            <span className="text-muted-foreground text-sm hidden sm:block">/</span>
            <span className="text-sm font-medium text-foreground hidden sm:block">
              Профиль
            </span>
          </Link>

          {/* Правая часть — кнопка выхода */}
          <div className="flex items-center gap-3">
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

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        {/* ── Profile header ── */}
        <div className="bg-card rounded-2xl border border-border p-6 sm:p-8 mb-8 shadow-[0_2px_16px_rgba(0,0,0,0.05)]">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
            {/* Avatar */}
            <div
              className="w-20 h-20 rounded-2xl flex items-center justify-center text-2xl font-semibold text-white flex-shrink-0"
              style={{ background: ACCENT }}
            >
              {user.avatar}
            </div>

            {/* User info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-2xl font-semibold text-card-foreground">
                  {user.full_name}
                </h1>
                <span
                  className="text-xs font-medium px-2.5 py-1 rounded-full"
                  style={{
                    background: isOrganizer ? `${ACCENT}15` : "#fef3c7",
                    color: isOrganizer ? ACCENT : "#b45309",
                  }}
                >
                  {isOrganizer ? "Организатор" : "Участник"}
                </span>
              </div>
              <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                <span>{user.email}</span>
                <button
                  onClick={copyEmail}
                  className="p-1 rounded-lg hover:bg-muted transition text-muted-foreground hover:text-foreground"
                  aria-label="Скопировать email"
                >
                  {copied ? (
                    <Check className="w-3.5 h-3.5" style={{ color: ACCENT }} />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>
              <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" />
                  С нами с {new Date(user.joinedAt).toLocaleDateString("ru-RU")}
                </span>
                <span className="flex items-center gap-1">
                  <Trophy className="w-3.5 h-3.5" />
                  {user.stats.totalQuizzes} квизов
                </span>
                <span className="flex items-center gap-1">
                  <Star className="w-3.5 h-3.5" />
                  {user.stats.averageScore}% средний результат
                </span>
              </div>
            </div>

            <button
              className="px-4 py-2 rounded-xl text-sm font-medium text-white transition flex items-center gap-1.5 flex-shrink-0"
              style={{ background: ACCENT }}
              onMouseEnter={(e) => (e.currentTarget.style.background = ACCENT_HOVER)}
              onMouseLeave={(e) => (e.currentTarget.style.background = ACCENT)}
            >
              <Edit className="w-4 h-4" />
              Редактировать
            </button>
          </div>
        </div>

        {/* ── Stats grid ── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          <StatCard
            icon={<Trophy className="w-5 h-5" style={{ color: ACCENT }} />}
            label="Всего квизов"
            value={user.stats.totalQuizzes}
          />
          <StatCard
            icon={<BarChart3 className="w-5 h-5" style={{ color: ACCENT }} />}
            label="Средний балл"
            value={`${user.stats.averageScore}%`}
          />
          <StatCard
            icon={<Award className="w-5 h-5" style={{ color: ACCENT }} />}
            label="Правильных ответов"
            value={user.stats.correctAnswers}
            subtitle={`${Math.round((user.stats.correctAnswers / (user.stats.correctAnswers + user.stats.wrongAnswers)) * 100)}%`}
          />
          <StatCard
            icon={<Star className="w-5 h-5" style={{ color: ACCENT }} />}
            label="Лучшая категория"
            value={user.stats.bestCategory}
          />
        </div>

        {/* ── Tabs ── */}
        <div className="mb-6">
          <div className="flex gap-1 bg-muted/60 rounded-2xl p-1 w-fit">
            <button
              onClick={() => setActiveTab("overview")}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition ${
                activeTab === "overview"
                  ? "bg-card text-card-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Обзор
            </button>
            <button
              onClick={() => setActiveTab("history")}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition ${
                activeTab === "history"
                  ? "bg-card text-card-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Мои квизы
            </button>
            {isOrganizer && (
              <button
                onClick={() => setActiveTab("created")}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition ${
                  activeTab === "created"
                    ? "bg-card text-card-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Созданные
              </button>
            )}
          </div>
        </div>

        {/* ── Tab content ── */}
        {activeTab === "overview" && (
          <div className="bg-card rounded-2xl border border-border p-6 shadow-[0_2px_16px_rgba(0,0,0,0.05)]">
            <h3 className="text-sm font-semibold text-card-foreground mb-4">
              Последние активности
            </h3>
            <div className="divide-y divide-border">
              {RECENT_QUIZZES.slice(0, 3).map((quiz) => (
                <QuizHistoryItem key={quiz.id} quiz={quiz} />
              ))}
            </div>
            <button
              onClick={() => setActiveTab("history")}
              className="mt-4 text-sm font-medium hover:underline transition"
              style={{ color: ACCENT }}
            >
              Показать все →
            </button>
          </div>
        )}

        {activeTab === "history" && (
          <div className="bg-card rounded-2xl border border-border p-6 shadow-[0_2px_16px_rgba(0,0,0,0.05)]">
            <h3 className="text-sm font-semibold text-card-foreground mb-4">
              История участия
            </h3>
            {participatedQuizzes.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">
                Вы ещё не участвовали в квизах
              </p>
            ) : (
              <div>
                {participatedQuizzes.map((quiz) => (
                  <QuizHistoryItem key={quiz.id} quiz={quiz} />
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === "created" && isOrganizer && (
          <div className="bg-card rounded-2xl border border-border p-6 shadow-[0_2px_16px_rgba(0,0,0,0.05)]">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-card-foreground">
                Созданные квизы
              </h3>
              <Link
                to="/quiz/create"
                className="text-sm font-medium hover:underline transition"
                style={{ color: ACCENT }}
              >
                + Создать новый
              </Link>
            </div>
            {createdQuizzes.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">
                Вы ещё не создали ни одного квиза
              </p>
            ) : (
              <div>
                {createdQuizzes.map((quiz) => (
                  <QuizHistoryItem key={quiz.id} quiz={quiz} />
                ))}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}