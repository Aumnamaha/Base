'use client';

import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, Sparkles, Upload } from 'lucide-react';

export function HeroSection() {
  const scrollToDemo = () => {
    document.getElementById('process')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section
      id="home"
      className="relative min-h-screen overflow-hidden bg-gradient-hero pt-20"
    >
      {/* Background Effects */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute top-1/4 left-1/4 h-[500px] w-[500px] rounded-full bg-primary/5 blur-[120px]" />
        <div className="absolute right-1/4 bottom-1/4 h-[400px] w-[400px] rounded-full bg-amber-500/5 blur-[120px]" />
        <div className="bg-grid-pattern absolute inset-0 opacity-50" />
      </div>

      <div className="relative mx-auto flex max-w-7xl flex-col items-center px-4 py-20 sm:px-6 lg:flex-row lg:gap-12 lg:px-8 lg:py-28">
        {/* Text Content */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: 'easeOut' }}
          className="flex-1 text-center lg:text-left"
        >
          <Badge
            variant="outline"
            className="mb-6 gap-1.5 border-primary/30 bg-primary/10 px-3 py-1.5 text-primary"
          >
            <Sparkles className="h-3.5 w-3.5" />
            AI-Powered Text Extraction
          </Badge>

          <h1 className="text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl lg:text-6xl">
            <span className="text-foreground">Smart </span>
            <span className="text-glow-teal text-primary">OCR</span>{' '}
            <span className="text-foreground">Scanner</span>
          </h1>

          <p className="mt-4 text-lg font-semibold text-foreground/90 sm:text-xl">
            Extract text from images and documents with speed and accuracy.
          </p>

          <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-muted-foreground lg:mx-0">
            Our OCR solution helps you digitize content, search documents, and boost
            productivity. From medical bills to handwritten notes — turn any image into
            editable text instantly.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center lg:justify-start">
            <Button
              size="lg"
              className="glow-teal gap-2 bg-primary px-8 text-base font-semibold text-primary-foreground hover:bg-primary/90"
              onClick={scrollToDemo}
            >
              <Upload className="h-4 w-4" />
              Try Demo
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="gap-2 border-border/50 px-8 text-base font-semibold text-foreground hover:bg-muted"
              onClick={scrollToDemo}
            >
              Get Started
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>

          {/* Stats */}
          <div className="mt-12 flex flex-wrap justify-center gap-8 lg:justify-start">
            {[
              { value: '99.2%', label: 'Accuracy Rate' },
              { value: '50+', label: 'Languages' },
              { value: '< 3s', label: 'Avg. Scan Time' },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-2xl font-bold text-primary sm:text-3xl">
                  {stat.value}
                </div>
                <div className="mt-1 text-xs text-muted-foreground sm:text-sm">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Hero Image */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.2, ease: 'easeOut' }}
          className="mt-12 flex-1 lg:mt-0"
        >
          <div className="relative mx-auto max-w-lg lg:max-w-none">
            <div className="absolute -inset-4 rounded-2xl bg-gradient-to-br from-primary/10 via-transparent to-amber-500/10 blur-2xl" />
            <div className="relative overflow-hidden rounded-2xl border border-border/30 bg-card/50 shadow-2xl">
              <img
                src="/hero-ocr.png"
                alt="OCR Document Scanner"
                className="h-auto w-full object-cover"
                loading="eager"
              />
              {/* Scan line overlay */}
              <div className="absolute inset-0 overflow-hidden">
                <div className="animate-scan-line absolute inset-x-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Bottom gradient fade */}
      <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent" />
    </section>
  );
}
