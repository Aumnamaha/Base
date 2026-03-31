'use client';

import { Navbar } from '@/components/navbar';
import { HeroSection } from '@/components/hero-section';
import { FeaturesSection } from '@/components/features-section';
import { ProcessSection } from '@/components/process-section';
import { OcrDemoSection } from '@/components/ocr-demo';
import { ContactSection } from '@/components/contact-section';
import { Footer } from '@/components/footer';

export default function Home() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      <main>
        <HeroSection />
        <FeaturesSection />
        <ProcessSection />
        <OcrDemoSection />
        <ContactSection />
      </main>
      <Footer />
    </div>
  );
}
