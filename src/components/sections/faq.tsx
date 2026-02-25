import { Container } from "@/components/layout/container";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    q: "What kind of PM roles are you targeting?",
    a: "Full-time PM roles starting May 2026 (BYU graduation Apr 2026). Interested in healthcare tech, B2B SaaS, or companies building complex physical-digital products. Strongest background in enterprise tech, clinician-facing apps, and 0→1 product development.",
  },
  {
    q: "What is Inara Health?",
    a: "A healthcare diagnostics startup building a continuous progesterone monitoring device for early pregnancy care. I founded it in Jan 2025 and lead a cross-functional team across biosensing research, hardware prototyping, and clinical outreach. We've deployed ~$40K in capital with 60% going toward R&D.",
  },
  {
    q: "What's your strongest PM experience?",
    a: "Two PM internships with real production impact: at the LDS Church (migrated 1,200+ phones with zero downtime, saved $30K/yr on licenses) and at Nursa (shipped an AI TB verification model that replaced an external vendor, saving another $30K/yr). Both involved working directly with engineers and shipping to production.",
  },
  {
    q: "How do I book a meeting with you?",
    a: "Head to /meet and pick the type that fits — Recruiting for job conversations, Startup for partnerships or co-founder discussions, or Healthcare for domain-specific conversations. I keep 5–10 slots open per week.",
  },
  {
    q: "Where are you based?",
    a: "Provo, Utah (BYU). Graduating Apr 2026. Open to relocating for the right full-time role, and remote-friendly for startup or part-time work.",
  },
];

export function FAQ() {
  return (
    <section className="border-b border-byu-sky/20 bg-gray-50 py-16">
      <Container>
        <h2 className="mb-8 text-2xl font-bold text-byu-navy">
          Frequently Asked
        </h2>
        <Accordion type="single" collapsible className="max-w-2xl">
          {faqs.map((item, i) => (
            <AccordionItem key={i} value={`item-${i}`}>
              <AccordionTrigger className="text-left text-byu-navy hover:text-byu-blue">
                {item.q}
              </AccordionTrigger>
              <AccordionContent className="text-gray-600">
                {item.a}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </Container>
    </section>
  );
}
