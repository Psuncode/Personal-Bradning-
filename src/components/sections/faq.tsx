import { Container } from "@/components/layout/container";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    q: "What kind of roles are you open to?",
    a: "Product Manager, Strategy, or Chief of Staff roles at growth-stage companies ($10M–$200M ARR). Also open to co-founding conversations — especially in healthcare tech or B2B SaaS where I can bring both product and operator DNA.",
  },
  {
    q: "What's your M&A / ETA thesis?",
    a: "I'm running a focused search on small healthcare services businesses in the $2–10M revenue range, primarily in the Intermountain West. I'm looking for founder-owned businesses with stable cash flow and a clear operational improvement opportunity.",
  },
  {
    q: "What does 'Investor' mean in your positioning?",
    a: "I write small angel checks ($5K–$25K) into pre-seed healthcare and B2B SaaS startups where I can add operator value — product strategy, GTM, or early hiring. I prioritize companies where I know the founder personally.",
  },
  {
    q: "How do I book a meeting with you?",
    a: "Head to /meet and pick the meeting type that fits: Recruiting for job conversations, Startup for venture or partnership discussions, or Investing for deal flow and co-investment. I keep 5–10 slots open per week.",
  },
  {
    q: "Where are you based?",
    a: "Provo, Utah (BYU). Fully remote-friendly for the right role or opportunity — I've worked across US time zones without issue.",
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
