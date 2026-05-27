import type { Project } from "@/types";

export const projects: Project[] = [
  {
    id: "inara-health",
    slug: "inara-health",
    title: "Inara Health Diagnostic",
    description:
      "Founding a continuous progesterone monitoring device for early pregnancy care.",
    problem:
      "Progesterone levels are critical in early pregnancy, but current testing requires clinic visits and days-long lab delays — leaving patients without actionable data during their most vulnerable window.",
    solution:
      "Building a wearable continuous monitoring device with a cross-functional team across biosensing research, hardware prototyping, and clinical outreach. Leading product roadmap and execution framework from 0 to prototype.",
    results:
      "Directed allocation of ~$40K in capital (60% toward R&D); advancing technical feasibility with competitive funding milestones.",
    metrics: ["$40K capital deployed", "3-discipline team", "Founder & CEO"],
    lessonsLearned:
      "Hardware product development requires much longer feedback loops than software. Getting clinical stakeholders involved early — before the prototype exists — accelerates validation and surfaces regulatory constraints you'd otherwise hit late.",
    techStack: ["Hardware", "Biosensing", "Clinical Research", "Product Strategy", "Figma"],
    featured: true,
  },
  {
    id: "lds-church-pm",
    slug: "lds-church-pm",
    title: "LDS Church: Enterprise Tech PM",
    description:
      "PM intern driving enterprise-scale phone migrations and reporting infrastructure for a global organization.",
    problem:
      "1,200+ desk phones across 18 HQ departments needed migration to Microsoft Teams Phone with zero downtime. 30+ concurrent tech initiatives had no single source of truth for status tracking, creating coordination blind spots.",
    solution:
      "Coordinated 4 voice engineers for the Teams Phone migration; built Power BI dashboards to track all initiative timelines; oversaw Zoom Phone transitions across 50+ global sites; reclaimed 300+ unused licenses by auditing usage across all sites.",
    results:
      "Zero downtime across all migrations; $30K annual savings from license reclamation; 25% reduction in weekly meeting time; 1,000+ employees trained on new systems.",
    metrics: ["$30K/year saved", "1,200+ phones migrated", "0 downtime", "25% meeting reduction"],
    lessonsLearned:
      "At enterprise scale, the hardest part of a migration isn't the technology — it's stakeholder alignment across dozens of teams with competing priorities. Weekly 1:1s with department leads made the difference between a smooth rollout and a stalled one.",
    techStack: ["Power BI", "Microsoft Teams", "Zoom", "Power Automate", "Stakeholder Management"],
    featured: true,
  },
  {
    id: "nursa-ai-tb",
    slug: "nursa-ai-tb",
    title: "Nursa: AI TB Verification Model",
    description:
      "Built and shipped an AI-powered TB test verification model that replaced an external vendor.",
    problem:
      "Nursa's credentialing process relied on a costly third-party vendor for TB test verification. Manual review was expensive, slow, and introduced data quality issues that blocked clinician onboarding.",
    solution:
      "Built an AI-powered TB test verification model trained on real user data. Collaborated with developers to extract training samples, run model training, and deploy to production. Also audited Segment event tracking to close critical analytics data gaps.",
    results:
      "$30K in annual cost savings; improved data collection quality; in-house model replaced vendor entirely; product analytics materially strengthened.",
    metrics: ["$30K/year saved", "Replaced external vendor", "AI shipped to production"],
    lessonsLearned:
      "Replacing a vendor with an in-house model requires more than technical accuracy — you need to match the vendor's reliability guarantees and build internal confidence before you can cut the contract. Tracking edge cases early is critical.",
    techStack: ["Python", "AI/ML", "Segment", "SQL", "Tableau"],
    featured: true,
  },
  {
    id: "granger-rvu-analytics",
    slug: "granger-rvu-analytics",
    title: "Granger Medical: RVU Analytics Platform",
    description:
      "Web-based analytics platform covering 7,000+ CPT codes to strengthen payer contract negotiations.",
    problem:
      "Granger Medical's leadership lacked visibility into reimbursement gaps across their CPT code portfolio and had no data-driven basis for payer contract negotiations. The $10M+ real estate portfolio also lacked analytical structure.",
    solution:
      "Developed a web-based RVU analytics platform covering 7,000+ CPT codes. Organized 2,500+ billing codes and ran competitive payer pricing analysis to identify negotiation leverage points.",
    results:
      "Equipped executives with contract negotiation data; improved revenue cycle accuracy; provided real estate portfolio analysis to support asset decisions.",
    metrics: ["7,000+ CPT codes analyzed", "$10M+ portfolio", "2,500+ billing codes"],
    lessonsLearned:
      "Healthcare finance is deeply fragmented — each payer has different fee schedules, and RVU values shift with each code update. Building a maintainable data model that survives code changes is as important as the analysis itself.",
    techStack: ["Web Development", "Healthcare Finance", "Data Analysis", "SQL"],
    featured: false,
  },
  {
    id: "cocker-fellowship",
    slug: "cocker-fellowship",
    title: "Cocker Innovation Fellowship",
    description:
      "Leading product development for a synthetic biology startup from 0 to 1 as a Cocker Innovation Fellow.",
    problem:
      "An early-stage synthetic biology project needed product direction, market validation, and a go-to-market strategy with no prior product infrastructure.",
    solution:
      "Led MVP design, product roadmap, and GTM strategy. Conducted customer discovery with 200+ users to validate product direction. Built an AI-powered SEO content engine generating 20+ articles per week and deployed automated HTML email campaigns with weekly triggers.",
    results:
      "200+ users interviewed; AI content engine producing 20+ articles/week; product roadmap and GTM strategy complete.",
    metrics: ["200+ users interviewed", "20+ articles/week", "0→1 product built"],
    lessonsLearned:
      "Customer discovery at the 0-to-1 stage is less about confirming your hypothesis and more about finding the problem worth solving. The best insight from 200+ interviews wasn't what we expected — it reframed the entire go-to-market angle.",
    techStack: ["Product Strategy", "AI/SEO", "Email Automation", "Figma", "Go-to-Market"],
    featured: false,
  },
];
