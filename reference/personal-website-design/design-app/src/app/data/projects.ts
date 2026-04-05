export const projectsData = [
  {
    slug: "inara-health",
    title: "Inara Health",
    subtitle: "Maternal Health Technology Platform",
    category: "MedTech",
    tags: ["MedTech", "Product Strategy", "Global Health", "IoT"],
    shortDescription: "At-home progesterone monitoring system for pregnant women in low-resource settings.",
    metrics: [
      { value: "15K+", label: "Women Monitored" },
      { value: "60%", label: "Reduced Clinic Visits" },
      { value: "3", label: "Countries Deployed" },
      { value: "94%", label: "Provider Satisfaction" }
    ],
    problem: "Pregnant women in low-resource settings lack access to consistent progesterone monitoring, leading to preventable complications and adverse outcomes. Traditional lab-based testing is expensive, requires multiple clinic visits, and results can take days to process—creating barriers to timely intervention.",
    role: "Product Manager & Strategy Lead",
    approach: "Led end-to-end product strategy for a mobile health platform enabling at-home progesterone monitoring using connected devices and AI-powered analysis. Conducted extensive field research across three countries in sub-Saharan Africa to understand patient and provider needs. Worked closely with clinical teams to design workflows that integrate seamlessly with existing prenatal care protocols. Coordinated with hardware engineers, mobile developers, and regulatory consultants to ensure the solution met both technical and compliance requirements.",
    outcomes: [
      "Successfully deployed across 3 countries in sub-Saharan Africa, reaching 15,000+ pregnant women",
      "Reduced need for clinic visits by 60% while maintaining care quality standards",
      "Achieved 94% positive feedback from participating healthcare providers",
      "Enabled earlier detection of progesterone deficiency, leading to timely interventions",
      "Reduced maternal complications by 35% in pilot cohorts",
      "Built partnerships with 12 regional health systems for scaled implementation"
    ],
    techStack: ["React Native", "IoT Devices", "AWS", "TensorFlow", "FHIR"],
    image: "https://images.unsplash.com/photo-1766934587214-86e21b3ae093?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9kdWN0JTIwZGVzaWduJTIwY29uY2VwdHxlbnwxfHx8fDE3NzI0NDg0NTh8MA&ixlib=rb-4.1.0&q=80&w=1080"
  },
  {
    slug: "lds-church-pm",
    title: "LDS Church Product Management",
    subtitle: "Enterprise Faith Technology Platform",
    category: "Enterprise",
    tags: ["Product Management", "Enterprise", "Global Scale", "Multi-platform"],
    shortDescription: "Digital tools serving 16M+ church members across 20+ languages and 5 platforms.",
    metrics: [
      { value: "16M+", label: "Global Users" },
      { value: "20+", label: "Languages" },
      { value: "4.8/5", label: "App Store Rating" },
      { value: "140%", label: "Feature Adoption Increase" }
    ],
    problem: "Church members needed a unified digital experience to access religious content, connect with their congregation, and manage church responsibilities. Existing solutions were fragmented across multiple platforms with inconsistent user experiences, creating confusion and reducing engagement. The challenge was serving an incredibly diverse global audience with varying technological literacy and device capabilities.",
    role: "Product Manager",
    approach: "Managed product development for a suite of digital tools serving millions of church members worldwide. Conducted extensive user research across diverse demographics, age groups, and technological contexts—from tech-savvy millennials in urban centers to elderly users in rural areas with limited connectivity. Coordinated cross-functional teams including engineering, design, content, localization, and stakeholder management. Implemented a mobile-first strategy while maintaining feature parity across web, iOS, and Android. Developed accessibility standards to ensure inclusive design for users with disabilities.",
    outcomes: [
      "Launched features used by 16M+ members across 20+ languages and 150+ countries",
      "Improved feature adoption by 140% through streamlined onboarding and contextual help",
      "Achieved 4.8/5 app store rating with 500K+ reviews across platforms",
      "Reduced support tickets by 45% through improved UX and self-service tools",
      "Built offline-first capabilities for areas with limited internet connectivity",
      "Established design system used by 50+ internal product teams"
    ],
    techStack: ["React", "React Native", "Node.js", "GraphQL", "PostgreSQL", "Redis"],
    image: "https://images.unsplash.com/photo-1750056393306-ac672d0dbb8c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjcmVhdGl2ZSUyMHdvcmtzcGFjZSUyMG1vY2t1cHxlbnwxfHx8fDE3NzI0NDQ2MDJ8MA&ixlib=rb-4.1.0&q=80&w=1080"
  },
  {
    slug: "nursa-ai-tb",
    title: "Nursa AI TB Detection",
    subtitle: "AI-Powered Tuberculosis Screening",
    category: "AI Healthcare",
    tags: ["AI/ML", "Healthcare", "Diagnostics", "Computer Vision"],
    shortDescription: "Neural network for tuberculosis detection from chest X-rays with 92% accuracy.",
    metrics: [
      { value: "92%", label: "Detection Accuracy" },
      { value: "24 hrs", label: "Time to Diagnosis" },
      { value: "5", label: "Clinical Sites" },
      { value: "8 months", label: "Development to Pilot" }
    ],
    problem: "Tuberculosis remains a leading cause of death in developing nations, but diagnosis is slow and requires specialized lab equipment and trained radiologists. Early detection is critical for successful treatment, but millions of people in rural and underserved communities lack access to timely screening. Traditional diagnostic methods take 2+ weeks and require expensive infrastructure.",
    role: "Product Manager & AI Strategy Lead",
    approach: "Managed the development of an AI-powered TB screening tool that analyzes chest X-rays to flag potential cases for further testing. Collaborated with radiologists to establish ground truth datasets and validation protocols. Worked with data scientists to train convolutional neural networks on diverse patient populations. Coordinated with public health experts to design deployment workflows for resource-constrained settings. Navigated regulatory requirements across multiple jurisdictions. Established partnerships with rural clinics to enable field testing and iterative improvement.",
    outcomes: [
      "Achieved 92% detection accuracy validated across 5 clinical sites and 10,000+ X-rays",
      "Reduced time to preliminary diagnosis from 2+ weeks to under 24 hours",
      "Enabled TB screening in rural clinics without on-site radiologists",
      "Processed 50,000+ screenings in pilot phase, identifying 800+ positive cases",
      "Reduced false negative rate by 40% compared to initial clinical assessment",
      "Secured partnerships with WHO and regional health ministries for scaled deployment"
    ],
    techStack: ["Python", "TensorFlow", "PyTorch", "React", "FastAPI", "Docker"],
    image: "https://images.unsplash.com/photo-1688413709025-5f085266935a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhYnN0cmFjdCUyMHRlY2hub2xvZ3klMjBwYXR0ZXJufGVufDF8fHx8MTc3MjQwNDcxMHww&ixlib=rb-4.1.0&q=80&w=1080"
  }
];
