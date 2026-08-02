import { BookOpen, Library, Bookmark, Target, BarChart3, ArrowRight, Star, Check, Quote, Sun, Moon } from "lucide-react";

/**
 * BookNest landing page.
 *
 * Fonts: add these to your index.html <head> for the intended look
 * (falls back gracefully to system serif/mono without them):
 *
 * <link rel="preconnect" href="https://fonts.googleapis.com">
 * <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
 * <link href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,400;0,9..144,500;0,9..144,600;1,9..144,500&family=Source+Serif+4:ital,wght@0,400;0,600;1,400&family=IBM+Plex+Mono:wght@400;500&display=swap" rel="stylesheet">
 */

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
  "--borderSoft": "rgba(35,32,27,0.15)",
  "--borderMed": "rgba(35,32,27,0.2)",
  "--borderStrong": "rgba(35,32,27,0.3)",
  "--onInk": "#EFE7D8",
  "--onInkDivider": "rgba(239,231,216,0.15)",
  "--headerBg": "rgba(34,39,43,0.92)",
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
  "--borderSoft": "rgba(237,230,214,0.14)",
  "--borderMed": "rgba(237,230,214,0.2)",
  "--borderStrong": "rgba(237,230,214,0.28)",
  "--onInk": "#EFE7D8",
  "--onInkDivider": "rgba(239,231,216,0.15)",
  "--headerBg": "rgba(14,16,18,0.92)",
  "--fontDisplay": "'Fraunces', Georgia, 'Times New Roman', serif",
  "--fontBody": "'Source Serif 4', Georgia, serif",
  "--fontMono": "'IBM Plex Mono', 'Courier New', monospace",
} as React.CSSProperties;

interface LandingPageProps {
  onGetStarted: () => void;
  onSignIn: () => void;
  isDark: boolean;
  onToggleDark: () => void;
}

function CallTag({ children }: { children: React.ReactNode }) {
  return (
    <span
      className="inline-block text-[10px] tracking-[0.18em] px-2 py-1 border rounded-sm"
      style={{
        fontFamily: "var(--fontMono)",
        color: "var(--wine)",
        borderColor: "var(--wine)",
        background: "rgba(110,42,51,0.06)",
      }}
    >
      {children}
    </span>
  );
}

function Eyebrow({ children, light = false }: { children: React.ReactNode; light?: boolean }) {
  return (
    <p
      className="text-xs tracking-[0.28em] uppercase mb-4"
      style={{
        fontFamily: "var(--fontMono)",
        color: light ? "var(--brassLight)" : "var(--brass)",
      }}
    >
      {children}
    </p>
  );
}

// The signature element: a "library checkout card" reimagined as a
// reading-progress log instead of literal due-dates.
function LibraryCard() {
  const rows = [
    { label: "STARTED", value: "Jun 02" },
    { label: "PAGE 118 / 320", value: "37%" },
    { label: "PAGE 271 / 320", value: "85%" },
    { label: "FINISHED", value: "Jun 19" },
  ];
  return (
    <div className="relative select-none">
      {/* stacked cards behind for depth */}
      <div
        className="absolute -top-3 -right-3 w-full h-full rounded-sm rotate-[4deg]"
        style={{ background: "var(--parchment2)", border: "1px solid var(--borderSoft)" }}
      />
      <div
        className="absolute -top-1.5 -right-1.5 w-full h-full rounded-sm rotate-[2deg]"
        style={{ background: "var(--parchment)", border: "1px solid var(--borderSoft)" }}
      />

      <div
        className="relative w-full rounded-sm p-6 shadow-xl animate-[cardIn_0.6s_ease-out]"
        style={{ background: "var(--parchment)", border: "1px solid var(--borderMed)" }}
      >
        <div className="flex items-start justify-between pb-4 mb-4" style={{ borderBottom: "1px dashed var(--borderStrong)" }}>
          <div>
            <p style={{ fontFamily: "var(--fontMono)", fontSize: "10px", letterSpacing: "0.2em", color: "var(--wine)" }}>
              BOOKNEST · READING LOG
            </p>
            <h3 className="mt-1 text-xl font-semibold" style={{ fontFamily: "var(--fontDisplay)", color: "var(--textInk)" }}>
              The Midnight Library
            </h3>
            <p className="text-sm mt-0.5" style={{ fontFamily: "var(--fontBody)", color: "var(--textInk)", opacity: 0.7 }}>
              Matt Haig
            </p>
          </div>
          <div className="flex gap-0.5 pt-1">
            {[1, 2, 3, 4].map((n) => (
              <Star key={n} className="w-3.5 h-3.5" style={{ fill: "var(--brass)", color: "var(--brass)" }} />
            ))}
            <Star className="w-3.5 h-3.5" style={{ color: "var(--brass)" }} />
          </div>
        </div>

        <div className="space-y-2.5">
          {rows.map((r) => (
            <div key={r.label} className="flex items-center justify-between text-xs">
              <span style={{ fontFamily: "var(--fontMono)", color: "var(--textInk)", opacity: 0.55, letterSpacing: "0.05em" }}>
                {r.label}
              </span>
              <span
                className="px-1.5 py-0.5 rounded-sm"
                style={{
                  fontFamily: "var(--fontMono)",
                  color: "var(--wine)",
                  border: "1px solid rgba(110,42,51,0.35)",
                  transform: "rotate(-1.5deg)",
                }}
              >
                {r.value}
              </span>
            </div>
          ))}
        </div>

        <div className="mt-5 pt-4 flex items-center gap-2" style={{ borderTop: "1px dashed var(--borderStrong)" }}>
          <Quote className="w-3.5 h-3.5 flex-shrink-0" style={{ color: "var(--sage)" }} />
          <p className="text-xs italic" style={{ fontFamily: "var(--fontBody)", color: "var(--textInk)", opacity: 0.75 }}>
            "Between life and death there is a library."
          </p>
        </div>
      </div>

      <style>{`
        @keyframes cardIn {
          from { opacity: 0; transform: translateY(10px) rotate(-1deg); }
          to { opacity: 1; transform: translateY(0) rotate(0deg); }
        }
        @media (prefers-reduced-motion: reduce) {
          .animate-\\[cardIn_0\\.6s_ease-out\\] { animation: none; }
        }
      `}</style>
    </div>
  );
}

export default function LandingPage({ onGetStarted, onSignIn, isDark, onToggleDark }: LandingPageProps) {
  const TOKENS = isDark ? DARK_TOKENS : LIGHT_TOKENS;

  const features = [
    {
      tag: "000 · CATALOG",
      icon: Library,
      title: "A library that knows what it owns",
      body: "Every book gets a status: reading, paused, finished, or just an idea. No more guessing what you started in March.",
    },
    {
      tag: "010 · TO READ",
      icon: Bookmark,
      title: "A wishlist that isn't a group chat",
      body: "Keep the books people mention in passing somewhere you'll actually see them again.",
    },
    {
      tag: "020 · TARGETS",
      icon: Target,
      title: "A number you set for yourself",
      body: "Pick a yearly goal and watch the shelf fill in as you go. Nobody else has to see it.",
    },
    {
      tag: "030 · RECORDS",
      icon: BarChart3,
      title: "A record of how you actually read",
      body: "Pace, genres, streaks, favorites. The shape of your reading year, at a glance.",
    },
  ];

  const steps = [
    { n: "01", title: "Add it", body: "Title, author, cover. Ten seconds, and it's on the shelf." },
    { n: "02", title: "Track it", body: "Move the page number as you go. The progress bar fills itself in." },
    { n: "03", title: "Remember it", body: "Save the line that got you. Rate it when you close the back cover." },
  ];

  return (
    <div style={TOKENS} className="min-h-screen">
      {/* ── Nav ─────────────────────────────────────────────── */}
      <header className="sticky top-0 z-40 backdrop-blur-md" style={{ background: "var(--headerBg)" }}>
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-sm flex items-center justify-center" style={{ background: "var(--brass)" }}>
              <BookOpen className="w-4 h-4" style={{ color: "var(--ink)" }} />
            </div>
            <span className="font-semibold text-base" style={{ fontFamily: "var(--fontDisplay)", color: "var(--onInk)" }}>
              BookNest
            </span>
          </div>

          <nav className="hidden md:flex items-center gap-8 text-sm">
            <a href="#shelves" className="transition-colors hover:opacity-100" style={{ color: "var(--onInk)", opacity: 0.7, fontFamily: "var(--fontBody)" }}>
              Shelves
            </a>
            <a href="#routine" className="transition-colors hover:opacity-100" style={{ color: "var(--onInk)", opacity: 0.7, fontFamily: "var(--fontBody)" }}>
              How it works
            </a>
          </nav>

          <div className="flex items-center gap-2">
            <button
              onClick={onToggleDark}
              aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
              className="p-2 rounded-sm transition-opacity hover:opacity-70"
              style={{ color: "var(--onInk)" }}
            >
              {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
            <button
              onClick={onSignIn}
              className="text-sm px-3 py-1.5 transition-opacity hover:opacity-80"
              style={{ color: "var(--onInk)", fontFamily: "var(--fontBody)" }}
            >
              Sign in
            </button>
            <button
              onClick={onGetStarted}
              className="text-sm font-medium px-4 py-2 rounded-sm transition-transform hover:-translate-y-0.5"
              style={{ background: "var(--brass)", color: "var(--ink)", fontFamily: "var(--fontBody)" }}
            >
              Start your shelf
            </button>
          </div>
        </div>
      </header>

      {/* ── Hero ────────────────────────────────────────────── */}
      <section className="relative overflow-hidden" style={{ background: "linear-gradient(180deg, var(--ink) 0%, var(--ink2) 100%)" }}>
        <div className="max-w-6xl mx-auto px-6 py-20 lg:py-28 grid lg:grid-cols-2 gap-16 items-center">
          <div>
            <Eyebrow light>Personal library, kept properly</Eyebrow>
            <h1
              className="text-4xl sm:text-5xl leading-[1.08] font-medium"
              style={{ fontFamily: "var(--fontDisplay)", color: "var(--onInk)" }}
            >
              Every book you've read, lent, loved, or left on page twelve.
            </h1>
            <p
              className="mt-6 text-lg leading-relaxed max-w-md"
              style={{ fontFamily: "var(--fontBody)", color: "var(--onInk)", opacity: 0.75 }}
            >
              BookNest is where your library actually lives — what you're reading, what you rated, what you underlined, and what's still waiting on the shelf.
            </p>

            <div className="mt-9 flex flex-wrap items-center gap-4">
              <button
                onClick={onGetStarted}
                className="group flex items-center gap-2 px-6 py-3 rounded-sm text-sm font-medium transition-transform hover:-translate-y-0.5"
                style={{ background: "var(--brass)", color: "var(--ink)", fontFamily: "var(--fontBody)" }}
              >
                Start your shelf
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
              </button>
              <a
                href="#routine"
                className="text-sm px-2 py-3 border-b transition-opacity hover:opacity-70"
                style={{ color: "var(--onInk)", borderColor: "var(--brass)", fontFamily: "var(--fontBody)" }}
              >
                See how it works
              </a>
            </div>

            <div
              className="mt-14 flex flex-wrap gap-x-8 gap-y-3 pt-6"
              style={{ borderTop: "1px solid var(--onInkDivider)" }}
            >
              {[["2,400+", "books logged"], ["15,000", "readers"], ["4.9", "average rating"]].map(([val, label]) => (
                <div key={label}>
                  <span style={{ fontFamily: "var(--fontMono)", color: "var(--brassLight)" }} className="text-sm">
                    {val}
                  </span>
                  <span style={{ fontFamily: "var(--fontMono)", color: "var(--onInk)", opacity: 0.5 }} className="text-sm ml-2">
                    {label}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="max-w-sm mx-auto w-full">
            <LibraryCard />
          </div>
        </div>
      </section>

      {/* ── Features ────────────────────────────────────────── */}
      <section id="shelves" className="py-24" style={{ background: "var(--parchment)" }}>
        <div className="max-w-6xl mx-auto px-6">
          <div className="max-w-xl mb-14">
            <Eyebrow>The shelves</Eyebrow>
            <h2 className="text-3xl sm:text-4xl font-medium" style={{ fontFamily: "var(--fontDisplay)", color: "var(--textInk)" }}>
              Four ways to keep track
            </h2>
          </div>

          <div className="grid sm:grid-cols-2 gap-5">
            {features.map((f) => (
              <div
                key={f.title}
                className="p-6 rounded-sm transition-transform hover:-translate-y-1"
                style={{ background: "var(--parchment2)", border: "1px solid var(--borderSoft)" }}
              >
                <div className="flex items-center justify-between mb-5">
                  <div className="w-10 h-10 rounded-sm flex items-center justify-center" style={{ background: "var(--ink)" }}>
                    <f.icon className="w-4.5 h-4.5" style={{ color: "var(--brassLight)" }} />
                  </div>
                  <CallTag>{f.tag}</CallTag>
                </div>
                <h3 className="text-lg font-semibold mb-2" style={{ fontFamily: "var(--fontDisplay)", color: "var(--textInk)" }}>
                  {f.title}
                </h3>
                <p className="text-sm leading-relaxed" style={{ fontFamily: "var(--fontBody)", color: "var(--textInk)", opacity: 0.7 }}>
                  {f.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How it works ────────────────────────────────────── */}
      <section id="routine" className="py-24" style={{ background: "var(--ink)" }}>
        <div className="max-w-6xl mx-auto px-6">
          <div className="max-w-xl mb-14">
            <Eyebrow light>The routine</Eyebrow>
            <h2 className="text-3xl sm:text-4xl font-medium" style={{ fontFamily: "var(--fontDisplay)", color: "var(--onInk)" }}>
              Three habits, one shelf
            </h2>
          </div>

          <div className="grid sm:grid-cols-3 gap-8">
            {steps.map((s) => (
              <div key={s.n} className="relative pl-0">
                <div className="flex items-center gap-3 mb-4">
                  <span
                    className="text-3xl font-medium"
                    style={{ fontFamily: "var(--fontDisplay)", color: "var(--brass)" }}
                  >
                    {s.n}
                  </span>
                  <div className="flex-1 h-px" style={{ background: "var(--onInkDivider)" }} />
                </div>
                <h3 className="text-lg font-semibold mb-2" style={{ fontFamily: "var(--fontDisplay)", color: "var(--onInk)" }}>
                  {s.title}
                </h3>
                <p className="text-sm leading-relaxed" style={{ fontFamily: "var(--fontBody)", color: "var(--onInk)", opacity: 0.65 }}>
                  {s.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Quote ───────────────────────────────────────────── */}
      <section className="py-24" style={{ background: "var(--parchment)" }}>
        <div className="max-w-3xl mx-auto px-6 text-center">
          <div
            className="relative inline-block px-10 py-10 rounded-sm"
            style={{ background: "var(--parchment2)", border: "1px solid var(--borderSoft)" }}
          >
            <div
              className="absolute -top-3 left-1/2 -translate-x-1/2 w-16 h-6 rounded-sm rotate-[-2deg]"
              style={{ background: "var(--wine)", opacity: 0.85 }}
            />
            <Quote className="w-6 h-6 mx-auto mb-5" style={{ color: "var(--brass)" }} />
            <blockquote
              className="text-2xl sm:text-3xl leading-snug font-medium"
              style={{ fontFamily: "var(--fontDisplay)", color: "var(--textInk)" }}
            >
              "A reader lives a thousand lives before he dies. The man who never reads lives only one."
            </blockquote>
            <cite className="block mt-5 text-sm not-italic" style={{ fontFamily: "var(--fontMono)", color: "var(--textInk)", opacity: 0.55 }}>
              — George R.R. Martin
            </cite>
          </div>
        </div>
      </section>

      {/* ── CTA ─────────────────────────────────────────────── */}
      <section className="py-24" style={{ background: "linear-gradient(180deg, var(--ink) 0%, var(--ink2) 100%)" }}>
        <div className="max-w-2xl mx-auto px-6 text-center">
          <h2 className="text-3xl sm:text-4xl font-medium mb-5" style={{ fontFamily: "var(--fontDisplay)", color: "var(--onInk)" }}>
            Your shelf is waiting.
          </h2>
          <p className="text-base mb-9" style={{ fontFamily: "var(--fontBody)", color: "var(--onInk)", opacity: 0.7 }}>
            Free to start. No credit card, no due dates.
          </p>
          <button
            onClick={onGetStarted}
            className="inline-flex items-center gap-2 px-7 py-3.5 rounded-sm text-sm font-medium transition-transform hover:-translate-y-0.5"
            style={{ background: "var(--brass)", color: "var(--ink)", fontFamily: "var(--fontBody)" }}
          >
            Create your BookNest
            <ArrowRight className="w-4 h-4" />
          </button>
          <div className="mt-6 flex items-center justify-center gap-1.5 text-xs" style={{ color: "var(--onInk)", opacity: 0.5, fontFamily: "var(--fontMono)" }}>
            <Check className="w-3.5 h-3.5" />
            Set up in under a minute
          </div>
        </div>
      </section>

      {/* ── Footer ──────────────────────────────────────────── */}
      <footer className="py-10" style={{ background: "var(--ink2)" }}>
        <div className="max-w-6xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4" style={{ color: "var(--brass)" }} />
            <span style={{ fontFamily: "var(--fontDisplay)", color: "var(--onInk)" }} className="text-sm font-medium">
              BookNest
            </span>
          </div>
          <p style={{ fontFamily: "var(--fontMono)", color: "var(--onInk)", opacity: 0.4 }} className="text-xs">
            © {new Date().getFullYear()} BookNest. Kept, not just tracked.
          </p>
        </div>
      </footer>
    </div>
  );
}