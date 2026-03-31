'use client';

import { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Textarea } from '@/components/ui/textarea';
import {
  Upload,
  ScanLine,
  FileText,
  Copy,
  Download,
  X,
  Check,
  Image as ImageIcon,
  Loader2,
  RotateCcw,
  ZoomIn,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ScanResult {
  text: string;
  confidence: number;
  words: number;
  time: number;
}

export function OcrDemoSection() {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [status, setStatus] = useState<'idle' | 'scanning' | 'done' | 'error'>('idle');
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<ScanResult | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleFile = useCallback((f: File) => {
    if (!f.type.startsWith('image/')) {
      toast({ title: 'Invalid file', description: 'Please upload an image file.', variant: 'destructive' });
      return;
    }
    if (f.size > 20 * 1024 * 1024) {
      toast({ title: 'File too large', description: 'Maximum file size is 20MB.', variant: 'destructive' });
      return;
    }
    setFile(f);
    setResult(null);
    setProgress(0);
    setStatus('idle');
    const reader = new FileReader();
    reader.onload = (e) => setPreview(e.target?.result as string);
    reader.readAsDataURL(f);
  }, [toast]);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragActive(false);
      const f = e.dataTransfer.files[0];
      if (f) handleFile(f);
    },
    [handleFile]
  );

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(e.type === 'dragenter' || e.type === 'dragover');
  }, []);

  const handleScan = async () => {
    if (!file) return;
    setStatus('scanning');
    setProgress(0);
    setResult(null);

    const startTime = performance.now();

    try {
      const Tesseract = await import('tesseract.js');
      const worker = await Tesseract.createWorker('eng', undefined, {
        logger: (m: { progress?: number }) => {
          if (typeof m.progress === 'number') {
            setProgress(Math.round(m.progress * 100));
          }
        },
      });

      const { data } = await worker.recognize(file);
      const elapsed = ((performance.now() - startTime) / 1000).toFixed(1);

      await worker.terminate();

      setResult({
        text: data.text.trim(),
        confidence: Math.round(data.confidence),
        words: data.words?.length ?? data.text.trim().split(/\s+/).filter(Boolean).length,
        time: parseFloat(elapsed),
      });
      setStatus('done');
      toast({ title: 'Scan complete!', description: `Extracted ${data.text.trim().split(/\s+/).filter(Boolean).length} words with ${Math.round(data.confidence)}% confidence.` });
    } catch (err) {
      console.error(err);
      setStatus('error');
      toast({ title: 'Scan failed', description: 'Something went wrong during text extraction.', variant: 'destructive' });
    }
  };

  const handleCopy = async () => {
    if (!result?.text) return;
    await navigator.clipboard.writeText(result.text);
    setCopied(true);
    toast({ title: 'Copied!', description: 'Text copied to clipboard.' });
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    if (!result?.text) return;
    const blob = new Blob([result.text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${file?.name?.replace(/\.[^.]+$/, '') || 'scan'}-extracted.txt`;
    a.click();
    URL.revokeObjectURL(url);
    toast({ title: 'Downloaded!', description: 'Text file saved.' });
  };

  const handleReset = () => {
    setFile(null);
    setPreview(null);
    setStatus('idle');
    setProgress(0);
    setResult(null);
    setCopied(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <section className="relative py-24 sm:py-32" id="demo">
      {/* Background */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute bottom-0 left-1/2 h-[400px] w-[600px] -translate-x-1/2 rounded-full bg-primary/3 blur-[150px]" />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.5 }}
          className="mx-auto max-w-2xl text-center"
        >
          <span className="mb-4 inline-block rounded-full bg-emerald-500/10 px-4 py-1.5 text-xs font-semibold tracking-wider text-emerald-400 uppercase">
            Live Demo
          </span>
          <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
            Try the <span className="text-primary">OCR Scanner</span> Now
          </h2>
          <p className="mt-4 text-base text-muted-foreground sm:text-lg">
            Upload any image — medical bills, ID cards, handwritten notes, receipts —
            and extract clean text in seconds.
          </p>
        </motion.div>

        {/* Scanner UI */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ duration: 0.6 }}
          className="mx-auto mt-12 max-w-4xl"
        >
          <Card className="overflow-hidden border-border/40 bg-card/70 backdrop-blur-sm">
            <CardContent className="p-0">
              {/* Top Bar */}
              <div className="flex items-center justify-between border-b border-border/40 px-5 py-3">
                <div className="flex items-center gap-2">
                  <ScanLine className="h-4 w-4 text-primary" />
                  <span className="text-sm font-semibold text-foreground">
                    OCR Scanner
                  </span>
                </div>
                {file && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 gap-1.5 text-xs text-muted-foreground hover:text-foreground"
                    onClick={handleReset}
                  >
                    <RotateCcw className="h-3 w-3" />
                    Reset
                  </Button>
                )}
              </div>

              <div className="grid lg:grid-cols-2">
                {/* Left: Upload / Preview */}
                <div className="border-b border-border/40 p-5 lg:border-b-0 lg:border-r">
                  {!preview ? (
                    <div
                      onDrop={handleDrop}
                      onDragOver={handleDrag}
                      onDragEnter={handleDrag}
                      onDragLeave={handleDrag}
                      onClick={() => fileInputRef.current?.click()}
                      className={`flex min-h-[280px] cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed transition-all duration-200 ${
                        dragActive
                          ? 'border-primary bg-primary/5'
                          : 'border-border/50 hover:border-primary/50 hover:bg-muted/30'
                      }`}
                    >
                      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
                        <Upload className="h-7 w-7 text-primary" />
                      </div>
                      <p className="text-sm font-medium text-foreground">
                        Drop your image here
                      </p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        or click to browse — PNG, JPG, WebP, BMP (max 20MB)
                      </p>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const f = e.target.files?.[0];
                          if (f) handleFile(f);
                        }}
                      />
                    </div>
                  ) : (
                    <div className="relative min-h-[280px]">
                      <img
                        src={preview}
                        alt="Preview"
                        className="h-full w-full rounded-xl object-contain"
                      />
                      {/* Scan overlay */}
                      <AnimatePresence>
                        {status === 'scanning' && (
                          <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 overflow-hidden rounded-xl bg-black/30"
                          >
                            <div className="animate-scan-line absolute inset-x-0 h-0.5 bg-gradient-to-r from-transparent via-primary to-transparent" />
                            <div className="absolute inset-0 flex items-center justify-center">
                              <div className="flex items-center gap-2 rounded-lg bg-black/60 px-4 py-2 backdrop-blur-sm">
                                <Loader2 className="h-4 w-4 animate-spin text-primary" />
                                <span className="text-sm font-medium text-white">
                                  Scanning... {progress}%
                                </span>
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>

                      {/* Zoom hint */}
                      <div className="absolute right-2 top-2 opacity-0 transition-opacity hover:opacity-100">
                        <Button variant="secondary" size="icon" className="h-8 w-8" onClick={() => {
                          const w = window.open(preview, '_blank');
                          if (w) w.focus();
                        }}>
                          <ZoomIn className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* File info */}
                  {file && (
                    <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
                      <ImageIcon className="h-3.5 w-3.5" />
                      <span className="truncate">{file.name}</span>
                      <span className="ml-auto">
                        {(file.size / 1024).toFixed(1)} KB
                      </span>
                    </div>
                  )}

                  {/* Action buttons */}
                  {file && status !== 'scanning' && (
                    <div className="mt-4">
                      <Button
                        className="glow-teal w-full gap-2 bg-primary text-primary-foreground hover:bg-primary/90"
                        onClick={handleScan}
                      >
                        <ScanLine className="h-4 w-4" />
                        Start Scan
                      </Button>
                    </div>
                  )}

                  {status === 'scanning' && (
                    <div className="mt-4">
                      <Progress value={progress} className="h-2" />
                      <p className="mt-2 text-center text-xs text-muted-foreground">
                        Processing image... Please wait
                      </p>
                    </div>
                  )}
                </div>

                {/* Right: Results */}
                <div className="p-5">
                  <div className="mb-3 flex items-center gap-2">
                    <FileText className="h-4 w-4 text-foreground" />
                    <span className="text-sm font-semibold text-foreground">
                      Extracted Text
                    </span>
                  </div>

                  {status === 'idle' && !result && (
                    <div className="flex min-h-[240px] flex-col items-center justify-center rounded-xl border border-border/30 bg-muted/20">
                      <FileText className="mb-3 h-10 w-10 text-muted-foreground/40" />
                      <p className="text-sm text-muted-foreground">
                        Upload an image and scan to see results
                      </p>
                    </div>
                  )}

                  {status === 'scanning' && (
                    <div className="flex min-h-[240px] flex-col items-center justify-center rounded-xl border border-primary/20 bg-primary/5">
                      <Loader2 className="mb-3 h-10 w-10 animate-spin text-primary" />
                      <p className="text-sm font-medium text-primary">
                        Extracting text...
                      </p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        Analyzing document structure
                      </p>
                    </div>
                  )}

                  {status === 'error' && (
                    <div className="flex min-h-[240px] flex-col items-center justify-center rounded-xl border border-destructive/20 bg-destructive/5">
                      <X className="mb-3 h-10 w-10 text-destructive" />
                      <p className="text-sm font-medium text-destructive">
                        Extraction failed
                      </p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        Try a clearer image or different format
                      </p>
                    </div>
                  )}

                  {status === 'done' && result && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                    >
                      {/* Stats badges */}
                      <div className="mb-3 flex flex-wrap gap-2">
                        <Badge
                          variant="outline"
                          className="border-primary/30 bg-primary/10 text-primary"
                        >
                          {result.confidence}% Confidence
                        </Badge>
                        <Badge
                          variant="outline"
                          className="border-amber-500/30 bg-amber-500/10 text-amber-500"
                        >
                          {result.words} Words
                        </Badge>
                        <Badge
                          variant="outline"
                          className="border-emerald-500/30 bg-emerald-500/10 text-emerald-400"
                        >
                          {result.time}s
                        </Badge>
                      </div>

                      {/* Text area */}
                      <Textarea
                        value={result.text}
                        readOnly
                        className="min-h-[200px] resize-none border-border/40 bg-muted/30 font-mono text-sm leading-relaxed text-foreground focus-visible:ring-primary/30"
                        placeholder="Extracted text will appear here..."
                      />

                      {/* Action buttons */}
                      <div className="mt-3 flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="gap-1.5 text-xs"
                          onClick={handleCopy}
                        >
                          {copied ? (
                            <Check className="h-3.5 w-3.5 text-emerald-400" />
                          ) : (
                            <Copy className="h-3.5 w-3.5" />
                          )}
                          {copied ? 'Copied' : 'Copy'}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="gap-1.5 text-xs"
                          onClick={handleDownload}
                        >
                          <Download className="h-3.5 w-3.5" />
                          Download TXT
                        </Button>
                      </div>
                    </motion.div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </section>
  );
}
