# Deferred Items — Phase 03

## Out-of-scope issues discovered during plan execution

### contact.test.tsx fails when suite run together (pre-existing)

**Discovered during:** Plan 03-00, Task 2 verification
**Root cause:** `src/components/sections/contact-section.tsx` was modified in the working tree (before Plan 03 began) to import `useReducedMotion` from `framer-motion`. The contact.test.tsx mock only provides `motion.div` and does not export `useReducedMotion`, causing Vitest to throw when rendering `ContactPage`.
**Scope:** Pre-existing, not caused by Phase 3 changes
**Fix required:** Update `contact.test.tsx` framer-motion mock to include `useReducedMotion: () => false` — or update the contact component's approach.
**Affected file:** `src/app/__tests__/contact.test.tsx`
