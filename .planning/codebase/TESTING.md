# Testing Patterns

**Analysis Date:** 2025-03-17

## Test Framework

**Runner:**
- Vitest 4.0.18 - modern, fast test runner with ESM support
- Config: `vitest.config.ts` at project root
- Environment: jsdom (browser-like DOM simulation for React components)
- Globals enabled: `true` (no need to import `describe`, `it`, `expect` in test files)

**Assertion Library:**
- Vitest built-in assertions (extends Chai syntax)
- React Testing Library matchers via `@testing-library/jest-dom` (v6.9.1)

**Run Commands:**
```bash
npm run test              # Run all tests in watch mode (default for Vitest)
npm run test:ui          # Start Vitest UI browser interface
npm run test:coverage    # Generate coverage report (v8 provider)
npx vitest src/app/__tests__/home.test.tsx  # Run single test file
```

## Test File Organization

**Location:**
- Co-located pattern: test files live alongside source files
- Page tests: `src/app/__tests__/[page].test.tsx`
- Component tests: `src/components/[component].test.tsx` (same directory as component)

**Naming:**
- Pattern: `[FileName].test.tsx` (suffix after component name)
- Examples: `hero.test.tsx`, `button.test.tsx`, `section-heading.test.tsx`

**Structure:**
```
src/
├── app/
│   ├── page.tsx
│   ├── __tests__/
│   │   ├── home.test.tsx
│   │   ├── projects.test.tsx
│   │   ├── contact.test.tsx
│   │   └── meet.test.tsx
├── components/
│   ├── project-card.tsx
│   ├── project-card.test.tsx
│   ├── section-heading.tsx
│   ├── section-heading.test.tsx
│   ├── sections/
│   │   ├── hero.tsx
│   │   ├── hero.test.tsx
│   │   └── contact-section.test.tsx
│   └── layout/
│       ├── navbar.tsx
│       └── navbar.test.tsx
```

## Test Structure

**Setup:**
- Global setup file: `src/test/setup.ts`
- Runs after each test: `afterEach(() => { cleanup(); })`
- Imports `@testing-library/jest-dom` for extended matchers

**Suite Organization:**
```typescript
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { Button } from "./button";

describe("Button Component", () => {
  it("renders button with text", () => {
    render(<Button>Click me</Button>);
    const button = screen.getByRole("button", { name: /click me/i });
    expect(button).toBeInTheDocument();
  });

  it("handles click events", async () => {
    const handleClick = vi.fn();
    const user = userEvent.setup();

    render(<Button onClick={handleClick}>Click me</Button>);
    const button = screen.getByRole("button", { name: /click me/i });

    await user.click(button);
    expect(handleClick).toHaveBeenCalledOnce();
  });
});
```

**Patterns:**
- Single `describe()` block per component/page
- Multiple `it()` blocks testing specific behaviors
- Assertions ordered: render → query → assert
- Test names are descriptive and start with verb (renders, handles, displays, etc.)

## Mocking

**Framework:** Vitest's `vi` module

**Patterns:**

1. **Module mocking (framer-motion):**
```typescript
vi.mock("framer-motion", () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    h1: ({ children, ...props }: any) => <h1 {...props}>{children}</h1>,
    p: ({ children, ...props }: any) => <p {...props}>{children}</p>,
  },
  animate: {},
}));
```

2. **Navigation mocking (Next.js):**
```typescript
vi.mock("next/link", () => ({
  default: ({ children, href, ...props }: any) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

vi.mock("next/navigation", () => ({
  usePathname: () => "/",
}));
```

3. **Icon library mocking (lucide-react):**
```typescript
vi.mock("lucide-react", () => ({
  Menu: () => <div data-testid="menu-icon">Menu</div>,
  X: () => <div data-testid="close-icon">Close</div>,
}));
```

4. **Function mocks:**
```typescript
const handleClick = vi.fn();
render(<Button onClick={handleClick}>Click</Button>);
expect(handleClick).toHaveBeenCalledOnce();
```

**What to Mock:**
- External libraries (framer-motion, next/link, lucide-react icons)
- Next.js hooks and modules (usePathname, useRouter)
- Third-party animations or side effects

**What NOT to Mock:**
- React Testing Library utilities (render, screen)
- Component logic — test actual behavior
- Tailwind CSS classes (verify via class assertions, don't mock)

## Fixtures and Factories

**Test Data:**
- Minimal fixture usage observed
- Component props created inline in tests:
```typescript
render(<Button variant="outline">Outline</Button>);
render(<SectionHeading title="Test Title" subtitle="Sub" />);
```

**Static Test Data:**
- Projects and resume data from `src/data/` used directly in tests
- Tests check for real content (e.g., `screen.getByText("Inara Health Diagnostic")`)

**Location:**
- No separate fixtures directory
- Test data created inline or imported from `src/data/`

## Coverage

**Requirements:** No mandatory coverage target enforced (v8 provider configured but no threshold)

**View Coverage:**
```bash
npm run test:coverage
```
- Generates HTML report in `coverage/` directory
- Reporters configured: `["text", "json", "html"]`
- Excludes: `node_modules/`, `setup.ts`, `**/*.test.ts`, `**/*.test.tsx`

## Test Types

**Unit Tests:**
- Scope: Individual components and utilities
- Approach: Test component rendering, prop handling, user interactions
- Examples: `button.test.tsx` (variant/size props), `section-heading.test.tsx` (alignment props)

**Integration Tests:**
- Scope: Full pages and section interactions
- Approach: Test multiple components together, navigation, layout
- Examples: `home.test.tsx` (renders Hero + Featured Work + Projects sections), `projects.test.tsx` (renders grid + project cards)

**E2E Tests:**
- Framework: Not used
- Manual testing approach or external E2E tool would be needed for browser automation

## Common Patterns

**Async Testing:**
```typescript
import userEvent from "@testing-library/user-event";

it("handles click events", async () => {
  const user = userEvent.setup();
  const handleClick = vi.fn();

  render(<Button onClick={handleClick}>Click</Button>);
  await user.click(screen.getByRole("button"));
  expect(handleClick).toHaveBeenCalledOnce();
});
```

**Error Testing:**
```typescript
it("renders without crashing", () => {
  expect(() => render(<HomePage />)).not.toThrow();
});
```

**Conditional Rendering:**
```typescript
it("renders subtitle when provided", () => {
  render(<SectionHeading title="Main" subtitle="Sub" />);
  expect(screen.getByText("Sub")).toBeDefined();
});

it("does not render subtitle when not provided", () => {
  const { container } = render(<SectionHeading title="Main" />);
  const paragraph = container.querySelector("p");
  expect(paragraph).toBeNull();
});
```

**DOM Querying Patterns:**
```typescript
// Query by role (preferred for accessibility)
screen.getByRole("button", { name: /click me/i })
screen.getByRole("link")
screen.getByRole("heading")

// Query by text (with regex for case-insensitive)
screen.getByText("Get in Touch")
screen.getByText(/Product Manager/i)

// Query by label (form fields)
screen.getByLabelText("Email")

// Query by test ID (when role/text insufficient)
screen.getByTestId("menu-icon")

// Container queries (DOM structure verification)
container.querySelector(".grid")
container.querySelector("section")
```

**Assertion Patterns:**
```typescript
// Existence checks
expect(element).toBeDefined()
expect(element).toBeNull()
expect(element).toBeInTheDocument()

// Attribute checks
expect(button).toHaveAttribute("data-variant", "default")
expect(link).toHaveClass("custom-class")

// Content checks
expect(heading?.textContent).toBe("Title")
expect(container?.className).toContain("text-center")

// Count checks
expect(screen.getAllByText("text").length).toBeGreaterThan(0)
expect(handleClick).toHaveBeenCalledOnce()
```

**Rendering with rerender (for prop changes):**
```typescript
it("updates when props change", () => {
  const { rerender } = render(<Button variant="default">Default</Button>);
  let button = screen.getByRole("button");
  expect(button).toHaveAttribute("data-variant", "default");

  rerender(<Button variant="outline">Outline</Button>);
  button = screen.getByRole("button");
  expect(button).toHaveAttribute("data-variant", "outline");
});
```

**Hook setup/teardown (in Navbar test):**
```typescript
import { describe, it, expect, vi, beforeEach } from "vitest";

describe("Navbar Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("test case", () => { /* ... */ });
});
```

## Best Practices Observed

1. **Accessibility-first queries:** Use `getByRole()` before `getByText()`
2. **Case-insensitive matching:** Use regex flags (`/Pattern/i`) for user-facing text
3. **Avoid implementation details:** Test behavior, not component internals
4. **Mock external dependencies:** Framer Motion, Next.js routing, icon libraries
5. **Comprehensive page tests:** Home, Projects, Contact pages test full section rendering
6. **One assertion per concept:** Tests like "renders heading" and "has proper spacing" are separate
7. **Fail-safe patterns:** `.toBeDefined()` used instead of truthy checks for existence

---

*Testing analysis: 2025-03-17*
