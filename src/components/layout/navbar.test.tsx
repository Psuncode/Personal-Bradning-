import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import type { AnchorHTMLAttributes, PropsWithChildren } from "react";
import { Navbar } from "./navbar";

type LinkProps = PropsWithChildren<
  { href: string } & AnchorHTMLAttributes<HTMLAnchorElement>
>;

// Mock next/link
vi.mock("next/link", () => ({
  default: ({ children, href, ...props }: LinkProps) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

// Mock next/navigation
vi.mock("next/navigation", () => ({
  usePathname: () => "/",
}));

// Mock lucide-react
vi.mock("lucide-react", () => ({
  Menu: () => <div data-testid="menu-icon">Menu</div>,
  XIcon: () => <div data-testid="close-icon">Close</div>,
  X: () => <div data-testid="close-icon">Close</div>,
  ChevronDown: () => <div data-testid="chevron-down-icon">ChevronDown</div>,
}));

describe("Navbar Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders the navbar header", () => {
    render(<Navbar />);
    const header = screen.getByRole("banner");
    expect(header).toBeDefined();
  });

  it("renders the logo/brand name", () => {
    render(<Navbar />);
    const logo = screen.getByText("Philip Sun");
    expect(logo).toBeDefined();
  });

  it("logo links to home page", () => {
    render(<Navbar />);
    const logoLink = screen.getByText("Philip Sun").closest("a");
    expect(logoLink?.getAttribute("href")).toBe("/");
  });

  it("renders all navigation links on desktop", () => {
    render(<Navbar />);
    expect(screen.getByText("Projects")).toBeDefined();
    expect(screen.getByText("Writing")).toBeDefined();
    expect(screen.getByText("Book a Call")).toBeDefined();
    expect(screen.queryByText("Contact")).toBeNull();
  });

  it("renders a top-level Photography link between Writing and Meet", () => {
    const { container } = render(<Navbar />);
    // The top-level desktop list (the first <ul> in the nav)
    const topUl = container.querySelector("nav > ul");
    expect(topUl).toBeDefined();
    const topLabels = Array.from(topUl?.querySelectorAll("a") ?? [])
      .map((a) => a.textContent?.trim())
      .filter(Boolean);

    const writingIdx = topLabels.indexOf("Writing");
    const photographyIdx = topLabels.indexOf("Photography");
    const bookIdx = topLabels.indexOf("Book a Call");

    expect(writingIdx).toBeGreaterThanOrEqual(0);
    expect(photographyIdx).toBeGreaterThan(writingIdx);
    expect(bookIdx).toBeGreaterThan(photographyIdx);
  });

  it("Photography top-level link points to /photography", () => {
    const { container } = render(<Navbar />);
    const topUl = container.querySelector("nav > ul");
    const link = Array.from(topUl?.querySelectorAll("a") ?? []).find(
      (a) => a.textContent?.trim() === "Photography",
    );
    expect(link?.getAttribute("href")).toBe("/photography");
  });

  it("navigation links have correct hrefs", () => {
    render(<Navbar />);
    const projectsLink = screen.getByText("Projects").closest("a");
    const meetLink = screen.getByText("Book a Call").closest("a");

    expect(projectsLink?.getAttribute("href")).toBe("/projects");
    expect(meetLink?.getAttribute("href")).toBe("/meet");
  });

  it("does not render Home link", () => {
    render(<Navbar />);
    expect(screen.queryByText("Home")).toBeNull();
  });

  it("renders mobile menu button", () => {
    render(<Navbar />);
    // Use aria-label query to target the mobile menu button specifically
    const menuButton = screen.getByText(/Open menu/i).closest("button");
    expect(menuButton).toBeDefined();
  });

  it("mobile menu button has aria-label", () => {
    render(<Navbar />);
    const menuButton = screen.getByText(/Open menu/i);
    expect(menuButton).toBeDefined();
  });

  it("renders navbar with sticky positioning", () => {
    const { container } = render(<Navbar />);
    const header = container.querySelector("header");
    expect(header?.className).toContain("sticky");
    expect(header?.className).toContain("top-0");
  });

  it("applies proper z-index for navbar", () => {
    const { container } = render(<Navbar />);
    const header = container.querySelector("header");
    expect(header?.className).toContain("z-50");
  });

  it("has backdrop blur effect", () => {
    const { container } = render(<Navbar />);
    const header = container.querySelector("header");
    expect(header?.className).toContain("backdrop-blur");
  });

  it("navbar has border styling", () => {
    const { container } = render(<Navbar />);
    const header = container.querySelector("header");
    expect(header?.className).toContain("border-b");
  });

  it("renders navigation as a nav element", () => {
    const { container } = render(<Navbar />);
    const nav = container.querySelector("nav");
    expect(nav).toBeDefined();
  });

  it("renders without crashing", () => {
    expect(() => render(<Navbar />)).not.toThrow();
  });

  it("has proper flex layout", () => {
    const { container } = render(<Navbar />);
    const nav = container.querySelector("nav");
    expect(nav?.className).toContain("flex");
    expect(nav?.className).toContain("justify-between");
  });

  it("maintains proper height on navbar", () => {
    const { container } = render(<Navbar />);
    const nav = container.querySelector("nav");
    expect(nav?.className).toContain("h-16");
  });

  it("has proper max-width", () => {
    const { container } = render(<Navbar />);
    const nav = container.querySelector("nav");
    expect(nav?.className).toContain("max-w-6xl");
  });
});
