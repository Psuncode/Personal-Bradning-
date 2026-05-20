export interface CoverImage {
  src: string;
  alt: string;
  focalPoint?: "center" | "top" | "bottom";
  layout: "overlay" | "beside";
}

export interface Project {
  id: string;
  title: string;
  description: string;
  longDescription?: string;
  image?: string;
  techStack: string[];
  githubUrl?: string;
  liveUrl?: string;
  slug?: string;
  problem?: string;
  solution?: string;
  results?: string;
  metrics?: string[];
  lessonsLearned?: string;
  coverImage: CoverImage;
}

export interface SocialLink {
  name: string;
  url: string;
  icon: string;
}
