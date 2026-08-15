import { useState } from "react";
import { BookOpen, ArrowRight, ArrowLeft, Check, Sun, Moon, Eye, EyeOff, AlertCircle } from "lucide-react";
import type { AuthMode } from "../../types";

const LIGHT_TOKENS = {
  "--ink": "#22272B",
  "--ink2": "#191D20",
  "--parchment": "#EFE7D8",
  "--parchment2": "#E6DAC0",
  "--brass": "#C4A15A",
  "--brassLight": "#D9BD82",
  "--wine": "#9C4A3E",
  "--sage": "#3B4A6B",
  "--textInk": "#23201B",
  "--borderSoft": "rgba(35,32,27,0.2)",
  "--onInk": "#EFE7D8",
  "--onInkDivider": "rgba(239,231,216,0.15)",
  "--fontDisplay": "'Fraunces', Georgia, 'Times New Roman', serif",
  "--fontBody": "'Source Serif 4', Georgia, serif",
  "--fontMono": "'IBM Plex Mono', 'Courier New', monospace",
} as React.CSSProperties;

const DARK_TOKENS = {
  "--ink": "#15181B",
  "--ink2": "#0E1012",
  "--parchment": "#2A2D26",
  "--parchment2": "#333629",
  "--brass": "#D9BD82",
  "--brassLight": "#E8D4A3",
  "--wine": "#C97364",
  "--sage": "#8098C4",
  "--textInk": "#EDE6D6",
  "--borderSoft": "rgba(237,230,214,0.22)",
  "--onInk": "#EFE7D8",
  "--onInkDivider": "rgba(239,231,216,0.15)",
  "--fontDisplay": "'Fraunces', Georgia, 'Times New Roman', serif",
  "--fontBody": "'Source Serif 4', Georgia, serif",
  "--fontMono": "'IBM Plex Mono', 'Courier New', monospace",
} as React.CSSProperties;

function Field({
  label, value, onChange, placeholder, type = "text", required = false,
}: {
  label: string; value: string; onChange: (v: string) => void;
  placeholder?: string; type?: string; required?: boolean;
}) {
  const [visible, setVisible] = useState(false);
  const isPassword = type === "password";
  const effectiveType = isPassword ? (visible ? "text" : "password") : type;

  return (
    <div className="space-y-1.5">
      <label className="text-sm" style={{ fontFamily: "var(--fontBody)", color: "var(--textInk)" }}>
        {label}
        {required && <span style={{ color: "var(--wine)" }} className="ml-1">*</span>}
      </label>
      <div className="relative">
        <input
          type={effectiveType}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          required={required}
          className="w-full px-4 py-2.5 text-sm rounded-sm outline-none transition-colors"
          style={{
            fontFamily: "var(--fontBody)",
            background: "var(--parchment2)",
            border: "1px solid var(--borderSoft)",
            color: "var(--textInk)",
            paddingRight: isPassword ? "2.75rem" : undefined,
          }}
          onFocus={(e) => (e.currentTarget.style.borderColor = "var(--brass)")}
          onBlur={(e) => (e.currentTarget.style.borderColor = "var(--borderSoft)")}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setVisible((v) => !v)}
            aria-label={visible ? "Hide password" : "Show password"}
            className="absolute right-0 top-0 h-full px-3 flex items-center transition-opacity hover:opacity-70"
            style={{ color: "var(--textInk)", opacity: 0.55 }}
          >
            {visible ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        )}
      </div>
    </div>
  );
}

interface AuthPageProps {
  onBack: () => void;
  initialMode?: AuthMode;
  isDark: boolean;
  onToggleDark: () => void;
  onLogin: (email: string, password: string) => Promise<boolean>;
  onSignup: (name: string, email: string, password: string) => Promise<boolean>;
  authError: string | null;
}

export default function AuthPage({
  onBack, initialMode = "signin", isDark, onToggleDark, onLogin, onSignup, authError,
}: AuthPageProps) {
  const TOKENS = isDark ? DARK_TOKENS : LIGHT_TOKENS;
  const [mode, setMode] = useState<AuthMode>(initialMode);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (mode === "forgot") { setSubmitted(true); return; }

    setSubmitting(true);
    if (mode === "signin") {
      await onLogin(email, password);
    } else {
      await onSignup(name, email, password);
    }
    setSubmitting(false);
    // On success, isAuthenticated flips in the parent and this page unmounts automatically —
    // nothing further to do here. On failure, authError is passed back in and shown below.
  }

  return (
    <div style={TOKENS} className="min-h-screen flex">
      {/* ── Left: quote panel ─────────────────────────────── */}
      <div
        className="hidden lg:flex lg:w-1/2 relative overflow-hidden flex-col justify-between p-12"
        style={{ background: "linear-gradient(160deg, var(--ink) 0%, var(--ink2) 100%)" }}
      >
        {/* decorative book spines */}
        <div className="absolute inset-y-0 right-0 w-24 flex gap-1.5 px-4 opacity-[0.15]">
          {[0.55, 0.8, 0.4, 0.9, 0.6, 0.7, 0.45].map((h, i) => (
            <div key={i} className="w-full self-end" style={{ height: `${h * 100}%`, background: "var(--brassLight)" }} />
          ))}
        </div>

        <div className="relative z-10 flex items-center justify-between">
          <button onClick={onBack} className="flex items-center gap-3 text-left w-fit">
            <div className="w-10 h-10 rounded-sm flex items-center justify-center" style={{ background: "var(--brass)" }}>
              <BookOpen className="w-5 h-5" style={{ color: "var(--ink)" }} />
            </div>
            <span className="text-xl font-semibold" style={{ fontFamily: "var(--fontDisplay)", color: "var(--onInk)" }}>
              BookNest
            </span>
          </button>
          <button
            onClick={onToggleDark}
            aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
            className="p-2 rounded-sm transition-opacity hover:opacity-70"
            style={{ color: "var(--onInk)" }}
          >
            {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
        </div>

        <div className="relative z-10">
          <blockquote
            className="text-2xl leading-snug font-medium mb-4"
            style={{ fontFamily: "var(--fontDisplay)", color: "var(--onInk)" }}
          >
            "A reader lives a thousand lives before he dies. The man who never reads lives only one."
          </blockquote>
          <cite className="text-sm not-italic" style={{ fontFamily: "var(--fontMono)", color: "var(--brassLight)" }}>
            — George R.R. Martin
          </cite>
          <div className="flex gap-8 mt-9 pt-6" style={{ borderTop: "1px solid var(--onInkDivider)" }}>
            {[["2,400+", "books tracked"], ["15,000", "readers"], ["4.9", "rating"]].map(([val, label]) => (
              <div key={label}>
                <p className="text-xl font-medium" style={{ fontFamily: "var(--fontDisplay)", color: "var(--onInk)" }}>{val}</p>
                <p className="text-xs mt-0.5" style={{ fontFamily: "var(--fontMono)", color: "var(--onInk)", opacity: 0.5 }}>{label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Right: form panel ─────────────────────────────── */}
      <div className="flex-1 flex items-center justify-center p-8" style={{ background: "var(--parchment)" }}>
        <div className="w-full max-w-md">
          <div className="flex items-center justify-between mb-8">
            <button
              onClick={onBack}
              className="flex items-center gap-2 text-sm transition-opacity hover:opacity-70"
              style={{ fontFamily: "var(--fontBody)", color: "var(--textInk)", opacity: 0.6 }}
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back to BookNest
            </button>
            <button
              onClick={onToggleDark}
              aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
              className="p-2 rounded-sm lg:hidden transition-opacity hover:opacity-70"
              style={{ color: "var(--textInk)" }}
            >
              {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
          </div>

          <div className="flex items-center gap-3 mb-8 lg:hidden">
            <div className="w-9 h-9 rounded-sm flex items-center justify-center" style={{ background: "var(--brass)" }}>
              <BookOpen className="w-5 h-5" style={{ color: "var(--ink)" }} />
            </div>
            <span className="text-xl font-semibold" style={{ fontFamily: "var(--fontDisplay)", color: "var(--textInk)" }}>
              BookNest
            </span>
          </div>

          {mode === "forgot" && submitted ? (
            <div
              className="text-center p-8 rounded-sm"
              style={{ background: "var(--parchment2)", border: "1px solid var(--borderSoft)" }}
            >
              <div
                className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4"
                style={{ background: "rgba(60,90,80,0.15)" }}
              >
                <Check className="w-7 h-7" style={{ color: "var(--sage)" }} />
              </div>
              <h2 className="text-2xl font-medium mb-2" style={{ fontFamily: "var(--fontDisplay)", color: "var(--textInk)" }}>
                Check your email
              </h2>
              <p className="mb-6 text-sm" style={{ fontFamily: "var(--fontBody)", color: "var(--textInk)", opacity: 0.7 }}>
                We've sent a reset link to <strong>{email}</strong>
              </p>
              <button
                onClick={() => { setMode("signin"); setSubmitted(false); }}
                className="text-sm px-4 py-2 rounded-sm transition-opacity hover:opacity-70"
                style={{ fontFamily: "var(--fontBody)", color: "var(--textInk)", border: "1px solid var(--borderSoft)" }}
              >
                Back to sign in
              </button>
            </div>
          ) : (
            <>
              <h2 className="text-3xl font-medium mb-1" style={{ fontFamily: "var(--fontDisplay)", color: "var(--textInk)" }}>
                {mode === "signin" ? "Welcome back" : mode === "signup" ? "Create your shelf" : "Reset password"}
              </h2>
              <p className="mb-8 text-sm" style={{ fontFamily: "var(--fontBody)", color: "var(--textInk)", opacity: 0.65 }}>
                {mode === "signin" ? "Sign in to your personal library"
                  : mode === "signup" ? "Start tracking your reading journey"
                  : "Enter your email to receive a reset link"}
              </p>

              {authError && (
                <div
                  className="flex items-center gap-2 px-4 py-3 rounded-sm mb-4 text-sm"
                  style={{ background: "color-mix(in srgb, var(--wine) 12%, transparent)", color: "var(--wine)", fontFamily: "var(--fontBody)" }}
                >
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  {authError}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                {mode === "signup" && (
                  <Field label="Full name" value={name} onChange={setName} placeholder="Alex Rivera" required />
                )}
                <Field label="Email address" value={email} onChange={setEmail} placeholder="alex@example.com" type="email" required />
                {mode !== "forgot" && (
                  <Field label="Password" value={password} onChange={setPassword} placeholder="••••••••" type="password" required />
                )}

                {mode === "signin" && (
                  <div className="text-right">
                    <button
                      type="button"
                      onClick={() => setMode("forgot")}
                      className="text-sm hover:underline"
                      style={{ fontFamily: "var(--fontBody)", color: "var(--sage)" }}
                    >
                      Forgot password?
                    </button>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-sm text-sm font-medium mt-2 transition-transform hover:-translate-y-0.5 disabled:opacity-60 disabled:pointer-events-none"
                  style={{ background: "var(--brass)", color: "var(--ink)", fontFamily: "var(--fontBody)" }}
                >
                  {submitting
                    ? "Please wait…"
                    : mode === "signin" ? "Sign in" : mode === "signup" ? "Create account" : "Send reset link"}
                  {!submitting && <ArrowRight className="w-4 h-4" />}
                </button>
              </form>

              {mode !== "forgot" && (
                <div className="mt-6 text-center text-sm" style={{ fontFamily: "var(--fontBody)", color: "var(--textInk)", opacity: 0.6 }}>
                  {mode === "signin" ? (
                    <>Don't have an account?{" "}
                      <button onClick={() => setMode("signup")} className="font-medium hover:underline" style={{ color: "var(--wine)" }}>
                        Sign up
                      </button>
                    </>
                  ) : (
                    <>Already have an account?{" "}
                      <button onClick={() => setMode("signin")} className="font-medium hover:underline" style={{ color: "var(--wine)" }}>
                        Sign in
                      </button>
                    </>
                  )}
                </div>
              )}

              {mode === "forgot" && (
                <div className="mt-4 text-center">
                  <button
                    onClick={() => setMode("signin")}
                    className="text-sm flex items-center gap-1 mx-auto hover:opacity-70"
                    style={{ fontFamily: "var(--fontBody)", color: "var(--textInk)", opacity: 0.6 }}
                  >
                    <ArrowLeft className="w-3 h-3" /> Back to sign in
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}