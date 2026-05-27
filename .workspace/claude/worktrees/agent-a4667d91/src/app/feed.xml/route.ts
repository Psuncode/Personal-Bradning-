import { getAllPosts } from "@/lib/blog";
import { siteConfig } from "@/data/site-config";

export const dynamic = "force-static";

export function GET() {
  const posts = getAllPosts();

  const items = posts
    .map(
      (p) => `
    <item>
      <title><![CDATA[${p.frontmatter.title}]]></title>
      <link>${siteConfig.url}/blog/${p.slug}</link>
      <guid isPermaLink="true">${siteConfig.url}/blog/${p.slug}</guid>
      <description><![CDATA[${p.frontmatter.excerpt}]]></description>
      <pubDate>${new Date(p.frontmatter.date).toUTCString()}</pubDate>
    </item>`
    )
    .join("");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title><![CDATA[${siteConfig.name} — Writing]]></title>
    <link>${siteConfig.url}/blog</link>
    <description><![CDATA[Thoughts on software, building things, and lessons learned along the way]]></description>
    <language>en-US</language>
    <atom:link href="${siteConfig.url}/feed.xml" rel="self" type="application/rss+xml"/>
    ${items}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
