# Philip Sun — Personal Website & Professional Portfolio

> A high-conviction personal site showcasing projects, ventures, and strategic thinking. Built to convert visitors into recruiter calls, investor conversations, startup partnerships, and acquisition leads.

**Live:** [philip-sun-website.vercel.app](https://philip-sun-website.vercel.app)  
**Version:** v0.1.0  
**Status:** Active Development (V1 complete, V1.5 roadmap in progress)

---

## Table of Contents

- [Project Overview](#project-overview)
- [Features](#features)
- [Product Vision & Strategy](#product-vision--strategy)
- [Architecture](#architecture)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
- [Project Structure](#project-structure)
- [Deployment](#deployment)
- [Contributing & Extending](#contributing--extending)
- [Key Implementation Notes](#key-implementation-notes)
- [Future Roadmap](#future-roadmap)

---

## Project Overview

**PhilipSun.com** is a purpose-built personal website designed to build credibility as a **Product Manager + Founder + Investor** and enable frictionless professional meetings.

### Core Purpose
- **Showcase**: Highlight successful projects, ventures, and strategic thinking
- **Credibility**: Demonstrate expertise across Product, Engineering, and Business
- **Conversion**: Transform website visitors into:
  - Recruiter calls (Finance, Strategy, Product roles)
  - Investor conversations & partnerships
  - Startup collaboration opportunities
  - Acquisition/talent acquisition leads
- **Accessibility**: Enable friction-free meeting booking with integrated calendar system

### Design Philosophy
**Clarity + Strategy + Precision**

Every element serves a purpose. The site is fast, mobile-first, and optimized for converting high-intent visitors into meetings.

---

## Features

### V1 Features (Complete)

#### 🏠 **Homepage**
- **Hero Section**: Strategic one-liner and value proposition
- **Current Focus**: Real-time insight into what's being worked on
- **Featured Projects**: Showcase of 3-5 best projects with problem/solution overview
- **Social Proof**: Metrics, testimonials, or results
- **CTA**: Prominent link to booking system
- **Technical Details**: Built with Framer Motion animations, responsive design

#### 📊 **Projects Page**
- **Full Projects Grid**: Complete project portfolio with filtering/search
- **Project Cards**: Each includes:
  - Problem statement
  - Strategic approach
  - Execution summary
  - Key results/metrics
  - Lessons learned
  - Tech stack used
- **Responsive Layout**: Mobile-first grid that adapts to tablet/desktop

#### 📅 **Meeting Booking System** (Cal.com Integration)
- **Embedded Calendar**: Cal.com CalEmbed component for real-time availability
- **Meeting Types**:
  - **Career/Recruiting**: For job opportunities and recruiter conversations
  - **Startup**: For venture discussions and partnerships
  - **Healthcare/IVF**: Domain-specific expertise discussions
  - **Investing**: Investment opportunities and portfolio discussions
  - **General**: Other inquiries
- **Auto-Timezone Detection**: Calendar adjusts to visitor's timezone
- **Frictionless UX**: No external redirects; book directly on-site
- **Email Confirmation**: Automated notifications

#### 💬 **Contact Page**
- **Direct Contact Methods**: Email, LinkedIn, GitHub links
- **Contact Form**: For general inquiries
- **Social Links**: Professional profiles

#### 🧭 **Navigation & Layout**
- **Responsive Navbar**: Mobile-friendly menu with sheet navigation
- **Footer**: Links, social profiles, copyright
- **Loading States**: Smooth loading animations
- **404 Handling**: Graceful error pages

#### ♿ **Accessibility & SEO**
- **Semantic HTML**: Proper heading hierarchy and ARIA attributes
- **Mobile-First**: Touch-friendly, responsive design
- **Performance**: < 1.5s load time target
- **SEO Optimized**:
  - Meta tags, Open Graph, Twitter cards
  - Sitemap and robots.txt
  - Structured data (schema.org)

---

## Product Vision & Strategy

### Target Users

**Primary:**
- **Recruiters**: Finance, Strategy, Product roles
- **Founders & Investors**: Startup partnerships, due diligence
- **Healthcare Operators**: Domain expertise discussions
- **Acquisition Decision-Makers**: Talent/startup acquisition

**Secondary:**
- Students and early-career professionals
- Industry collaborators
- Potential team members

### User Journey

```
Visitor lands on homepage
    ↓
Quickly understands value proposition (hero + current focus)
    ↓
Explores featured projects (problem → solution → results)
    ↓
Interested? → Click to projects page for deeper dive
    ↓
Ready to connect? → Click booking CTA
    ↓
Select meeting type, choose time, book
    ↓
Calendar confirmation + reminder emails
    ↓
Meeting happens, relationship established
```

### Success Metrics

**Primary (V1):**
- **Meetings Booked/Week**: Target 3-5 qualified meetings
- **Visitor → Booking Conversion**: Target 1-2%
- **Booking Type Distribution**: Track by category (recruiting, startup, investing, etc.)

**Secondary (V1):**
- **Average Time on Site**: > 2 minutes
- **Recruiter Inbound**: Track inbound recruiter messages
- **Project Click-Through Rate**: % of visitors who explore full projects page

**Tertiary:**
- **Page Load Time**: < 1.5s (Lighthouse Core Web Vitals)
- **Mobile Usage Rate**: Optimization target

---

## Architecture

### System Overview

```
┌─────────────────────────────────────────────────────────────┐
│                        Frontend (Next.js)                    │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Pages: Homepage, Projects, Meet, Contact           │   │
│  │  Components: Hero, ProjectCard, CalEmbed, Navbar    │   │
│  │  Styling: Tailwind CSS 4 + Shadcn/ui               │   │
│  └──────────────────────────────────────────────────────┘   │
│              ↓                              ↓                │
│        ┌──────────┐                   ┌──────────────┐       │
│        │ Vercel   │                   │ Cal.com API  │       │
│        │ CDN      │                   │ (CalEmbed)   │       │
│        └──────────┘                   └──────────────┘       │
└─────────────────────────────────────────────────────────────┘
```

### Component Architecture

```
src/
├── app/
│   ├── page.tsx              # Homepage
│   ├── projects/page.tsx      # Projects listing
│   ├── meet/page.tsx          # Booking page (Cal.com)
│   ├── contact/page.tsx       # Contact page
│   ├── layout.tsx             # Root layout
│   ├── sitemap.ts             # SEO sitemap
│   └── robots.ts              # SEO robots.txt
│
├── components/
│   ├── ui/                    # Shadcn/ui components
│   │   ├── button.tsx         # Reusable button
│   │   ├── card.tsx           # Card component
│   │   ├── badge.tsx          # Badge/pill component
│   │   ├── sheet.tsx          # Mobile sheet/drawer
│   │   └── ...
│   ├── sections/              # Page sections
│   │   ├── hero.tsx           # Hero section with CTA
│   │   ├── projects-grid.tsx  # Projects grid layout
│   │   └── contact-section.tsx # Contact info
│   ├── layout/                # Layout components
│   │   ├── navbar.tsx         # Top navigation
│   │   ├── footer.tsx         # Footer
│   │   └── container.tsx      # Page container/padding
│   ├── cal-embed.tsx          # Cal.com calendar embed wrapper
│   ├── project-card.tsx       # Individual project card
│   ├── motion-wrapper.tsx     # Framer Motion wrapper
│   └── social-links.tsx       # Social media links
│
├── data/
│   ├── projects.ts            # Projects data (title, description, link, etc.)
│   └── site-config.ts         # Site configuration (title, description, links)
│
├── lib/
│   └── utils.ts               # Utility functions (cn() for classname merging)
│
├── types/
│   └── index.ts               # TypeScript type definitions
│
└── globals.css                # Global styles & Tailwind directives
```

### Data Model

#### Projects (Static Data Structure)
```typescript
interface Project {
  id: string;
  title: string;
  description: string;
  problem: string;
  solution: string;
  results: string;
  lessonsLearned: string[];
  tags: string[];
  metrics?: {
    label: string;
    value: string;
  }[];
  links?: {
    label: string;
    url: string;
  }[];
  image?: string;
  featured: boolean;
}
```

#### Cal.com Integration
Cal.com handles all meeting logic through **CalEmbed** component:
- **Calendar Sync**: Real-time availability from calendar
- **Meeting Types**: Configured in Cal.com admin (5 types)
- **Timezone Handling**: Automatic visitor timezone detection
- **Confirmation Emails**: Sent automatically by Cal.com
- **Calendar Events**: Synced to Google Calendar, Outlook, etc.

**No backend needed** — Cal.com manages scheduling, notifications, and calendar sync.

---

## Tech Stack

### Frontend Framework
- **Next.js 16** (App Router, Server Components)
  - Rationale: Industry-standard, fast static generation, Vercel-native
- **React 19** (Latest with improvements)
  - Rationale: Latest stable, better performance, improved dev experience
- **TypeScript 5** (Full type safety)
  - Rationale: Catch bugs at compile-time, better IDE support

### Styling & UI
- **Tailwind CSS 4** (Utility-first CSS)
  - Rationale: Fast to build, consistent design system, excellent DX
- **Shadcn/ui** (Headless component library)
  - Rationale: Accessible, composable components with Radix UI under the hood
- **Radix UI 1.4** (Headless UI primitives)
  - Rationale: Unstyled, accessible components (used by Shadcn/ui)
- **Framer Motion 12** (Animation library)
  - Rationale: Smooth, performant animations; great for micro-interactions

### Icons & Utilities
- **Lucide React 0.574** (Icon library)
  - Rationale: Modern, tree-shakeable, consistent with design system
- **Class Variance Authority** (Component variant system)
  - Rationale: Scalable component styling patterns
- **Clsx** (Conditional className utilities)
  - Rationale: Safe classname management
- **Tailwind Merge** (Smart classname merging)
  - Rationale: Prevent Tailwind class conflicts

### Calendar & Booking
- **Cal.com CalEmbed React** (Embedded booking widget)
  - Rationale: No backend needed, handles scheduling/notifications, white-labeled

### Linting & Code Quality
- **ESLint 9** (Code quality)
- **ESLint Config (Next.js)** (Next.js-specific rules)

### Development Tools
- **Node.js 20+** (Runtime)
- **npm 10+** (Package manager)

### Deployment
- **Vercel** (Hosting & CI/CD)
  - Rationale: Native Next.js support, zero-config deployment, CDN included

---

## Getting Started

### Prerequisites
- Node.js 20 or higher
- npm 10 or higher
- Cal.com account (for booking system) — create free at [cal.com](https://cal.com)
- Vercel account (for deployment) — create at [vercel.com](https://vercel.com)

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/your-username/philip-sun-website.git
   cd philip-sun-website
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Environment setup:**
   Create a `.env.local` file in the project root:
   ```env
   # Cal.com Configuration
   NEXT_PUBLIC_CALCOM_USERNAME=your-cal-username
   
   # Optional: Email notifications
   NEXT_PUBLIC_CONTACT_EMAIL=your-email@example.com
   
   # Optional: Analytics
   NEXT_PUBLIC_GA_ID=your-google-analytics-id
   ```

4. **Update site configuration:**
   Edit `src/data/site-config.ts` with your personal details:
   ```typescript
   export const siteConfig = {
     name: "Your Name",
     title: "Your Name | Your Role",
     description: "Your bio...",
     url: "https://your-domain.com",
     ogImage: "/og-image.png",
     links: {
       github: "https://github.com/your-username",
       linkedin: "https://linkedin.com/in/your-username",
       email: "your-email@example.com",
     },
     calLink: "your-cal-username/30min", // From Cal.com
   };
   ```

5. **Update projects data:**
   Edit `src/data/projects.ts` to add your projects:
   ```typescript
   export const projects: Project[] = [
     {
       id: "project-1",
       title: "Project Title",
       description: "Short description",
       problem: "The problem you solved...",
       solution: "How you approached it...",
       results: "Key outcomes and metrics...",
       lessonsLearned: ["Lesson 1", "Lesson 2"],
       tags: ["tag1", "tag2"],
       featured: true,
     },
     // ... more projects
   ];
   ```

### Run Locally

**Development server:**
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

The app auto-refreshes as you edit files. Check the terminal for TypeScript errors.

**Build for production:**
```bash
npm run build
npm start
```

**Linting:**
```bash
npm run lint
```

---

## Project Structure

```
philip-sun-website/
├── src/
│   ├── app/                    # Next.js App Router (pages)
│   ├── components/             # Reusable React components
│   ├── data/                   # Static data (projects, config)
│   ├── lib/                    # Utility functions
│   ├── types/                  # TypeScript type definitions
│   └── globals.css             # Global styles
├── public/                     # Static assets (images, favicon)
├── .github/                    # GitHub config (workflows, etc.)
├── .next/                      # Build output (ignored)
├── node_modules/               # Dependencies (ignored)
├── package.json                # Dependencies & scripts
├── tsconfig.json               # TypeScript config
├── next.config.ts              # Next.js config
├── tailwind.config.ts          # Tailwind CSS config
├── postcss.config.js           # PostCSS config
├── eslint.config.mjs           # ESLint config
├── components.json             # Shadcn/ui config
└── README.md                   # This file
```

### Key Directories

**`src/app/`** — Next.js pages (file-based routing)
- `page.tsx` = `/`
- `projects/page.tsx` = `/projects`
- `meet/page.tsx` = `/meet`
- `contact/page.tsx` = `/contact`

**`src/components/`** — Reusable React components
- `ui/` = Shadcn/ui components (copy-paste, don't modify)
- `sections/` = Page sections (hero, projects grid, etc.)
- `layout/` = Layout components (navbar, footer, container)

**`src/data/`** — Static data and configuration
- `projects.ts` = Project list (edit this to add/remove projects)
- `site-config.ts` = Site metadata (edit with your info)

**`public/`** — Static files (images, favicon, og-image, etc.)

---

## Deployment

### Quick Deploy to Vercel

The easiest way to deploy:

1. **Push to GitHub:**
   ```bash
   git add .
   git commit -m "Initial commit"
   git push origin main
   ```

2. **Connect to Vercel:**
   - Go to [vercel.com/new](https://vercel.com/new)
   - Import your GitHub repository
   - Vercel auto-detects Next.js (no config needed)
   - Click "Deploy"

3. **Add environment variables:**
   - In Vercel dashboard, go to "Settings" → "Environment Variables"
   - Add `NEXT_PUBLIC_CALCOM_USERNAME` with your Cal.com username
   - Add other env vars from `.env.local`
   - Redeploy

4. **Custom domain:**
   - Go to "Settings" → "Domains"
   - Add your custom domain (e.g., philip-sun.com)
   - Update DNS records as instructed

### Environment Variables (Production)

Required variables for Vercel deployment:

```env
# Cal.com — REQUIRED
NEXT_PUBLIC_CALCOM_USERNAME=your-cal-username

# Site Configuration (optional, can use defaults from site-config.ts)
NEXT_PUBLIC_CONTACT_EMAIL=your-email@example.com

# Analytics (optional)
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX

# Feature Flags (optional)
NEXT_PUBLIC_DISABLE_ANALYTICS=false
NEXT_PUBLIC_ENABLE_BLOG=false
```

### Build & Deployment Process

```bash
# Local build test
npm run build

# If build succeeds, push to main branch
git push origin main

# Vercel automatically deploys on push to main
# Check deployment status in Vercel dashboard
```

### Monitoring & Analytics

- **Vercel Analytics**: Built-in (no setup needed)
- **Google Analytics**: Add `NEXT_PUBLIC_GA_ID` env var (optional)
- **Error Tracking**: Vercel provides error logs in dashboard
- **Performance**: Use Lighthouse in Chrome DevTools or Vercel's Web Vitals

---

## Contributing & Extending

### Adding a New Project

1. **Add to `src/data/projects.ts`:**
   ```typescript
   {
     id: "my-new-project",
     title: "Project Title",
     description: "One-line summary",
     problem: "The problem you solved...",
     solution: "Your approach...",
     results: "Outcome & metrics...",
     lessonsLearned: [
       "Key insight #1",
       "Key insight #2",
     ],
     tags: ["tag1", "tag2"],
     metrics: [
       { label: "Growth", value: "300%" },
       { label: "Users", value: "50K+" },
     ],
     links: [
       { label: "Live Site", url: "https://example.com" },
       { label: "Case Study", url: "/projects#project-id" },
     ],
     featured: true, // Show on homepage
   }
   ```

2. **Projects are rendered automatically** from this data (no code changes needed).

### Adding a New Page

1. **Create a new route:**
   ```bash
   mkdir src/app/new-page
   touch src/app/new-page/page.tsx
   ```

2. **Create the page component:**
   ```typescript
   import { Container } from "@/components/layout/container";
   
   export default function NewPage() {
     return (
       <Container>
         <h1>New Page</h1>
         {/* Your content here */}
       </Container>
     );
   }
   ```

3. **Update navigation** in `src/components/layout/navbar.tsx` if needed.

### Component Guidelines

**Shadcn/ui Components:**
- Copy from [ui.shadcn.com](https://ui.shadcn.com)
- Install: `npx shadcn-ui@latest add button` (replaces manual copy)
- Don't modify files in `src/components/ui/`
- Customize via props and Tailwind classes

**Custom Components:**
- Keep components small and focused (< 150 lines ideally)
- Use TypeScript for props: `interface ComponentProps { ... }`
- Use Framer Motion for animations
- Apply Tailwind classes for styling
- Example:
  ```typescript
  import { motion } from "framer-motion";
  
  interface HeroProps {
    title: string;
    subtitle: string;
  }
  
  export function Hero({ title, subtitle }: HeroProps) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="space-y-4"
      >
        <h1 className="text-4xl font-bold">{title}</h1>
        <p className="text-lg text-gray-600">{subtitle}</p>
      </motion.div>
    );
  }
  ```

### Styling

**Use Tailwind CSS exclusively** for styling:
- Utility-first approach: `className="flex items-center justify-between"`
- Dark mode: Classes prefixed with `dark:` (built-in)
- Custom colors: Defined in `tailwind.config.ts`
- Never use inline styles or CSS-in-JS

**Responsive Design:**
```typescript
// Mobile-first (default is mobile)
className="flex flex-col gap-4 md:gap-8 lg:gap-12"
//        mobile   tablet       desktop
```

### Database & Backend (Future)

For V1.5 features (blog, newsletter, etc.), consider:
- **Vercel KV** (Redis-like) for caching
- **Supabase** (PostgreSQL) for persistent data
- **Prisma ORM** for type-safe database access

For now, projects and config are static (edit `.ts` files in `src/data/`).

### Testing Approach

**Current (V1):**
- Manual testing in dev server (`npm run dev`)
- Browser DevTools for debugging
- Lighthouse for performance checks

**Future (V1.5):**
- Unit tests with Jest/Vitest
- Component tests with React Testing Library
- E2E tests with Playwright
- CI/CD in GitHub Actions

### Code Style & Formatting

- **ESLint**: Configured for Next.js + TypeScript
- **Run locally**: `npm run lint`
- **Auto-fix**: `npm run lint -- --fix`
- **Formatting**: Prettier recommended (install with VS Code extension)
- **Git Hooks**: Pre-commit linting (optional, set up with Husky)

---

## Key Implementation Notes

### Design Philosophy

**Clarity + Strategy + Precision**

Every pixel, every interaction, every word should serve a purpose:

1. **Clarity**: Remove confusion. Users should instantly understand value and next step.
   - Clear hierarchy (H1 > H2 > H3)
   - Scannable layouts (projects grid, feature list)
   - Obvious CTAs ("Book a Meeting" not "Submit")

2. **Strategy**: Showcase expertise across domains.
   - Featured projects highlight different skill areas
   - Metrics demonstrate impact
   - Meeting types cater to different buyer personas

3. **Precision**: Optimize for conversion.
   - Hero section immediately establishes credibility
   - CTAs are always visible and compelling
   - Mobile-optimized for all device sizes

### Performance Targets

- **Page Load Time**: < 1.5s (Lighthouse metric)
- **First Contentful Paint**: < 1.0s
- **Cumulative Layout Shift**: < 0.1
- **Time to Interactive**: < 2.5s

**Optimization Strategies:**
- Next.js static generation (pages are pre-built)
- Image optimization with `next/image`
- Code splitting (automatic per-route)
- CSS tree-shaking with Tailwind
- Minification (Vercel handles automatically)

### Mobile-First Approach

- Default styles are mobile
- Tablet/desktop breakpoints add enhancements
- Touch-friendly targets (min 44px × 44px)
- Responsive images and grids
- Sheet navigation on mobile (Shadcn/ui Sheet)

**Responsive Breakpoints:**
```typescript
sm:  640px   // Small phones
md:  768px   // Tablets
lg:  1024px  // Desktops
xl:  1280px  // Large screens
2xl: 1536px  // Ultra-wide
```

### Accessibility (a11y)

- **Semantic HTML**: `<button>`, `<nav>`, `<header>`, `<main>`
- **ARIA Labels**: All interactive elements labeled
- **Keyboard Navigation**: Tab through all elements
- **Color Contrast**: WCAG AA compliant (4.5:1 minimum)
- **Alt Text**: All images have descriptive alt text
- **Focus Indicators**: Clear focus styles for keyboard users

Test with:
- Chrome DevTools → Lighthouse → Accessibility
- Screen reader (NVDA on Windows, VoiceOver on Mac)
- Keyboard-only navigation (Tab, Enter, Escape)

### Booking System (Cal.com Integration)

**How It Works:**

1. User clicks "Book a Meeting" button
2. `<CalEmbed>` component loads Cal.com calendar widget
3. User selects meeting type (Career, Startup, etc.)
4. Calendar shows available times (synced from your calendar)
5. User picks time slot, enters details, confirms
6. Cal.com sends confirmation email to both parties
7. Event created in your calendar (Google, Outlook, etc.)
8. Reminder emails sent before meeting

**Cal.com Component:**
```typescript
import { Cal, getCalApi } from "@calcom/embed-react";
import { useEffect } from "react";

export function CalEmbed() {
  useEffect(() => {
    (async function () {
      const cal = await getCalApi();
      cal("ui", {
        styles: { branding: { brandColor: "#000" } },
        hideEventTypeDetails: false,
      });
    })();
  }, []);

  return (
    <Cal
      calLink={process.env.NEXT_PUBLIC_CALCOM_USERNAME}
      style={{ width: "100%", height: "100%", overflow: "clip" }}
      config={{ layout: "month_view" }}
    />
  );
}
```

**Meeting Types (Configured in Cal.com Admin):**
- 30min Career/Recruiting: Default booking
- 30min Startup Discussion: For venture talks
- 30min Healthcare/IVF: Domain expertise
- 60min Investor Meeting: Investment discussions
- 15min Quick Chat: General inquiries

**No Backend Required:**
- Cal.com handles all scheduling logic
- Automatic email confirmations and reminders
- Real-time calendar sync (Google, Outlook, etc.)
- No database setup needed

### SEO Implementation

**Metadata:**
- Title, description in `site-config.ts` and page metadata
- Open Graph tags for social sharing
- Twitter card tags
- Sitemap at `/sitemap.xml` (auto-generated)
- Robots.txt at `/robots.txt`

**Structured Data:**
```typescript
// Example in layout.tsx
<script
  type="application/ld+json"
  dangerouslySetInnerHTML={{
    __html: JSON.stringify({
      "@context": "https://schema.org",
      "@type": "Person",
      name: "Philip Sun",
      url: "https://philip-sun.com",
      sameAs: ["https://linkedin.com/in/philipsun"],
    }),
  }}
/>
```

**Best Practices:**
- Keep titles < 60 characters
- Descriptions < 160 characters
- Use header hierarchy correctly (H1 once, then H2, H3)
- Add alt text to all images
- Link internally to other pages
- Use descriptive anchor text

### Error Handling & Edge Cases

- **404 Page**: Custom error page in `src/app/not-found.tsx`
- **Loading States**: Fallback UI while content loads
- **Cal.com Errors**: Graceful fallback if embed fails
- **Mobile Responsiveness**: All pages tested on mobile

---

## API & Integration Reference

### Cal.com Integration

**Setup:**

1. Create account at [cal.com](https://cal.com)
2. Connect your calendar (Google, Outlook, Apple, etc.)
3. Create meeting event types (Career, Startup, etc.)
4. Copy your Cal.com username
5. Add to environment: `NEXT_PUBLIC_CALCOM_USERNAME=your-username`

**Integration Points:**

- `src/components/cal-embed.tsx` — Main embed component
- `src/app/meet/page.tsx` — Booking page that renders embed
- `src/data/site-config.ts` — Cal.com username reference

**Customization:**

Change embed styling/behavior in `cal-embed.tsx`:
```typescript
<Cal
  calLink={process.env.NEXT_PUBLIC_CALCOM_USERNAME}
  style={{ width: "100%", height: "100%" }}
  config={{
    layout: "month_view", // or "week_view", "day_view"
    theme: "light", // or "dark"
  }}
/>
```

### Email Notifications

**Currently Handled By Cal.com:**
- Confirmation email when booking
- Reminder emails (1 day before, 15 min before)
- Meeting notes and link shared

**Future (V1.5):**
- Custom email templates
- Integration with SendGrid or Resend
- Newsletter signup handling

### Analytics Integration (Optional)

To add Google Analytics:

1. Create GA4 property at [analytics.google.com](https://analytics.google.com)
2. Add `NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX` to `.env.local` and Vercel
3. Uncomment GA code in `src/app/layout.tsx` (if already added)

**Vercel Analytics** (Built-in):
- Automatically enabled, no setup needed
- View in Vercel dashboard → Analytics

---

## Future Roadmap

### V1.5 (Next Quarter)
**Goal: Deeper engagement and content authority**

- **Blog/Insights Page**: Thought writing on PM, Startups, Investing
  - Using MDX for markdown + interactive components
  - RSS feed for newsletter
- **Newsletter Signup**: Email capture for future announcements
  - Integration with Substack or Resend
- **Case Study Archive**: Deeper project documentation
  - Video demos or screenshots
  - Metrics and learnings
- **Social Proof**: Testimonials, social links, media mentions
- **Analytics Dashboard**: Track key metrics (bookings, conversions)
  - Vercel Analytics enhanced view

### V2 (6+ Months)
**Goal: Full content platform and CRM integration**

- **AI Meeting Prep**: Auto-summarize visitor's LinkedIn/company before meeting
- **CRM Integration**: Sync Cal.com bookings to HubSpot/Salesforce
- **Paid Meeting Option**: Premium 1:1 strategy sessions
- **Podcast/Video**: Long-form content hosted on-site
- **Dashboard for Philip**: Admin panel to manage projects, bookings, metrics
- **Open API**: Allow external tools to book meetings
- **Team Page**: Add co-founders or team members

### Known Limitations & Technical Debt

**Current Limitations:**
- No authentication (all content public)
- No persistent backend (projects stored in code)
- Cal.com handles all meeting logic (can't customize beyond embed)
- Limited analytics (basic Vercel analytics)

**Technical Debt:**
- Email notifications managed externally (Cal.com)
- No database yet (needed for blog, newsletters)
- Manual project updates (no CMS)
- No automated testing suite

**Future Infrastructure Improvements:**
- Add Supabase/PostgreSQL for blog, newsletters
- Prisma ORM for type-safe database access
- Webhook for Cal.com → CRM sync
- GitHub Actions CI/CD with automated testing

---

## Support & Questions

- **Vercel Docs**: [vercel.com/docs](https://vercel.com/docs)
- **Next.js Docs**: [nextjs.org/docs](https://nextjs.org/docs)
- **Tailwind CSS**: [tailwindcss.com](https://tailwindcss.com)
- **Shadcn/ui**: [ui.shadcn.com](https://ui.shadcn.com)
- **Cal.com Docs**: [cal.com/docs](https://cal.com/docs)

---

## License

This project is the personal website of Philip Sun. All content and design are proprietary. Code components using open-source libraries (Next.js, React, Tailwind, Shadcn/ui) are subject to their respective licenses.

---

**Last Updated:** 2024  
**Version:** 0.1.0  
**Status:** Active Development (V1 complete)

---

*Built with clarity, strategy, and precision.*
