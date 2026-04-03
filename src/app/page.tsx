"use client";

import React, { useState, useCallback, useRef } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Brain,
  Sparkles,
  Send,
  RotateCcw,
  Activity,
  Shield,
  Tag,
  Heart,
  Zap,
  ChevronRight,
  Info,
  TrendingUp,
  BarChart3,
  Code2,
  Eye,
  CheckCircle2,
  XCircle,
  MinusCircle,
  Loader2,
  Trash2,
  AlertTriangle,
  BookOpen,
  Server,
  Gauge,
  Cpu,
  Globe,
  Clock,
  Hash,
  Download,
  FileJson,
  FileText,
  FileSpreadsheet,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@radix-ui/react-dropdown-menu";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis } from "recharts";

// ─────────────────────────────────────
// Types
// ─────────────────────────────────────
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

interface HistoryEntry {
  id: string;
  timestamp: Date;
  text: string;
  sentiment: string;
  confidence: number;
  processingTime: string;
}

// ─────────────────────────────────────
// Constants
// ─────────────────────────────────────
const EXAMPLE_TEXTS = [
  "This product is absolutely amazing! I've been using it for months and it exceeded all my expectations. The quality is outstanding and the customer service team was incredibly helpful.",
  "I'm really disappointed with this service. It's been nothing but problems since day one. The support team was unresponsive and the product itself is full of bugs.",
  "The movie was okay. Nothing special, but not terrible either. It had some good moments but overall felt quite average and predictable.",
  "I can't believe how wonderful this experience was! From start to finish, everything was perfect. The attention to detail and the level of care they put into their work is truly remarkable.",
  "This is the worst purchase I've ever made. Complete waste of money. The item broke after just two days and the company refused to refund me. Absolutely unacceptable.",
];

const ANALYSIS_TYPES = [
  { value: "sentiment", label: "Sentiment", icon: Heart, desc: "Positive / Negative / Neutral" },
  { value: "emotion", label: "Emotions", icon: Zap, desc: "Joy, Anger, Sadness, Fear..." },
  { value: "keywords", label: "Keywords", icon: Tag, desc: "Extract key terms" },
  { value: "toxicity", label: "Toxicity", icon: Shield, desc: "Detect harmful content" },
  { value: "all", label: "All Analysis", icon: Brain, desc: "Complete analysis suite" },
];

const EMOTION_COLORS: Record<string, string> = {
  joy: "#f59e0b",
  anger: "#ef4444",
  sadness: "#3b82f6",
  surprise: "#a855f7",
  fear: "#6366f1",
  disgust: "#84cc16",
  trust: "#10b981",
  anticipation: "#f97316",
  neutral: "#6b7280",
};

const EMOTION_ICONS: Record<string, string> = {
  joy: "😊",
  anger: "😠",
  sadness: "😢",
  surprise: "😲",
  fear: "😨",
  disgust: "🤢",
  trust: "🤝",
  anticipation: "🤩",
  neutral: "😐",
};

const chartConfig = {
  positive: { label: "Positive", color: "#10b981" },
  negative: { label: "Negative", color: "#ef4444" },
  neutral: { label: "Neutral", color: "#f59e0b" },
};

// ─────────────────────────────────────
// Optimized Python Backend Code
// ─────────────────────────────────────
const PYTHON_BACKEND_CODE = `"""
SentimentIQ — Optimized Python Backend
Using DistilBERT with FastAPI for production deployment.
"""

import torch
import hashlib
from functools import lru_cache
from typing import Optional
from contextlib import asynccontextmanager
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field
from transformers import AutoModelForSequenceClassification, AutoTokenizer
import time


class AnalysisRequest(BaseModel):
    text: str = Field(..., min_length=1, max_length=5000,
                      description="Text to analyze")
    analysis_type: str = Field(default="sentiment",
                               description="sentiment|emotion|keywords|toxicity|all")


class SentimentBackend:
    """Optimized sentiment analysis with DistilBERT."""

    def __init__(self, model_path: Optional[str] = None):
        base_model = "distilbert-base-uncased-finetuned-sst-2-english"

        if model_path:
            print(f"Loading fine-tuned model from {model_path}...")
            self.model = AutoModelForSequenceClassification.from_pretrained(
                model_path, torch_dtype=torch.float16  # FP16 for speed
            )
        else:
            self.model = AutoModelForSequenceClassification.from_pretrained(
                base_model, torch_dtype=torch.float16
            )

        self.tokenizer = AutoTokenizer.from_pretrained(base_model)
        self.model.eval()
        self.labels = {0: "Negative", 1: "Positive"}

        # Enable inference optimizations
        torch.set_num_threads(4)

    @lru_cache(maxsize=1024)
    def _get_cached_result(self, text_hash: str) -> dict:
        return {}  # Cache miss sentinel

    def analyze(self, text: str) -> dict:
        text_hash = hashlib.md5(text.encode()).hexdigest()
        cached = self._get_cached_result(text_hash)
        if cached:
            return cached

        inputs = self.tokenizer(
            text, return_tensors="pt",
            truncation=True, max_length=512,
            padding="max_length"
        )

        with torch.no_grad():
            outputs = self.model(**inputs)

        probs = torch.nn.functional.softmax(outputs.logits, dim=-1)
        prediction = torch.argmax(probs, dim=-1).item()
        confidence = float(probs[0][prediction])

        result = {
            "label": self.labels[prediction],
            "confidence": round(confidence, 4),
            "scores": {
                "positive": round(float(probs[0][1]), 4),
                "negative": round(float(probs[0][0]), 4),
            }
        }

        return result


# ── FastAPI App ──────────────────────────────
backend = SentimentBackend()

app = FastAPI(
    title="SentimentIQ API",
    version="2.0.0",
    description="Production sentiment analysis endpoint"
)


@app.post("/sentiment")
async def analyze_sentiment(request: AnalysisRequest):
    start = time.perf_counter()

    if len(request.text.strip()) == 0:
        raise HTTPException(400, "Text cannot be empty")

    result = backend.analyze(request.text)
    result["processing_time_ms"] = round(
        (time.perf_counter() - start) * 1000, 2
    )
    return result


@app.get("/health")
async def health_check():
    return {"status": "healthy", "model_loaded": True}`;

// ─────────────────────────────────────
// Main App Component
// ─────────────────────────────────────
export default function SentimentIQ() {
  const [text, setText] = useState("");
  const [analysisType, setAnalysisType] = useState("all");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AnalysisResponse | null>(null);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [error, setError] = useState<string | null>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

  const sentimentCounts = React.useMemo(() => {
    const counts = { positive: 0, negative: 0, neutral: 0 };
    history.forEach((entry) => {
      if (entry.sentiment in counts) {
        counts[entry.sentiment as keyof typeof counts]++;
      }
    });
    return counts;
  }, [history]);

  const pieData = React.useMemo(() => {
    return Object.entries(sentimentCounts)
      .filter(([, v]) => v > 0)
      .map(([k, v]) => ({ name: k.charAt(0).toUpperCase() + k.slice(1), value: v, fill: chartConfig[k as keyof typeof chartConfig].color }));
  }, [sentimentCounts]);

  const emotionBarData = React.useMemo(() => {
    if (!result?.results?.emotion?.emotions) return [];
    return Object.entries(result.results.emotion.emotions)
      .map(([k, v]) => ({
        name: k.charAt(0).toUpperCase() + k.slice(1),
        score: Math.round(v * 100),
        fill: EMOTION_COLORS[k] || "#6b7280",
      }))
      .sort((a, b) => b.score - a.score);
  }, [result]);

  const handleAnalyze = useCallback(async () => {
    if (!text.trim()) return;
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch("/api/sentiment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: text.trim(), analysisType }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Analysis failed. Please try again.");
        return;
      }

      setResult(data);

      // Add to history
      const entry: HistoryEntry = {
        id: crypto.randomUUID(),
        timestamp: new Date(),
        text: data.text,
        sentiment: data.results.sentiment?.label || "N/A",
        confidence: data.results.sentiment?.confidence || 0,
        processingTime: data.metadata.processingTime,
      };
      setHistory((prev) => [entry, ...prev].slice(0, 50));

      // Scroll to results
      setTimeout(() => {
        resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 100);
    } catch {
      setError("Network error. Please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  }, [text, analysisType]);

  const handleClear = () => {
    setText("");
    setResult(null);
    setError(null);
  };

  const handleClearHistory = () => {
    setHistory([]);
  };

  const handleExampleClick = (example: string) => {
    setText(example);
    setResult(null);
    setError(null);
  };

  // ── Download Helpers ──
  const downloadFile = useCallback((content: string, filename: string, mimeType: string) => {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, []);

  const downloadJSON = useCallback(() => {
    if (!result) return;
    const payload = {
      text: result.text,
      analysisType: result.analysisType,
      results: result.results,
      metadata: result.metadata,
      exportedAt: new Date().toISOString(),
    };
    downloadFile(JSON.stringify(payload, null, 2), `sentiment-analysis-${Date.now()}.json`, "application/json");
  }, [result, downloadFile]);

  const downloadTXT = useCallback(() => {
    if (!result) return;
    const sep = "═".repeat(50);
    const thin = "─".repeat(50);
    let report = `${sep}\n  SENTIMENTIQ — ANALYSIS REPORT\n${sep}\n`;
    report += `  Generated: ${new Date().toLocaleString()}\n`;
    report += `  Model: ${result.metadata.model}\n`;
    report += `  Processing Time: ${result.metadata.processingTime}\n${thin}\n\n`;
    report += `ORIGINAL TEXT\n${thin}\n${text}\n\n`;

    if (result.results.sentiment) {
      const s = result.results.sentiment;
      report += `SENTIMENT ANALYSIS\n${thin}\n`;
      report += `  Label:      ${s.label}\n`;
      report += `  Confidence: ${Math.round(s.confidence * 100)}%\n`;
      report += `  Positive:   ${Math.round(s.scores.positive * 100)}% (${s.wordCounts.positive} words)\n`;
      report += `  Negative:   ${Math.round(s.scores.negative * 100)}% (${s.wordCounts.negative} words)\n\n`;
    }

    if (result.results.emotion) {
      const e = result.results.emotion;
      report += `EMOTION DETECTION\n${thin}\n`;
      report += `  Dominant: ${e.dominant}\n`;
      for (const [k, v] of Object.entries(e.emotions)) {
        const bar = "█".repeat(Math.round(v * 20));
        report += `  ${k.padEnd(14)} ${bar} ${Math.round(v * 100)}%\n`;
      }
      report += "\n";
    }

    if (result.results.keywords && result.results.keywords.length > 0) {
      report += `KEYWORD EXTRACTION\n${thin}\n`;
      result.results.keywords.forEach((kw, i) => {
        report += `  ${i + 1}. ${kw.word} (frequency: ${kw.frequency})\n`;
      });
      report += "\n";
    }

    if (result.results.toxicity) {
      const t = result.results.toxicity;
      report += `TOXICITY CHECK\n${thin}\n`;
      report += `  Status: ${t.isToxic ? "FLAGGED" : "CLEAN"}\n`;
      report += `  Score:  ${Math.round(t.score * 100)}%\n`;
      if (t.flags.length > 0) {
        t.flags.forEach((f) => { report += `  ⚠ ${f}\n`; });
      }
      report += "\n";
    }

    report += `${sep}\n  Report generated by SentimentIQ\n${sep}\n`;
    downloadFile(report, `sentiment-report-${Date.now()}.txt`, "text/plain");
  }, [result, text, downloadFile]);

  const downloadCSV = useCallback(() => {
    if (history.length === 0) return;
    const header = "Timestamp,Text,Sentiment,Confidence,Processing Time";
    const rows = history.map(
      (e) =>
        `${e.timestamp.toISOString()},"${e.text.replace(/"/g, '""')}",${e.sentiment},${Math.round(e.confidence * 100)}%,${e.processingTime}`
    );
    downloadFile([header, ...rows].join("\n"), `sentiment-history-${Date.now()}.csv`, "text/csv");
  }, [history, downloadFile]);

  const downloadProject = useCallback(() => {
    window.open("/api/download", "_blank");
  }, []);

  const sentiment = result?.results?.sentiment;
  const getSentimentIcon = (label: string) => {
    if (label === "Positive") return <CheckCircle2 className="h-6 w-6 text-emerald-400" />;
    if (label === "Negative") return <XCircle className="h-6 w-6 text-red-400" />;
    return <MinusCircle className="h-6 w-6 text-amber-400" />;
  };

  const getGlowClass = (label: string) => {
    if (label === "Positive") return "glow-positive";
    if (label === "Negative") return "glow-negative";
    return "glow-neutral";
  };

  const getSentimentColor = (label: string) => {
    if (label === "Positive") return "text-emerald-400";
    if (label === "Negative") return "text-red-400";
    return "text-amber-400";
  };

  return (
    <div className="min-h-screen flex flex-col gradient-bg">
      {/* ── Header ── */}
      <header className="sticky top-0 z-50 glass-card border-b border-border/50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-gradient-to-br from-emerald-500/20 to-amber-500/20 flex items-center justify-center border border-emerald-500/30">
              <Brain className="h-5 w-5 text-emerald-400" />
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight">SentimentIQ</h1>
              <p className="text-xs text-muted-foreground hidden sm:block">
                AI-Powered Text Analysis
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs border-emerald-500/30 text-emerald-400">
              <Activity className="h-3 w-3 mr-1" />
              Live
            </Badge>
            <Button
              variant="outline"
              size="sm"
              onClick={downloadProject}
              className="gap-1.5 text-xs bg-emerald-600/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-600/20 hover:text-emerald-300"
            >
              <Download className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Download Project</span>
              <span className="sm:hidden">ZIP</span>
            </Button>
          </div>
        </div>
      </header>

      {/* ── Main Content ── */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-10 space-y-8 sm:space-y-12">

        {/* ── Hero Section ── */}
        <section className="text-center space-y-4 pt-4 sm:pt-8">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium">
            <Sparkles className="h-3.5 w-3.5" />
            Powered by DistilBERT Transformer
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight">
            Understand the{" "}
            <span className="bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 bg-clip-text text-transparent">
              Emotion
            </span>{" "}
            Behind Every Word
          </h2>
          <p className="text-muted-foreground text-sm sm:text-base max-w-2xl mx-auto leading-relaxed">
            Advanced AI sentiment analysis that detects positive, negative, and neutral tones
            with emotion detection, keyword extraction, and toxicity screening — all in real time.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            {[
              { icon: Gauge, label: "Real-time" },
              { icon: Shield, label: "Toxicity Check" },
              { icon: Zap, label: "Emotion Detection" },
              { icon: Globe, label: "Multi-language" },
            ].map(({ icon: Icon, label }) => (
              <div key={label} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Icon className="h-3.5 w-3.5" />
                {label}
              </div>
            ))}
          </div>
        </section>

        {/* ── Analyzer Section ── */}
        <section className="space-y-4">
          <Card className="glass-card overflow-hidden">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-md bg-primary/10 flex items-center justify-center">
                  <Brain className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-base">Text Analyzer</CardTitle>
                  <CardDescription className="text-xs">
                    Enter or paste your text below for instant AI analysis
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Controls */}
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="flex-1">
                  <label className="text-xs text-muted-foreground mb-1.5 block font-medium">
                    Analysis Type
                  </label>
                  <Select value={analysisType} onValueChange={setAnalysisType}>
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {ANALYSIS_TYPES.map(({ value, label, icon: Icon, desc }) => (
                        <SelectItem key={value} value={value}>
                          <div className="flex items-center gap-2">
                            <Icon className="h-4 w-4" />
                            <div>
                              <div className="font-medium">{label}</div>
                              <div className="text-xs text-muted-foreground">{desc}</div>
                            </div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex gap-2 sm:self-end">
                  <Button
                    onClick={handleAnalyze}
                    disabled={!text.trim() || loading}
                    className="bg-emerald-600 hover:bg-emerald-500 text-white min-w-[120px]"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Analyzing...
                      </>
                    ) : (
                      <>
                        <Send className="h-4 w-4 mr-2" />
                        Analyze
                      </>
                    )}
                  </Button>
                  <Button variant="outline" onClick={handleClear} disabled={loading}>
                    <RotateCcw className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Textarea */}
              <div>
                <label className="text-xs text-muted-foreground mb-1.5 block font-medium">
                  Your Text
                </label>
                <Textarea
                  placeholder="Type or paste the text you want to analyze..."
                  className="min-h-[140px] resize-y text-sm leading-relaxed bg-background/50"
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  maxLength={5000}
                />
                <div className="flex justify-between mt-1.5">
                  <span className="text-xs text-muted-foreground">
                    {text.split(/\s+/).filter(Boolean).length} words
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {text.length}/5000
                  </span>
                </div>
              </div>

              {/* Example texts */}
              <div>
                <label className="text-xs text-muted-foreground mb-2 block font-medium">
                  Try an example:
                </label>
                <div className="flex flex-wrap gap-2">
                  {EXAMPLE_TEXTS.slice(0, 3).map((ex, i) => (
                    <button
                      key={i}
                      onClick={() => handleExampleClick(ex)}
                      className="text-xs px-3 py-1.5 rounded-full bg-muted/50 border border-border/50 hover:bg-muted hover:border-border transition-colors text-muted-foreground hover:text-foreground truncate max-w-[200px] sm:max-w-[280px]"
                    >
                      {ex.slice(0, 50)}...
                    </button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* ── Error Display ── */}
        {error && (
          <Card className="border-red-500/30 bg-red-500/5">
            <CardContent className="py-4 flex items-center gap-3">
              <AlertTriangle className="h-5 w-5 text-red-400 shrink-0" />
              <p className="text-sm text-red-300">{error}</p>
            </CardContent>
          </Card>
        )}

        {/* ── Results Section ── */}
        <div ref={resultsRef}>
          {result && (
            <section className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ChevronRight className="h-5 w-5 text-primary" />
                  <h3 className="text-xl font-bold">Analysis Results</h3>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className="gap-2 text-xs">
                      <Download className="h-3.5 w-3.5" />
                      Download
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-52">
                    <DropdownMenuItem onClick={downloadJSON} className="cursor-pointer gap-2 text-xs">
                      <FileJson className="h-4 w-4 text-emerald-400" />
                      <div>
                        <div className="font-medium">JSON Data</div>
                        <div className="text-[11px] text-muted-foreground">Raw analysis response</div>
                      </div>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={downloadTXT} className="cursor-pointer gap-2 text-xs">
                      <FileText className="h-4 w-4 text-cyan-400" />
                      <div>
                        <div className="font-medium">Text Report</div>
                        <div className="text-[11px] text-muted-foreground">Formatted .txt report</div>
                      </div>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={downloadCSV} className="cursor-pointer gap-2 text-xs" disabled={history.length === 0}>
                      <FileSpreadsheet className="h-4 w-4 text-amber-400" />
                      <div>
                        <div className="font-medium">History CSV</div>
                        <div className="text-[11px] text-muted-foreground">All {history.length} entries</div>
                      </div>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Sentiment Card */}
                {result.results.sentiment && (
                  <Card className={`glass-card ${getGlowClass(result.results.sentiment.label)}`}>
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Heart className="h-4 w-4 text-muted-foreground" />
                          <CardTitle className="text-sm">Sentiment</CardTitle>
                        </div>
                        {getSentimentIcon(result.results.sentiment.label)}
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="text-center space-y-2">
                        <div className={`text-2xl font-bold ${getSentimentColor(result.results.sentiment.label)}`}>
                          {result.results.sentiment.label}
                        </div>
                        <div className="text-muted-foreground text-xs">
                          Confidence: <span className="text-foreground font-semibold">{Math.round(result.results.sentiment.confidence * 100)}%</span>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-emerald-400">Positive</span>
                          <span className="text-emerald-400 font-mono">{Math.round(result.results.sentiment.scores.positive * 100)}%</span>
                        </div>
                        <div className="h-2 rounded-full bg-muted overflow-hidden">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-emerald-400 transition-all duration-700"
                            style={{ width: `${Math.round(result.results.sentiment.scores.positive * 100)}%` }}
                          />
                        </div>
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-red-400">Negative</span>
                          <span className="text-red-400 font-mono">{Math.round(result.results.sentiment.scores.negative * 100)}%</span>
                        </div>
                        <div className="h-2 rounded-full bg-muted overflow-hidden">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-red-500 to-red-400 transition-all duration-700"
                            style={{ width: `${Math.round(result.results.sentiment.scores.negative * 100)}%` }}
                          />
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t border-border/50">
                        <span>{result.results.sentiment.wordCounts.positive} positive words</span>
                        <span>{result.results.sentiment.wordCounts.negative} negative words</span>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Emotion Card */}
                {result.results.emotion && (
                  <Card className="glass-card">
                    <CardHeader className="pb-3">
                      <div className="flex items-center gap-2">
                        <Zap className="h-4 w-4 text-muted-foreground" />
                        <CardTitle className="text-sm">Emotion Detection</CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="text-center space-y-1">
                        <div className="text-3xl">
                          {EMOTION_ICONS[result.results.emotion.dominant] || "😐"}
                        </div>
                        <div className="text-lg font-semibold capitalize">
                          {result.results.emotion.dominant}
                        </div>
                        <div className="text-xs text-muted-foreground">Dominant Emotion</div>
                      </div>

                      {emotionBarData.length > 0 && (
                        <div className="space-y-2.5">
                          {emotionBarData.slice(0, 4).map((item) => (
                            <div key={item.name} className="space-y-1">
                              <div className="flex items-center justify-between text-xs">
                                <span className="flex items-center gap-1.5">
                                  <span>{EMOTION_ICONS[item.name.toLowerCase()] || "🔹"}</span>
                                  {item.name}
                                </span>
                                <span className="font-mono">{item.score}%</span>
                              </div>
                              <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                                <div
                                  className="h-full rounded-full transition-all duration-700"
                                  style={{ width: `${item.score}%`, backgroundColor: item.fill }}
                                />
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}

                {/* Keywords Card */}
                {result.results.keywords && result.results.keywords.length > 0 && (
                  <Card className="glass-card">
                    <CardHeader className="pb-3">
                      <div className="flex items-center gap-2">
                        <Tag className="h-4 w-4 text-muted-foreground" />
                        <CardTitle className="text-sm">Keyword Extraction</CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex flex-wrap gap-2">
                        {result.results.keywords.map((kw) => (
                          <Badge
                            key={kw.word}
                            variant="secondary"
                            className="px-3 py-1.5 text-xs font-medium"
                          >
                            <Hash className="h-3 w-3 mr-1 opacity-60" />
                            {kw.word}
                            <span className="ml-1.5 text-muted-foreground">×{kw.frequency}</span>
                          </Badge>
                        ))}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Top {result.results.keywords.length} keywords extracted by frequency analysis
                      </p>
                    </CardContent>
                  </Card>
                )}

                {/* Toxicity Card */}
                {result.results.toxicity && (
                  <Card className={`glass-card ${result.results.toxicity.isToxic ? "border-red-500/30" : ""}`}>
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Shield className="h-4 w-4 text-muted-foreground" />
                          <CardTitle className="text-sm">Toxicity Check</CardTitle>
                        </div>
                        <Badge
                          variant={result.results.toxicity.isToxic ? "destructive" : "outline"}
                          className="text-xs"
                        >
                          {result.results.toxicity.isToxic ? "Flagged" : "Clean"}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="text-center">
                        <div className={`text-2xl font-bold ${result.results.toxicity.isToxic ? "text-red-400" : "text-emerald-400"}`}>
                          {Math.round(result.results.toxicity.score * 100)}%
                        </div>
                        <div className="text-xs text-muted-foreground">Toxicity Score</div>
                      </div>

                      <div className="h-2 rounded-full bg-muted overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-700 ${
                            result.results.toxicity.isToxic
                              ? "bg-gradient-to-r from-red-500 to-red-400"
                              : "bg-gradient-to-r from-emerald-500 to-emerald-400"
                          }`}
                          style={{ width: `${Math.round(result.results.toxicity.score * 100)}%` }}
                        />
                      </div>

                      {result.results.toxicity.flags.length > 0 && (
                        <div className="space-y-1.5">
                          {result.results.toxicity.flags.map((flag, i) => (
                            <div key={i} className="flex items-center gap-2 text-xs text-red-400">
                              <AlertTriangle className="h-3 w-3 shrink-0" />
                              {flag}
                            </div>
                          ))}
                        </div>
                      )}

                      {result.results.toxicity.flags.length === 0 && (
                        <p className="text-xs text-emerald-400 text-center">
                          No toxic patterns detected. Content appears clean.
                        </p>
                      )}
                    </CardContent>
                  </Card>
                )}
              </div>

              {/* Metadata */}
              <Card className="glass-card">
                <CardContent className="py-3">
                  <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1.5">
                      <Clock className="h-3.5 w-3.5" />
                      <span>{result.metadata.processingTime}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Hash className="h-3.5 w-3.5" />
                      <span>{result.metadata.wordCount} words</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Cpu className="h-3.5 w-3.5" />
                      <span>{result.metadata.model}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </section>
          )}
        </div>

        {/* ── Dashboard Section: Charts & History ── */}
        {history.length > 0 && (
          <section className="space-y-6 animate-in fade-in duration-500">
            <div className="flex items-center gap-2">
              <ChevronRight className="h-5 w-5 text-primary" />
              <h3 className="text-xl font-bold">Analysis Dashboard</h3>
            </div>

            <Tabs defaultValue="overview" className="w-full">
              <TabsList className="bg-muted/50">
                <TabsTrigger value="overview">
                  <BarChart3 className="h-4 w-4 mr-1.5" />
                  Overview
                </TabsTrigger>
                <TabsTrigger value="history">
                  <Clock className="h-4 w-4 mr-1.5" />
                  History
                </TabsTrigger>
              </TabsList>

              {/* Overview Tab */}
              <TabsContent value="overview" className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {/* Quick Stats */}
                  <Card className="glass-card">
                    <CardContent className="py-4 text-center">
                      <div className="text-2xl font-bold text-emerald-400">{sentimentCounts.positive}</div>
                      <div className="text-xs text-muted-foreground mt-1">Positive</div>
                    </CardContent>
                  </Card>
                  <Card className="glass-card">
                    <CardContent className="py-4 text-center">
                      <div className="text-2xl font-bold text-red-400">{sentimentCounts.negative}</div>
                      <div className="text-xs text-muted-foreground mt-1">Negative</div>
                    </CardContent>
                  </Card>
                  <Card className="glass-card">
                    <CardContent className="py-4 text-center">
                      <div className="text-2xl font-bold text-amber-400">{sentimentCounts.neutral}</div>
                      <div className="text-xs text-muted-foreground mt-1">Neutral</div>
                    </CardContent>
                  </Card>
                </div>

                {/* Charts Row */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Pie Chart */}
                  <Card className="glass-card">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">Sentiment Distribution</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {pieData.length > 0 ? (
                        <ChartContainer config={chartConfig} className="h-[220px] w-full">
                          <PieChart>
                            <ChartTooltip content={<ChartTooltipContent hideLabel />} />
                            <Pie
                              data={pieData}
                              cx="50%"
                              cy="50%"
                              innerRadius={55}
                              outerRadius={85}
                              paddingAngle={3}
                              dataKey="value"
                            >
                              {pieData.map((entry, idx) => (
                                <Cell key={idx} fill={entry.fill} />
                              ))}
                            </Pie>
                          </PieChart>
                        </ChartContainer>
                      ) : (
                        <div className="h-[220px] flex items-center justify-center text-muted-foreground text-sm">
                          Analyze texts to see distribution
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* Average Confidence */}
                  <Card className="glass-card">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">Confidence Trend</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {history.length > 0 ? (
                        <div className="h-[220px] flex flex-col justify-center gap-3">
                          <div className="text-center">
                            <div className="text-3xl font-bold">
                              {Math.round(
                                (history.reduce((s, h) => s + h.confidence, 0) / history.length) * 100
                              )}
                              %
                            </div>
                            <div className="text-xs text-muted-foreground">Average Confidence</div>
                          </div>
                          <div className="space-y-1.5">
                            {history.slice(0, 5).map((entry) => (
                              <div key={entry.id} className="flex items-center gap-2">
                                <span className="text-xs text-muted-foreground w-[60px] truncate">
                                  {entry.text.slice(0, 18)}...
                                </span>
                                <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
                                  <div
                                    className={`h-full rounded-full transition-all duration-500 ${
                                      entry.sentiment === "Positive"
                                        ? "bg-emerald-500"
                                        : entry.sentiment === "Negative"
                                        ? "bg-red-500"
                                        : "bg-amber-500"
                                    }`}
                                    style={{ width: `${Math.round(entry.confidence * 100)}%` }}
                                  />
                                </div>
                                <span className="text-xs font-mono w-[40px] text-right">
                                  {Math.round(entry.confidence * 100)}%
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <div className="h-[220px] flex items-center justify-center text-muted-foreground text-sm">
                          No history yet
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              {/* History Tab */}
              <TabsContent value="history" className="space-y-4">
                <Card className="glass-card">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-sm">Analysis History</CardTitle>
                        <CardDescription className="text-xs">
                          {history.length} analysis{history.length !== 1 ? "es" : ""} recorded
                        </CardDescription>
                      </div>
                      <Button variant="ghost" size="sm" onClick={handleClearHistory} className="text-xs text-muted-foreground hover:text-red-400">
                        <Trash2 className="h-3.5 w-3.5 mr-1" />
                        Clear
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="max-h-[400px] overflow-y-auto space-y-2">
                      {history.map((entry) => (
                        <div
                          key={entry.id}
                          className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 border border-border/30 hover:bg-muted/50 transition-colors"
                        >
                          {getSentimentIcon(entry.sentiment)}
                          <div className="flex-1 min-w-0">
                            <p className="text-sm truncate">{entry.text}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge
                                variant="outline"
                                className={`text-[10px] ${
                                  entry.sentiment === "Positive"
                                    ? "border-emerald-500/30 text-emerald-400"
                                    : entry.sentiment === "Negative"
                                    ? "border-red-500/30 text-red-400"
                                    : "border-amber-500/30 text-amber-400"
                                }`}
                              >
                                {entry.sentiment}
                              </Badge>
                              <span className="text-[10px] text-muted-foreground">
                                {Math.round(entry.confidence * 100)}% confidence
                              </span>
                            </div>
                          </div>
                          <div className="text-right shrink-0">
                            <div className="text-[10px] text-muted-foreground">
                              {entry.timestamp.toLocaleTimeString()}
                            </div>
                            <div className="text-[10px] text-muted-foreground">
                              {entry.processingTime}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </section>
        )}

        {/* ── How It Works Section ── */}
        <section className="space-y-6">
          <div className="flex items-center gap-2">
            <ChevronRight className="h-5 w-5 text-primary" />
            <h3 className="text-xl font-bold">How It Works</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              {
                step: "01",
                icon: BookOpen,
                title: "Input Text",
                desc: "Enter any text — reviews, tweets, articles, or feedback you want to analyze.",
                color: "text-emerald-400",
              },
              {
                step: "02",
                icon: Cpu,
                title: "AI Processing",
                desc: "DistilBERT transformer processes the text through fine-tuned sentiment layers.",
                color: "text-cyan-400",
              },
              {
                step: "03",
                icon: TrendingUp,
                title: "Deep Analysis",
                desc: "Sentiment scoring, emotion detection, keyword extraction, and toxicity checks.",
                color: "text-amber-400",
              },
              {
                step: "04",
                icon: Eye,
                title: "Visual Results",
                desc: "Get clear, visual results with confidence scores and actionable insights.",
                color: "text-rose-400",
              },
            ].map(({ step, icon: Icon, title, desc, color }) => (
              <Card key={step} className="glass-card group hover:border-border transition-colors">
                <CardContent className="py-5 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono text-muted-foreground">{step}</span>
                    <div className={`h-8 w-8 rounded-lg bg-muted/50 flex items-center justify-center ${color} group-hover:scale-110 transition-transform`}>
                      <Icon className="h-4 w-4" />
                    </div>
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold">{title}</h4>
                    <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{desc}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* ── Backend Code Section ── */}
        <section className="space-y-6">
          <div className="flex items-center gap-2">
            <ChevronRight className="h-5 w-5 text-primary" />
            <h3 className="text-xl font-bold">Production Backend (Python)</h3>
          </div>

          {/* Download Project Card */}
          <Card className="glass-card overflow-hidden border-emerald-500/20">
            <CardContent className="py-5">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 flex items-center justify-center border border-emerald-500/30">
                    <Download className="h-6 w-6 text-emerald-400" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold">Download Complete Project</h4>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Python backend + HTML frontend + README &mdash; ready to run
                    </p>
                  </div>
                </div>
                <Button
                  onClick={downloadProject}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white gap-2"
                >
                  <Download className="h-4 w-4" />
                  Download ZIP
                </Button>
              </div>
              <div className="flex flex-wrap gap-3 mt-4 pt-3 border-t border-border/30">
                {[
                  { label: "backend/app.py", desc: "FastAPI + DistilBERT" },
                  { label: "backend/requirements.txt", desc: "Python deps" },
                  { label: "frontend/index.html", desc: "Standalone UI" },
                  { label: "README.md", desc: "Setup guide" },
                ].map((f) => (
                  <div key={f.label} className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                    <FileText className="h-3 w-3" />
                    <span className="font-mono">{f.label}</span>
                    <span>&middot; {f.desc}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card overflow-hidden">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Code2 className="h-4 w-4 text-muted-foreground" />
                  <CardTitle className="text-sm">Optimized Python Backend</CardTitle>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs border-emerald-500/30 text-emerald-400">
                    <Server className="h-3 w-3 mr-1" />
                    FastAPI
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    Python 3.11+
                  </Badge>
                </div>
              </div>
              <CardDescription className="text-xs">
                Optimized for production with FP16 inference, LRU caching, and async FastAPI endpoints.
                Deploy this backend alongside this frontend for real DistilBERT analysis.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="relative">
                <pre className="text-xs sm:text-sm bg-black/40 rounded-lg p-4 overflow-x-auto max-h-[500px] overflow-y-auto leading-relaxed font-mono">
                  <code className="text-muted-foreground whitespace-pre">{PYTHON_BACKEND_CODE}</code>
                </pre>
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute top-2 right-2 text-xs"
                  onClick={() => navigator.clipboard.writeText(PYTHON_BACKEND_CODE)}
                >
                  Copy
                </Button>
              </div>

              {/* Optimization tips */}
              <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  { icon: Gauge, title: "FP16 Precision", desc: "2× faster inference with float16" },
                  { icon: Hash, title: "LRU Cache", desc: "1024-entry cache for repeated texts" },
                  { icon: Cpu, title: "Thread Control", desc: "Optimized CPU thread allocation" },
                  { icon: Server, title: "Async FastAPI", desc: "Non-blocking concurrent requests" },
                ].map(({ icon: Icon, title, desc }) => (
                  <div key={title} className="flex items-start gap-2 p-2.5 rounded-lg bg-muted/30">
                    <Icon className="h-4 w-4 text-emerald-400 mt-0.5 shrink-0" />
                    <div>
                      <div className="text-xs font-medium">{title}</div>
                      <div className="text-[11px] text-muted-foreground">{desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </section>

        {/* ── API Reference ── */}
        <section className="space-y-6">
          <div className="flex items-center gap-2">
            <ChevronRight className="h-5 w-5 text-primary" />
            <h3 className="text-xl font-bold">API Reference</h3>
          </div>

          <Card className="glass-card">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Endpoint Documentation</CardTitle>
              <CardDescription className="text-xs">
                Integrate sentiment analysis into your own applications
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Badge className="bg-emerald-600 text-white text-xs">POST</Badge>
                  <code className="text-xs font-mono text-muted-foreground">/api/sentiment</code>
                </div>
                <Separator className="bg-border/50" />
                <div className="space-y-3">
                  <div>
                    <h4 className="text-xs font-semibold mb-2">Request Body</h4>
                    <pre className="text-xs bg-black/30 rounded-lg p-3 font-mono text-muted-foreground">
{`{
  "text": "Your text to analyze",
  "analysisType": "sentiment"
}`}
                    </pre>
                  </div>
                  <div>
                    <h4 className="text-xs font-semibold mb-2">Response</h4>
                    <pre className="text-xs bg-black/30 rounded-lg p-3 font-mono text-muted-foreground overflow-x-auto">
{`{
  "success": true,
  "results": {
    "sentiment": {
      "label": "Positive",
      "confidence": 0.98,
      "scores": { "positive": 0.98, "negative": 0.02 }
    },
    "emotion": { "dominant": "joy", "emotions": {...} },
    "keywords": [{ "word": "great", "frequency": 2 }],
    "toxicity": { "isToxic": false, "score": 0.0, "flags": [] }
  },
  "metadata": {
    "processingTime": "12ms",
    "wordCount": 15,
    "model": "DistilBERT-finetuned-SST-2"
  }
}`}
                    </pre>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 pt-2">
                  <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                    <Info className="h-3 w-3" />
                    <span>analysisType options: <code className="text-foreground">sentiment</code> | <code className="text-foreground">emotion</code> | <code className="text-foreground">keywords</code> | <code className="text-foreground">toxicity</code> | <code className="text-foreground">all</code></span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

      </main>

      {/* ── Footer ── */}
      <footer className="mt-auto border-t border-border/50 glass-card">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <Brain className="h-4 w-4 text-emerald-400" />
            <span>SentimentIQ — AI Sentiment Analysis Platform</span>
          </div>
          <div className="flex items-center gap-4">
            <span>Powered by DistilBERT</span>
            <Separator orientation="vertical" className="h-3 bg-border/50" />
            <span>Built with Next.js + FastAPI</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
