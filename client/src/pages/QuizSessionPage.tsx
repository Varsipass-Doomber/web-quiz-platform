import { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import {
  Zap,
  ArrowLeft,
  CheckCircle2,
  XCircle,
  Users,
  Timer,
  Send,
  ChevronRight,
} from "lucide-react";

const ACCENT = "#0d9488";
const ACCENT_HOVER = "#0f766e";
const DANGER = "#e05a5a";

// ─── Demo config ──────────────────────────────────────────────────────────────
const CURRENT_ROLE: "organizer" | "participant" = "participant";

// ─── Mock data ────────────────────────────────────────────────────────────────

interface Answer {
  id: string;
  text: string;
}

interface Question {
  id: string;
  text: string;
  type: "single" | "multiple" | "truefalse";
  options: Answer[];
  correctAnswer: string | string[];
  image?: string;
}

interface Participant {
  id: string;
  name: string;
  avatar: string;
  score: number;
  hasAnswered: boolean;
  isCorrect?: boolean;
}

const MOCK_QUESTIONS: Question[] = [
  {
    id: "q1",
    text: "Какое открытие считается самым важным в XX веке?",
    type: "single",
    options: [
      { id: "a", text: "Открытие ДНК" },
      { id: "b", text: "Теория относительности" },
      { id: "c", text: "Квантовая механика" },
      { id: "d", text: "Компьютер" },
    ],
    correctAnswer: "b",
  },
  {
    id: "q2",
    text: "Какие из перечисленных стран являются членами ООН? (выберите все)",
    type: "multiple",
    options: [
      { id: "a", text: "Россия" },
      { id: "b", text: "Швейцария" },
      { id: "c", text: "Ватикан" },
      { id: "d", text: "Тайвань" },
    ],
    correctAnswer: ["a", "b"],
  },
  {
    id: "q3",
    text: "Земля вращается вокруг Солнца.",
    type: "truefalse",
    options: [
      { id: "true", text: "Верно" },
      { id: "false", text: "Неверно" },
    ],
    correctAnswer: "true",
  },
];

const INITIAL_PARTICIPANTS: Participant[] = [
  { id: "p1", name: "maria_ivanova", avatar: "МИ", score: 0, hasAnswered: false },
  { id: "p2", name: "ivan_petrov", avatar: "ИП", score: 0, hasAnswered: false },
  { id: "p3", name: "olga_smirnova", avatar: "ОС", score: 0, hasAnswered: false },
];

// ─── Helper components ──────────────────────────────────────────────────────

function TimerDisplay({ seconds, isActive }: { seconds: number; isActive: boolean }) {
  const color = seconds <= 5 ? DANGER : ACCENT;
  return (
    <div className="flex items-center gap-2 text-sm font-mono">
      <Timer className={`w-4 h-4 ${!isActive ? "opacity-40" : ""}`} style={{ color }} />
      <span style={{ color }}>{seconds}s</span>
    </div>
  );
}

function ParticipantStatus({ p }: { p: Participant }) {
  return (
    <div className="flex items-center justify-between py-2 px-3 rounded-xl bg-muted/40">
      <div className="flex items-center gap-2">
        <div
          className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-semibold"
          style={{ background: ACCENT }}
        >
          {p.avatar}
        </div>
        <span className="text-sm font-medium text-card-foreground">{p.name}</span>
      </div>
      <div className="flex items-center gap-2">
        {p.hasAnswered && (
          p.isCorrect !== undefined ? (
            p.isCorrect ? (
              <CheckCircle2 className="w-4 h-4 text-green-500" />
            ) : (
              <XCircle className="w-4 h-4 text-red-500" />
            )
          ) : (
            <CheckCircle2 className="w-4 h-4 text-muted-foreground/40" />
          )
        )}
        <span className="text-sm font-semibold text-card-foreground">{p.score}</span>
      </div>
    </div>
  );
}

// ─── Main page ──────────────────────────────────────────────────────────────

export function QuizSessionPage() {
  useParams<{ quizId: string }>();

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [questions] = useState<Question[]>(MOCK_QUESTIONS);
  const [selectedAnswers, setSelectedAnswers] = useState<string[]>([]);
  const [isAnswered, setIsAnswered] = useState(false);
  const [timeLeft, setTimeLeft] = useState(30);
  const [isTimerActive, setIsTimerActive] = useState(true);
  const [participants, setParticipants] = useState<Participant[]>(INITIAL_PARTICIPANTS);
  const [myScore, setMyScore] = useState(0);
  const [showResults, setShowResults] = useState(false);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);

  const currentQuestion = questions[currentQuestionIndex];
  const totalQuestions = questions.length;
  const isOrganizer = CURRENT_ROLE === "organizer";

  // ── Handlers ──
  const handleSelectAnswer = (optionId: string) => {
    if (isAnswered) return;
    // Разрешаем выбор даже если таймер истёк, но только для последнего вопроса?
    // Лучше разрешить всегда, если пользователь не ответил.
    if (currentQuestion.type === "single") {
      setSelectedAnswers([optionId]);
    } else if (currentQuestion.type === "multiple") {
      setSelectedAnswers((prev) =>
        prev.includes(optionId) ? prev.filter((id) => id !== optionId) : [...prev, optionId]
      );
    }
  };

  const handleSubmitAnswer = (timeout = false) => {
    if (isAnswered) return;
    setIsAnswered(true);
    setIsTimerActive(false);

    if (timeout) {
      setIsCorrect(false);
      return;
    }

    let correct = false;
    if (currentQuestion.type === "single" || currentQuestion.type === "truefalse") {
      correct = selectedAnswers[0] === currentQuestion.correctAnswer;
    } else if (currentQuestion.type === "multiple") {
      const sortedSelected = [...selectedAnswers].sort();
      const sortedCorrect = [...(currentQuestion.correctAnswer as string[])].sort();
      correct = JSON.stringify(sortedSelected) === JSON.stringify(sortedCorrect);
    }

    setIsCorrect(correct);
    if (correct) {
      setMyScore((prev) => prev + 1);
    }
  };

  const goToNextQuestion = () => {
    if (currentQuestionIndex < totalQuestions - 1) {
      setCurrentQuestionIndex((i) => i + 1);
      setSelectedAnswers([]);
      setIsAnswered(false);
      setIsTimerActive(true);
      setTimeLeft(30);
      setIsCorrect(null);
      if (isOrganizer) {
        setParticipants((prev) => prev.map((p) => ({ ...p, hasAnswered: false, isCorrect: undefined })));
      }
    } else {
      setShowResults(true);
    }
  };

  const finishQuiz = () => {
    setShowResults(true);
  };

  // ── Timer effect ──
  useEffect(() => {
    if (!isTimerActive || isAnswered) return;
    const timer = setTimeout(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);
    return () => clearTimeout(timer);
  }, [timeLeft, isTimerActive, isAnswered]);

  // ── Timeout effect ──
  useEffect(() => {
    if (timeLeft === 0 && !isAnswered) {
      const timeoutId = setTimeout(() => {
        setIsAnswered(true);
        setIsTimerActive(false);
        setIsCorrect(false);
      }, 0);
      return () => clearTimeout(timeoutId);
    }
  }, [timeLeft, isAnswered]);

  // ── Render ──
  if (showResults) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4" style={{ fontFamily: "'Inter', sans-serif" }}>
        <div className="bg-card rounded-2xl shadow-[0_4px_32px_rgba(0,0,0,0.08)] p-10 w-full max-w-md text-center">
          <h2 className="text-2xl font-semibold text-card-foreground mb-2">Квиз завершён!</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Ваш счёт: {myScore} из {totalQuestions}
          </p>
          <Link to="/home" className="inline-block px-6 py-3 rounded-xl text-white text-sm font-medium" style={{ background: ACCENT }}>
            На главную
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background" style={{ fontFamily: "'Inter', sans-serif" }}>
      {/* Header */}
      <header className="bg-card border-b border-border sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to="/home" className="text-muted-foreground hover:text-foreground transition p-1.5 rounded-lg hover:bg-muted">
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: ACCENT }}>
                <Zap className="w-3.5 h-3.5 text-white" />
              </div>
              <span className="text-base font-semibold text-foreground hidden sm:block">QuizSpace</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-sm text-muted-foreground flex items-center gap-2">
              <Users className="w-4 h-4" />
              <span>{participants.length}</span>
            </div>
            <div className="text-sm font-semibold text-card-foreground">
              Счёт: {myScore}
            </div>
            <TimerDisplay seconds={timeLeft} isActive={isTimerActive && !isAnswered} />
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-card rounded-2xl border border-border p-6 shadow-[0_2px_16px_rgba(0,0,0,0.05)]">
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-medium text-muted-foreground">
                  Вопрос {currentQuestionIndex + 1} из {totalQuestions}
                </span>
                {isOrganizer && (
                  <span className="text-xs font-medium px-2 py-1 rounded-full" style={{ background: `${ACCENT}15`, color: ACCENT }}>
                    Организатор
                  </span>
                )}
              </div>

              <h2 className="text-xl font-semibold text-card-foreground mb-4">{currentQuestion.text}</h2>
              {currentQuestion.image && (
                <img src={currentQuestion.image} alt="Иллюстрация" className="rounded-xl max-h-48 w-auto object-contain mb-4" />
              )}

              {/* Вопросы с множественным выбором — подсказка */}
              {currentQuestion.type === "multiple" && (
                <p className="text-sm text-muted-foreground mb-3 flex items-center gap-2">
                  <span className="inline-block w-2 h-2 rounded-full bg-[#0d9488]" />
                  Выберите все подходящие варианты
                </p>
              )}

              <div className="space-y-2">
                {currentQuestion.options.map((opt) => {
                  const isSelected = selectedAnswers.includes(opt.id);
                  let isCorrectOption = false;
                  if (isAnswered && currentQuestion.type === "single") {
                    isCorrectOption = opt.id === currentQuestion.correctAnswer;
                  } else if (isAnswered && currentQuestion.type === "multiple") {
                    isCorrectOption = (currentQuestion.correctAnswer as string[]).includes(opt.id);
                  }
                  const isWrongSelected = isSelected && isAnswered && !isCorrectOption;

                  return (
                    <button
                      key={opt.id}
                      onClick={() => handleSelectAnswer(opt.id)}
                      disabled={isAnswered}
                      className={`w-full text-left px-4 py-3 rounded-xl border transition-all flex items-center gap-3 ${
                        isSelected && !isAnswered ? "border-[#0d9488] bg-[#0d9488]/10" : "border-border"
                      } ${
                        isAnswered && isCorrectOption ? "border-green-500 bg-green-50 dark:bg-green-900/20" : ""
                      } ${
                        isAnswered && isWrongSelected ? "border-red-500 bg-red-50 dark:bg-red-900/20" : ""
                      } ${
                        isAnswered && !isSelected && !isCorrectOption ? "opacity-60" : ""
                      } disabled:cursor-not-allowed`}
                    >
                      {/* Визуальный индикатор */}
                      <span className="flex-shrink-0">
                        {currentQuestion.type === "multiple" ? (
                          <span className={`w-5 h-5 border-2 rounded flex items-center justify-center transition-colors ${
                            isSelected ? 'border-[#0d9488] bg-[#0d9488]' : 'border-gray-300'
                          }`}>
                            {isSelected && <CheckCircle2 className="w-4 h-4 text-white" />}
                          </span>
                        ) : (
                          <span className={`w-5 h-5 border-2 rounded-full flex items-center justify-center transition-colors ${
                            isSelected ? 'border-[#0d9488]' : 'border-gray-300'
                          }`}>
                            {isSelected && <span className="w-2.5 h-2.5 rounded-full bg-[#0d9488]" />}
                          </span>
                        )}
                      </span>
                      <span className="text-sm text-foreground flex-1">{opt.text}</span>
                      {isAnswered && isCorrectOption && <CheckCircle2 className="w-4 h-4 text-green-500" />}
                      {isAnswered && isWrongSelected && <XCircle className="w-4 h-4 text-red-500" />}
                    </button>
                  );
                })}
              </div>

              {/* Отображение результата */}
              {isAnswered && isCorrect !== null && (
                <div className="mt-4 flex items-center gap-2">
                  <div className={`flex items-center gap-1.5 text-sm font-medium ${isCorrect ? 'text-green-600' : 'text-red-500'}`}>
                    {isCorrect ? <CheckCircle2 className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
                    {isCorrect ? 'Правильно!' : 'Неправильно'}
                  </div>
                </div>
              )}

              <div className="flex justify-end mt-6 gap-3">
                {!isAnswered && (
                  <button
                    onClick={() => handleSubmitAnswer(false)}
                    disabled={selectedAnswers.length === 0}
                    className="px-6 py-2 rounded-xl text-sm font-medium text-white transition disabled:opacity-40 disabled:cursor-not-allowed"
                    style={{ background: ACCENT }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = ACCENT_HOVER)}
                    onMouseLeave={(e) => (e.currentTarget.style.background = ACCENT)}
                  >
                    <Send className="w-4 h-4 inline mr-1.5" />
                    Ответить
                  </button>
                )}
                {isAnswered && (
                  <button
                    onClick={goToNextQuestion}
                    className="px-6 py-2 rounded-xl text-sm font-medium text-white transition"
                    style={{ background: ACCENT }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = ACCENT_HOVER)}
                    onMouseLeave={(e) => (e.currentTarget.style.background = ACCENT)}
                  >
                    {currentQuestionIndex < totalQuestions - 1 ? "Следующий вопрос" : "Завершить"}
                    <ChevronRight className="w-4 h-4 inline ml-1.5" />
                  </button>
                )}
              </div>
            </div>

            {isOrganizer && (
              <div className="flex justify-end">
                <button
                  onClick={finishQuiz}
                  className="px-6 py-2.5 rounded-xl text-sm font-medium text-white transition bg-red-500 hover:bg-red-600"
                >
                  Завершить квиз досрочно
                </button>
              </div>
            )}
          </div>

          {isOrganizer && (
            <div className="lg:col-span-1">
              <div className="bg-card rounded-2xl border border-border p-4 shadow-[0_2px_16px_rgba(0,0,0,0.05)]">
                <h3 className="text-sm font-semibold text-card-foreground mb-4 flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  Участники ({participants.length})
                </h3>
                <div className="space-y-1">
                  {participants.map((p) => (
                    <ParticipantStatus key={p.id} p={p} />
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}