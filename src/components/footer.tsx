'use client';

import { ScanText, Github, Twitter, Linkedin } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

const footerLinks = {
  Product: ['Features', 'Pricing', 'Demo', 'API', 'Changelog'],
  Company: ['About', 'Blog', 'Careers', 'Press', 'Partners'],
  Resources: ['Documentation', 'Help Center', 'Community', 'Status', 'Contact'],
  Legal: ['Privacy', 'Terms', 'Security', 'Cookie Policy'],
};

export function Footer() {
  return (
    <footer className="border-t border-border/30 bg-card/30">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-5">
          {/* Brand */}
          <div className="lg:col-span-1">
            <div className="mb-4 flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/15">
                <ScanText className="h-4 w-4 text-primary" />
              </div>
              <span className="text-base font-bold tracking-tight text-foreground">
                Scan<span className="text-primary">OCR</span>
              </span>
            </div>
            <p className="mb-6 max-w-xs text-sm leading-relaxed text-muted-foreground">
              Smart OCR scanning technology to digitize your documents with
              speed, accuracy, and ease.
            </p>
            <div className="flex gap-3">
              {[Twitter, Github, Linkedin].map((Icon, i) => (
                <button
                  key={i}
                  className="flex h-9 w-9 items-center justify-center rounded-lg border border-border/30 text-muted-foreground transition-colors hover:border-primary/30 hover:text-primary"
                  aria-label="Social link"
                >
                  <Icon className="h-4 w-4" />
                </button>
              ))}
            </div>
          </div>

          {/* Links */}
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h4 className="mb-4 text-sm font-semibold text-foreground">
                {category}
              </h4>
              <ul className="space-y-2.5">
                {links.map((link) => (
                  <li key={link}>
                    <a
                      href="#"
                      className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                    >
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <Separator className="my-8 bg-border/30" />

        <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
          <p className="text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()} ScanOCR. All rights reserved.
          </p>
          <p className="text-xs text-muted-foreground">
            Built with AI-powered OCR technology
          </p>
        </div>
      </div>
    </footer>
  );
}
