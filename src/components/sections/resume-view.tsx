import Link from "next/link";
import { Download, Calendar, MapPin } from "lucide-react";
import { Container } from "@/components/layout/container";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { roles, education, skills } from "@/data/resume";

const typeLabel: Record<string, string> = {
  "full-time": "Full-time",
  internship: "Internship",
  "part-time": "Part-time",
  contract: "Contract",
};

export function ResumeView() {
  return (
    <Container>
      {/* Header */}
      <div className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-byu-navy sm:text-4xl">
            Philip Sun
          </h1>
          <p className="mt-1 text-byu-dark-gray/70">
            Product · Engineering · Strategy
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Button asChild variant="outline" className="border-byu-blue text-byu-blue hover:bg-byu-blue hover:text-white">
            <a href="/Philip-Sun-Resume.pdf" download>
              <Download className="mr-1.5 size-4" />
              Download PDF
            </a>
          </Button>
          <Button asChild className="bg-byu-blue text-white hover:bg-byu-navy">
            <Link href="/meet">Book a Recruiting Call</Link>
          </Button>
        </div>
      </div>

      <Separator className="mb-10" />

      {/* Experience */}
      <section className="mb-12">
        <h2 className="mb-6 text-xl font-bold text-byu-navy">Experience</h2>
        <div className="relative space-y-8 pl-6 before:absolute before:left-0 before:top-2 before:h-[calc(100%-1.5rem)] before:w-px before:bg-byu-sky/60">
          {roles.map((role, i) => (
            <div key={i} className="relative">
              {/* Timeline dot */}
              <span className="absolute -left-[1.4375rem] top-1.5 size-2.5 rounded-full border-2 border-byu-blue bg-white" />
              <div className="rounded-xl border border-byu-sky/30 bg-white p-5 shadow-sm">
                <div className="mb-1 flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <h3 className="font-semibold text-byu-navy">{role.title}</h3>
                    <p className="text-sm font-medium text-byu-blue">{role.company}</p>
                  </div>
                  <Badge variant="secondary" className="bg-byu-sky/30 text-byu-navy text-xs">
                    {typeLabel[role.type]}
                  </Badge>
                </div>
                <div className="mb-3 flex flex-wrap gap-4 text-xs text-byu-dark-gray/60">
                  <span className="flex items-center gap-1">
                    <Calendar className="size-3" />
                    {role.period}
                  </span>
                  <span className="flex items-center gap-1">
                    <MapPin className="size-3" />
                    {role.location}
                  </span>
                </div>
                <ul className="space-y-1.5 text-sm text-byu-dark-gray">
                  {role.bullets.map((b, j) => (
                    <li key={j} className="flex gap-2">
                      <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-byu-light-blue" />
                      {b}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Skills */}
      <section className="mb-12">
        <h2 className="mb-6 text-xl font-bold text-byu-navy">Skills</h2>
        <div className="grid gap-6 sm:grid-cols-3">
          {(
            [
              { label: "Product", items: skills.product },
              { label: "Technical", items: skills.technical },
              { label: "Business", items: skills.business },
            ] as const
          ).map(({ label, items }) => (
            <div key={label} className="rounded-xl border border-byu-sky/30 bg-white p-5 shadow-sm">
              <h3 className="mb-3 text-sm font-semibold text-byu-navy">{label}</h3>
              <div className="flex flex-wrap gap-2">
                {items.map((s) => (
                  <Badge key={s} variant="secondary" className="bg-byu-sky/30 text-byu-navy text-xs">
                    {s}
                  </Badge>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Education */}
      <section className="mb-12">
        <h2 className="mb-6 text-xl font-bold text-byu-navy">Education</h2>
        <div className="space-y-4">
          {education.map((edu, i) => (
            <div key={i} className="rounded-xl border border-byu-sky/30 bg-white p-5 shadow-sm">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <h3 className="font-semibold text-byu-navy">{edu.school}</h3>
                  <p className="text-sm text-byu-dark-gray/70">{edu.degree}</p>
                </div>
                <div className="text-right text-xs text-byu-dark-gray/60">
                  <div>{edu.period}</div>
                  {edu.gpa && <div>GPA {edu.gpa}</div>}
                </div>
              </div>
              {edu.highlights.length > 0 && (
                <ul className="mt-3 space-y-1 text-sm text-byu-dark-gray">
                  {edu.highlights.map((h, j) => (
                    <li key={j} className="flex gap-2">
                      <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-byu-light-blue" />
                      {h}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      </section>
    </Container>
  );
}
