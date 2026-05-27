import Link from "next/link";
import { siteConfig } from "@/data/site-config";

export function Footer() {
  return (
    <footer id="contact" className="bg-[#0a0a0a] text-white py-24 px-6 md:px-12">
      <div className="max-w-6xl mx-auto">
        <div className="grid md:grid-cols-2 gap-16 mb-16">
          <div>
            <h2 className="font-[family-name:var(--font-playfair)] text-4xl md:text-5xl mb-6">
              Let&apos;s work together.
            </h2>
            <p className="text-gray-400 text-lg leading-relaxed mb-8">
              Open to opportunities in healthcare product management, medtech innovation, and AI-powered health solutions. Always interested in challenging problems and mission-driven teams.
            </p>
            <div className="flex flex-wrap gap-4 pt-4">
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
            </div>
          </div>

          <div className="flex flex-col justify-center space-y-4">
            <a
              href={siteConfig.links.email}
              className="text-2xl hover:text-gray-300 transition-colors"
            >
              ps324@byu.edu
            </a>
            <div className="flex gap-6 pt-4">
              <a
                href={siteConfig.links.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-white transition-colors"
              >
                LinkedIn
              </a>
              <a
                href={siteConfig.links.github}
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-white transition-colors"
              >
                GitHub
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-gray-500 text-sm">
            &copy; {new Date().getFullYear()} {siteConfig.name}. All rights reserved.
          </p>
          <p className="text-gray-500 text-sm">
            Built with care and attention to detail.
          </p>
        </div>
      </div>
    </footer>
  );
}
