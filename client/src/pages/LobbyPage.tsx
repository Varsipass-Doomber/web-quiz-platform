import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Zap,
  Copy,
  Check,
  Users,
  PlayCircle,
  Crown,
  FlaskConical,
  Landmark,
  Cpu,
  Music,
  BookOpen,
  Globe,
  Trophy,
  UtensilsCrossed,
  Palette,
} from "lucide-react";

const ACCENT = "#0d9488";
const FIELD_BG = "#f2f8f7";

// ─── Demo config — flip to "participant" to see that view ────────────────────
const CURRENT_ROLE: "organizer" | "participant" = "organizer";

// ─── Types & mock data ────────────────────────────────────────────────────────

interface Participant {
  id: string;
  name: string;
  avatar: string;
  isOrganizer?: boolean;
}

const ROOM_CODE = "QUIZ4F2A";

const QUIZ_INFO = {
  title: "Великие открытия XX века",
  category: "Наука",
};

const INITIAL_PARTICIPANTS: Participant[] = [
  { id: "1", name: "maria_ivanova", avatar: "МИ", isOrganizer: true },
  { id: "2", name: "ivan_petrov", avatar: "ИП" },
  { id: "3", name: "olga_smirnova", avatar: "ОС" },
];

const LATECOMERS: Participant[] = [
  { id: "4", name: "dev_alex", avatar: "DA" },
  { id: "5", name: "kate_morozova", avatar: "KM" },
  { id: "6", name: "sergey_volkov", avatar: "СВ" },
  { id: "7", name: "anna_koroleva", avatar: "АК" },
];

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  Наука: <FlaskConical className="w-3.5 h-3.5" />,
  История: <Landmark className="w-3.5 h-3.5" />,
  Технологии: <Cpu className="w-3.5 h-3.5" />,
  Музыка: <Music className="w-3.5 h-3.5" />,
  Литература: <BookOpen className="w-3.5 h-3.5" />,
  География: <Globe className="w-3.5 h-3.5" />,
  Спорт: <Trophy className="w-3.5 h-3.5" />,
  Еда: <UtensilsCrossed className="w-3.5 h-3.5" />,
  Искусство: <Palette className="w-3.5 h-3.5" />,
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

const AVATAR_PALETTE = [
  "#0d9488", "#7c3aed", "#db2777", "#ea580c",
  "#0284c7", "#16a34a", "#b45309", "#dc2626",
];

function avatarColor(name: string) {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) >>> 0;
  return AVATAR_PALETTE[h % AVATAR_PALETTE.length];
}

// ─── Shared logo with unsaved-changes guard ───────────────────────────────────

function Logo({ isDirty }: { isDirty?: boolean }) {
  const navigate = useNavigate();

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (isDirty) {
      const ok = window.confirm(
        "Вы действительно хотите покинуть страницу? Данные могут быть потеряны."
      );
      if (!ok) return;
    }
    navigate("/home");
  };

  return (
    <a href="/home" onClick={handleClick} className="flex items-center gap-2 group">
      <div
        className="w-7 h-7 rounded-lg flex items-center justify-center transition-opacity group-hover:opacity-85"
        style={{ background: ACCENT }}
      >
        <Zap className="w-3.5 h-3.5 text-white" />
      </div>
      <span className="text-base font-semibold text-foreground tracking-tight hidden sm:block group-hover:opacity-75 transition-opacity">
        QuizSpace
      </span>
    </a>
  );
}

// ─── Waiting animation ────────────────────────────────────────────────────────

function WaitingDots() {
  return (
    <span className="inline-flex items-end gap-[3px] h-4" aria-hidden>
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="w-1.5 h-1.5 rounded-full"
          style={{
            background: ACCENT,
            animation: `lobby-dot-bounce 1.2s ease-in-out ${i * 0.2}s infinite`,
          }}
        />
      ))}
    </span>
  );
}

// ─── Participant card (no organizer, no online dot) ───────────────────────────

function ParticipantCard({ p, isNew }: { p: Participant; isNew: boolean }) {
  const color = avatarColor(p.name);
  return (
    <div
      className="bg-card rounded-2xl border border-border p-4 flex flex-col items-center gap-3 text-center"
      style={{
        boxShadow: "0 2px 12px rgba(0,0,0,0.05)",
        animation: isNew ? "lobby-card-in 0.35s cubic-bezier(0.34,1.56,0.64,1) both" : "none",
      }}
    >
      <div
        className="w-12 h-12 rounded-full flex items-center justify-center text-white text-sm font-semibold select-none"
        style={{ background: color }}
      >
        {p.avatar}
      </div>
      <p className="text-xs font-medium text-card-foreground leading-tight truncate max-w-[88px]">
        {p.name}
      </p>
    </div>
  );
}

// ─── Organizer block ──────────────────────────────────────────────────────────

function OrganizerBlock({ organizer }: { organizer: Participant | undefined }) {
  if (!organizer) {
    return (
      <div
        className="rounded-2xl p-4 flex items-center gap-3"
        style={{ background: "#fef3c718", border: "1px solid #f59e0b40" }}
      >
        <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
          <Crown className="w-4 h-4 text-muted-foreground" />
        </div>
        <p className="text-sm text-muted-foreground">Организатор покинул комнату</p>
      </div>
    );
  }

  const color = avatarColor(organizer.name);
  const isYou = CURRENT_ROLE === "organizer";

  return (
    <div
      className="rounded-2xl px-4 py-3 flex items-center gap-3"
      style={{ background: "#fef3c718", border: "1px solid #f59e0b40" }}
    >
      <div className="relative flex-shrink-0">
        <div
          className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-semibold select-none"
          style={{ background: color }}
        >
          {organizer.avatar}
        </div>
        <div
          className="absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center"
          style={{ background: "#f59e0b" }}
        >
          <Crown className="w-3 h-3 text-white" />
        </div>
      </div>
      <div>
        <p className="text-sm font-medium text-card-foreground">{organizer.name}</p>
        <p className="text-xs text-muted-foreground mt-0.5">
          {isYou ? "Вы — организатор" : "Организатор"}
        </p>
      </div>
    </div>
  );
}

// ─── Copy button with smooth icon transition ──────────────────────────────────

function CopyButton({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);
  const [pressing, setPressing] = useState(false);

  const handleClick = () => {
    navigator.clipboard.writeText(code).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      onMouseDown={() => setPressing(true)}
      onMouseUp={() => setPressing(false)}
      onMouseLeave={() => setPressing(false)}
      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium border transition-all duration-300"
      style={{
        transform: pressing ? "scale(0.95)" : "scale(1)",
        background: copied ? "#dcfce7" : FIELD_BG,
        color: copied ? "#16a34a" : "var(--muted-foreground)",
        borderColor: copied ? "#86efac" : "var(--border)",
      }}
      aria-label="Скопировать код комнаты"
    >
      <span
        className="relative flex items-center justify-center w-3.5 h-3.5"
        style={{ transition: "transform 0.25s ease, opacity 0.25s ease" }}
      >
        <Copy
          className="w-3.5 h-3.5 absolute transition-all duration-300"
          style={{ opacity: copied ? 0 : 1, transform: copied ? "scale(0.5)" : "scale(1)" }}
        />
        <Check
          className="w-3.5 h-3.5 absolute transition-all duration-300"
          style={{ opacity: copied ? 1 : 0, transform: copied ? "scale(1)" : "scale(0.5)" }}
        />
      </span>
      <span style={{ transition: "color 0.3s" }}>
        {copied ? "Скопировано" : "Копировать"}
      </span>
    </button>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export function LobbyPage() {
  const [participants, setParticipants] = useState<Participant[]>(INITIAL_PARTICIPANTS);
  const [newIds, setNewIds] = useState<Set<string>>(new Set());
  const [started, setStarted] = useState(false);
  const [latecomerIdx, setLatecomerIdx] = useState(0);

  // Simulate latecomers joining
  useEffect(() => {
    if (latecomerIdx >= LATECOMERS.length) return;
    const t = setTimeout(() => {
      const p = LATECOMERS[latecomerIdx];
      setParticipants((prev) => [...prev, p]);
      setNewIds((prev) => new Set(prev).add(p.id));
      setTimeout(() => setNewIds((prev) => { const s = new Set(prev); s.delete(p.id); return s; }), 600);
      setLatecomerIdx((i) => i + 1);
    }, 3000);
    return () => clearTimeout(t);
  }, [latecomerIdx]);

  const organizer = participants.find((p) => p.isOrganizer);
  const regularParticipants = participants.filter((p) => !p.isOrganizer);
  const canStart = regularParticipants.length >= 1;

  if (started) {
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
            <PlayCircle className="w-7 h-7" style={{ color: ACCENT }} />
          </div>
          <h2 className="text-xl font-semibold text-card-foreground mb-2">Квиз начался!</h2>
          <p className="text-sm text-muted-foreground">
            {regularParticipants.length} участников готовы к игре
          </p>
          <button
            onClick={() => setStarted(false)}
            className="mt-6 text-sm font-medium hover:underline"
            style={{ color: ACCENT }}
          >
            ← Назад в лобби
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <style>{`
        @keyframes lobby-dot-bounce {
          0%, 80%, 100% { transform: translateY(0); opacity: 0.4; }
          40% { transform: translateY(-5px); opacity: 1; }
        }
        @keyframes lobby-card-in {
          from { opacity: 0; transform: scale(0.8) translateY(8px); }
          to   { opacity: 1; transform: scale(1) translateY(0); }
        }
        @keyframes lobby-pulse-ring {
          0%   { box-shadow: 0 0 0 0 rgba(13,148,136,0.38); }
          70%  { box-shadow: 0 0 0 10px rgba(13,148,136,0); }
          100% { box-shadow: 0 0 0 0 rgba(13,148,136,0); }
        }
      `}</style>

      <div
        className="min-h-screen bg-background"
        style={{ fontFamily: "'Inter', sans-serif" }}
      >
        {/* ── Header ── */}
        <header className="bg-card border-b border-border">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
            <Logo isDirty={false} />
            <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <Users className="w-4 h-4" />
              <span>{participants.length}</span>
            </div>
          </div>
        </header>

        <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-6">

          {/* ── Info panel ── */}
          <div
            className="rounded-2xl p-6 sm:p-8"
            style={{
              background: `linear-gradient(135deg, ${ACCENT}18 0%, ${ACCENT}08 100%)`,
              border: `1px solid ${ACCENT}25`,
            }}
          >
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-6">
              <div className="space-y-2">
                <span
                  className="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full"
                  style={{ background: `${ACCENT}18`, color: ACCENT }}
                >
                  {CATEGORY_ICONS[QUIZ_INFO.category] ?? null}
                  {QUIZ_INFO.category}
                </span>
                <h1 className="text-xl sm:text-2xl font-semibold text-foreground">
                  {QUIZ_INFO.title}
                </h1>
                <p className="text-sm text-muted-foreground flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5" />
                  {regularParticipants.length} участников
                </p>
              </div>

              {/* Room code */}
              <div className="flex-shrink-0">
                <p className="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wider">
                  Код комнаты
                </p>
                <div
                  className="flex items-center gap-3 bg-card rounded-2xl px-5 py-4"
                  style={{ border: `1.5px solid ${ACCENT}40`, boxShadow: "0 2px 16px rgba(13,148,136,0.12)" }}
                >
                  <span
                    className="font-mono text-2xl sm:text-3xl font-bold tracking-[0.18em] select-all"
                    style={{ color: ACCENT }}
                  >
                    {ROOM_CODE}
                  </span>
                  <CopyButton code={ROOM_CODE} />
                </div>
              </div>
            </div>
          </div>

          {/* ── Organizer block ── */}
          <OrganizerBlock organizer={organizer} />

          {/* ── Participants list ── */}
          <div className="bg-card rounded-2xl border border-border shadow-[0_2px_16px_rgba(0,0,0,0.05)] overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-border">
              <h2 className="text-sm font-semibold text-card-foreground">
                Участники
                <span className="ml-2 text-xs font-normal text-muted-foreground">
                  ({regularParticipants.length})
                </span>
              </h2>
              {CURRENT_ROLE === "participant" && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <WaitingDots />
                  <span>Ожидание начала...</span>
                </div>
              )}
            </div>

            <div className="p-5 sm:p-6">
              {regularParticipants.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-6">
                  Пока никто не присоединился
                </p>
              ) : (
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3">
                  {regularParticipants.map((p) => (
                    <ParticipantCard key={p.id} p={p} isNew={newIds.has(p.id)} />
                  ))}
                  {/* Empty slots up to 8 */}
                  {Array.from({ length: Math.max(0, 8 - regularParticipants.length) }).map((_, i) => (
                    <div
                      key={`empty-${i}`}
                      className="rounded-2xl border border-dashed border-border p-4 flex items-center justify-center min-h-[108px]"
                      style={{ background: FIELD_BG }}
                    >
                      <div className="w-10 h-10 rounded-full border-2 border-dashed border-border flex items-center justify-center">
                        <Users className="w-4 h-4 text-muted-foreground/30" />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* ── Action area ── */}
          {CURRENT_ROLE === "organizer" ? (
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 px-1">
              <p className="text-sm text-muted-foreground flex items-center gap-1.5">
                <span
                  className="w-2 h-2 rounded-full inline-block flex-shrink-0"
                  style={{ background: canStart ? "#22c55e" : "#f59e0b" }}
                />
                {canStart ? "Все готовы — можно начинать" : "Ожидаем участников..."}
              </p>
              <div className="flex gap-2">
                <Link
                  to="/home"
                  className="px-4 py-2.5 rounded-xl text-sm font-medium border border-border text-muted-foreground hover:text-foreground hover:bg-muted transition"
                >
                  Отменить
                </Link>
                <button
                  type="button"
                  disabled={!canStart}
                  onClick={() => setStarted(true)}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold text-white transition-all duration-150 active:scale-[0.97] disabled:opacity-40 disabled:cursor-not-allowed disabled:active:scale-100"
                  style={{
                    background: ACCENT,
                    boxShadow: canStart ? "0 2px 14px rgba(13,148,136,0.38)" : "none",
                    animation: canStart ? "lobby-pulse-ring 2s ease-out infinite" : "none",
                  }}
                >
                  <PlayCircle className="w-4 h-4" />
                  Начать квиз
                </button>
              </div>
            </div>
          ) : (
            <div
              className="rounded-2xl p-5 flex items-center gap-4"
              style={{ background: FIELD_BG, border: "1px solid var(--border)" }}
            >
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                style={{ background: `${ACCENT}15` }}
              >
                <Zap className="w-5 h-5" style={{ color: ACCENT }} />
              </div>
              <div>
                <p className="text-sm font-medium text-card-foreground flex items-center gap-2">
                  Ожидание организатора <WaitingDots />
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Квиз начнётся автоматически, когда организатор запустит игру
                </p>
              </div>
            </div>
          )}
        </main>
      </div>
    </>
  );
}
