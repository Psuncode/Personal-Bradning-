# Personal Website Editorial Refresh Design

Date: 2026-04-20
Status: Approved in conversation, pending written-spec review
Scope: Visual and presentation refresh for the main personal site homepage and shared design language, with minimal information architecture changes

## Objective

Refine `PhilipSun.com` into an executive-first personal brand site that feels editorial, selective, and high-trust. The redesign should preserve the current content architecture while significantly improving aesthetic judgment, narrative pacing, and perceived polish.

The homepage should primarily serve recruiters, founders, and investors in the first 10 seconds. Photography and other ventures remain present, but they should read as secondary extensions of the brand rather than competing first impressions.

## Success Criteria

- The homepage communicates "taste and clarity" before visitors process detailed content.
- The current architecture remains mostly intact; the work is primarily presentational and hierarchical rather than structural.
- The homepage feels like a composed narrative rather than a stack of product-marketing sections.
- The design system becomes more editorial and less generic startup/SaaS.
- Secondary ventures remain accessible without diluting the executive-first framing.

## User and Brand Positioning

### Primary audience

- Recruiters
- Founders
- Investors

### Brand impression target

- Editorial and refined
- Selective rather than loud
- Strategic and credible
- High-judgment, not overdesigned

### Core memory to leave with visitors

The site should make visitors remember Philip Sun for taste and clarity.

## Constraints

- Keep the current content architecture mostly intact.
- Avoid a broad rewrite of inner-page structure.
- Focus first on homepage presentation, shared visual language, and selective nav emphasis.
- Maintain current functionality and existing page destinations.
- Preserve accessibility, responsiveness, and production readiness.

## Current-State Review

### What is working

- The site already has strong content scaffolding: hero, current focus, about, case studies, writing, resume, contact, and business sub-areas.
- The homepage includes relevant proof and signal sections.
- The navigation already separates secondary business areas from the core portfolio.

### What is not working

- The visual language and page rhythm do not fully match the stated brand ambition.
- The current hero presentation reads like a startup landing page rather than an editorial professional profile.
- Decorative blur-orb treatments and rounded CTA patterns feel generic relative to the intended audience.
- The homepage sections are useful, but they currently read as stacked modules instead of a guided narrative.
- Typography choices point toward refinement, but the surrounding component styling still feels template-like.

## Recommended Direction

Use an editorial-sequence redesign while preserving the current content architecture.

This means:

- Keep the same major homepage sections and destination structure.
- Rework the visual system, pacing, spacing, and hierarchy so the page reads like a curated dossier.
- Emphasize the professional identity first and let business ventures remain secondary but credible.

This approach is preferred over a full structural rethink because it delivers a sharper brand outcome without destabilizing the rest of the site.

## Experience Principles

- Lead with point of view, not generic self-description.
- Prefer restraint over decorative excess.
- Use hierarchy and spacing to communicate judgment.
- Make proof feel selected and curated, not exhaustively presented.
- Let writing, projects, and current focus reinforce one coherent identity.

## Homepage Concept

The homepage should feel like a composed narrative for an executive-first personal brand.

### Narrative order

1. Hero: thesis and first impression
2. Current Focus: present-tense signals of momentum
3. About: concise editorial profile
4. Case Studies: strongest proof block
5. Writing: evidence of thinking and clarity

### Intended reading experience

- The hero opens with a sharper perspective statement.
- The page then transitions into present-tense signals about what Philip is doing now.
- Supporting profile context follows without becoming autobiographical overload.
- The strongest proof appears after the identity is established.
- Writing appears as intellectual reinforcement, not an isolated blog module.

## Design System

### Visual tone

Editorial, refined, warm, and composed.

The site should feel closer to a modern magazine profile, private-capital biography, or well-designed dossier than a startup landing page.

### Color system

- Base background: warm paper tone rather than pure white
- Primary text: deep charcoal or ink
- Accent: one restrained accent, such as oxblood, muted forest, or cultivated navy
- Secondary surfaces: bone, stone, or fog

Avoid:

- Pure black hero blocks as the dominant first impression
- Loud gradients
- Generic product-style blue defaults
- Decorative effects that do not support the brand story

### Typography

- Keep a serif-led identity
- Use a stronger, more commanding display voice
- Use a quiet, highly legible sans for support text
- Increase contrast between headline, deck, metadata, eyebrow labels, and body copy
- Introduce editorial details such as uppercase labels, tighter metadata styling, and more deliberate spacing rhythm

### Components

- Buttons should feel premium and understated, not soft or bubbly
- Cards should feel like curated panels, document fragments, or proof blocks
- Section headings should feel formal and typographically intentional
- Dividers, rules, captions, and metadata should do more compositional work

### Motion

- Use restrained staggered entrance motion
- Favor soft reveals and low-amplitude transitions
- Keep hover states subtle and typographic where possible
- Remove decorative bounce cues and attention-seeking motion

## Section-Level Design Guidance

### Hero

Replace the existing startup-like dark hero treatment with an editorial opening statement.

Requirements:

- Sharpen the copy beyond "Creative Thinker. Modern Builder."
- Position Philip as an operator working across product, strategy, and selective ventures
- Reduce reliance on generic hero tropes
- Use typography, rhythm, and layout as the main source of drama
- Keep primary CTA access, but present it with more restraint

Desired outcome:

Visitors should immediately understand that the site belongs to someone thoughtful, credible, and selective.

### Current Focus

Keep the section, but restyle it as "desk notes" or present-tense signals rather than feature cards.

Requirements:

- Lighter presentation
- More editorial framing
- Less product-card energy
- Focus on momentum, taste, and current priorities

### About

Present as a concise editorial profile block.

Requirements:

- Stronger layout composition
- Better relationship between heading, text, and supporting detail
- More confidence and less generic "about section" styling

### Case Studies

This should be the heaviest proof block after the hero.

Requirements:

- Carry more visual authority than surrounding sections
- Emphasize selectivity and judgment
- Make metrics and outcomes feel curated rather than decorative

### Writing

Integrate writing more tightly into the homepage narrative.

Requirements:

- Treat writing as evidence of thinking
- Reduce the feeling of a separate blog widget
- Use a more refined article-list treatment

## Navigation Guidance

- Keep the current overall nav structure
- Preserve access to business areas
- Ensure the professional identity remains visually primary
- Make "Business" feel secondary in emphasis even if it remains present

## Responsive and Accessibility Requirements

- Maintain mobile-first behavior and responsiveness
- Preserve semantic heading hierarchy
- Keep contrast accessible across the warmer palette
- Respect reduced motion preferences
- Avoid designs that rely on hover alone for comprehension

## Technical Direction

- Implement via the existing Next.js and Tailwind setup
- Use shared design tokens in `globals.css` to establish the new palette and typography hierarchy
- Apply the new system first to homepage and shared layout primitives
- Prefer CSS-first styling adjustments with selective motion updates
- Reuse current section architecture where possible instead of replacing content models

## Out of Scope

- Full information-architecture rewrite
- Rebuilding all interior pages from scratch
- Major content rewrites across the whole site
- Repositioning photography as a homepage co-equal to the executive-first identity

## Risks

- Overcorrecting into minimalism could remove warmth or individuality
- Preserving structure too literally could leave some modular feel behind
- If typography and spacing are upgraded without rebalancing component surfaces, the site may still feel partially template-driven

## Mitigations

- Use restraint, but preserve distinctive editorial character
- Adjust section pacing and surface treatment, not only colors and fonts
- Re-evaluate hierarchy at the page level, not just per component

## Testing and Verification

- Visual review on desktop and mobile breakpoints
- Confirm reduced-motion behavior still works
- Verify CTA visibility and booking path clarity
- Verify that homepage first impression prioritizes recruiters, founders, and investors
- Check that business links remain accessible without overpowering the primary brand story

## Implementation Priorities

1. Establish new visual tokens and global surface language
2. Redesign hero and homepage pacing
3. Restyle current focus, about, case studies, and writing sections to match the editorial system
4. Refine navbar and shared component presentation
5. Run responsive and accessibility validation
