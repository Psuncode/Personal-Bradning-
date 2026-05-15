# Portfolio beautification — screenshots

Manual capture step. Run `npm run build && npm start` and capture the following pages at 375 / 768 / 1024 / 1440 px:

- `/`
- `/projects`
- `/projects/inara-health` (or any slug)
- `/blog`
- `/blog/<slug>` (any post)
- `/meet`
- `/contact`

Save as `<page>-<viewport>.png` in this directory.

## Lighthouse mobile audit targets

| Page | A11y | Perf |
| --- | --- | --- |
| / | ≥95 | ≥90 |
| /projects | ≥95 | ≥90 |
| /projects/[slug] | ≥95 | — |
| /blog | ≥95 | ≥90 |
| /blog/[slug] | ≥95 | — |
| /meet | ≥95 | — |
| /contact | ≥95 | — |

## Reduced-motion verification

In DevTools → Rendering → Emulate CSS prefers-reduced-motion: reduce, navigate between `/projects` and a project detail. Expected: instant nav, no view-transition animation (covered by the `prefers-reduced-motion` rule in `src/app/globals.css`).
