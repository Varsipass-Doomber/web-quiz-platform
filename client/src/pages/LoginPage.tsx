import { useState } from "react";
import { Link } from "react-router-dom";
import { Eye, EyeOff, Zap } from "lucide-react";

const ACCENT = "#0d9488";
const ACCENT_HOVER = "#0f766e";
const FIELD_BG = "#f2f8f7";

export function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const [showPw, setShowPw] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

  const validate = () => {
    const e: typeof errors = {};
    if (!email) e.email = "Email обязателен";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      e.email = "Введите корректный email";
    if (!password) e.password = "Пароль обязателен";
    return e;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    setErrors(errs);
    // TODO: handle successful login
  };

  return (
    <div
      className="min-h-screen bg-background flex items-center justify-center px-4 py-10"
      style={{ fontFamily: "'Inter', sans-serif" }}
    >
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex items-center justify-center gap-2 mb-8">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ background: ACCENT }}
          >
            <Zap className="w-4 h-4 text-white" />
          </div>
          <span className="text-lg font-semibold text-foreground tracking-tight">
            QuizSpace
          </span>
        </div>

        {/* Card */}
        <div className="bg-card rounded-2xl shadow-[0_4px_32px_rgba(0,0,0,0.08)] px-8 py-9 sm:px-10">
          <h1 className="text-2xl font-semibold text-card-foreground mb-1">
            Войти в аккаунт
          </h1>
          <p className="text-sm text-muted-foreground mb-7">
            Рады видеть вас снова
          </p>

          <form onSubmit={handleSubmit} noValidate className="space-y-5">
            {/* Email */}
            <div>
              <label
                className="block text-sm font-medium text-card-foreground mb-1.5"
                htmlFor="email"
              >
                Email
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                placeholder="ivan@example.com"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setErrors((prev) => ({ ...prev, email: undefined }));
                }}
                className={`w-full px-4 py-2.5 rounded-xl border text-sm text-foreground placeholder:text-muted-foreground outline-none transition focus:ring-2 focus:ring-[#0d9488]/25 focus:border-[#0d9488] ${
                  errors.email ? "border-destructive" : "border-border"
                }`}
                style={{ background: FIELD_BG }}
              />
              {errors.email && (
                <p className="text-xs text-destructive mt-1.5">{errors.email}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <label
                className="block text-sm font-medium text-card-foreground mb-1.5"
                htmlFor="password"
              >
                Пароль
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPw ? "text" : "password"}
                  autoComplete="current-password"
                  placeholder="Введите пароль"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setErrors((prev) => ({ ...prev, password: undefined }));
                  }}
                  className={`w-full px-4 py-2.5 pr-11 rounded-xl border text-sm text-foreground placeholder:text-muted-foreground outline-none transition focus:ring-2 focus:ring-[#0d9488]/25 focus:border-[#0d9488] ${
                    errors.password ? "border-destructive" : "border-border"
                  }`}
                  style={{ background: FIELD_BG }}
                />
                <button
                  type="button"
                  onClick={() => setShowPw((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition"
                  aria-label={showPw ? "Скрыть пароль" : "Показать пароль"}
                >
                  {showPw ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="text-xs text-destructive mt-1.5">{errors.password}</p>
              )}
            </div>

            {/* Remember me */}
            <label className="flex items-center gap-2.5 cursor-pointer select-none group w-fit">
              <div className="relative flex-shrink-0">
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                  className="sr-only"
                />
                <div
                  className="w-[18px] h-[18px] rounded-[5px] border transition-all duration-150 flex items-center justify-center"
                  style={
                    remember
                      ? { background: ACCENT, borderColor: ACCENT }
                      : { background: FIELD_BG }
                  }
                >
                  {remember && (
                    <svg className="w-2.5 h-2.5 text-white" viewBox="0 0 10 8" fill="none">
                      <path
                        d="M1 4l2.5 2.5L9 1"
                        stroke="currentColor"
                        strokeWidth="1.6"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  )}
                </div>
              </div>
              <span className="text-sm text-muted-foreground group-hover:text-foreground transition">
                Запомнить меня
              </span>
            </label>

            {/* Submit */}
            <button
              type="submit"
              className="w-full py-3 rounded-xl text-white text-sm font-semibold tracking-wide active:scale-[0.98] transition-all duration-150 mt-1"
              style={{
                background: ACCENT,
                boxShadow: "0 2px 14px rgba(13,148,136,0.35)",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = ACCENT_HOVER)}
              onMouseLeave={(e) => (e.currentTarget.style.background = ACCENT)}
            >
              Войти
            </button>
          </form>

          <p className="text-center text-sm text-muted-foreground mt-6">
            Нет аккаунта?{" "}
            <Link
              to="/register"
              className="font-medium hover:underline"
              style={{ color: ACCENT }}
            >
              Зарегистрироваться
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
