import { useState } from "react";
import { Link } from "react-router-dom";
import { Eye, EyeOff, Zap } from "lucide-react";

type Role = "participant" | "organizer";

const ACCENT = "#0d9488";
const ACCENT_HOVER = "#0f766e";
const FIELD_BG = "#f2f8f7";

interface FormState {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
  role: Role;
}

interface FormErrors {
  username?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
}

export function RegisterPage() {
  const [form, setForm] = useState<FormState>({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "participant",
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const validate = (): FormErrors => {
    const e: FormErrors = {};
    if (!form.username.trim()) e.username = "Имя пользователя обязательно";
    if (!form.email) e.email = "Email обязателен";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      e.email = "Введите корректный email";
    if (!form.password) e.password = "Пароль обязателен";
    else if (form.password.length < 6) e.password = "Минимум 6 символов";
    if (form.confirmPassword !== form.password)
      e.confirmPassword = "Пароли не совпадают";
    return e;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    setErrors(errs);
    // TODO: handle successful registration
  };

  const update = (field: keyof FormState, value: string) => {
    setForm((f) => ({ ...f, [field]: value }));
    if (errors[field as keyof FormErrors])
      setErrors((e) => ({ ...e, [field]: undefined }));
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
            Создать аккаунт
          </h1>
          <p className="text-sm text-muted-foreground mb-7">
            Присоединяйтесь и начните квизы прямо сейчас
          </p>

          <form onSubmit={handleSubmit} noValidate className="space-y-5">
            {/* Username */}
            <div>
              <label
                className="block text-sm font-medium text-card-foreground mb-1.5"
                htmlFor="username"
              >
                Имя пользователя
              </label>
              <input
                id="username"
                type="text"
                autoComplete="name"
                placeholder="ivan_petrov"
                value={form.username}
                onChange={(e) => update("username", e.target.value)}
                className={`w-full px-4 py-2.5 rounded-xl border text-sm text-foreground placeholder:text-muted-foreground outline-none transition focus:ring-2 focus:ring-[#0d9488]/25 focus:border-[#0d9488] ${
                  errors.username ? "border-destructive" : "border-border"
                }`}
                style={{ background: FIELD_BG }}
              />
              {errors.username && (
                <p className="text-xs text-destructive mt-1.5">{errors.username}</p>
              )}
            </div>

            {/* Email */}
            <div>
              <label
                className="block text-sm font-medium text-card-foreground mb-1.5"
                htmlFor="reg-email"
              >
                Email
              </label>
              <input
                id="reg-email"
                type="email"
                autoComplete="email"
                placeholder="ivan@example.com"
                value={form.email}
                onChange={(e) => update("email", e.target.value)}
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
                htmlFor="reg-password"
              >
                Пароль
              </label>
              <div className="relative">
                <input
                  id="reg-password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  placeholder="Минимум 6 символов"
                  value={form.password}
                  onChange={(e) => update("password", e.target.value)}
                  className={`w-full px-4 py-2.5 pr-11 rounded-xl border text-sm text-foreground placeholder:text-muted-foreground outline-none transition focus:ring-2 focus:ring-[#0d9488]/25 focus:border-[#0d9488] ${
                    errors.password ? "border-destructive" : "border-border"
                  }`}
                  style={{ background: FIELD_BG }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition"
                  aria-label={showPassword ? "Скрыть пароль" : "Показать пароль"}
                >
                  {showPassword ? (
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

            {/* Confirm password */}
            <div>
              <label
                className="block text-sm font-medium text-card-foreground mb-1.5"
                htmlFor="reg-confirm"
              >
                Подтверждение пароля
              </label>
              <div className="relative">
                <input
                  id="reg-confirm"
                  type={showConfirm ? "text" : "password"}
                  autoComplete="new-password"
                  placeholder="Повторите пароль"
                  value={form.confirmPassword}
                  onChange={(e) => update("confirmPassword", e.target.value)}
                  className={`w-full px-4 py-2.5 pr-11 rounded-xl border text-sm text-foreground placeholder:text-muted-foreground outline-none transition focus:ring-2 focus:ring-[#0d9488]/25 focus:border-[#0d9488] ${
                    errors.confirmPassword ? "border-destructive" : "border-border"
                  }`}
                  style={{ background: FIELD_BG }}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition"
                  aria-label={showConfirm ? "Скрыть пароль" : "Показать пароль"}
                >
                  {showConfirm ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="text-xs text-destructive mt-1.5">
                  {errors.confirmPassword}
                </p>
              )}
            </div>

            {/* Role toggle */}
            <div>
              <label className="block text-sm font-medium text-card-foreground mb-2">
                Роль
              </label>
              <div
                className="flex border border-border rounded-xl p-1 gap-1"
                style={{ background: FIELD_BG }}
              >
                {(["participant", "organizer"] as Role[]).map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setForm((f) => ({ ...f, role: r }))}
                    className="flex-1 py-2 rounded-lg text-sm font-medium transition-all duration-200"
                    style={
                      form.role === r
                        ? { background: ACCENT, color: "#fff" }
                        : { color: "var(--muted-foreground)" }
                    }
                  >
                    {r === "participant" ? "Участник" : "Организатор"}
                  </button>
                ))}
              </div>
            </div>

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
              Зарегистрироваться
            </button>
          </form>

          <p className="text-center text-sm text-muted-foreground mt-6">
            Уже есть аккаунт?{" "}
            <Link
              to="/"
              className="font-medium hover:underline"
              style={{ color: ACCENT }}
            >
              Войти
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
