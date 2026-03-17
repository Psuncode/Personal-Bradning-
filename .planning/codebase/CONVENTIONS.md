# Coding Conventions

**Analysis Date:** 2025-03-17

## Naming Patterns

**Files:**
- Component files: PascalCase, kebab-case for test/spec files (e.g., `hero.tsx`, `hero.test.tsx`, `section-heading.tsx`)
- Data files: camelCase with `.ts` extension (e.g., `site-config.ts`, `projects.ts`, `current-focus.ts`)
- Service/utility files: descriptive camelCase (e.g., `availabilityService.ts`, `icsService.ts`, `icalendarService.ts`)
- Test files colocated with source: `[ComponentName].test.tsx` in same directory as component
- Page files: `page.tsx` following Next.js App Router convention

**Functions:**
- Exported functions: camelCase (e.g., `getAvailableSlots`, `generateICSContent`, `downloadICS`)
- Component functions: PascalCase (e.g., `export function Hero()`, `export function ProjectCard()`)
- Private/internal functions: camelCase with optional underscore prefix
- Event handlers in components: `handle[Action]` pattern (e.g., `handleClick`)

**Variables:**
- camelCase for all local variables (e.g., `zonedDate`, `dayOfWeek`, `currentTime`)
- Constants: UPPER_SNAKE_CASE in module scope (e.g., `TIMEZONE`, `WORK_START_HOUR`, `SLOT_DURATION_MINUTES`)
- BYU color palette constants follow naming: `--color-byu-navy`, `--color-byu-light-blue` in CSS

**Types & Interfaces:**
- PascalCase for interface/type names (e.g., `Project`, `SocialLink`, `SectionHeadingProps`)
- Props interfaces: `[ComponentName]Props` suffix (e.g., `ProjectCardProps`, `SectionHeadingProps`)
- Discriminated unions use literal string types (e.g., `type: "full-time" | "internship" | "part-time" | "contract"`)

## Code Style

**Formatting:**
- No dedicated `.prettierrc` found — default formatting via ESLint
- Line length: Appears to follow reasonable defaults (120-160 chars observed)
- Indentation: 2 spaces (inferred from codebase)

**Linting:**
- Tool: ESLint 9 with `eslint-config-next` core-web-vitals and TypeScript configs
- Config: `eslint.config.mjs` (flat config format)
- Core rules enforced: Next.js core web vitals + TypeScript best practices
- No custom rule overrides beyond Next.js defaults observed

**TypeScript:**
- Target: ES2017
- Module: esnext
- Strict mode: enabled (`strict: true`)
- JSX: react-jsx (React 19 compatible)
- Path aliases: `@/*` maps to `./src/*`

## Import Organization

**Order:**
1. External libraries (Next.js, React, third-party packages)
2. Internal components from `@/components`
3. Internal utilities/services from `@/lib`
4. Internal types from `@/types`
5. Internal data from `@/data`
6. Relative imports (rare, use absolute `@` paths instead)

**Examples:**
```typescript
// Correct pattern from src/components/project-card.tsx
import { motion } from "framer-motion";
import Link from "next/link";
import { ExternalLink, Github } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { Project } from "@/types";
```

**Path Aliases:**
- `@/` → `./src/` (configured in `tsconfig.json` and `vitest.config.ts`)
- Always use absolute `@/` imports, never relative imports (`../../../`)

**Grouped imports:** Related imports are grouped together without blank lines within groups, with blank lines between groups

## Error Handling

**Patterns:**
- Try-catch blocks used in utility functions (e.g., `icsService.ts` uses error handling with `const { error, value }`)
- Error objects checked via destructuring pattern: `{ error, value }`
- No global error boundary observed in this codebase (focus on component/page level)
- Component render safety: `.toBeDefined()` patterns suggest defensive checks
- Null coalescing and optional chaining used: `project.metrics?.length`, `link.getAttribute("href")?.includes()`

**Async/await:** Server-side async operations use try-catch wrapping; client components handle promise states via React lifecycle

## Logging

**Framework:** console (no dedicated logging library detected)

**Patterns:**
- Minimal logging in production code observed
- Comment-based documentation for complex logic (e.g., availability service includes step-by-step comments)
- Errors in utility functions logged via thrown errors or error objects

## Comments

**When to Comment:**
- Complex business logic (e.g., timezone conversions, availability slot generation)
- Non-obvious React patterns (e.g., Framer Motion animation configs)
- Configuration constants with context (e.g., `// 5 PM`)

**JSDoc/TSDoc:**
- Minimal JSDoc usage observed
- Type annotations preferred over JSDoc for function signatures
- Interface definitions are self-documenting

## Function Design

**Size:**
- Observed functions: 20–100 lines (average ~40 lines)
- Larger functions: utility services like `getAvailableSlots()` (40+ lines) remain readable via comments and clear variable names
- Components kept focused: Hero section ~65 lines, ProjectCard ~80 lines

**Parameters:**
- Single object parameter pattern for components (destructured props)
- Service functions use individual parameters for small arity (≤ 3 args)
- Named parameters via object pattern for higher complexity

**Return Values:**
- Components return JSX (`React.ReactNode`)
- Utilities return typed objects or arrays with clear type annotations
- No implicit `any` returns — always explicitly typed

**Example pattern from `section-heading.tsx`:**
```typescript
interface SectionHeadingProps {
  title: string;
  subtitle?: string;
  className?: string;
  align?: "left" | "center";
}

export function SectionHeading({
  title,
  subtitle,
  className,
  align = "center",
}: SectionHeadingProps) {
  // Implementation
}
```

## Module Design

**Exports:**
- Named exports preferred for reusability (e.g., `export function SectionHeading()`)
- Default exports used only for Next.js page/layout files
- Type exports for interfaces/types: `export type Project = ...` or `export interface Project {...}`

**Barrel Files:**
- `src/components/ui/` contains copy-paste shadcn components (unmodified structure)
- No barrel file re-exports observed in main component dirs (each file exports independently)
- Data files are singular modules: `projects.ts`, `resume.ts`, `site-config.ts`

**Styling Convention:**
- Tailwind CSS classnames via `className` attribute
- Conditional classes using `cn()` utility from `src/lib/utils.ts`
- Pattern: `cn("base-class", condition && "conditional-class", customClass)`
- Example from `section-heading.tsx`:
  ```typescript
  className={cn(
    "mb-12",
    align === "center" ? "text-center" : "text-left",
    className
  )}
  ```

**Color Usage:**
- BYU-branded Tailwind colors: `byu-navy`, `byu-blue`, `byu-light-blue`, `byu-sky`, `byu-gray`, `byu-dark-gray`
- Defined inline in `src/app/globals.css` via `@theme inline`
- Applied via class names: `text-byu-navy`, `bg-byu-light-blue/10`, `border-byu-sky/30`

---

*Convention analysis: 2025-03-17*
