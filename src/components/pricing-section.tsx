'use client';

import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, Sparkles } from 'lucide-react';

const plans = [
  {
    name: 'Free',
    price: '$0',
    period: 'forever',
    description: 'Perfect for occasional scanning needs.',
    features: [
      '5 scans per day',
      'Single image processing',
      'English language support',
      'TXT export',
      'Basic text extraction',
    ],
    cta: 'Get Started Free',
    popular: false,
    color: 'text-foreground',
    borderColor: 'border-border/40',
  },
  {
    name: 'Pro',
    price: '$9',
    period: '/month',
    description: 'For professionals who need reliable daily scanning.',
    features: [
      'Unlimited scans',
      'Batch processing (up to 100)',
      '50+ language support',
      'PDF, DOCX, TXT export',
      'Handwriting recognition',
      'Cloud sync & storage',
      'Priority processing',
      'Email support',
    ],
    cta: 'Start Free Trial',
    popular: true,
    color: 'text-primary',
    borderColor: 'border-primary/30',
  },
  {
    name: 'Enterprise',
    price: '$49',
    period: '/month',
    description: 'For teams and businesses at scale.',
    features: [
      'Everything in Pro',
      'Custom API access',
      'Team collaboration (10 seats)',
      'Advanced document parsing',
      'Custom models & training',
      'SSO & admin dashboard',
      'SLA guarantee (99.9%)',
      'Dedicated account manager',
    ],
    cta: 'Contact Sales',
    popular: false,
    color: 'text-amber-500',
    borderColor: 'border-amber-500/20',
  },
];

export function PricingSection() {
  return (
    <section id="pricing" className="relative py-24 sm:py-32">
      {/* Background */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute top-1/2 left-1/3 h-[400px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/3 blur-[150px]" />
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
          <span className="mb-4 inline-block rounded-full bg-sky-500/10 px-4 py-1.5 text-xs font-semibold tracking-wider text-sky-400 uppercase">
            Pricing
          </span>
          <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
            Simple, Transparent{' '}
            <span className="text-primary">Pricing</span>
          </h2>
          <p className="mt-4 text-base text-muted-foreground sm:text-lg">
            Start free and scale as you grow. No hidden fees, cancel anytime.
          </p>
        </motion.div>

        {/* Pricing Cards */}
        <div className="mt-16 grid gap-6 lg:grid-cols-3">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.5, delay: index * 0.12 }}
            >
              <Card
                className={`relative h-full overflow-hidden border transition-all duration-300 hover:shadow-xl ${
                  plan.popular
                    ? 'border-primary/40 bg-gradient-to-b from-primary/5 to-card/70 shadow-lg shadow-primary/5'
                    : `${plan.borderColor} bg-card/60`
                }`}
              >
                {plan.popular && (
                  <div className="absolute top-0 right-0">
                    <div className="flex items-center gap-1 rounded-bl-xl bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground">
                      <Sparkles className="h-3 w-3" />
                      Most Popular
                    </div>
                  </div>
                )}

                <CardHeader className="pb-2">
                  <CardTitle className="text-lg font-bold text-foreground">
                    {plan.name}
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">{plan.description}</p>
                </CardHeader>

                <CardContent>
                  <div className="mb-6">
                    <span className={`text-4xl font-extrabold ${plan.color}`}>
                      {plan.price}
                    </span>
                    <span className="text-sm text-muted-foreground">{plan.period}</span>
                  </div>

                  <ul className="mb-6 space-y-3">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-2.5">
                        <Check
                          className={`mt-0.5 h-4 w-4 shrink-0 ${
                            plan.popular ? 'text-primary' : 'text-muted-foreground'
                          }`}
                        />
                        <span className="text-sm text-muted-foreground">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <Button
                    className={`w-full font-semibold ${
                      plan.popular
                        ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                        : 'bg-muted text-foreground hover:bg-muted/80'
                    }`}
                    variant={plan.popular ? 'default' : 'secondary'}
                  >
                    {plan.cta}
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
