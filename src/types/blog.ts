export interface BlogPostFrontmatter {
  title: string;
  date: string;
  excerpt: string;
  tags: string[];
  published: boolean;
  featured?: boolean;
  faq?: Array<{ question: string; answer: string }>;
  howTo?: {
    name: string;
    description: string;
    steps: string[];
  };
}

export interface BlogPost {
  slug: string;
  frontmatter: BlogPostFrontmatter;
  readingTime: string;
  content: string;
}
