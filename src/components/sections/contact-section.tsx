'use client';

import { useState, useActionState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import Link from 'next/link';
import { Mail, MapPin, Github, Linkedin } from 'lucide-react';
import { siteConfig } from '@/data/site-config';
import { saveContact } from '@/app/actions/contact';
import type { ContactFormState } from '@/app/actions/contact';
import { EditorialPageHeader } from '@/components/editorial/editorial-page-header';

export function ContactSection() {
  const shouldReduceMotion = useReducedMotion();

  const [utmParams] = useState(() => {
    if (typeof window === 'undefined') {
      return {
        utm_source: '',
        utm_medium: '',
        utm_campaign: '',
      };
    }

    const params = new URLSearchParams(window.location.search);
    return {
      utm_source: params.get('utm_source') ?? '',
      utm_medium: params.get('utm_medium') ?? '',
      utm_campaign: params.get('utm_campaign') ?? '',
    };
  });

  const [state, formAction, isPending] = useActionState<ContactFormState, FormData>(
    saveContact,
    { success: false }
  );

  const inputClass =
    "w-full bg-[color:var(--color-paper-elevated)] border border-[color:var(--color-rule)] rounded-md px-4 py-3 text-[color:var(--color-ink)] placeholder:text-[color:var(--color-ink-soft)] focus:outline-none focus:border-[color:var(--color-accent)] focus:ring-1 focus:ring-[color:var(--color-accent)]";

  return (
    <>
      <EditorialPageHeader
        kicker="Contact"
        title="Send a Message"
        sub="A quiet inbox for the right conversations — product, hardware, AI, photography, and writing."
      />

      <section className="editorial-shell pb-24">
        <div className="grid md:grid-cols-2 gap-16">
          <motion.div
            initial={shouldReduceMotion ? false : { opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.35 }}
          >
            <p className="text-[color:var(--color-ink-soft)] leading-8 mb-10">
              Recruiting for a PM role, building something in healthcare, or want to talk shop? I keep my calendar open for the right conversations.
            </p>

            <div className="space-y-4 mb-10">
              <a
                href={siteConfig.links.email}
                className="flex items-center gap-4 group"
              >
                <span className="w-12 h-12 flex items-center justify-center rounded-full border border-[color:var(--color-rule)] text-[color:var(--color-ink-soft)] group-hover:bg-[color:var(--color-ink)] group-hover:text-[color:var(--color-paper-elevated)] group-hover:border-[color:var(--color-ink)] transition-colors">
                  <Mail className="size-5" />
                </span>
                <span className="text-[color:var(--color-ink)]">{siteConfig.email}</span>
              </a>

              <div className="flex items-center gap-4">
                <span className="w-12 h-12 flex items-center justify-center rounded-full border border-[color:var(--color-rule)] text-[color:var(--color-ink-soft)]">
                  <MapPin className="size-5" />
                </span>
                <span className="text-[color:var(--color-ink)]">Provo, UT</span>
              </div>

              <a
                href={siteConfig.links.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-4 group"
              >
                <span className="w-12 h-12 flex items-center justify-center rounded-full border border-[color:var(--color-rule)] text-[color:var(--color-ink-soft)] group-hover:bg-[color:var(--color-ink)] group-hover:text-[color:var(--color-paper-elevated)] group-hover:border-[color:var(--color-ink)] transition-colors">
                  <Linkedin className="size-5" />
                </span>
                <span className="text-[color:var(--color-ink)]">LinkedIn</span>
              </a>

              <a
                href={siteConfig.links.github}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-4 group"
              >
                <span className="w-12 h-12 flex items-center justify-center rounded-full border border-[color:var(--color-rule)] text-[color:var(--color-ink-soft)] group-hover:bg-[color:var(--color-ink)] group-hover:text-[color:var(--color-paper-elevated)] group-hover:border-[color:var(--color-ink)] transition-colors">
                  <Github className="size-5" />
                </span>
                <span className="text-[color:var(--color-ink)]">GitHub</span>
              </a>
            </div>

            <div className="border border-[color:var(--color-rule)] bg-[color:var(--color-paper-elevated)] rounded-md p-6">
              <p className="text-sm text-[color:var(--color-ink-soft)]">
                <span className="font-semibold text-[color:var(--color-ink)]">Response time:</span>{' '}
                I typically respond within 24-48 hours on weekdays.
              </p>
              <div className="mt-4">
                <Link
                  href="/meet"
                  className="inline-flex items-center gap-2 text-sm font-medium text-[color:var(--color-ink)] hover:text-[color:var(--color-accent)] underline underline-offset-4"
                >
                  Or book a meeting directly &rarr;
                </Link>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={shouldReduceMotion ? false : { opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.35, delay: 0.1 }}
            className="border border-[color:var(--color-rule)] bg-[color:var(--color-paper-elevated)] rounded-md p-8"
          >
            {state.success && (
              <div role="alert" aria-live="polite" className="mb-6 p-4 bg-green-50 border border-green-200 rounded-md text-green-800 text-sm">
                Message sent! I&apos;ll get back to you soon.
              </div>
            )}
            {state.error && (
              <div role="alert" aria-live="polite" className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md text-red-800 text-sm">
                {state.error} You can also email me at{' '}
                <a href={siteConfig.links.email} className="underline">{siteConfig.email}</a> directly.
              </div>
            )}

            <form action={formAction} className="space-y-4">
              <input type="hidden" name="utm_source" value={utmParams.utm_source} />
              <input type="hidden" name="utm_medium" value={utmParams.utm_medium} />
              <input type="hidden" name="utm_campaign" value={utmParams.utm_campaign} />

              <div>
                <label htmlFor="name" className="block text-sm font-medium text-[color:var(--color-ink)] mb-1">
                  Name <span aria-hidden="true" className="text-[color:var(--color-accent)]">*</span>
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  autoComplete="name"
                  className={inputClass}
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-[color:var(--color-ink)] mb-1">
                  Email <span aria-hidden="true" className="text-[color:var(--color-accent)]">*</span>
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  autoComplete="email"
                  className={inputClass}
                />
              </div>

              <div>
                <label htmlFor="subject" className="block text-sm font-medium text-[color:var(--color-ink)] mb-1">
                  Subject
                </label>
                <input
                  id="subject"
                  name="subject"
                  type="text"
                  autoComplete="off"
                  className={inputClass}
                />
              </div>

              <div>
                <label htmlFor="message" className="block text-sm font-medium text-[color:var(--color-ink)] mb-1">
                  Message <span aria-hidden="true" className="text-[color:var(--color-accent)]">*</span>
                </label>
                <textarea
                  id="message"
                  name="message"
                  required
                  rows={6}
                  className={`${inputClass} resize-none`}
                />
              </div>

              <button
                type="submit"
                disabled={isPending}
                className="w-full py-4 bg-[color:var(--color-ink)] text-[color:var(--color-paper-elevated)] rounded-full font-medium hover:bg-[color:var(--color-accent)] transition-colors disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
              >
                {isPending ? 'Sending...' : 'Send Message'}
              </button>
            </form>
          </motion.div>
        </div>
      </section>
    </>
  );
}
