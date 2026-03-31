'use client';

import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import {
  Target,
  Globe,
  Layers,
  Cloud,
  Zap,
  Shield,
  FileSearch,
  Languages,
} from 'lucide-react';

const features = [
  {
    icon: Target,
    title: 'High Accuracy',
    description:
      'Advanced OCR engine delivers 99.2% accuracy on printed text and 95%+ on clear handwriting.',
    color: 'text-primary',
    bg: 'bg-primary/10',
    glow: 'group-hover:shadow-primary/10',
  },
  {
    icon: Globe,
    title: 'Multi-Language',
    description:
      'Support for 50+ languages including English, Hindi, Chinese, Japanese, Arabic, and more.',
    color: 'text-amber-500',
    bg: 'bg-amber-500/10',
    glow: 'group-hover:shadow-amber-500/10',
  },
  {
    icon: Layers,
    title: 'Batch Scanning',
    description:
      'Process multiple documents at once. Upload up to 100 images and extract text in bulk.',
    color: 'text-emerald-400',
    bg: 'bg-emerald-400/10',
    glow: 'group-hover:shadow-emerald-400/10',
  },
  {
    icon: Cloud,
    title: 'Cloud Integration',
    description:
      'Save and sync your scans to the cloud. Access documents from any device, anywhere.',
    color: 'text-sky-400',
    bg: 'bg-sky-400/10',
    glow: 'group-hover:shadow-sky-400/10',
  },
  {
    icon: Zap,
    title: 'Lightning Fast',
    description:
      'Extract text in under 3 seconds per page with our optimized processing pipeline.',
    color: 'text-yellow-400',
    bg: 'bg-yellow-400/10',
    glow: 'group-hover:shadow-yellow-400/10',
  },
  {
    icon: Shield,
    title: 'Secure & Private',
    description:
      'Your documents never leave your browser. All processing happens locally for privacy.',
    color: 'text-rose-400',
    bg: 'bg-rose-400/10',
    glow: 'group-hover:shadow-rose-400/10',
  },
  {
    icon: FileSearch,
    title: 'Smart Detection',
    description:
      'Automatically detects document type, orientation, and regions of interest.',
    color: 'text-violet-400',
    bg: 'bg-violet-400/10',
    glow: 'group-hover:shadow-violet-400/10',
  },
  {
    icon: Languages,
    title: 'Handwriting OCR',
    description:
      'Powered by AI to recognize handwritten notes, signatures, and annotations.',
    color: 'text-teal-300',
    bg: 'bg-teal-300/10',
    glow: 'group-hover:shadow-teal-300/10',
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
};

export function FeaturesSection() {
  return (
    <section id="features" className="relative py-24 sm:py-32">
      {/* Background */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute top-0 left-1/2 h-[300px] w-[600px] -translate-x-1/2 rounded-full bg-primary/3 blur-[150px]" />
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
          <span className="mb-4 inline-block rounded-full bg-primary/10 px-4 py-1.5 text-xs font-semibold tracking-wider text-primary uppercase">
            Features
          </span>
          <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
            Everything You Need for{' '}
            <span className="text-primary">Smart Scanning</span>
          </h2>
          <p className="mt-4 text-base text-muted-foreground sm:text-lg">
            Powerful OCR capabilities packed into a clean, modern interface.
            Built for professionals who demand precision and speed.
          </p>
        </motion.div>

        {/* Feature Cards */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-50px' }}
          className="mt-16 grid gap-5 sm:grid-cols-2 lg:grid-cols-4"
        >
          {features.map((feature) => (
            <motion.div key={feature.title} variants={itemVariants}>
              <Card className="group h-full cursor-default border-border/40 bg-card/60 backdrop-blur-sm transition-all duration-300 hover:border-border/60 hover:shadow-xl">
                <CardContent className="p-6">
                  <div
                    className={`mb-4 inline-flex h-11 w-11 items-center justify-center rounded-xl ${feature.bg} ${feature.color} transition-transform duration-300 group-hover:scale-110`}
                  >
                    <feature.icon className="h-5 w-5" />
                  </div>
                  <h3 className="mb-2 text-base font-semibold text-foreground">
                    {feature.title}
                  </h3>
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
