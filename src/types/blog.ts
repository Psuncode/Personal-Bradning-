export interface BlogPostFrontmatter {
  title: string;
  date: string;
  /** Optional explicit modification date (ISO string). Falls back to `date`. */
  dateModified?: string;
  excerpt: string;
  tags: string[];
  published: boolean;
  featured?: boolean;
  series?: string;
  seriesOrder?: number;
  faq?: Array<{ question: string; answer: string }>;
  howTo?: {
    name: string;
    description: string;
    steps: string[];
  };
}

export interface BlogCover {
  src: string;
  blurDataURL?: string;
  alt?: string;
}

export interface BlogPost {
  slug: string;
  frontmatter: BlogPostFrontmatter;
  readingTime: string;
  content: string;
  cover?: BlogCover;
}
