import { useState, useEffect, useCallback } from "react";
import { Link, useParams } from "react-router-dom";
import {
  Zap,
  ArrowLeft,
  Plus,
  Pencil,
  Trash2,
  X,
  CheckCircle2,
  Circle,
  ChevronDown,
  ToggleLeft,
  ToggleRight,
  GripVertical,
  AlertCircle,
} from "lucide-react";

const ACCENT = "#0d9488";
const ACCENT_HOVER = "#0f766e";
const FIELD_BG = "#f2f8f7";
const DANGER = "#e05a5a";

// ─── Types ────────────────────────────────────────────────────────────────────

type QuestionType = "single" | "multiple" | "truefalse";

interface Answer {
  id: string;
  text: string;
  correct: boolean;
}

interface Question {
  id: string;
  text: string;
  type: QuestionType;
  answers: Answer[];
}

interface QuizForm {
  title: string;
  description: string;
  category: string;
  timePerQuestion: number;
  isPublic: boolean;
  maxParticipants: number;
}

interface QuizFormErrors {
  title?: string;
  category?: string;
  timePerQuestion?: string;
}

const CATEGORIES = [
  "Общие знания",
  "Наука",
  "История",
  "География",
  "Искусство",
  "Спорт",
  "Кино и ТВ",
  "Музыка",
  "Еда",
  "Технологии",
];

const QUESTION_TYPE_LABELS: Record<QuestionType, string> = {
  single: "Один ответ",
  multiple: "Несколько ответов",
  truefalse: "Верно / Неверно",
};

const uid = () => Math.random().toString(36).slice(2, 9);

const DEFAULT_ANSWERS: Answer[] = [
  { id: uid(), text: "", correct: false },
  { id: uid(), text: "", correct: false },
  { id: uid(), text: "", correct: false },
  { id: uid(), text: "", correct: false },
];

const TF_ANSWERS: Answer[] = [
  { id: uid(), text: "Верно", correct: true },
  { id: uid(), text: "Неверно", correct: false },
];

// ─── Question Modal ───────────────────────────────────────────────────────────

function QuestionModal({
  initial,
  onSave,
  onClose,
}: {
  initial: Question | null;
  onSave: (q: Question) => void;
  onClose: () => void;
}) {
  const [text, setText] = useState(initial?.text ?? "");
  const [type, setType] = useState<QuestionType>(initial?.type ?? "single");
  const [answers, setAnswers] = useState<Answer[]>(
    initial?.answers ?? DEFAULT_ANSWERS.map((a) => ({ ...a, id: uid() }))
  );
  const [errors, setErrors] = useState<{ text?: string; answers?: string }>({});

  const changeType = (t: QuestionType) => {
    setType(t);
    if (t === "truefalse") {
      setAnswers(TF_ANSWERS.map((a) => ({ ...a, id: uid() })));
    } else {
      setAnswers(DEFAULT_ANSWERS.map((a) => ({ ...a, id: uid() })));
    }
  };

  const toggleCorrect = (id: string) => {
    setAnswers((prev) =>
      prev.map((a) => {
        if (type === "single") {
          return { ...a, correct: a.id === id };
        }
        return a.id === id ? { ...a, correct: !a.correct } : a;
      })
    );
  };

  const updateAnswerText = (id: string, val: string) =>
    setAnswers((prev) => prev.map((a) => (a.id === id ? { ...a, text: val } : a)));

  const addAnswer = () =>
    setAnswers((prev) => [...prev, { id: uid(), text: "", correct: false }]);

  const removeAnswer = (id: string) =>
    setAnswers((prev) => prev.filter((a) => a.id !== id));

  const validate = () => {
    const e: typeof errors = {};
    if (!text.trim()) e.text = "Текст вопроса обязателен";
    const filled = answers.filter((a) => a.text.trim());
    if (filled.length < 2) e.answers = "Добавьте хотя бы 2 варианта ответа";
    else if (!answers.some((a) => a.correct)) e.answers = "Отметьте хотя бы один правильный ответ";
    return e;
  };

  const handleSave = () => {
    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length) return;
    onSave({
      id: initial?.id ?? uid(),
      text: text.trim(),
      type,
      answers: answers.filter((a) => a.text.trim()),
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-foreground/20 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="relative bg-card rounded-2xl shadow-[0_8px_48px_rgba(0,0,0,0.18)] w-full max-w-lg max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border sticky top-0 bg-card z-10">
          <h3 className="text-base font-semibold text-card-foreground">
            {initial ? "Редактировать вопрос" : "Новый вопрос"}
          </h3>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground transition p-1 rounded-lg hover:bg-muted"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="px-6 py-5 space-y-5">
          {/* Question text */}
          <div>
            <label className="block text-sm font-medium text-card-foreground mb-1.5">
              Текст вопроса
            </label>
            <textarea
              rows={2}
              placeholder="Введите вопрос..."
              value={text}
              onChange={(e) => {
                setText(e.target.value);
                setErrors((p) => ({ ...p, text: undefined }));
              }}
              className={`w-full px-4 py-2.5 rounded-xl border text-sm text-foreground placeholder:text-muted-foreground outline-none resize-none transition focus:ring-2 focus:ring-[#0d9488]/25 focus:border-[#0d9488] ${
                errors.text ? "border-destructive" : "border-border"
              }`}
              style={{ background: FIELD_BG }}
            />
            {errors.text && (
              <p className="text-xs text-destructive mt-1">{errors.text}</p>
            )}
          </div>

          {/* Type selector */}
          <div>
            <label className="block text-sm font-medium text-card-foreground mb-2">
              Тип вопроса
            </label>
            <div className="flex gap-2 flex-wrap">
              {(["single", "multiple", "truefalse"] as QuestionType[]).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => changeType(t)}
                  className="px-3 py-1.5 rounded-xl text-xs font-medium border transition-all"
                  style={
                    type === t
                      ? { background: ACCENT, color: "#fff", borderColor: ACCENT }
                      : { background: FIELD_BG, color: "var(--muted-foreground)", borderColor: "var(--border)" }
                  }
                >
                  {QUESTION_TYPE_LABELS[t]}
                </button>
              ))}
            </div>
          </div>

          {/* Answers */}
          <div>
            <label className="block text-sm font-medium text-card-foreground mb-2">
              Варианты ответа
              <span className="text-xs font-normal text-muted-foreground ml-1.5">
                {type === "single" ? "(выберите один правильный)" : type === "multiple" ? "(выберите все правильные)" : ""}
              </span>
            </label>
            <div className="space-y-2">
              {answers.map((answer, idx) => (
                <div key={answer.id} className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => toggleCorrect(answer.id)}
                    className="flex-shrink-0 transition-colors"
                    style={{ color: answer.correct ? ACCENT : "var(--muted-foreground)" }}
                    aria-label="Правильный ответ"
                  >
                    {answer.correct ? (
                      <CheckCircle2 className="w-5 h-5" />
                    ) : (
                      <Circle className="w-5 h-5" />
                    )}
                  </button>
                  <input
                    type="text"
                    placeholder={`Вариант ${idx + 1}`}
                    value={answer.text}
                    disabled={type === "truefalse"}
                    onChange={(e) => updateAnswerText(answer.id, e.target.value)}
                    className="flex-1 px-3 py-2 rounded-xl border border-border text-sm text-foreground placeholder:text-muted-foreground outline-none transition focus:ring-2 focus:ring-[#0d9488]/25 focus:border-[#0d9488] disabled:opacity-60 disabled:cursor-not-allowed"
                    style={{ background: FIELD_BG }}
                  />
                  {type !== "truefalse" && answers.length > 2 && (
                    <button
                      type="button"
                      onClick={() => removeAnswer(answer.id)}
                      className="flex-shrink-0 text-muted-foreground hover:text-destructive transition p-1"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
            {errors.answers && (
              <p className="text-xs text-destructive mt-1.5 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" />
                {errors.answers}
              </p>
            )}
            {type !== "truefalse" && answers.length < 6 && (
              <button
                type="button"
                onClick={addAnswer}
                className="mt-2 text-xs font-medium flex items-center gap-1 hover:underline transition"
                style={{ color: ACCENT }}
              >
                <Plus className="w-3.5 h-3.5" />
                Добавить вариант
              </button>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-border flex justify-end gap-2 sticky bottom-0 bg-card">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition"
          >
            Отмена
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="px-5 py-2 rounded-xl text-sm font-medium text-white transition-all active:scale-[0.97]"
            style={{ background: ACCENT }}
            onMouseEnter={(e) => (e.currentTarget.style.background = ACCENT_HOVER)}
            onMouseLeave={(e) => (e.currentTarget.style.background = ACCENT)}
          >
            Сохранить вопрос
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export function CreateQuizPage() {
  const { quizId } = useParams<{ quizId: string }>();
  const [isLoading, setIsLoading] = useState(false);
  const isEditMode = !!quizId; // вычисляем режим без отдельного состояния

  const [form, setForm] = useState<QuizForm>({
    title: "",
    description: "",
    category: "",
    timePerQuestion: 30,
    isPublic: true,
    maxParticipants: 0,
  });
  const [formErrors, setFormErrors] = useState<QuizFormErrors>({});
  const [questions, setQuestions] = useState<Question[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [published, setPublished] = useState(false);

  // ── Загрузка квиза ──
  const loadQuiz = useCallback(async (id: string) => {
    setIsLoading(true);
    try {
      console.log(`Загружаем квиз с ID: ${id}`); // используем id
      // TODO: заменить на реальный запрос к серверу
      const mockQuiz = {
        title: "Тестовый квиз",
        description: "Описание тестового квиза",
        category: "Наука",
        timePerQuestion: 30,
        isPublic: true,
        maxParticipants: 10,
        questions: [
          {
            id: "q1",
            text: "Первый вопрос?",
            type: "single" as QuestionType,
            answers: [
              { id: "a", text: "Ответ 1", correct: true },
              { id: "b", text: "Ответ 2", correct: false },
            ],
          },
          {
            id: "q2",
            text: "Второй вопрос?",
            type: "multiple" as QuestionType,
            answers: [
              { id: "c", text: "Вариант 1", correct: true },
              { id: "d", text: "Вариант 2", correct: true },
              { id: "e", text: "Вариант 3", correct: false },
            ],
          },
        ],
      };

      setForm({
        title: mockQuiz.title,
        description: mockQuiz.description,
        category: mockQuiz.category,
        timePerQuestion: mockQuiz.timePerQuestion,
        isPublic: mockQuiz.isPublic,
        maxParticipants: mockQuiz.maxParticipants,
      });
      setQuestions(mockQuiz.questions);
    } catch (error) {
      console.error("Ошибка загрузки квиза:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // ── Эффект для загрузки при монтировании ──
  useEffect(() => {
    if (quizId) {
      loadQuiz(quizId);
    }
    // Если quizId нет, ничего не делаем — форма пустая
  }, [quizId, loadQuiz]);

  const setField = <K extends keyof QuizForm>(key: K, val: QuizForm[K]) => {
    setForm((f) => ({ ...f, [key]: val }));
    if (formErrors[key as keyof QuizFormErrors])
      setFormErrors((e) => ({ ...e, [key]: undefined }));
  };

  const validateForm = (): QuizFormErrors => {
    const e: QuizFormErrors = {};
    if (!form.title.trim()) e.title = "Название обязательно";
    if (!form.category) e.category = "Выберите категорию";
    if (form.timePerQuestion < 5 || form.timePerQuestion > 300)
      e.timePerQuestion = "От 5 до 300 секунд";
    return e;
  };

  const handlePublish = () => {
    const errs = validateForm();
    setFormErrors(errs);
    if (Object.keys(errs).length) return;

    if (isEditMode) {
      console.log("Обновляем квиз с ID:", quizId);
      // TODO: PUT /api/quizzes/:quizId
    } else {
      console.log("Создаём новый квиз");
      // TODO: POST /api/quizzes
    }
    setPublished(true);
  };

  const openAdd = () => {
    setEditingQuestion(null);
    setModalOpen(true);
  };

  const openEdit = (q: Question) => {
    setEditingQuestion(q);
    setModalOpen(true);
  };

  const saveQuestion = (q: Question) => {
    setQuestions((prev) => {
      const idx = prev.findIndex((p) => p.id === q.id);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = q;
        return next;
      }
      return [...prev, q];
    });
    setModalOpen(false);
  };

  const deleteQuestion = (id: string) =>
    setQuestions((prev) => prev.filter((q) => q.id !== id));

  // ── Индикатор загрузки ──
  if (isLoading) {
    return (
      <div
        className="min-h-screen bg-background flex items-center justify-center"
        style={{ fontFamily: "'Inter', sans-serif" }}
      >
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-t-[#0d9488] border-gray-200 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-sm text-muted-foreground">Загрузка квиза...</p>
        </div>
      </div>
    );
  }

  if (published) {
    return (
      <div
        className="min-h-screen bg-background flex items-center justify-center px-4"
        style={{ fontFamily: "'Inter', sans-serif" }}
      >
        <div className="bg-card rounded-2xl shadow-[0_4px_32px_rgba(0,0,0,0.08)] p-10 w-full max-w-md text-center">
          <div
            className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-5"
            style={{ background: `${ACCENT}15` }}
          >
            <CheckCircle2 className="w-7 h-7" style={{ color: ACCENT }} />
          </div>
          <h2 className="text-xl font-semibold text-card-foreground mb-2">
            {isEditMode ? "Квиз обновлён!" : "Квиз опубликован!"}
          </h2>
          <p className="text-sm text-muted-foreground mb-1">
            <span className="font-medium text-card-foreground">{form.title}</span>
          </p>
          <p className="text-sm text-muted-foreground">
            {questions.length} {questions.length === 1 ? "вопрос" : questions.length < 5 ? "вопроса" : "вопросов"} · {form.category}
          </p>
          <div className="flex gap-2 justify-center mt-6">
            <button
              onClick={() => setPublished(false)}
              className="px-4 py-2 rounded-xl text-sm font-medium border border-border text-muted-foreground hover:text-foreground hover:bg-muted transition"
            >
              Редактировать
            </button>
            <Link
              to="/home"
              className="px-4 py-2 rounded-xl text-sm font-medium text-white transition"
              style={{ background: ACCENT }}
            >
              На главную
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen bg-background"
      style={{ fontFamily: "'Inter', sans-serif" }}
    >
      {/* ── Header ── */}
      <header className="bg-card border-b border-border sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-4">
          {/* Левая часть */}
          <div className="flex items-center gap-3">
            <Link
              to="/home"
              className="text-muted-foreground hover:text-foreground transition p-1.5 rounded-lg hover:bg-muted"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div className="flex items-center gap-2">
              <div
                className="w-6 h-6 rounded-md flex items-center justify-center"
                style={{ background: ACCENT }}
              >
                <Zap className="w-3 h-3 text-white" />
              </div>
              <span className="text-sm font-semibold text-foreground hidden sm:block">
                QuizSpace
              </span>
            </div>
            <span className="text-muted-foreground text-sm hidden sm:block">/</span>
            <span className="text-sm font-medium text-foreground hidden sm:block">
              {isEditMode ? "Редактирование квиза" : "Создание квиза"}
            </span>
          </div>

          {/* Правая часть — кнопки */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              type="button"
              onClick={() => {
                const errs = validateForm();
                setFormErrors(errs);
              }}
              className="px-4 py-1.5 rounded-xl text-sm font-medium border border-border text-muted-foreground hover:text-foreground hover:bg-muted transition whitespace-nowrap"
            >
              Сохранить черновик
            </button>
            <button
              type="button"
              onClick={handlePublish}
              className="px-4 py-1.5 rounded-xl text-sm font-medium text-white transition-all active:scale-[0.97] whitespace-nowrap"
              style={{ background: ACCENT, boxShadow: "0 2px 10px rgba(13,148,136,0.3)" }}
              onMouseEnter={(e) => (e.currentTarget.style.background = ACCENT_HOVER)}
              onMouseLeave={(e) => (e.currentTarget.style.background = ACCENT)}
            >
              {isEditMode ? "Сохранить изменения" : "Опубликовать"}
            </button>
          </div>
        </div>
      </header>

      {/* ── Main ── */}
      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-8 space-y-5">
        <h1 className="text-2xl font-semibold text-foreground">
          {isEditMode ? "Редактирование квиза" : "Создание нового квиза"}
        </h1>

        {/* ── General settings card ── */}
        <div className="bg-card rounded-2xl shadow-[0_2px_16px_rgba(0,0,0,0.06)] border border-border p-6 space-y-5">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
            Основное
          </h2>

          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-card-foreground mb-1.5" htmlFor="quiz-title">
              Название квиза <span style={{ color: DANGER }}>*</span>
            </label>
            <input
              id="quiz-title"
              type="text"
              placeholder="Например: Великие открытия XX века"
              value={form.title}
              onChange={(e) => setField("title", e.target.value)}
              className={`w-full px-4 py-2.5 rounded-xl border text-sm text-foreground placeholder:text-muted-foreground outline-none transition focus:ring-2 focus:ring-[#0d9488]/25 focus:border-[#0d9488] ${
                formErrors.title ? "border-destructive" : "border-border"
              }`}
              style={{ background: FIELD_BG }}
            />
            {formErrors.title && (
              <p className="text-xs text-destructive mt-1.5">{formErrors.title}</p>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-card-foreground mb-1.5" htmlFor="quiz-desc">
              Описание
              <span className="text-xs font-normal text-muted-foreground ml-1">(необязательно)</span>
            </label>
            <textarea
              id="quiz-desc"
              rows={3}
              placeholder="Расскажите, о чём этот квиз..."
              value={form.description}
              onChange={(e) => setField("description", e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-border text-sm text-foreground placeholder:text-muted-foreground outline-none resize-none transition focus:ring-2 focus:ring-[#0d9488]/25 focus:border-[#0d9488]"
              style={{ background: FIELD_BG }}
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-card-foreground mb-1.5" htmlFor="quiz-category">
              Категория <span style={{ color: DANGER }}>*</span>
            </label>
            <div className="relative">
              <select
                id="quiz-category"
                value={form.category}
                onChange={(e) => setField("category", e.target.value)}
                className={`w-full appearance-none px-4 py-2.5 rounded-xl border text-sm text-foreground outline-none transition focus:ring-2 focus:ring-[#0d9488]/25 focus:border-[#0d9488] cursor-pointer ${
                  formErrors.category ? "border-destructive" : "border-border"
                } ${!form.category ? "text-muted-foreground" : ""}`}
                style={{ background: FIELD_BG }}
              >
                <option value="" disabled>Выберите категорию</option>
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
              <ChevronDown className="w-4 h-4 absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
            </div>
            {formErrors.category && (
              <p className="text-xs text-destructive mt-1.5">{formErrors.category}</p>
            )}
          </div>
        </div>

        {/* ── Settings card ── */}
        <div className="bg-card rounded-2xl shadow-[0_2px_16px_rgba(0,0,0,0.06)] border border-border p-6 space-y-5">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
            Настройки
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {/* Time per question */}
            <div>
              <label className="block text-sm font-medium text-card-foreground mb-1.5" htmlFor="quiz-time">
                Время на вопрос (сек)
              </label>
              <input
                id="quiz-time"
                type="number"
                min={5}
                max={300}
                value={form.timePerQuestion}
                onChange={(e) => setField("timePerQuestion", Number(e.target.value))}
                className={`w-full px-4 py-2.5 rounded-xl border text-sm text-foreground outline-none transition focus:ring-2 focus:ring-[#0d9488]/25 focus:border-[#0d9488] ${
                  formErrors.timePerQuestion ? "border-destructive" : "border-border"
                }`}
                style={{ background: FIELD_BG }}
              />
              {formErrors.timePerQuestion && (
                <p className="text-xs text-destructive mt-1.5">{formErrors.timePerQuestion}</p>
              )}
            </div>

            {/* Max participants */}
            <div>
              <label className="block text-sm font-medium text-card-foreground mb-1.5" htmlFor="quiz-max">
                Макс. участников
                <span className="text-xs font-normal text-muted-foreground ml-1">(0 = без ограничений)</span>
              </label>
              <input
                id="quiz-max"
                type="number"
                min={0}
                value={form.maxParticipants}
                onChange={(e) => setField("maxParticipants", Math.max(0, Number(e.target.value)))}
                className="w-full px-4 py-2.5 rounded-xl border border-border text-sm text-foreground outline-none transition focus:ring-2 focus:ring-[#0d9488]/25 focus:border-[#0d9488]"
                style={{ background: FIELD_BG }}
              />
            </div>
          </div>

          {/* Public toggle */}
          <div className="flex items-center justify-between py-1">
            <div>
              <p className="text-sm font-medium text-card-foreground">Публичный квиз</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {form.isPublic ? "Квиз виден всем пользователям" : "Доступ только по ссылке или коду"}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setField("isPublic", !form.isPublic)}
              className="flex-shrink-0 transition-colors"
              style={{ color: form.isPublic ? ACCENT : "var(--muted-foreground)" }}
              aria-label="Публичный квиз"
            >
              {form.isPublic ? (
                <ToggleRight className="w-8 h-8" />
              ) : (
                <ToggleLeft className="w-8 h-8" />
              )}
            </button>
          </div>
        </div>

        {/* ── Questions card ── */}
        <div className="bg-card rounded-2xl shadow-[0_2px_16px_rgba(0,0,0,0.06)] border border-border overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-border">
            <div>
              <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                Вопросы
              </h2>
              {questions.length > 0 && (
                <p className="text-xs text-muted-foreground mt-0.5">
                  {questions.length} {questions.length === 1 ? "вопрос" : questions.length < 5 ? "вопроса" : "вопросов"}
                </p>
              )}
            </div>
            <button
              type="button"
              onClick={openAdd}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-medium text-white transition-all active:scale-[0.97]"
              style={{ background: ACCENT }}
              onMouseEnter={(e) => (e.currentTarget.style.background = ACCENT_HOVER)}
              onMouseLeave={(e) => (e.currentTarget.style.background = ACCENT)}
            >
              <Plus className="w-4 h-4" />
              Добавить вопрос
            </button>
          </div>

          {questions.length === 0 ? (
            <div className="px-6 py-14 text-center">
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3"
                style={{ background: `${ACCENT}12` }}
              >
                <Plus className="w-5 h-5" style={{ color: ACCENT }} />
              </div>
              <p className="text-sm font-medium text-card-foreground">Вопросов пока нет</p>
              <p className="text-xs text-muted-foreground mt-1 mb-4">
                Добавьте первый вопрос, чтобы начать создание квиза
              </p>
              <button
                type="button"
                onClick={openAdd}
                className="text-sm font-medium hover:underline transition"
                style={{ color: ACCENT }}
              >
                + Добавить вопрос
              </button>
            </div>
          ) : (
            <ul className="divide-y divide-border">
              {questions.map((q, idx) => (
                <li key={q.id} className="flex items-start gap-3 px-6 py-4 group hover:bg-muted/40 transition">
                  <div className="flex items-center gap-2 flex-shrink-0 mt-0.5">
                    <GripVertical className="w-4 h-4 text-muted-foreground/40 cursor-grab" />
                    <span
                      className="w-6 h-6 rounded-full text-xs font-semibold flex items-center justify-center text-white flex-shrink-0"
                      style={{ background: ACCENT }}
                    >
                      {idx + 1}
                    </span>
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-card-foreground truncate">
                      {q.text}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-muted-foreground">
                        {QUESTION_TYPE_LABELS[q.type]}
                      </span>
                      <span className="text-muted-foreground/30 text-xs">·</span>
                      <span className="text-xs text-muted-foreground">
                        {q.answers.length} вариантов
                      </span>
                      <span className="text-muted-foreground/30 text-xs">·</span>
                      <span className="text-xs" style={{ color: ACCENT }}>
                        {q.answers.filter((a) => a.correct).length} правильных
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition flex-shrink-0">
                    <button
                      type="button"
                      onClick={() => openEdit(q)}
                      className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition"
                      aria-label="Редактировать"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => deleteQuestion(q.id)}
                      className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition"
                      aria-label="Удалить"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Bottom publish bar */}
        <div className="flex justify-end gap-2 pb-4">
          <button
            type="button"
            className="px-4 py-2.5 rounded-xl text-sm font-medium border border-border text-muted-foreground hover:text-foreground hover:bg-muted transition"
          >
            Сохранить черновик
          </button>
          <button
            type="button"
            onClick={handlePublish}
            className="px-6 py-2.5 rounded-xl text-sm font-medium text-white transition-all active:scale-[0.97]"
            style={{ background: ACCENT, boxShadow: "0 2px 12px rgba(13,148,136,0.3)" }}
            onMouseEnter={(e) => (e.currentTarget.style.background = ACCENT_HOVER)}
            onMouseLeave={(e) => (e.currentTarget.style.background = ACCENT)}
          >
            {isEditMode ? "Сохранить изменения" : "Опубликовать квиз"}
          </button>
        </div>
      </main>

      {/* Question modal */}
      {modalOpen && (
        <QuestionModal
          initial={editingQuestion}
          onSave={saveQuestion}
          onClose={() => setModalOpen(false)}
        />
      )}
    </div>
  );
}