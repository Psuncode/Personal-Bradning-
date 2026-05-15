"use client";

import { motion, useReducedMotion } from "framer-motion";
import Link from "next/link";

export function Hero() {
  const shouldReduceMotion = useReducedMotion();

  return (
    <section className="relative overflow-hidden px-6 pb-20 pt-28 md:px-12 md:pb-28 md:pt-36">
      <div className="editorial-shell relative">
        <div className="editorial-rule mb-8 pt-6">
          <p className="editorial-kicker">Philip Sun</p>
        </div>

        <div className="grid gap-12 md:grid-cols-12 md:items-end">
          <div className="md:col-span-8">
            <motion.h1
              initial={shouldReduceMotion ? false : { opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: 0.1 }}
              className="font-[family-name:var(--font-playfair)] text-5xl leading-[1.04] tracking-[-0.03em] text-[color:var(--color-ink)] md:text-7xl"
            >
              I build product strategy, operating leverage, and trust.
            </motion.h1>

            <motion.p
              initial={shouldReduceMotion ? false : { opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: 0.18 }}
              className="mt-6 max-w-2xl text-lg leading-8 text-[color:var(--color-ink-soft)] md:text-xl"
            >
              Product manager, founder, and selective builder across healthcare,
              systems, and craft. I care about clear decisions, thoughtful
              execution, and work that holds up under scrutiny.
            </motion.p>
          </div>

          <motion.div
            initial={shouldReduceMotion ? false : { opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.28 }}
            className="editorial-card md:col-span-4 rounded-[1.75rem] p-8 bg-[rgba(251,247,241,0.8)] border border-[color:var(--color-rule)] shadow-sm backdrop-blur-sm"
          >
            <p className="editorial-kicker mb-4">Current Positioning</p>
            <div className="space-y-3 text-sm leading-7 text-[color:var(--color-ink-soft)]">
              <p>16M+ users influenced across enterprise and healthcare systems.</p>
              <p>3+ years in product across startup and scaled environments.</p>
              <p>Open to the right full-time PM role where product judgment matters.</p>
            </div>
          </motion.div>
        </div>

        <motion.div
          initial={shouldReduceMotion ? false : { opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.34 }}
          className="mt-10 flex flex-wrap gap-4"
        >
          <Link
            href="/meet"
            className="inline-flex items-center gap-2 rounded-full bg-[color:var(--color-ink)] px-6 py-3 text-sm font-medium text-[color:var(--color-paper-elevated)] transition-colors hover:bg-[color:var(--color-accent)]"
          >
            Book a Call
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
