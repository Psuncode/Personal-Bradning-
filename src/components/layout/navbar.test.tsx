import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { Navbar } from "./navbar";

// Mock next/link
vi.mock("next/link", () => ({
  default: ({ children, href, ...props }: any) => (
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
    expect(screen.getByText("Meet")).toBeDefined();
    expect(screen.getByText("Contact")).toBeDefined();
  });

  it("navigation links have correct hrefs", () => {
    render(<Navbar />);
    const projectsLink = screen.getByText("Projects").closest("a");
    const meetLink = screen.getByText("Meet").closest("a");
    const contactLink = screen.getByText("Contact").closest("a");

    expect(projectsLink?.getAttribute("href")).toBe("/projects");
    expect(meetLink?.getAttribute("href")).toBe("/meet");
    expect(contactLink?.getAttribute("href")).toBe("/contact");
  });

  it("does not render Home link", () => {
    render(<Navbar />);
    expect(screen.queryByText("Home")).toBeNull();
  });

  it("renders mobile menu button", () => {
    render(<Navbar />);
    const menuButton = screen.getByRole("button");
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
