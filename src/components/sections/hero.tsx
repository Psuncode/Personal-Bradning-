"use client";

import { motion } from "framer-motion";
import Link from "next/link";

export function Hero() {
  return (
    <section className="bg-[#0a0a0a] text-white min-h-screen flex items-center px-6 md:px-12 relative overflow-hidden">
      {/* Subtle white blur circles */}
      <div className="absolute inset-0 opacity-5 pointer-events-none">
        <div className="absolute top-20 left-20 w-96 h-96 bg-white rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-white rounded-full blur-3xl" />
      </div>

      <div className="max-w-6xl w-full relative z-10 space-y-8">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-5xl md:text-7xl lg:text-8xl font-[family-name:var(--font-playfair)] leading-[1.1] max-w-5xl"
        >
          Creative Thinker. Modern Builder.
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.25 }}
          className="text-xl md:text-2xl text-gray-300 max-w-3xl"
        >
          Product Manager specializing in Healthcare Technology and AI-Powered Solutions.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="pt-4 flex flex-wrap gap-4"
        >
          <Link
            href="/contact"
            className="inline-flex items-center gap-2 px-8 py-4 bg-white text-black rounded-full hover:bg-gray-100 transition-colors font-medium"
          >
            Get in Touch
          </Link>
          <Link
            href="/resume"
            className="inline-flex items-center gap-2 px-8 py-4 border-2 border-white text-white rounded-full hover:bg-white hover:text-black transition-colors font-medium"
          >
            View Resume
          </Link>
        </motion.div>
      </div>

      {/* Animated bounce arrow */}
      <div className="absolute bottom-12 left-1/2 -translate-x-1/2">
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 5V19M12 19L6 13M12 19L18 13" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </motion.div>
      </div>
    </section>
  );
}
