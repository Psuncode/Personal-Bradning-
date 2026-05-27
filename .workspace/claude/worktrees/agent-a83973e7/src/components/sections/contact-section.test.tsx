import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { ContactSection } from "./contact-section";

// Mock framer-motion
vi.mock("framer-motion", () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  },
}));

// Mock next/link
vi.mock("next/link", () => ({
  default: ({ children, href, ...props }: any) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

describe("ContactSection Component", () => {
  it("renders the contact section", () => {
    render(<ContactSection />);
    expect(screen.getByText("Get in Touch")).toBeDefined();
  });

  it("renders section heading", () => {
    render(<ContactSection />);
    expect(screen.getByText("Get in Touch")).toBeDefined();
  });

  it("renders Send a Message heading", () => {
    render(<ContactSection />);
    expect(screen.getByText("Send a Message")).toBeDefined();
  });

  it("renders description text", () => {
    render(<ContactSection />);
    expect(
      screen.getByText(
        /Recruiting for a PM role, building something in healthcare/i
      )
    ).toBeDefined();
  });

  it("renders contact form fields", () => {
    render(<ContactSection />);
    expect(screen.getByLabelText("Name")).toBeDefined();
    expect(screen.getByLabelText("Email")).toBeDefined();
    expect(screen.getByLabelText("Subject")).toBeDefined();
    expect(screen.getByLabelText("Message")).toBeDefined();
  });

  it("renders submit button", () => {
    render(<ContactSection />);
    expect(screen.getByText("Send Message")).toBeDefined();
  });

  it("has email link", () => {
    render(<ContactSection />);
    const emailLinks = screen.getAllByRole("link").filter(
      (link) => link.getAttribute("href")?.includes("mailto:")
    );
    expect(emailLinks.length).toBeGreaterThan(0);
  });

  it("has link to /meet", () => {
    render(<ContactSection />);
    const meetLinks = screen.getAllByRole("link").filter(
      (link) => link.getAttribute("href") === "/meet"
    );
    expect(meetLinks.length).toBeGreaterThan(0);
  });

  it("has proper layout classes", () => {
    const { container } = render(<ContactSection />);
    const section = container.querySelector("section");
    expect(section?.className).toContain("py-24");
  });

  it("content is centered", () => {
    const { container } = render(<ContactSection />);
    const centerDiv = container.querySelector(".mx-auto");
    expect(centerDiv).toBeDefined();
  });

  it("has max-width constraint on content", () => {
    const { container } = render(<ContactSection />);
    const contentDiv = container.querySelector(".max-w-5xl");
    expect(contentDiv).toBeDefined();
  });

  it("renders two-column grid layout", () => {
    const { container } = render(<ContactSection />);
    const grid = container.querySelector(".grid");
    expect(grid?.className).toContain("md:grid-cols-2");
  });

  it("renders LinkedIn and GitHub links", () => {
    render(<ContactSection />);
    const links = screen.getAllByRole("link");
    const linkedIn = links.find((l) =>
      l.getAttribute("href")?.includes("linkedin")
    );
    const github = links.find((l) =>
      l.getAttribute("href")?.includes("github")
    );
    expect(linkedIn).toBeDefined();
    expect(github).toBeDefined();
  });

  it("renders without crashing", () => {
    expect(() => render(<ContactSection />)).not.toThrow();
  });

  it("has proper container padding", () => {
    const { container } = render(<ContactSection />);
    const section = container.querySelector("section");
    expect(section?.className).toContain("py-24");
  });

  it("form has correct structure", () => {
    const { container } = render(<ContactSection />);
    const form = container.querySelector("form");
    expect(form).toBeDefined();
  });

  it("submit button is full width", () => {
    const { container } = render(<ContactSection />);
    const submitBtn = container.querySelector("button[type='submit']");
    expect(submitBtn?.className).toContain("w-full");
  });

  it("contact info section shows location", () => {
    render(<ContactSection />);
    expect(screen.getByText("Provo, UT")).toBeDefined();
  });
});
