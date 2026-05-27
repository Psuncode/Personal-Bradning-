export interface Project {
  id: string;
  title: string;
  description: string;
  longDescription?: string;
  image?: string;
  techStack: string[];
  githubUrl?: string;
  liveUrl?: string;
  featured?: boolean;
  slug?: string;
  problem?: string;
  solution?: string;
  results?: string;
  metrics?: string[];
  lessonsLearned?: string;
}

export interface SocialLink {
  name: string;
  url: string;
  icon: string;
}
