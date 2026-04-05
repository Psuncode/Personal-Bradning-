Let me take a look at the site first!Got it! Let me check what's built on the other tabs.I can see the full nav from the homepage. Here's a complete breakdown of what you need to build and how:

---

## Your Nav Has 6 Tabs — Home is Done, You Need 5 More

### 1. `/projects` — **Projects Page**
**Purpose:** Showcase all your work in detail.

**What to build:**
- A grid/list of project cards (you already have 3 featured on Home: Inara Health, LDS Church PM, Nursa AI TB)
- Each card: title, tags (tech stack), 3-4 key metrics, short description, "View Details →" link
- Individual project detail pages at `/projects/[slug]` (e.g. `/projects/inara-health`)
- Detail page should have: problem, your role, what you built, results/metrics, screenshots or diagrams

**How to build:**
```
/projects/page.tsx           → grid of all projects
/projects/[slug]/page.tsx    → individual project detail
/data/projects.ts            → centralize all project data here
```

---

### 2. `/blog` (Writing) — **Writing/Thought Leadership Page**
**Purpose:** Show you think deeply about PM, medtech, and healthcare.

**What to build:**
- A list of articles with title, date, reading time, tags (PM, Healthcare, etc.)
- Even 3–5 posts to start is fine — can be repurposed essays, class papers, or LinkedIn posts
- Individual post pages at `/blog/[slug]`

**How to build:**
Use **MDX files** (Markdown + JSX) for easy writing:
```
/content/blog/
  medtech-pmf.mdx
  progesterone-monitoring.mdx
/app/blog/page.tsx           → list all posts
/app/blog/[slug]/page.tsx    → render MDX
```
Install: `npm install next-mdx-remote gray-matter`

---

### 3. `/resume` — **Resume Page**
**Purpose:** An interactive/web version of your resume + download option.

**What to build:**
- Sections: Experience, Education, Skills, Certifications
- A "Download PDF" button at the top
- Optional: timeline-style layout for experience

**How to build:**
```
/app/resume/page.tsx         → hardcode your resume data here
/public/resume.pdf           → drop your PDF here for download
```

---

### 4. `/meet` — **Book a Meeting Page**
**Purpose:** Let people schedule time with you directly.

**How to build (simplest path):**
Embed a **Calendly** widget:
```tsx
// Install: npm install react-calendly
import { InlineWidget } from "react-calendly";

export default function MeetPage() {
  return (
    <div>
      <h1>Book a Meeting</h1>
      <InlineWidget url="https://calendly.com/YOUR_USERNAME" />
    </div>
  );
}
```
Or just iframe embed if you don't want the package.

---

### 5. `/contact` — **Contact Page**
**Purpose:** Simple way for recruiters/collaborators to reach you.

**What to build:**
- A form: Name, Email, Message + Submit button
- Your email (`ps324@byu.edu`) as a fallback
- Social links (LinkedIn, GitHub)

**How to build:**
Use **Formspree** (free, no backend needed):
```tsx
<form action="https://formspree.io/f/YOUR_ID" method="POST">
  <input name="name" placeholder="Your name" />
  <input name="email" type="email" placeholder="Your email" />
  <textarea name="message" placeholder="Message" />
  <button type="submit">Send</button>
</form>
```

---

## Suggested Build Order

| Priority | Tab | Time Estimate |
|---|---|---|
| 1 | `/projects` + detail pages | 2–3 hrs |
| 2 | `/resume` | 1 hr |
| 3 | `/contact` | 30 min |
| 4 | `/meet` | 30 min |
| 5 | `/blog` | 2–3 hrs (content takes longest) |

Want me to write the actual code for any of these pages?