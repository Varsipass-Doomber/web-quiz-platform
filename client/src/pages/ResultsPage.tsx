import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Zap,
  Trophy,
  BarChart3,
  Home,
  ChevronRight,
} from "lucide-react";

const ACCENT = "#0d9488";
const ACCENT_HOVER = "#0f766e";

// ─── Mock data ──────────────────────────────────────────────────────────────

interface LeaderboardEntry {
  id: string;
  name: string;
  avatar: string;
  score: number;
  correctAnswers: number;
  wrongAnswers: number;
  totalQuestions: number;
  timeSpent: number; // секунды
}

const MOCK_LEADERBOARD: LeaderboardEntry[] = [
  {
    id: "p1",
    name: "maria_ivanova",
    avatar: "МИ",
    score: 350,
    correctAnswers: 5,
    wrongAnswers: 1,
    totalQuestions: 6,
    timeSpent: 45,
  },
  {
    id: "p2",
    name: "ivan_petrov",
    avatar: "ИП",
    score: 300,
    correctAnswers: 4,
    wrongAnswers: 2,
    totalQuestions: 6,
    timeSpent: 50,
  },
  {
    id: "p3",
    name: "olga_smirnova",
    avatar: "ОС",
    score: 250,
    correctAnswers: 3,
    wrongAnswers: 1,
    totalQuestions: 6,
    timeSpent: 38,
  },
  {
    id: "p4",
    name: "dev_alex",
    avatar: "DA",
    score: 200,
    correctAnswers: 2,
    wrongAnswers: 2,
    totalQuestions: 6,
    timeSpent: 42,
  },
  {
    id: "p5",
    name: "kate_morozova",
    avatar: "KM",
    score: 150,
    correctAnswers: 2,
    wrongAnswers: 4,
    totalQuestions: 6,
    timeSpent: 55,
  },
  {
    id: "p6",
    name: "sergey_volkov",
    avatar: "СВ",
    score: 100,
    correctAnswers: 1,
    wrongAnswers: 3,
    totalQuestions: 6,
    timeSpent: 30,
  },
];

const QUIZ_TITLE = "Великие открытия XX века";
const TOTAL_QUESTIONS = 6;

// ─── Helper components ──────────────────────────────────────────────────────

function getMedal(index: number): { emoji: string; color: string } {
  if (index === 0) return { emoji: "🥇", color: "#fbbf24" };
  if (index === 1) return { emoji: "🥈", color: "#9ca3af" };
  if (index === 2) return { emoji: "🥉", color: "#d97706" };
  return { emoji: "", color: "transparent" };
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return m > 0 ? `${m}м ${s}с` : `${s}с`;
}

// ─── Page ──────────────────────────────────────────────────────────────────

export function ResultsPage() {
  const [leaderboard] = useState(MOCK_LEADERBOARD);
  const [quizTitle] = useState(QUIZ_TITLE);

  // Сортировка по убыванию баллов (уже отсортированы)
  const sorted = [...leaderboard].sort((a, b) => b.score - a.score);

  // Статистика
  const totalParticipants = sorted.length;
  const averageScore = Math.round(
    sorted.reduce((sum, p) => sum + p.score, 0) / totalParticipants
  );
  const maxScore = sorted.length > 0 ? sorted[0].score : 0;
  const totalCorrect = sorted.reduce((sum, p) => sum + p.correctAnswers, 0);
  const totalWrong = sorted.reduce((sum, p) => sum + p.wrongAnswers, 0);

  const currentUser = sorted[0]; // для демонстрации (первый участник)

  return (
    <div
      className="min-h-screen bg-background"
      style={{ fontFamily: "'Inter', sans-serif" }}
    >
      {/* ── Header ── */}
      <header className="bg-card border-b border-border sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              to="/home"
              className="text-muted-foreground hover:text-foreground transition p-1.5 rounded-lg hover:bg-muted"
              aria-label="На главную"
            >
              <Zap className="w-4 h-4" />
            </Link>
            <div className="flex items-center gap-2">
              <div
                className="w-7 h-7 rounded-lg flex items-center justify-center"
                style={{ background: ACCENT }}
              >
                <Zap className="w-3.5 h-3.5 text-white" />
              </div>
              <span className="text-base font-semibold text-foreground hidden sm:block">
                QuizSpace
              </span>
            </div>
            <span className="text-muted-foreground text-sm hidden sm:block">/</span>
            <span className="text-sm font-medium text-foreground hidden sm:block">
              Результаты
            </span>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        {/* ── Header info ── */}
        <div className="text-center mb-8">
          <div
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium mb-4"
            style={{ background: `${ACCENT}15`, color: ACCENT }}
          >
            <Trophy className="w-4 h-4" />
            Квиз завершён!
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-card-foreground">
            {quizTitle}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {totalParticipants} участников · {TOTAL_QUESTIONS} вопросов
          </p>
        </div>

        {/* ── Stats grid ── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          <div className="bg-card rounded-2xl border border-border p-4 text-center">
            <p className="text-2xl font-bold text-card-foreground">
              {totalParticipants}
            </p>
            <p className="text-xs text-muted-foreground">Участников</p>
          </div>
          <div className="bg-card rounded-2xl border border-border p-4 text-center">
            <p className="text-2xl font-bold text-card-foreground">
              {averageScore}
            </p>
            <p className="text-xs text-muted-foreground">Средний балл</p>
          </div>
          <div className="bg-card rounded-2xl border border-border p-4 text-center">
            <p className="text-2xl font-bold text-card-foreground">
              {maxScore}
            </p>
            <p className="text-xs text-muted-foreground">Максимальный балл</p>
          </div>
          <div className="bg-card rounded-2xl border border-border p-4 text-center">
            <p className="text-2xl font-bold text-card-foreground">
              {Math.round((totalCorrect / (totalCorrect + totalWrong)) * 100)}%
            </p>
            <p className="text-xs text-muted-foreground">Общая точность</p>
          </div>
        </div>

        {/* ── Leaderboard table ── */}
        <div className="bg-card rounded-2xl border border-border shadow-[0_2px_16px_rgba(0,0,0,0.05)] overflow-hidden">
          <div className="px-6 py-4 border-b border-border flex items-center justify-between">
            <h2 className="text-sm font-semibold text-card-foreground flex items-center gap-2">
              <Trophy className="w-4 h-4" style={{ color: ACCENT }} />
              Лидерборд
            </h2>
            <span className="text-xs text-muted-foreground">
              {totalParticipants} участников
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/30 text-muted-foreground text-xs uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-3 text-left font-medium">Место</th>
                  <th className="px-6 py-3 text-left font-medium">Участник</th>
                  <th className="px-6 py-3 text-center font-medium">Правильно</th>
                  <th className="px-6 py-3 text-center font-medium">Баллы</th>
                  <th className="px-6 py-3 text-center font-medium">Время</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {sorted.map((entry, index) => {
                  const medal = getMedal(index);
                  const isCurrentUser = entry.id === currentUser.id;

                  return (
                    <tr
                      key={entry.id}
                      className={`hover:bg-muted/20 transition ${
                        isCurrentUser
                          ? "bg-[#0d9488]/5 border-l-4 border-[#0d9488]"
                          : ""
                      }`}
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          {index < 3 ? (
                            <span className="text-xl">{medal.emoji}</span>
                          ) : (
                            <span className="text-sm font-medium text-muted-foreground w-6 text-center">
                              {index + 1}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div
                            className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-semibold flex-shrink-0"
                            style={{ background: ACCENT }}
                          >
                            {entry.avatar}
                          </div>
                          <span className="font-medium text-card-foreground">
                            {entry.name}
                          </span>
                          {isCurrentUser && (
                            <span
                              className="text-[10px] font-medium px-2 py-0.5 rounded-full"
                              style={{ background: `${ACCENT}15`, color: ACCENT }}
                            >
                              Вы
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="font-medium text-card-foreground">
                          {entry.correctAnswers}
                        </span>
                        <span className="text-muted-foreground">
                          /{entry.totalQuestions}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="font-bold" style={{ color: ACCENT }}>
                          {entry.score}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center text-muted-foreground">
                        {formatTime(entry.timeSpent)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* ── Actions ── */}
        <div className="flex flex-wrap items-center justify-center gap-3 mt-8">
          <Link
            to="/home"
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-medium border border-border text-muted-foreground hover:text-foreground hover:bg-muted transition"
          >
            <Home className="w-4 h-4" />
            На главную
          </Link>
          <Link
            to="/profile"
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-medium text-white transition"
            style={{ background: ACCENT }}
            onMouseEnter={(e) => (e.currentTarget.style.background = ACCENT_HOVER)}
            onMouseLeave={(e) => (e.currentTarget.style.background = ACCENT)}
          >
            <BarChart3 className="w-4 h-4" />
            Моя статистика
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      </main>
    </div>
  );
}