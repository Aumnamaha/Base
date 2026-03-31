'use client';

import { motion } from 'framer-motion';
import { Upload, ScanLine, FileText, Download } from 'lucide-react';

const steps = [
  {
    number: '01',
    icon: Upload,
    title: 'Upload',
    description:
      'Drag & drop or browse to upload your image. Supports PNG, JPG, WebP, BMP, and TIFF formats.',
    color: 'from-primary/20 to-primary/5',
    iconColor: 'text-primary',
    borderColor: 'border-primary/20',
  },
  {
    number: '02',
    icon: ScanLine,
    title: 'Scan',
    description:
      'Our AI-powered engine analyzes the image, detects text regions, and pre-processes for optimal results.',
    color: 'from-amber-500/20 to-amber-500/5',
    iconColor: 'text-amber-500',
    borderColor: 'border-amber-500/20',
  },
  {
    number: '03',
    icon: FileText,
    title: 'Extract',
    description:
      'Clean, structured text is extracted and presented in an editable format. Copy, edit, or refine.',
    color: 'from-emerald-500/20 to-emerald-500/5',
    iconColor: 'text-emerald-400',
    borderColor: 'border-emerald-500/20',
  },
  {
    number: '04',
    icon: Download,
    title: 'Export',
    description:
      'Download your extracted text as TXT, copy to clipboard, or save directly to your cloud storage.',
    color: 'from-sky-500/20 to-sky-500/5',
    iconColor: 'text-sky-400',
    borderColor: 'border-sky-500/20',
  },
];

export function ProcessSection() {
  return (
    <section id="process" className="relative py-24 sm:py-32">
      {/* Background */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-accent" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.5 }}
          className="mx-auto max-w-2xl text-center"
        >
          <span className="mb-4 inline-block rounded-full bg-amber-500/10 px-4 py-1.5 text-xs font-semibold tracking-wider text-amber-500 uppercase">
            How It Works
          </span>
          <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
            From Image to Text in{' '}
            <span className="text-primary">4 Simple Steps</span>
          </h2>
          <p className="mt-4 text-base text-muted-foreground sm:text-lg">
            Our streamlined process makes text extraction effortless.
            No complex setup, no technical knowledge required.
          </p>
        </motion.div>

        {/* Steps */}
        <div className="relative mt-16">
          {/* Connecting line (desktop) */}
          <div className="absolute top-24 right-[12%] left-[12%] hidden h-px bg-gradient-to-r from-primary/30 via-amber-500/30 to-sky-400/30 lg:block" />

          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {steps.map((step, index) => (
              <motion.div
                key={step.number}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-50px' }}
                transition={{ duration: 0.5, delay: index * 0.12 }}
                className="relative"
              >
                <div className="group relative rounded-2xl border border-border/40 bg-card/60 p-6 backdrop-blur-sm transition-all duration-300 hover:border-border/70 hover:shadow-lg">
                  {/* Step number */}
                  <div className="mb-4 flex items-center justify-between">
                    <span
                      className={`inline-flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${step.color} ${step.iconColor} font-bold text-lg`}
                    >
                      {step.number}
                    </span>
                    <div
                      className={`h-8 w-8 items-center justify-center rounded-full border ${step.borderColor} ${step.iconColor} hidden lg:flex`}
                    >
                      <step.icon className="h-4 w-4" />
                    </div>
                  </div>

                  {/* Mobile icon */}
                  <div
                    className={`mb-3 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${step.color} ${step.iconColor} lg:hidden`}
                  >
                    <step.icon className="h-5 w-5" />
                  </div>

                  <h3 className="mb-2 text-lg font-bold text-foreground">
                    {step.title}
                  </h3>
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    {step.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
