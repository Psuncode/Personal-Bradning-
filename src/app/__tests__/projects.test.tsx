import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import type {
  AnchorHTMLAttributes,
  HTMLAttributes,
  ImgHTMLAttributes,
  PropsWithChildren,
} from "react";
import ProjectsPage from "@/app/(main)/projects/page";

type LinkProps = PropsWithChildren<
  { href: string } & AnchorHTMLAttributes<HTMLAnchorElement>
>;
type DivProps = PropsWithChildren<HTMLAttributes<HTMLDivElement>>;

vi.mock("next/link", () => ({
  default: ({ children, href, ...props }: LinkProps) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

vi.mock("next/image", () => ({
  default: ({
    src,
    alt,
    ...rest
  }: ImgHTMLAttributes<HTMLImageElement> & { src: string; alt: string }) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt={alt} {...rest} />
  ),
}));

vi.mock("framer-motion", () => ({
  motion: {
    div: ({ children, ...props }: DivProps) => <div {...props}>{children}</div>,
  },
}));

describe("Projects Page", () => {
  it("renders the projects page", () => {
    render(<ProjectsPage />);
    expect(screen.getByRole("heading", { level: 1, name: "Projects" })).toBeDefined();
  });

  it("renders page heading", () => {
    render(<ProjectsPage />);
    expect(screen.getByText("Projects")).toBeDefined();
  });

  it("renders all projects", () => {
    render(<ProjectsPage />);
    expect(screen.getByText("Inara Health Diagnostic")).toBeDefined();
    expect(screen.getByText("LDS Church: Enterprise Tech PM")).toBeDefined();
    expect(screen.getByText("Nursa: AI TB Verification Model")).toBeDefined();
  });

  it("displays more than 3 projects (all projects, not just featured)", () => {
    render(<ProjectsPage />);
    const links = screen.getAllByRole("link");
    expect(links.length).toBeGreaterThan(3);
  });

  it("renders project descriptions", () => {
    render(<ProjectsPage />);
    expect(
      screen.getByText(/Founding a continuous progesterone monitoring device/i),
    ).toBeDefined();
  });

  it("renders project links", () => {
    render(<ProjectsPage />);
    const links = screen.getAllByRole("link");
    expect(links.length).toBeGreaterThan(0);
  });

  it("has no View All Projects button (already on all projects page)", () => {
    render(<ProjectsPage />);
    const viewAllButton = screen.queryByText("View All Projects");
    expect(viewAllButton).toBeNull();
  });

  it("renders editorial numeral kickers", () => {
    render(<ProjectsPage />);
    expect(screen.getByText("01")).toBeDefined();
    expect(screen.getByText("02")).toBeDefined();
  });

  it("renders the editorial sub-line", () => {
    render(<ProjectsPage />);
    expect(screen.getByText(/A magazine of recent work/i)).toBeDefined();
  });

  it("renders without crashing", () => {
    expect(() => render(<ProjectsPage />)).not.toThrow();
  });

  it("displays both featured and non-featured projects", () => {
    render(<ProjectsPage />);
    expect(screen.getByText("Granger Medical: RVU Analytics Platform")).toBeDefined();
    expect(screen.getByText("Cocker Innovation Fellowship")).toBeDefined();
  });
});
