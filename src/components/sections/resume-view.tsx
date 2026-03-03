import Link from "next/link";
import { Download } from "lucide-react";
import { roles, education, skills } from "@/data/resume";

const typeLabel: Record<string, string> = {
  "full-time": "Full-time",
  internship: "Internship",
  "part-time": "Part-time",
  contract: "Contract",
};

export function ResumeView() {
  return (
    <div className="bg-white py-24 px-6 md:px-12">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-6 mb-16">
          <div>
            <h1 className="font-[family-name:var(--font-playfair)] text-5xl md:text-6xl text-gray-900 mb-3">
              Resume
            </h1>
            <p className="text-gray-600 text-lg">Product · Strategy · Healthcare</p>
          </div>
          <a
            href="/Philip-Sun-Resume.pdf"
            download
            className="inline-flex items-center gap-2 px-6 py-3 bg-gray-900 text-white rounded-full hover:bg-gray-700 transition-colors text-sm font-medium self-start"
          >
            <Download className="size-4" />
            Download PDF
          </a>
        </div>

        {/* Experience */}
        <section className="mb-20">
          <h2 className="font-[family-name:var(--font-playfair)] text-3xl text-gray-900 mb-10">
            Experience
          </h2>
          <div className="relative pl-8 border-l-2 border-gray-200 space-y-10">
            {roles.map((role, i) => (
              <div key={i} className="relative">
                <span className="absolute -left-[1.5625rem] top-1.5 w-4 h-4 bg-gray-900 rounded-full" />
                <div className="flex flex-wrap items-start justify-between gap-2 mb-1">
                  <div>
                    <h3 className="font-semibold text-xl text-gray-900">{role.title}</h3>
                    <p className="text-gray-600 font-medium">{role.company}</p>
                  </div>
                  <div className="text-right text-sm text-gray-500">
                    <div>{role.period}</div>
                    <div>{role.location}</div>
                    <div>{typeLabel[role.type]}</div>
                  </div>
                </div>
                <ul className="mt-3 space-y-2 text-gray-600 leading-relaxed">
                  {role.bullets.map((b, j) => (
                    <li key={j} className="flex gap-2">
                      <span className="mt-2 size-1.5 shrink-0 rounded-full bg-gray-400" />
                      {b}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        {/* Education */}
        <section className="mb-20">
          <h2 className="font-[family-name:var(--font-playfair)] text-3xl text-gray-900 mb-10">
            Education
          </h2>
          <div className="relative pl-8 border-l-2 border-gray-200 space-y-10">
            {education.map((edu, i) => (
              <div key={i} className="relative">
                <span className="absolute -left-[1.5625rem] top-1.5 w-4 h-4 bg-gray-900 rounded-full" />
                <div className="flex flex-wrap items-start justify-between gap-2 mb-1">
                  <div>
                    <h3 className="font-semibold text-xl text-gray-900">{edu.school}</h3>
                    <p className="text-gray-600">{edu.degree}</p>
                  </div>
                  <div className="text-right text-sm text-gray-500">
                    <div>{edu.period}</div>
                    {edu.gpa && <div>GPA {edu.gpa}</div>}
                  </div>
                </div>
                {edu.highlights.length > 0 && (
                  <ul className="mt-3 space-y-1.5 text-gray-600">
                    {edu.highlights.map((h, j) => (
                      <li key={j} className="flex gap-2">
                        <span className="mt-2 size-1.5 shrink-0 rounded-full bg-gray-400" />
                        {h}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Skills */}
        <section className="mb-20">
          <h2 className="font-[family-name:var(--font-playfair)] text-3xl text-gray-900 mb-10">
            Skills
          </h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h3 className="font-semibold text-gray-900 mb-4">Product Management</h3>
              <div className="flex flex-wrap gap-2">
                {skills.product.map((s) => (
                  <span key={s} className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
                    {s}
                  </span>
                ))}
              </div>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-4">Technical Skills</h3>
              <div className="flex flex-wrap gap-2">
                {skills.technical.map((s) => (
                  <span key={s} className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
                    {s}
                  </span>
                ))}
              </div>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-4">Business</h3>
              <div className="flex flex-wrap gap-2">
                {skills.business.map((s) => (
                  <span key={s} className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
                    {s}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <div className="text-center border-t border-gray-200 pt-12">
          <p className="text-gray-600 mb-6">Interested in working together?</p>
          <Link
            href="/contact"
            className="inline-flex items-center gap-2 px-8 py-4 bg-gray-900 text-white rounded-full hover:bg-gray-700 transition-colors font-medium"
          >
            Get in Touch
          </Link>
        </div>
      </div>
    </div>
  );
}
