"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { Mail, MapPin, Github, Linkedin } from "lucide-react";
import { siteConfig } from "@/data/site-config";

export function ContactSection() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("submitting");

    // Set NEXT_PUBLIC_FORMSPREE_ID in your environment to enable form submissions.
    // Falls back to a mailto link if not configured.
    const formspreeId = process.env.NEXT_PUBLIC_FORMSPREE_ID;

    if (!formspreeId) {
      const mailto = `mailto:ps324@byu.edu?subject=${encodeURIComponent(formData.subject)}&body=${encodeURIComponent(`From: ${formData.name} <${formData.email}>\n\n${formData.message}`)}`;
      window.location.href = mailto;
      setStatus("idle");
      return;
    }

    try {
      const res = await fetch(`https://formspree.io/f/${formspreeId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (res.ok) {
        setStatus("success");
        setFormData({ name: "", email: "", subject: "", message: "" });
      } else {
        setStatus("error");
      }
    } catch {
      setStatus("error");
    }
  }

  return (
    <section className="bg-white py-24 px-6 md:px-12">
      <div className="max-w-5xl mx-auto">
        <div className="grid md:grid-cols-2 gap-16">
          {/* Left column */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
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
                <span className="text-gray-700">ps324@byu.edu</span>
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
                <span className="font-semibold text-gray-900">Response time:</span>{" "}
                I typically respond within 24–48 hours on weekdays.
              </p>
              <div className="mt-4">
                <Link
                  href="/meet"
                  className="inline-flex items-center gap-2 text-sm font-medium text-gray-900 hover:underline"
                >
                  Or book a meeting directly →
                </Link>
              </div>
            </div>
          </motion.div>

          {/* Right column: form */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="bg-[#faf9f7] rounded-2xl p-8"
          >
            <h2 className="font-[family-name:var(--font-playfair)] text-3xl text-gray-900 mb-6">
              Send a Message
            </h2>

            {status === "success" && (
              <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg text-green-800 text-sm">
                Message sent! I&apos;ll get back to you soon.
              </div>
            )}
            {status === "error" && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-800 text-sm">
                Something went wrong. Please try again or email me directly.
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                  Name
                </label>
                <input
                  id="name"
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                  className="w-full bg-white border border-gray-300 rounded-lg px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900"
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
                  className="w-full bg-white border border-gray-300 rounded-lg px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900"
                />
              </div>

              <div>
                <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-1">
                  Subject
                </label>
                <input
                  id="subject"
                  type="text"
                  required
                  value={formData.subject}
                  onChange={(e) => setFormData((prev) => ({ ...prev, subject: e.target.value }))}
                  className="w-full bg-white border border-gray-300 rounded-lg px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900"
                />
              </div>

              <div>
                <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
                  Message
                </label>
                <textarea
                  id="message"
                  required
                  rows={6}
                  value={formData.message}
                  onChange={(e) => setFormData((prev) => ({ ...prev, message: e.target.value }))}
                  className="w-full bg-white border border-gray-300 rounded-lg px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900 resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={status === "submitting"}
                className="w-full py-4 bg-gray-900 text-white rounded-full font-medium hover:bg-gray-700 transition-colors disabled:opacity-50"
              >
                {status === "submitting" ? "Sending..." : "Send Message"}
              </button>
            </form>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
