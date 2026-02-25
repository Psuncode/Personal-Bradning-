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
    company: "Your Company",
    title: "Your Role",
    period: "Jan 2025 – Present",
    location: "Provo, UT",
    type: "full-time",
    bullets: [
      "Add your key achievement with a metric here",
      "Another impact-focused bullet point",
      "What did you build, ship, or improve?",
    ],
  },
  {
    company: "Previous Company",
    title: "Previous Role",
    period: "Jun 2024 – Dec 2024",
    location: "Remote",
    type: "internship",
    bullets: [
      "Add your key achievement with a metric here",
      "Another impact-focused bullet point",
      "What did you learn or contribute?",
    ],
  },
];

export const education: Education[] = [
  {
    school: "Brigham Young University",
    degree: "Bachelor of Science",
    period: "Aug 2021 – Apr 2025",
    gpa: "3.X / 4.0",
    highlights: [
      "Relevant coursework: [add courses]",
      "Club or leadership role",
    ],
  },
];

export const skills = {
  product: [
    "Product Strategy",
    "User Research",
    "Roadmapping",
    "Agile / Scrum",
    "A/B Testing",
    "Data Analysis",
  ],
  technical: [
    "TypeScript",
    "React / Next.js",
    "Node.js",
    "Python",
    "PostgreSQL",
    "Git",
  ],
  business: [
    "Healthcare M&A",
    "ETA / Search",
    "Financial Modeling",
    "Stakeholder Management",
    "Deal Sourcing",
  ],
};
