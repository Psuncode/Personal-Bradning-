"use client";

import { motion, useReducedMotion } from "framer-motion";
import Link from "next/link";

export function Hero() {
  const shouldReduceMotion = useReducedMotion();

  return (
    <section className="relative pb-24 pt-32 md:pb-32 md:pt-40">
      <div className="editorial-shell">
        <motion.h1
          initial={shouldReduceMotion ? false : { opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          className="font-[family-name:var(--font-playfair)] text-5xl leading-[1.04] tracking-[-0.03em] text-[color:var(--color-ink)] md:text-7xl lg:text-[6rem]"
        >
          Philip Sun — product manager,
          <br />
          building Inara Health.
        </motion.h1>

        <p className="mt-6 max-w-2xl text-lg leading-8 text-[color:var(--color-ink-soft)] md:text-xl">
          Healthcare operations, medtech, and the boring parts of building
          software that holds up under scrutiny.
        </p>

        <p className="mt-8">
          <Link
            href="/projects/inara-health"
            className="text-base text-[color:var(--color-ink)] transition-colors hover:text-[color:var(--color-accent)] hover:underline"
          >
            See Inara →
          </Link>
        </p>
      </div>
    </section>
  );
}
