"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";

const competencies = [
  {
    title: "Healthcare Product Strategy",
    body: "Designing patient-centered digital health products that can survive clinical, operational, and regulatory scrutiny.",
  },
  {
    title: "AI in Healthcare",
    body: "Translating applied machine learning into workflows that improve signal quality, adoption, and decision confidence.",
  },
  {
    title: "User Research & Testing",
    body: "Working closely with patients, clinicians, and stakeholders to understand what actually changes behavior.",
  },
];

export function About() {
  return (
    <section id="about" className="pt-32 pb-24 overflow-hidden">
      <motion.div 
        className="editorial-shell grid gap-12 md:grid-cols-12"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        <div className="md:col-span-7">
          <p className="editorial-kicker mb-4">Profile</p>
          <h2 className="font-[family-name:var(--font-playfair)] text-4xl leading-tight text-[color:var(--color-ink)] md:text-6xl">
            I work at the intersection of product, healthcare, and craft.
          </h2>

          <div className="mt-8 max-w-2xl space-y-5 text-lg leading-8 text-[color:var(--color-ink-soft)]">
            <p>
              I am a product manager and healthcare founder building systems that need
              both strategic clarity and operational discipline, from AI diagnostics and
              analytics platforms to enterprise-scale internal tools.
            </p>
            <p>
              Photography remains part of the same worldview. Good product work and good
              image-making both depend on attention, judgment, and an honest read of what
              matters.
            </p>
          </div>

          <div className="mt-8">
            <Link
              href="/meet"
              className="inline-flex items-center border-b border-[color:var(--color-accent)] pb-1 text-sm font-medium uppercase tracking-[0.18em] text-[color:var(--color-accent)]"
            >
              Open to full-time PM roles starting April 2026
            </Link>
          </div>

          <div className="editorial-rule mt-12 pt-8">
            <h3 className="font-[family-name:var(--font-playfair)] text-2xl text-[color:var(--color-ink)]">
              Core Competencies
            </h3>
            <ul className="mt-6 space-y-6">
              {competencies.map((item) => (
                <li
                  key={item.title}
                  className="grid gap-2 md:grid-cols-[220px_minmax(0,1fr)]"
                >
                  <h4 className="text-sm font-semibold uppercase tracking-[0.2em] text-[color:var(--color-ink)]">
                    {item.title}
                  </h4>
                  <p className="text-sm leading-7 text-[color:var(--color-ink-soft)]">
                    {item.body}
                  </p>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="md:col-span-5">
          <div className="editorial-card sticky top-28 overflow-hidden rounded-[2rem] p-4">
            <div className="relative h-[560px] overflow-hidden rounded-[1.5rem]">
              <Image
                src="https://images.unsplash.com/photo-1700619663094-be321751b545?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080"
                alt="Philip Sun workspace editorial portrait"
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 40vw"
              />
            </div>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
