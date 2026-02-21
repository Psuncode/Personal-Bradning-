"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Calendar, Clock } from "lucide-react";
import { Container } from "@/components/layout/container";
import { SectionHeading } from "@/components/section-heading";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { BlogPost } from "@/types/blog";

interface BlogListProps {
  posts: BlogPost[];
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export function BlogList({ posts }: BlogListProps) {
  return (
    <section className="bg-byu-gray py-24">
      <Container>
        <SectionHeading
          title="Writing"
          subtitle="Thoughts on software, building things, and lessons learned along the way"
        />

        {posts.length === 0 ? (
          <p className="text-center text-byu-dark-gray/60">
            No posts yet. Check back soon.
          </p>
        ) : (
          <div className="mx-auto max-w-2xl space-y-6">
            {posts.map((post, index) => (
              <motion.div
                key={post.slug}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.4, delay: index * 0.08 }}
              >
                <Card className="border-byu-sky/30 transition-all duration-300 hover:border-byu-light-blue hover:shadow-md hover:shadow-byu-light-blue/10">
                  <CardHeader>
                    <CardTitle className="text-byu-navy hover:text-byu-blue transition-colors">
                      <Link href={`/blog/${post.slug}`}>
                        {post.frontmatter.title}
                      </Link>
                    </CardTitle>
                    <div className="flex flex-wrap items-center gap-3 text-sm text-byu-dark-gray/60">
                      <span className="flex items-center gap-1">
                        <Calendar className="size-3.5" />
                        {formatDate(post.frontmatter.date)}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="size-3.5" />
                        {post.readingTime}
                      </span>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="mb-4 text-byu-dark-gray/80 leading-relaxed">
                      {post.frontmatter.excerpt}
                    </CardDescription>
                    <div className="flex flex-wrap gap-2">
                      {post.frontmatter.tags.map((tag) => (
                        <Badge
                          key={tag}
                          variant="secondary"
                          className="bg-byu-sky/30 text-byu-navy"
                        >
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </Container>
    </section>
  );
}
