# Authoring guide — blog v2

## File layout

Every post is a folder:

```
content/blog/<slug>/
  index.mdx
  cover.jpg            (optional — auto-detected hero)
  any-image.png        (referenced as ./any-image.png in MDX)
```

Slug is the folder name (kebab-case, max ~5 words).

## Frontmatter

```yaml
---
title: "Your title"
date: "2026-05-15"           # publish date
excerpt: "One-sentence summary for the index page."
tags: ["product", "writing"] # 2–4 tags
published: true              # false to keep as draft
featured: false              # optional, surfaces on the homepage
series: "Healthcare PM"      # optional — groups posts in a series
seriesOrder: 2               # optional — position within the series
faq: []                      # optional, generates FAQ JSON-LD
howTo: ~                     # optional, generates HowTo JSON-LD
coverAlt: "Wasatch sunset — accessible description of the cover image"  # optional
---
```

If you have a `cover.jpg`, set `coverAlt` to provide alt text for screen readers. If omitted, the cover falls back to a generic description derived from the title.

## Shortcodes available in every MDX file

```mdx
<Figure src="./diagram.png" caption="Optional caption." alt="Diagram alt." />

<FullBleed src="./hero.jpg" alt="Wasatch sunset" caption="Optional caption." />

<Gallery columns={3} images={[
  { src: "./a.jpg", alt: "A" },
  { src: "./b.jpg", alt: "B" },
  { src: "./c.jpg", alt: "C" }
]} />

<PullQuote attribution="Annie Dillard">
How we spend our days is how we spend our lives.
</PullQuote>

<TwoColumn>
  <div>Left column text.</div>
  <Figure src="./right.jpg" caption="Right column image." />
</TwoColumn>

<Aside>
A margin note. Floats right at md+, inline below at mobile.
</Aside>
```

Use relative paths (`./...`) for any image inside the post folder.

## Covers (heroes)

If a file named `cover.jpg`, `cover.png`, or `cover.webp` exists in the post folder, it auto-renders as a full-bleed editorial cover at the top of the post. No frontmatter required.

## Build pipeline

`npm run build` automatically:

1. Mirrors every image from `content/blog/<slug>/` to `public/_blog-assets/<slug>/`.
2. Generates blur-up placeholders (LQIP) into `public/_blog-assets/<slug>/__blur.json`.

Don't commit `public/_blog-assets/` — it's gitignored and regenerated on every build.

## Writing with `/write-blog-post`

The project ships a skill that drafts a polished post from a 5-question interview, hands off to `/storyteller-writing-assistant` to lock the narrative framework, then writes the draft to `content/blog/<slug>/index.mdx` with frontmatter pre-filled and `published: false`. Use it as your starting point.

## Tag URLs

Every tag automatically gets a static page at `/blog/tag/<tag>`. Click any tag pill on a post to see the page for it.

## OG images

Every post has a dynamic 1200×630 OG card at `/blog/<slug>/og`. The metadata is wired automatically — no manual work.
