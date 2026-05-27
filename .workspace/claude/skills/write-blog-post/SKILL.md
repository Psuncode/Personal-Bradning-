---
name: write-blog-post
description: Draft an engaging blog post end-to-end using a short interview, an internal Pip Decks framework recommendation, a mid-flow handoff to /storyteller-writing-assistant to confirm purpose and lock the framework, then write a polished MDX draft to content/blog/<slug>/index.mdx with editorial shortcodes placed at narrative pivots. Triggers — "/write-blog-post", "write a blog post", "draft a post", "new blog post", "blog post about", "help me blog".
---

# Write Blog Post

You are drafting a polished blog post for Philip Sun's personal site. The post lives in this repo at `content/blog/<slug>/index.mdx`. The repo already has a v2 editorial system: shortcodes (`<Figure>`, `<FullBleed>`, `<Gallery>`, `<PullQuote>`, `<TwoColumn>`, `<Aside>`), per-post folder layout, cover convention, drop-cap-friendly opening paragraphs.

Read `content/blog/AUTHORING.md` for conventions before you write.

## Hard rules

1. **The storyteller handoff is non-negotiable.** You MUST invoke the `storyteller-writing-assistant` skill via the Skill tool mid-flow (step 3). If you cannot invoke it, stop and surface the failure — do not proceed to drafting on your own.
2. **Every run ends with a file on disk.** Never return a draft only inline; always Write it to `content/blog/<slug>/index.mdx`.
3. **Frontmatter always ships with `published: false`.** The user flips it to `true` when ready.
4. **Use the per-post folder convention.** Create the folder if missing.
5. **One question at a time during the interview.** Like the brainstorming skill.

## Flow

### 1. Interview (5–7 questions, one at a time)

Ask in this order, one per turn:

1. What's the topic / working title?
2. Who is the audience? (peers, recruiters, photography clients, general builders)
3. What's the single insight or "so what"?
4. What experience or evidence grounds it?
5. What outcome do you want for the reader? (a-ha, a new mental model, a decision, a feeling)
6. Approximate length? (short ~500w, medium ~900w, long ~1500w)
7. Any photos you plan to drop into the post folder?

Capture each answer compactly. After question 7, summarize in two sentences.

### 2. Internal framework recommendation

From the answers, pick ONE of these Pip Decks Storyteller Tactics (use the cheat sheet below). Prepare a one-sentence justification — you'll pass it to storyteller in step 3 as your proposed framework.

Cheat sheet:

| Tactic | Best for | Length sweet spot |
|---|---|---|
| **Mountain** | A struggle → climb → resolution narrative. Lessons-learned posts. | 900–1500 words |
| **Sparklines** | Contrast: expectation vs reality, before vs after, what we thought vs what we found. | 500–900 words |
| **Cinderella** | Transformation arc — humble start, turning point, new state. | ~900 words |
| **Quest** | Decision-driven journey — a series of choices and what each cost. | ~1200 words |
| **Petal Structure** | One insight illuminated from multiple angles. Each section is a petal. | ~700 words |

Recommendation heuristic:
- Primary emotion = struggle/grit → Mountain.
- Primary tension = surprise/contrast → Sparklines.
- Primary arc = transformation of self → Cinderella.
- Primary spine = decisions made under uncertainty → Quest.
- Single insight, multiple perspectives → Petal Structure.

### 3. Storyteller handoff (MANDATORY)

Invoke `storyteller-writing-assistant` via the Skill tool with this exact handoff prompt template:

> I'm drafting a blog post for Philip Sun's personal site. Here's the context from a short interview:
> - Topic: <topic>
> - Audience: <audience>
> - Insight ("so what"): <insight>
> - Grounding experience: <experience>
> - Reader outcome: <outcome>
> - Target length: <length>
> - Photos planned: <photos>
>
> My recommended Pip Decks framework is **<framework name>** because <one-sentence justification>.
>
> Please:
> 1. Confirm the post's purpose statement with the user (one sentence — what is this post for).
> 2. Confirm or override the framework choice.
> 3. Produce a section-by-section outline I can draft against (3–6 sections, with one-line description each).
>
> Return the locked purpose, chosen framework, and outline.

Wait for storyteller's return. The locked outline is your contract for step 4.

### 4. Draft using the confirmed framework

- Suggest a slug: kebab-case of the working title, max 5 words.
- Create `content/blog/<slug>/` if it doesn't exist.
- Draft the full MDX:
  - Open with a drop-cap-friendly first sentence (single strong sentence, no ramp-up like "In this post we'll").
  - Follow the locked outline section by section.
  - Place shortcodes at narrative pivots:
    - `<PullQuote>` at the emotional/insight peak. One per post, max.
    - `<Figure src="./<descriptive-name>.jpg" caption="..." alt="..." />` placeholder wherever the outline suggests imagery. The user will drop in the actual image later.
    - `<TwoColumn>` for contrast moments (especially natural in Sparklines).
    - `<Aside>` for tangents the user mentioned but that would derail the spine.
- Pre-filled frontmatter:

```yaml
---
title: "<working title>"
date: "<today's date YYYY-MM-DD>"
excerpt: "<one sentence pulled from the body, written for the index page>"
tags: ["<tag1>", "<tag2>"]  # suggest 2–3 from the existing taxonomy across content/blog/
published: false
---
```

To find existing tags, read the frontmatter of existing posts under `content/blog/*/index.mdx`.

### 5. Write to disk

Use the Write tool to create `content/blog/<slug>/index.mdx` with the full draft.

If the post calls for a cover or any inline images, ALSO write `content/blog/<slug>/COVER_NOTES.md` describing what photo would fit the post's emotional tone — subject, mood, framing, aspect ratio. This guides the user when they upload `cover.jpg` later.

### 6. Hand back

Print:

- The path(s) created.
- 1–2 specific suggestions for light edits the user might want.

Do not commit to git. The user reviews and commits when ready.

## Out of scope

- Selecting / placing real images (user does this after the draft exists).
- Final copyedit pass.
- Setting `published: true` and committing.
