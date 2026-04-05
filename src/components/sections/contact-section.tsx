'use client';

import { useEffect, useState, useActionState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import Link from 'next/link';
import { Mail, MapPin, Github, Linkedin } from 'lucide-react';
import { siteConfig } from '@/data/site-config';
import { saveContact } from '@/app/actions/contact';
import type { ContactFormState } from '@/app/actions/contact';

export function ContactSection() {
  const shouldReduceMotion = useReducedMotion();

  const [utmParams, setUtmParams] = useState({
    utm_source: '',
    utm_medium: '',
    utm_campaign: '',
  });

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setUtmParams({
      utm_source: params.get('utm_source') ?? '',
      utm_medium: params.get('utm_medium') ?? '',
      utm_campaign: params.get('utm_campaign') ?? '',
    });
  }, []);

  const [state, formAction, isPending] = useActionState<ContactFormState, FormData>(
    saveContact,
    { success: false }
  );

  return (
    <section className="bg-white py-24 px-6 md:px-12">
      <div className="max-w-5xl mx-auto">
        <div className="grid md:grid-cols-2 gap-16">
          {/* Left column */}
          <motion.div
            initial={shouldReduceMotion ? false : { opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.35 }}
          >
            <h1 className="font-[family-name:var(--font-playfair)] text-5xl md:text-6xl text-gray-900 mb-6">
              Get in Touch
            </h1>
            <p className="text-gray-600 leading-relaxed mb-10">
              Recruiting for a PM role, building something in healthcare, or want to talk shop? I keep my calendar open for the right conversations.
            </p>

            <div className="space-y-4 mb-10">
              <a
                href={siteConfig.links.email}
                className="flex items-center gap-4 group"
              >
                <span className="w-12 h-12 flex items-center justify-center rounded-full bg-gray-100 group-hover:bg-gray-900 group-hover:text-white transition-colors">
                  <Mail className="size-5" />
                </span>
                <span className="text-gray-700">{siteConfig.email}</span>
              </a>

              <div className="flex items-center gap-4">
                <span className="w-12 h-12 flex items-center justify-center rounded-full bg-gray-100">
                  <MapPin className="size-5" />
                </span>
                <span className="text-gray-700">Provo, UT</span>
              </div>

              <a
                href={siteConfig.links.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-4 group"
              >
                <span className="w-12 h-12 flex items-center justify-center rounded-full bg-gray-100 group-hover:bg-gray-900 group-hover:text-white transition-colors">
                  <Linkedin className="size-5" />
                </span>
                <span className="text-gray-700">LinkedIn</span>
              </a>

              <a
                href={siteConfig.links.github}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-4 group"
              >
                <span className="w-12 h-12 flex items-center justify-center rounded-full bg-gray-100 group-hover:bg-gray-900 group-hover:text-white transition-colors">
                  <Github className="size-5" />
                </span>
                <span className="text-gray-700">GitHub</span>
              </a>
            </div>

            <div className="bg-gray-50 rounded-2xl p-6">
              <p className="text-sm text-gray-600">
                <span className="font-semibold text-gray-900">Response time:</span>{' '}
                I typically respond within 24-48 hours on weekdays.
              </p>
              <div className="mt-4">
                <Link
                  href="/meet"
                  className="inline-flex items-center gap-2 text-sm font-medium text-gray-900 hover:underline"
                >
                  Or book a meeting directly &rarr;
                </Link>
              </div>
            </div>
          </motion.div>

          {/* Right column: form */}
          <motion.div
            initial={shouldReduceMotion ? false : { opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.35, delay: 0.1 }}
            className="bg-[#faf9f7] rounded-2xl p-8"
          >
            <h2 className="font-[family-name:var(--font-playfair)] text-3xl text-gray-900 mb-6">
              Send a Message
            </h2>

            {state.success && (
              <div role="alert" aria-live="polite" className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg text-green-800 text-sm">
                Message sent! I&apos;ll get back to you soon.
              </div>
            )}
            {state.error && (
              <div role="alert" aria-live="polite" className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-800 text-sm">
                {state.error} You can also email me at{' '}
                <a href={siteConfig.links.email} className="underline">{siteConfig.email}</a> directly.
              </div>
            )}

            <form action={formAction} className="space-y-4">
              {/* Hidden UTM inputs — populated from URL on mount */}
              <input type="hidden" name="utm_source" value={utmParams.utm_source} />
              <input type="hidden" name="utm_medium" value={utmParams.utm_medium} />
              <input type="hidden" name="utm_campaign" value={utmParams.utm_campaign} />

              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                  Name <span aria-hidden="true" className="text-red-500">*</span>
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  autoComplete="name"
                  className="w-full bg-white border border-gray-300 rounded-lg px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900"
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email <span aria-hidden="true" className="text-red-500">*</span>
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  autoComplete="email"
                  className="w-full bg-white border border-gray-300 rounded-lg px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900"
                />
              </div>

              <div>
                <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-1">
                  Subject
                </label>
                <input
                  id="subject"
                  name="subject"
                  type="text"
                  autoComplete="off"
                  className="w-full bg-white border border-gray-300 rounded-lg px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900"
                />
              </div>

              <div>
                <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
                  Message <span aria-hidden="true" className="text-red-500">*</span>
                </label>
                <textarea
                  id="message"
                  name="message"
                  required
                  rows={6}
                  className="w-full bg-white border border-gray-300 rounded-lg px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900 resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={isPending}
                className="w-full py-4 bg-gray-900 text-white rounded-full font-medium hover:bg-gray-700 transition-colors disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
              >
                {isPending ? 'Sending...' : 'Send Message'}
              </button>
            </form>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
