"use client";

import { motion, useReducedMotion } from "framer-motion";
import Link from "next/link";

export function Hero() {
  const shouldReduceMotion = useReducedMotion();

  return (
    <section className="relative flex min-h-[85vh] items-center overflow-hidden px-6 py-24 md:px-12">
      <div className="editorial-shell relative">
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
            className="text-base text-[color:var(--color-ink)] transition-[font-style] duration-200 hover:italic"
          >
            See Inara →
          </Link>
        </p>
      </div>
    </section>
  );
}
