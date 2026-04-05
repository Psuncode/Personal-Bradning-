# Photography Landing Page Design

Date: 2026-04-05
Topic: Reposition `/photography` into an SEO-first landing page for Utah couples and portrait inquiries

## Goal

Turn `/photography` into a focused landing page that attracts local search traffic for couples and portrait photography in Utah, then converts that traffic into qualified inquiries through a repaired booking flow.

## Scope

In scope:
- Reposition `/photography` around couples and portraits instead of broad general photography
- Treat `/photography` as a mini-homepage with clear search, trust, and conversion sections
- Keep `/photography/book` as the primary conversion path, but include repair work for its current broken experience
- Preserve broader photography work through secondary surfaces like `/photography/gallery`
- Define the next-step SEO expansion path after the landing page is stable

Out of scope:
- Rebranding the main homepage `/` away from PM and recruiter positioning
- Launching a full cluster of local SEO pages in the first wave
- Making landscapes or events part of the primary landing-page promise
- Rebuilding the entire photography section at once without prioritization

## Current State

The repository already contains a meaningful photography surface:

- `/photography` exists and has a polished visual structure
- `/photography/pricing`, `/photography/gallery`, and `/photography/book` already exist
- package data and booking infrastructure are already wired into the app
- photography is already linked in site navigation and sitemap

However, the current landing page is misaligned with the intended funnel:

- the positioning is broad: portraits, landscapes, and events
- the hero copy is aesthetic but weak for local SEO and conversion
- gallery content is driven by placeholder image URLs, which hurts trust and quality
- the page behaves more like an art-forward portfolio entry point than a service landing page
- the booking flow exists, but confidence in its reliability is low

## Primary Product Decision

The landing page should optimize for one clear offer:

- primary service focus: couples + portraits
- primary business objective: better SEO traffic to `/photography`
- primary conversion measure: qualified inquiries
- primary CTA destination: `/photography/book`, after flow repair

This keeps the funnel narrow enough for search engines and visitors to understand immediately.

## Chosen Approach

Build `/photography` as a search-first service landing page, then strengthen the downstream conversion path before expanding into a broader SEO cluster.

Why this approach:

- it aligns the page with explicit local service intent
- it avoids confusing visitors with multiple equal-priority photography categories
- it preserves the existing photography section instead of forcing a total rebuild
- it gives one strong hub page before adding supporting pages

## Information Architecture

Recommended structure:

- `/` remains the PM and recruiter-facing homepage
- `/photography` becomes the photography hub and primary SEO landing page
- `/photography/gallery` remains the broader archive for additional work, including landscapes and events
- `/photography/pricing` remains available, but pricing should also be surfaced on the landing page
- `/photography/book` remains the transactional endpoint

Future supporting pages should branch from the hub, not compete with it:

- `/photography/couples`
- `/photography/provo`
- optional later pages such as `/photography/portraits`

The first supporting page should only be added after the hub page is strong and the booking path is reliable.

## Landing Page Strategy

`/photography` should be treated as a full funnel page, not a gallery homepage.

Primary keyword themes:

- Utah couples photographer
- Utah portrait photographer
- Provo photographer
- Provo couples photographer

Metadata direction:

- title: `Philip Sun Photography | Utah Couples & Portrait Photographer`
- H1 direction: `Utah Couples & Portrait Photographer`

Core page principles:

- local relevance appears high on the page
- the service offer is explicit within the first screenful
- portfolio is supporting proof, not the entire story
- CTA hierarchy is clear and consistent

Recommended CTA order:

1. Book a Session
2. View Pricing
3. Browse Gallery

## Recommended Page Sections

### Hero

Purpose:
- clarify service, location, and intended client immediately

Requirements:
- explicit mention of Utah and couples + portraits
- primary CTA to booking
- secondary CTA to pricing or selected work
- copy should reduce ambiguity and avoid purely artistic phrasing

### Selected Work

Purpose:
- prove quality without overwhelming the visitor

Requirements:
- feature only the strongest couples and portrait images
- avoid filler and avoid leading with landscapes or events
- keep gallery exploration available as a secondary path

### Why Work With Me

Purpose:
- sell the client experience, not camera gear

Requirements:
- explain comfort, posing guidance, speed, and approachability
- explicitly reduce client anxiety around awkwardness and inexperience

### Pricing Snapshot

Purpose:
- qualify visitors and increase trust

Requirements:
- surface simple couples and portrait package framing on the landing page
- keep detailed package logic available on pricing and booking pages
- remove packages that do not support the couples + portraits positioning from the landing-page emphasis

### Process

Purpose:
- remove friction and uncertainty

Requirements:
- clearly explain booking, planning, shoot day, and delivery
- set expectations for response time and image delivery

### FAQ and SEO Copy

Purpose:
- capture search intent and answer practical objections

Requirements:
- include local relevance naturally
- answer what to expect, where you shoot, how booking works, and turnaround timing
- support intent-driven searches without sounding stuffed or generic

### Final CTA

Purpose:
- close the page with one clear next step

Requirements:
- route users into the repaired booking flow
- present one fallback contact option only if booking is temporarily unreliable

## Category Strategy

Couples and portraits should be the headline offer.

Landscapes and events should not disappear from the photography section, but they should move out of the primary landing-page promise:

- keep them in the gallery or archive experience
- do not present them as equal specialties in the main landing page hero or core service section
- do not let them dilute metadata, H1s, or CTA framing

## Conversion Strategy

The booking flow remains the intended primary CTA destination, but it should be treated as a reliability project.

Roadmap implication:

- do not hide the booking flow behind a generic contact form by default
- do not over-promote the booking path until the major failure points are fixed
- if necessary, use a lightweight fallback inquiry route during repair, but the target end state is direct booking

The landing page should therefore be designed to support two realities:

- immediate SEO and messaging improvements now
- improved conversion once booking reliability is restored

## Build Roadmap

### Phase 1: Reposition `/photography`

Goals:
- shift the page from broad photography to couples + portraits
- tighten metadata, headings, schema, and local relevance
- make the page work as a self-contained mini-homepage

Key outputs:
- revised hero copy
- updated page sections and CTA hierarchy
- revised service framing
- stronger on-page SEO structure

### Phase 2: Fix Conversion Plumbing

Goals:
- repair the booking flow so the landing page can convert qualified traffic
- remove confusion, broken steps, and weak failure handling

Key outputs:
- booking flow audit
- package and routing cleanup
- clearer states for availability, errors, and completion
- acceptable fallback inquiry path only if needed during transition

### Phase 3: Credibility Upgrades

Goals:
- replace low-trust placeholders with real proof
- increase conversion confidence for new visitors

Key outputs:
- real gallery assets
- testimonials or review snippets
- clearer package framing
- practical FAQ copy

### Phase 4: Expand the SEO Cluster

Goals:
- grow search surface area after the hub page is stable

Key outputs:
- one supporting page, likely `/photography/couples` or `/photography/provo`
- internal links between hub and supporting page
- page-specific copy that avoids thin, duplicated content

## Guardrails

- Do not mix PM or recruiter messaging into the photography landing page
- Do not expand into multiple SEO child pages before the hub page is strong
- Do not lead the landing page with landscapes or events
- Do not rely on placeholder imagery for a conversion-focused page
- Do not treat the booking flow as complete without verification

## Risks

Primary risks:

- broad photography language continues to dilute SEO intent
- placeholder assets undermine trust
- booking flow issues waste high-intent traffic
- premature expansion into thin SEO pages creates low-quality content

Mitigation:

- keep positioning narrow
- prioritize booking reliability before cluster expansion
- use real proof as soon as possible
- add only one follow-on SEO page after the hub proves out

## Success Criteria

The build is successful when:

- `/photography` clearly reads as a Utah couples and portrait service page
- page structure supports both SEO and conversion, not just aesthetics
- users can identify the offer, location, and next step immediately
- the booking path is reliable enough to capture qualified inquiries
- the photography section keeps broader work available without diluting the landing page
- the next SEO page is defined, but not prematurely shipped as thin content
