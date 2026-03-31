'use client';

import { useState, type FormEvent } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Mail,
  MessageSquare,
  User,
  Send,
  MapPin,
  Phone,
  CheckCircle2,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export function ContactSection() {
  const { toast } = useToast();
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // Simulate submission
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
      toast({ title: 'Message sent!', description: "We'll get back to you soon." });
    }, 1200);
  };

  return (
    <section id="contact" className="relative py-24 sm:py-32">
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
          <span className="mb-4 inline-block rounded-full bg-rose-500/10 px-4 py-1.5 text-xs font-semibold tracking-wider text-rose-400 uppercase">
            Contact
          </span>
          <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
            Get in <span className="text-primary">Touch</span>
          </h2>
          <p className="mt-4 text-base text-muted-foreground sm:text-lg">
            Have questions or need help? We&apos;d love to hear from you.
            Send us a message and we&apos;ll respond within 24 hours.
          </p>
        </motion.div>

        <div className="mx-auto mt-12 grid max-w-5xl gap-8 lg:grid-cols-5">
          {/* Contact Info */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{ duration: 0.5 }}
            className="space-y-6 lg:col-span-2"
          >
            <div className="space-y-4">
              {[
                {
                  icon: Mail,
                  label: 'Email',
                  value: 'support@scanocr.com',
                  color: 'text-primary',
                  bg: 'bg-primary/10',
                },
                {
                  icon: Phone,
                  label: 'Phone',
                  value: '+1 (555) 123-4567',
                  color: 'text-amber-500',
                  bg: 'bg-amber-500/10',
                },
                {
                  icon: MapPin,
                  label: 'Office',
                  value: '123 Tech Avenue, San Francisco, CA',
                  color: 'text-emerald-400',
                  bg: 'bg-emerald-400/10',
                },
              ].map((item) => (
                <div key={item.label} className="flex items-start gap-3.5">
                  <div
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${item.bg} ${item.color}`}
                  >
                    <item.icon className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">{item.label}</p>
                    <p className="mt-0.5 text-sm text-muted-foreground">
                      {item.value}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Contact Form */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="lg:col-span-3"
          >
            <Card className="border-border/40 bg-card/70 backdrop-blur-sm">
              <CardContent className="p-6">
                {submitted ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex min-h-[300px] flex-col items-center justify-center text-center"
                  >
                    <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-500/10">
                      <CheckCircle2 className="h-8 w-8 text-emerald-400" />
                    </div>
                    <h3 className="text-lg font-bold text-foreground">
                      Message Sent!
                    </h3>
                    <p className="mt-2 max-w-sm text-sm text-muted-foreground">
                      Thank you for reaching out. We&apos;ll get back to you within
                      24 hours.
                    </p>
                    <Button
                      variant="outline"
                      className="mt-6"
                      onClick={() => setSubmitted(false)}
                    >
                      Send Another Message
                    </Button>
                  </motion.div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="name" className="text-sm font-medium">
                          Name
                        </Label>
                        <div className="relative">
                          <User className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                          <Input
                            id="name"
                            placeholder="John Doe"
                            required
                            className="border-border/40 bg-muted/30 pl-9 text-sm placeholder:text-muted-foreground/50"
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email" className="text-sm font-medium">
                          Email
                        </Label>
                        <div className="relative">
                          <Mail className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                          <Input
                            id="email"
                            type="email"
                            placeholder="john@example.com"
                            required
                            className="border-border/40 bg-muted/30 pl-9 text-sm placeholder:text-muted-foreground/50"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="subject" className="text-sm font-medium">
                        Subject
                      </Label>
                      <div className="relative">
                        <MessageSquare className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                          id="subject"
                          placeholder="How can we help?"
                          required
                          className="border-border/40 bg-muted/30 pl-9 text-sm placeholder:text-muted-foreground/50"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="message" className="text-sm font-medium">
                        Message
                      </Label>
                      <Textarea
                        id="message"
                        placeholder="Tell us more about your needs..."
                        rows={4}
                        required
                        className="border-border/40 bg-muted/30 text-sm placeholder:text-muted-foreground/50"
                      />
                    </div>

                    <Button
                      type="submit"
                      disabled={loading}
                      className="glow-teal w-full gap-2 bg-primary font-semibold text-primary-foreground hover:bg-primary/90"
                    >
                      {loading ? (
                        <>
                          <span className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground/30 border-t-primary-foreground" />
                          Sending...
                        </>
                      ) : (
                        <>
                          <Send className="h-4 w-4" />
                          Send Message
                        </>
                      )}
                    </Button>
                  </form>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
