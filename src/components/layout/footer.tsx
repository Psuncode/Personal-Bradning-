import { siteConfig } from "@/data/site-config";

export function Footer() {
  return (
    <footer id="contact" className="bg-[#0a0a0a] text-white py-24 px-6 md:px-12">
      <div className="max-w-6xl mx-auto grid gap-12 md:grid-cols-3">
        <div>
          <p className="font-[family-name:var(--font-playfair)] text-3xl mb-2">Philip Sun</p>
          <p className="text-sm text-gray-400">Portfolio · {new Date().getFullYear()}</p>
        </div>
        <div className="text-sm space-y-2">
          <a href={siteConfig.links.email} className="block hover:text-gray-300">
            {siteConfig.email}
          </a>
          <div className="flex gap-4 text-gray-400">
            <a
              href={siteConfig.links.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-white"
            >
              LinkedIn
            </a>
            <a
              href={siteConfig.links.github}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-white"
            >
              GitHub
            </a>
          </div>
        </div>
        <div className="text-xs text-gray-500 leading-6">
          Built with Next.js and Tailwind. Photography by Philip. Set in Playfair Display and Inter.
        </div>
      </div>
    </footer>
  );
}
