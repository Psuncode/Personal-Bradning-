export interface Role {
  company: string;
  title: string;
  period: string;
  location: string;
  type: "full-time" | "internship" | "part-time" | "contract";
  bullets: string[];
}

export interface Education {
  school: string;
  degree: string;
  period: string;
  gpa?: string;
  highlights: string[];
}

export const roles: Role[] = [
  {
    company: "Inara Health Diagnostic",
    title: "Founder & CEO",
    period: "Jan 2025 – Present",
    location: "Provo, UT",
    type: "full-time",
    bullets: [
      "Leading development of a continuous progesterone monitoring device for early pregnancy care",
      "Built and manage a cross-functional team across biosensing research, hardware prototyping, and clinical outreach",
      "Directed allocation of ~$40K in capital, deploying 60% toward R&D to advance technical feasibility",
      "Established product roadmap and execution framework to drive prototype development and competitive funding wins",
    ],
  },
  {
    company: "Granger Medical Clinic",
    title: "Administrative Intern",
    period: "Sep 2025 – Dec 2025",
    location: "Provo, UT",
    type: "internship",
    bullets: [
      "Analyzed $10M+ real estate portfolio to support executive decision-making on accounting and asset management",
      "Organized 2,500+ billing codes and conducted competitive payer pricing analysis, improving revenue cycle accuracy",
      "Developed a web-based RVU analytics platform covering 7,000+ CPT codes to identify reimbursement gaps and support executive negotiation strategy",
    ],
  },
  {
    company: "The Church of Jesus Christ of Latter-day Saints",
    title: "Communication Technology PM Intern",
    period: "Apr 2025 – Aug 2025",
    location: "Salt Lake City, UT",
    type: "internship",
    bullets: [
      "Led Microsoft Teams Phone migration for 18 of 20 HQ departments, coordinating 4 voice engineers to transfer 1,200+ desk phones with zero downtime",
      "Reclaimed 300+ unused Zoom Phone licenses by auditing usage across 30+ global sites, saving $30,000 annually",
      "Built and maintained Power BI dashboards to track 30+ tech initiative timelines, reducing weekly meeting time by 25%",
      "Ran user interviews and focus groups to uncover onboarding pain points; translated findings into prioritized user stories and actionable improvements",
      "Designed and delivered training programs for 1,000+ employees across major tech transitions",
    ],
  },
  {
    company: "Nursa",
    title: "Product Manager Intern",
    period: "Sep 2024 – Apr 2025",
    location: "Murray, UT",
    type: "internship",
    bullets: [
      "Reduced credentialing costs by $30K annually by building an AI-powered TB test verification model using real user data; replaced existing vendor with a cheaper, in-house solution",
      "Collaborated with developers to extract samples, run model training, and implement the system into production",
      "Audited and improved app-wide event tracking in Segment to close critical data gaps and strengthen product analytics",
      "Led strategy project to improve clinician check-in workflows and onboarding at partner facilities; delivered solutions that enabled executive implementation decisions",
    ],
  },
  {
    company: "Med-Kick",
    title: "Intern Director",
    period: "Apr 2024 – Aug 2024",
    location: "Provo, UT",
    type: "internship",
    bullets: [
      "Managed 50 interns across finance, sales, and business administration departments",
      "Monitored and tracked key KPIs using HubSpot, improving data-driven decision-making by 25%",
      "Led the selection and interview process; met 3+ times weekly with CEO to align on projects and priorities",
    ],
  },
  {
    company: "Leventhal Capital",
    title: "Leventhal Fellow",
    period: "2024 – Present",
    location: "Remote",
    type: "part-time",
    bullets: [
      "Participating in a mentorship program focused on capital markets, deal evaluation, and investment strategy",
    ],
  },
  {
    company: "BYU Workday",
    title: "Change Management Lead",
    period: "Oct 2023 – Apr 2025",
    location: "Provo, UT",
    type: "part-time",
    bullets: [
      "Designed and launched a training readiness survey reaching 35,000+ faculty and staff across campus",
      "Conducted 10+ user group interviews to identify pain points and tailor training content to specific team needs",
      "Built a change management strategy using engagement analytics and platform usage data aligned with the ADKAR model",
      "Created weekly training and communication materials to support system-wide adoption during implementation",
    ],
  },
];

export const education: Education[] = [
  {
    school: "Brigham Young University — Marriott School of Business",
    degree: "BS in Business Strategy, Minor in Healthcare Leadership",
    period: "Sep 2023 – Apr 2026",
    gpa: "3.96 / 4.00",
    highlights: [
      "Dean's List — Top 5% of ~2,800 undergraduate business students",
      "Healthcare Leadership Scholar",
      "VP of Product Management Association",
      "VP of Utah Biohive BYU Chapter",
    ],
  },
  {
    school: "Brigham Young University–Idaho",
    degree: "Associate Degree, Digital Marketing",
    period: "Apr 2021 – Apr 2023",
    highlights: [
      "Business Management, Marketing, Finance, Organization Leadership",
    ],
  },
];

export const skills = {
  product: [
    "Product Strategy",
    "Roadmapping",
    "User Research",
    "Data Analysis",
    "Agile / Scrum",
    "Jira",
    "Figma",
    "Go-to-Market",
  ],
  technical: [
    "SQL",
    "Python",
    "Tableau",
    "Power BI",
    "Power Automate",
    "Segment",
  ],
  business: [
    "Healthcare Operations",
    "Change Management",
    "Stakeholder Management",
    "Healthcare Finance",
    "HubSpot",
  ],
};
