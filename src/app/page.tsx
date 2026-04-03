"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  AlertTriangle,
  Activity,
  BrainCircuit,
  CheckCircle2,
  CircleDot,
  Flame,
  Gauge,
  Hash,
  Loader2,
  MessageSquareText,
  Radar,
  RotateCcw,
  Send,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  Zap,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

type AnalysisMode = "sentiment" | "emotion" | "keywords" | "toxicity" | "all";

interface SentimentResult {
  label: string;
  confidence: number;
  scores: { positive: number; negative: number };
  wordCounts: { positive: number; negative: number };
}

interface EmotionResult {
  dominant: string;
  emotions: Record<string, number>;
}

interface ToxicityResult {
  isToxic: boolean;
  score: number;
  flags: string[];
}

interface AnalysisResponse {
  success: boolean;
  text: string;
  analysisType: string;
  results: {
    sentiment?: SentimentResult;
    emotion?: EmotionResult;
    keywords?: { word: string; frequency: number }[];
    toxicity?: ToxicityResult;
  };
  metadata: {
    processingTime: string;
    wordCount: number;
    characterCount: number;
    model: string;
  };
}

interface CursorParticle {
  id: number;
  x: number;
  y: number;
  size: number;
  color: string;
  dx: number;
  dy: number;
  life: number;
}

const ANALYSIS_MODES: Array<{
  value: AnalysisMode;
  label: string;
  description: string;
}> = [
  {
    value: "all",
    label: "Full scan",
    description: "Sentiment, emotion, keywords, and safety in one pass.",
  },
  {
    value: "sentiment",
    label: "Sentiment",
    description: "Read the overall tone and confidence.",
  },
  {
    value: "emotion",
    label: "Emotion",
    description: "Surface the dominant feeling behind the text.",
  },
  {
    value: "keywords",
    label: "Keywords",
    description: "Extract the words that carry the most weight.",
  },
  {
    value: "toxicity",
    label: "Safety",
    description: "Flag abusive, harmful, or aggressive language.",
  },
];

const EXAMPLE_TEXTS = [
  "The new dashboard feels sharp, fast, and surprisingly easy to trust.",
  "This rollout is a disaster. The latency is awful and the team is furious.",
  "I expected something decent, but the result was not good at all.",
];

const EMOTION_ICONS: Record<string, string> = {
  joy: "✨",
  anger: "🔥",
  sadness: "🌧️",
  surprise: "⚡",
  fear: "👁️",
  disgust: "☣️",
  trust: "💎",
  anticipation: "⏳",
  neutral: "◌",
  malice: "☠️",
};

function formatPercent(value: number) {
  return `${Math.round(value * 100)}%`;
}

function StatBar({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone: "emerald" | "rose" | "amber" | "cyan";
}) {
  const toneClass = {
    emerald: "from-emerald-400 to-emerald-200",
    rose: "from-rose-400 to-rose-200",
    amber: "from-amber-400 to-amber-200",
    cyan: "from-cyan-400 to-cyan-200",
  }[tone];

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-[11px] uppercase tracking-[0.3em] text-slate-400">
        <span>{label}</span>
        <span className="font-mono text-slate-200">{formatPercent(value)}</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-white/5 ring-1 ring-white/10">
        <div
          className={`h-full rounded-full bg-gradient-to-r ${toneClass} shadow-[0_0_20px_rgba(56,189,248,0.2)] transition-all duration-700`}
          style={{ width: `${Math.max(6, value * 100)}%` }}
        />
      </div>
    </div>
  );
}

function ModePill({
  active,
  label,
  description,
  onClick,
}: {
  active: boolean;
  label: string;
  description: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`group rounded-2xl border px-4 py-3 text-left transition-all duration-200 ${
        active
          ? "border-cyan-400/40 bg-cyan-400/10 shadow-[0_0_0_1px_rgba(34,211,238,0.2),0_18px_60px_rgba(15,23,42,0.45)]"
          : "border-white/10 bg-white/[0.03] hover:border-white/20 hover:bg-white/[0.05]"
      }`}
    >
      <div className="flex items-center justify-between gap-3">
        <span className={`text-sm font-medium ${active ? "text-white" : "text-slate-200"}`}>
          {label}
        </span>
        <span
          className={`h-2.5 w-2.5 rounded-full transition-all ${
            active ? "bg-cyan-300 shadow-[0_0_18px_rgba(103,232,249,0.9)]" : "bg-slate-600"
          }`}
        />
      </div>
      <p className="mt-2 text-xs leading-5 text-slate-400 group-hover:text-slate-300">
        {description}
      </p>
    </button>
  );
}

export default function SentimentDashboard() {
  const [text, setText] = useState("");
  const [mode, setMode] = useState<AnalysisMode>("all");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AnalysisResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [perfLite, setPerfLite] = useState(false);
  const [cursorEnabled, setCursorEnabled] = useState(false);
  const [cursorVisible, setCursorVisible] = useState(false);
  const [cursorHover, setCursorHover] = useState(false);
  const [cursorParticles, setCursorParticles] = useState<CursorParticle[]>([]);
  const sceneRef = useRef<HTMLElement>(null);
  const cursorDotRef = useRef<HTMLDivElement>(null);
  const cursorRingRef = useRef<HTMLDivElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);
  const particleIdRef = useRef(0);
  const particleTimersRef = useRef<number[]>([]);

  useEffect(() => {
    const cores = typeof navigator !== "undefined" ? navigator.hardwareConcurrency || 4 : 4;
    const memory =
      typeof navigator !== "undefined" && "deviceMemory" in navigator
        ? ((navigator as Navigator & { deviceMemory?: number }).deviceMemory ?? 4)
        : 4;

    // Auto-light mode for low-spec machines (common for older i3 laptops).
    if (cores <= 4 || memory <= 4) {
      setPerfLite(true);
    }
  }, []);

  useEffect(() => {
    let frame = 0;

    if (perfLite) {
      return;
    }

    const updateParallax = (event: MouseEvent) => {
      if (frame) return;

      frame = window.requestAnimationFrame(() => {
        const scene = sceneRef.current;
        if (!scene) return;

        const x = (event.clientX / window.innerWidth - 0.5) * 2;
        const y = (event.clientY / window.innerHeight - 0.5) * 2;

        scene.style.setProperty("--mx", x.toFixed(4));
        scene.style.setProperty("--my", y.toFixed(4));
        frame = 0;
      });
    };

    const resetParallax = () => {
      const scene = sceneRef.current;
      if (!scene) return;
      scene.style.setProperty("--mx", "0");
      scene.style.setProperty("--my", "0");
    };

    window.addEventListener("mousemove", updateParallax, { passive: true });
    window.addEventListener("mouseleave", resetParallax);

    return () => {
      if (frame) {
        window.cancelAnimationFrame(frame);
      }
      window.removeEventListener("mousemove", updateParallax);
      window.removeEventListener("mouseleave", resetParallax);
    };
  }, [perfLite]);

  useEffect(() => {
    return () => {
      particleTimersRef.current.forEach((timeoutId) => window.clearTimeout(timeoutId));
      particleTimersRef.current = [];
    };
  }, []);

  useEffect(() => {
    const finePointer = window.matchMedia("(pointer: fine)").matches;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (!finePointer || reducedMotion || perfLite) {
      setCursorEnabled(false);
      setCursorVisible(false);
      setCursorHover(false);
      return;
    }

    setCursorEnabled(true);

    let rafId = 0;
    let mouseX = window.innerWidth * 0.5;
    let mouseY = window.innerHeight * 0.5;
    let ringX = mouseX;
    let ringY = mouseY;

    const onMove = (event: MouseEvent) => {
      mouseX = event.clientX;
      mouseY = event.clientY;
      setCursorVisible(true);
    };

    const onTargetChange = (event: MouseEvent) => {
      const target = event.target as HTMLElement | null;
      if (!target) {
        setCursorHover(false);
        return;
      }

      const interactive = target.closest(
        "button, a, input, textarea, select, [data-cursor='active'], .tilt-shell"
      );
      setCursorHover(Boolean(interactive));
    };

    const onWindowLeave = () => {
      setCursorVisible(false);
      setCursorHover(false);
    };

    const onMouseOut = (event: MouseEvent) => {
      if (!event.relatedTarget) {
        onWindowLeave();
      }
    };

    const animateCursor = () => {
      ringX += (mouseX - ringX) * 0.18;
      ringY += (mouseY - ringY) * 0.18;

      if (cursorDotRef.current) {
        cursorDotRef.current.style.transform = `translate3d(${mouseX}px, ${mouseY}px, 0)`;
      }

      if (cursorRingRef.current) {
        cursorRingRef.current.style.transform = `translate3d(${ringX}px, ${ringY}px, 0)`;
      }

      rafId = window.requestAnimationFrame(animateCursor);
    };

    rafId = window.requestAnimationFrame(animateCursor);
    window.addEventListener("mousemove", onMove, { passive: true });
    document.addEventListener("mouseover", onTargetChange);
    window.addEventListener("mouseout", onMouseOut);

    return () => {
      window.cancelAnimationFrame(rafId);
      window.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseover", onTargetChange);
      window.removeEventListener("mouseout", onMouseOut);
    };
  }, [perfLite]);

  const handleAnalyze = useCallback(async () => {
    if (!text.trim() || loading) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/sentiment", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text: text.trim(), analysisType: mode }),
      });
      const data = await response.json();

      if (!response.ok) {
        setResult(null);
        setError(data.error || "Analysis failed. Try again.");
        return;
      }

      setResult(data);
      requestAnimationFrame(() => {
        resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    } catch {
      setResult(null);
      setError("Network error. The analyzer could not reach the server.");
    } finally {
      setLoading(false);
    }
  }, [loading, mode, text]);

  const handleClear = () => {
    setText("");
    setResult(null);
    setError(null);
  };

  const spawnCursorBurst = useCallback(
    (event: React.PointerEvent<HTMLElement>) => {
      if (!cursorEnabled) return;

      const palette = ["#67e8f9", "#34d399", "#fbbf24", "#fb7185", "#c084fc"];
      const burstCount = perfLite ? 3 : 7;
      const baseX = event.clientX;
      const baseY = event.clientY;

      const particles = Array.from({ length: burstCount }, (_, index) => {
        const angle = (Math.PI * 2 * index) / burstCount + Math.random() * 0.35;
        const distance = 18 + Math.random() * (perfLite ? 14 : 24);

        return {
          id: ++particleIdRef.current,
          x: baseX,
          y: baseY,
          size: perfLite ? 4 + Math.random() * 2 : 4 + Math.random() * 4,
          color: palette[index % palette.length],
          dx: Math.cos(angle) * distance,
          dy: Math.sin(angle) * distance,
          life: perfLite ? 420 : 620,
        } satisfies CursorParticle;
      });

      setCursorParticles((current) => {
        const next = [...current, ...particles].slice(-18);
        return next;
      });

      particles.forEach((particle) => {
        const timeoutId = window.setTimeout(() => {
          setCursorParticles((current) => current.filter((item) => item.id !== particle.id));
        }, particle.life);

        particleTimersRef.current.push(timeoutId);
      });
    },
    [cursorEnabled, perfLite]
  );

  const sentiment = result?.results.sentiment;
  const emotion = result?.results.emotion;
  const keywords = result?.results.keywords ?? [];
  const toxicity = result?.results.toxicity;

  const sentimentGlow =
    sentiment?.label === "Positive"
      ? "from-emerald-400 to-cyan-300"
      : sentiment?.label === "Negative"
      ? "from-rose-400 to-orange-300"
      : "from-amber-300 to-yellow-100";

  return (
    <main
      ref={sceneRef}
      onPointerDown={spawnCursorBurst}
      className={`parallax-scene relative min-h-screen overflow-hidden text-white ${perfLite ? "perf-lite" : ""}`}
    >
      {cursorEnabled && (
        <div className={`cursor-fx ${cursorVisible ? "is-visible" : ""} ${cursorHover ? "is-hover" : ""}`}>
          <div ref={cursorRingRef} className="cursor-ring" />
          <div ref={cursorDotRef} className="cursor-dot" />
          {cursorParticles.map((particle) => (
            <span
              key={particle.id}
              className="cursor-particle"
              style={{
                left: particle.x,
                top: particle.y,
                width: particle.size,
                height: particle.size,
                backgroundColor: particle.color,
                boxShadow: `0 0 12px ${particle.color}`,
                ["--dx" as never]: `${particle.dx}px`,
                ["--dy" as never]: `${particle.dy}px`,
                ["--life" as never]: `${particle.life}ms`,
              }}
            />
          ))}
        </div>
      )}
      <div className="parallax-layer-back pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(34,197,94,0.18),_transparent_24%),radial-gradient(circle_at_top_right,_rgba(56,189,248,0.16),_transparent_22%),radial-gradient(circle_at_bottom,_rgba(15,23,42,0.9),_transparent_58%)]" />
      <div className="parallax-layer-grid pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.035)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.035)_1px,transparent_1px)] bg-[size:84px_84px] opacity-30 [mask-image:radial-gradient(circle_at_center,black,transparent_82%)]" />
      <div className="parallax-glare pointer-events-none absolute inset-0" />
      <div className="floating-orb floating-orb-a" />
      <div className="floating-orb floating-orb-b" />
      <div className="floating-orb floating-orb-c" />
      <div className="floating-orb floating-orb-d" />

      <div className="parallax-content relative mx-auto flex min-h-screen w-full max-w-7xl flex-col px-4 py-6 sm:px-6 lg:px-8">
        <header className="section-hero floating-card flex flex-col gap-4 border-b border-white/10 pb-6 sm:flex-row sm:items-end sm:justify-between">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-cyan-400/30 bg-cyan-400/10 shadow-[0_0_30px_rgba(34,211,238,0.12)]">
              <BrainCircuit className="h-6 w-6 text-cyan-200" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-3">
                <Badge className="border-cyan-400/20 bg-cyan-400/10 text-cyan-100 hover:bg-cyan-400/10">
                  Live analysis
                </Badge>
                <span className="text-xs uppercase tracking-[0.35em] text-slate-400">
                  SentimentIQ
                </span>
              </div>
              <h1 className="mt-3 text-3xl font-semibold tracking-tight text-white sm:text-5xl">
                Sharp text analysis.
                <span className="block bg-gradient-to-r from-cyan-300 via-white to-emerald-200 bg-clip-text text-transparent">
                  Clean output, fast.
                </span>
              </h1>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300 sm:text-base">
                Drop in a message, choose what to inspect, and get a clear read on tone,
                emotion, keywords, and toxicity without the clutter.
              </p>
            </div>
          </div>

          <div className="grid gap-2 rounded-2xl border border-white/10 bg-white/[0.04] p-4 backdrop-blur-xl sm:min-w-[260px]">
            <div className="flex items-center justify-between text-xs uppercase tracking-[0.3em] text-slate-400">
              <span>System</span>
              <span className="text-emerald-300">Ready</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-slate-200">
              <CheckCircle2 className="h-4 w-4 text-emerald-300" />
              Explainable scoring
            </div>
            <div className="flex items-center gap-3 text-sm text-slate-200">
              <ShieldCheck className="h-4 w-4 text-cyan-300" />
              Safety-aware checks
            </div>
            <div className="flex items-center gap-3 text-sm text-slate-200">
              <Zap className="h-4 w-4 text-amber-300" />
              Responsive UI
            </div>
          </div>
        </header>

        <section className="mt-8 grid gap-6 xl:grid-cols-[1.25fr_0.75fr]">
          <div className="tilt-shell tilt-left">
          <Card className="section-panel floating-card border-white/10 bg-slate-950/70 shadow-[0_18px_80px_rgba(2,6,23,0.55)] backdrop-blur-xl">
            <div className="border-b border-white/10 px-6 py-5 sm:px-8">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <div className="flex items-center gap-2 text-xs uppercase tracking-[0.35em] text-cyan-200">
                    <Sparkles className="h-4 w-4" />
                    Input studio
                  </div>
                  <h2 className="mt-2 text-xl font-semibold text-white">Run a focused analysis</h2>
                  <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">
                    This interface stays direct: choose the analysis mode, paste your text, and
                    get a result layout that is easy to scan at a glance.
                  </p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-right">
                  <div className="text-[10px] uppercase tracking-[0.35em] text-slate-500">Text limit</div>
                  <div className="mt-1 text-sm font-medium text-slate-200">5,000 characters</div>
                </div>
              </div>
            </div>

            <div className="grid gap-4 border-b border-white/10 px-6 py-5 sm:px-8">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <div className="text-xs uppercase tracking-[0.3em] text-slate-500">Analysis mode</div>
                  <p className="mt-1 text-sm text-slate-300">
                    Pick the level of detail you want before running the scan.
                  </p>
                </div>
                <Badge variant="outline" className="border-white/10 text-slate-300">
                  {mode}
                </Badge>
              </div>

              <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                {ANALYSIS_MODES.map((option) => (
                  <ModePill
                    key={option.value}
                    active={mode === option.value}
                    label={option.label}
                    description={option.description}
                    onClick={() => setMode(option.value)}
                  />
                ))}
              </div>
            </div>

            <div className="px-6 py-5 sm:px-8">
              <label className="mb-3 flex items-center gap-2 text-sm font-medium text-slate-200">
                <MessageSquareText className="h-4 w-4 text-cyan-300" />
                Text to analyze
              </label>
              <textarea
                value={text}
                onChange={(event) => setText(event.target.value)}
                placeholder="Paste a review, chat message, product comment, or support ticket here..."
                className="min-h-[220px] w-full resize-y rounded-3xl border border-white/10 bg-slate-950/60 px-5 py-4 text-base leading-7 text-white outline-none transition placeholder:text-slate-500 focus:border-cyan-400/40 focus:ring-2 focus:ring-cyan-400/20"
              />

              <div className="mt-4 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex flex-wrap gap-2">
                  {EXAMPLE_TEXTS.map((example) => (
                    <button
                      key={example}
                      type="button"
                      onClick={() => setText(example)}
                      className="rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-left text-xs text-slate-300 transition hover:border-cyan-400/30 hover:bg-cyan-400/10 hover:text-white"
                    >
                      {example}
                    </button>
                  ))}
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-xs uppercase tracking-[0.3em] text-slate-500">
                    {text.length}/5000
                  </span>
                  <button
                    type="button"
                    onClick={handleClear}
                    disabled={loading || !text}
                    className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-sm font-medium text-slate-200 transition hover:border-white/20 hover:bg-white/[0.07] disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    <RotateCcw className="h-4 w-4" />
                    Clear
                  </button>
                  <button
                    type="button"
                    onClick={handleAnalyze}
                    disabled={loading || !text.trim()}
                    className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-cyan-400 to-emerald-300 px-5 py-2.5 text-sm font-semibold text-slate-950 shadow-[0_10px_40px_rgba(34,211,238,0.18)] transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                    Analyze
                  </button>
                </div>
              </div>
            </div>
          </Card>
          </div>

          <div className="grid gap-6">
            <div className="tilt-shell tilt-right">
            <Card className="section-panel-b floating-card border-white/10 bg-slate-950/60 shadow-[0_18px_80px_rgba(2,6,23,0.45)] backdrop-blur-xl">
              <div className="px-6 py-5 sm:px-7">
                <div className="flex items-center gap-2 text-xs uppercase tracking-[0.35em] text-slate-500">
                  <Gauge className="h-4 w-4 text-cyan-300" />
                  What you get
                </div>
                <div className="mt-5 space-y-4 text-sm leading-6 text-slate-300">
                  <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                    <div className="font-medium text-white">Tone</div>
                    <p className="mt-1 text-slate-400">
                      A clear positive, negative, or neutral call with confidence scoring.
                    </p>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                    <div className="font-medium text-white">Emotion</div>
                    <p className="mt-1 text-slate-400">
                      The strongest emotional signal, shown as a simple ranked breakdown.
                    </p>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                    <div className="font-medium text-white">Safety</div>
                    <p className="mt-1 text-slate-400">
                      Toxic language is highlighted instead of buried in dense text.
                    </p>
                  </div>
                </div>
              </div>
            </Card>
            </div>

            <div className="tilt-shell tilt-left">
            <Card className="section-panel-b floating-card float-delay-2 border-white/10 bg-slate-950/60 shadow-[0_18px_80px_rgba(2,6,23,0.45)] backdrop-blur-xl">
              <div className="px-6 py-5 sm:px-7">
                <div className="flex items-center gap-2 text-xs uppercase tracking-[0.35em] text-slate-500">
                  <TrendingUp className="h-4 w-4 text-emerald-300" />
                  Output style
                </div>
                <div className="mt-4 rounded-2xl border border-white/10 bg-gradient-to-br from-white/[0.04] to-white/[0.02] p-4">
                  <p className="text-sm leading-6 text-slate-300">
                    The layout is intentionally minimal: one strong primary metric, then supporting
                    details below it. That keeps the interface fast to read on both desktop and mobile.
                  </p>
                </div>
              </div>
            </Card>
            </div>
          </div>
        </section>

        {error && (
          <Card className="mt-6 border-rose-500/20 bg-rose-500/10 shadow-[0_18px_80px_rgba(190,18,60,0.16)]">
            <div className="flex items-start gap-3 px-6 py-5 text-rose-100">
              <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-rose-300" />
              <div>
                <div className="font-medium">Analysis error</div>
                <p className="mt-1 text-sm text-rose-100/80">{error}</p>
              </div>
            </div>
          </Card>
        )}

        <div ref={resultsRef} className="mt-6 scroll-mt-8">
          {result ? (
            <section className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
              <div className="tilt-shell tilt-left">
              <Card className="section-result-main floating-card float-delay-1 border-white/10 bg-slate-950/70 shadow-[0_24px_90px_rgba(2,6,23,0.55)] backdrop-blur-xl">
                <div className="border-b border-white/10 px-6 py-5 sm:px-8">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2 text-xs uppercase tracking-[0.35em] text-slate-500">
                        <Radar className="h-4 w-4 text-cyan-300" />
                        Primary result
                      </div>
                      <h2 className="mt-2 text-2xl font-semibold text-white">Sentiment core</h2>
                    </div>
                    <Badge className="border-white/10 bg-white/[0.04] text-slate-200" variant="outline">
                      {result.analysisType}
                    </Badge>
                  </div>
                </div>

                <div className="px-6 py-6 sm:px-8">
                  {sentiment ? (
                    <>
                      <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
                        <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-5">
                          <div className="text-xs uppercase tracking-[0.35em] text-slate-500">Label</div>
                          <div
                            className={`mt-4 bg-gradient-to-r ${sentimentGlow} bg-clip-text text-4xl font-black uppercase tracking-tight text-transparent sm:text-5xl`}
                          >
                            {sentiment.label}
                          </div>
                          <div className="mt-3 text-sm text-slate-400">
                            Confidence {formatPercent(sentiment.confidence)}
                          </div>
                          <div className="mt-5 flex items-center gap-3 text-sm text-slate-300">
                            <CircleDot className="h-4 w-4 text-cyan-300" />
                            {sentiment.wordCounts.positive} positive matches, {sentiment.wordCounts.negative} negative matches
                          </div>
                        </div>

                        <div className="space-y-4 rounded-3xl border border-white/10 bg-white/[0.03] p-5">
                          <StatBar
                            label="Positive weight"
                            value={sentiment.scores.positive}
                            tone="emerald"
                          />
                          <StatBar
                            label="Negative weight"
                            value={sentiment.scores.negative}
                            tone="rose"
                          />
                          <div className="grid grid-cols-2 gap-3 pt-2 text-xs uppercase tracking-[0.3em] text-slate-500">
                            <div className="rounded-2xl border border-white/10 bg-black/20 p-3">
                              <div className="text-slate-400">Processing</div>
                              <div className="mt-1 text-sm text-white">{result.metadata.processingTime}</div>
                            </div>
                            <div className="rounded-2xl border border-white/10 bg-black/20 p-3">
                              <div className="text-slate-400">Model</div>
                              <div className="mt-1 text-sm text-white">{result.metadata.model}</div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-6 text-sm text-slate-300">
                      No sentiment result was returned for this scan.
                    </div>
                  )}
                </div>
              </Card>
              </div>

              <div className="grid gap-6">
                <div className="tilt-shell tilt-right">
                <Card className="section-result-emotion floating-card float-delay-2 border-white/10 bg-slate-950/70 shadow-[0_24px_90px_rgba(2,6,23,0.55)] backdrop-blur-xl">
                  <div className="border-b border-white/10 px-6 py-5">
                    <div className="flex items-center gap-2 text-xs uppercase tracking-[0.35em] text-slate-500">
                      <Sparkles className="h-4 w-4 text-cyan-300" />
                      Emotion map
                    </div>
                  </div>
                  <div className="px-6 py-5">
                    {emotion ? (
                      <>
                        <div className="flex items-start gap-4 rounded-3xl border border-white/10 bg-white/[0.03] p-5">
                          <div className="text-4xl">
                            {EMOTION_ICONS[emotion.dominant] ?? "◌"}
                          </div>
                          <div>
                            <div className="text-2xl font-semibold capitalize text-white">
                              {emotion.dominant}
                            </div>
                            <p className="mt-1 text-sm text-slate-400">
                              Dominant emotion and normalized distribution.
                            </p>
                          </div>
                        </div>

                        <div className="mt-5 space-y-4">
                          {Object.entries(emotion.emotions)
                            .slice(0, 4)
                            .map(([name, value]) => (
                              <StatBar
                                key={name}
                                label={`${EMOTION_ICONS[name] ?? "◌"} ${name}`}
                                value={value}
                                tone="cyan"
                              />
                            ))}
                        </div>
                      </>
                    ) : (
                      <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-5 text-sm text-slate-400">
                        Emotion data is not included for the selected mode.
                      </div>
                    )}
                  </div>
                </Card>
                </div>

                <div className="tilt-shell tilt-left">
                <Card className="section-result-safety floating-card float-delay-3 border-white/10 bg-slate-950/70 shadow-[0_24px_90px_rgba(2,6,23,0.55)] backdrop-blur-xl">
                  <div className="border-b border-white/10 px-6 py-5">
                    <div className="flex items-center gap-2 text-xs uppercase tracking-[0.35em] text-slate-500">
                      <Flame className="h-4 w-4 text-rose-300" />
                      Safety and keywords
                    </div>
                  </div>
                  <div className="grid gap-4 px-6 py-5 sm:grid-cols-2">
                    <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-5">
                      <div className="text-sm font-medium text-white">Toxicity</div>
                      {toxicity ? (
                        <div className="mt-4 space-y-3">
                          <div className="flex items-center gap-2 text-sm text-slate-300">
                            {toxicity.isToxic ? (
                              <AlertTriangle className="h-4 w-4 text-rose-300" />
                            ) : (
                              <ShieldCheck className="h-4 w-4 text-emerald-300" />
                            )}
                            {toxicity.isToxic ? "Potential issue detected" : "No obvious threat detected"}
                          </div>
                          <StatBar label="Risk score" value={toxicity.score} tone={toxicity.isToxic ? "rose" : "emerald"} />
                          {toxicity.flags.length > 0 && (
                            <div className="space-y-2 pt-1 text-sm text-slate-400">
                              {toxicity.flags.slice(0, 2).map((flag) => (
                                <div key={flag} className="rounded-2xl border border-white/10 bg-black/20 px-3 py-2">
                                  {flag}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      ) : (
                        <p className="mt-3 text-sm text-slate-400">Not included in this scan mode.</p>
                      )}
                    </div>

                    <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-5">
                      <div className="text-sm font-medium text-white">Keywords</div>
                      {keywords.length > 0 ? (
                        <div className="mt-4 flex flex-wrap gap-2">
                          {keywords.slice(0, 5).map((keyword) => (
                            <span
                              key={keyword.word}
                              className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/20 px-3 py-2 text-xs text-slate-200"
                            >
                              <Hash className="h-3.5 w-3.5 text-cyan-300" />
                              {keyword.word}
                              <span className="font-mono text-slate-500">x{keyword.frequency}</span>
                            </span>
                          ))}
                        </div>
                      ) : (
                        <p className="mt-3 text-sm text-slate-400">No keyword list was returned for this scan mode.</p>
                      )}
                    </div>
                  </div>
                </Card>
                </div>
              </div>
            </section>
          ) : (
            <div className="tilt-shell tilt-right">
            <Card className="section-empty floating-card border-dashed border-white/10 bg-slate-950/30 py-12 text-center shadow-[0_24px_90px_rgba(2,6,23,0.28)] backdrop-blur-xl">
              <div className="mx-auto flex max-w-xl flex-col items-center px-6">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04]">
                  <Activity className="h-6 w-6 text-cyan-200" />
                </div>
                <h2 className="mt-4 text-xl font-semibold text-white">Results will appear here</h2>
                <p className="mt-2 text-sm leading-6 text-slate-400">
                  Run a scan to see the score, emotion breakdown, toxicity flag, and keyword summary in a clean dashboard.
                </p>
              </div>
            </Card>
            </div>
          )}
        </div>

        <section className="mt-8 grid gap-6 lg:grid-cols-3">
          <div className="tilt-shell tilt-left">
          <Card className="section-step-one floating-card border-white/10 bg-slate-950/55 shadow-[0_18px_70px_rgba(2,6,23,0.4)] backdrop-blur-xl">
            <div className="px-6 py-5">
              <div className="flex items-center gap-2 text-xs uppercase tracking-[0.35em] text-slate-500">
                <Activity className="h-4 w-4 text-cyan-300" />
                Step 1
              </div>
              <h3 className="mt-3 text-lg font-semibold text-white">Read the text</h3>
              <p className="mt-2 text-sm leading-6 text-slate-400">
                The analyzer tokenizes the input and checks for signals that matter: sentiment words,
                emotional cues, strong keywords, and harmful language.
              </p>
            </div>
          </Card>
          </div>

          <div className="tilt-shell tilt-right">
          <Card className="section-step-two floating-card float-delay-1 border-white/10 bg-slate-950/55 shadow-[0_18px_70px_rgba(2,6,23,0.4)] backdrop-blur-xl">
            <div className="px-6 py-5">
              <div className="flex items-center gap-2 text-xs uppercase tracking-[0.35em] text-slate-500">
                <TrendingUp className="h-4 w-4 text-emerald-300" />
                Step 2
              </div>
              <h3 className="mt-3 text-lg font-semibold text-white">Score the signals</h3>
              <p className="mt-2 text-sm leading-6 text-slate-400">
                Positive and negative weights are balanced, then normalized into a confidence score
                that is easy to understand at a glance.
              </p>
            </div>
          </Card>
          </div>

          <div className="tilt-shell tilt-left">
          <Card className="section-step-three floating-card float-delay-2 border-white/10 bg-slate-950/55 shadow-[0_18px_70px_rgba(2,6,23,0.4)] backdrop-blur-xl">
            <div className="px-6 py-5">
              <div className="flex items-center gap-2 text-xs uppercase tracking-[0.35em] text-slate-500">
                <ShieldCheck className="h-4 w-4 text-amber-300" />
                Step 3
              </div>
              <h3 className="mt-3 text-lg font-semibold text-white">Explain the result</h3>
              <p className="mt-2 text-sm leading-6 text-slate-400">
                The output stays readable: one main label, a few supporting metrics, and a compact
                explanation section so nothing feels buried.
              </p>
            </div>
          </Card>
          </div>
        </section>

        <footer className="section-footer mt-10 border-t border-white/10 py-6 text-sm text-slate-500">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>Built for clean sentiment inspection and fast decision-making.</div>
            <div className="flex items-center gap-4 text-xs uppercase tracking-[0.3em]">
              <span className="inline-flex items-center gap-2">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-300" />
                Explainable
              </span>
              <span className="inline-flex items-center gap-2">
                <Gauge className="h-3.5 w-3.5 text-cyan-300" />
                Lightweight
              </span>
              <span className="inline-flex items-center gap-2">
                <BrainCircuit className="h-3.5 w-3.5 text-slate-300" />
                Responsive
              </span>
            </div>
          </div>
        </footer>
      </div>
    </main>
  );
}
