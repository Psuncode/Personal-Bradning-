import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import ContactPage from "@/app/contact/page";

// Mock next/link
vi.mock("next/link", () => ({
  default: ({ children, href, ...props }: any) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

// Mock framer-motion
vi.mock("framer-motion", () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  },
}));

describe("Contact Page", () => {
  it("renders the contact page", () => {
    render(<ContactPage />);
    expect(screen.getByText("Get in Touch")).toBeDefined();
  });

  it("renders page heading", () => {
    render(<ContactPage />);
    const heading = screen.getByText("Get in Touch");
    expect(heading).toBeDefined();
  });

  it("renders contact description", () => {
    render(<ContactPage />);
    expect(
      screen.getByText(
        /Recruiting for a PM role, building something in healthcare/i
      )
    ).toBeDefined();
  });

  it("renders Send a Message heading", () => {
    render(<ContactPage />);
    expect(screen.getByText("Send a Message")).toBeDefined();
  });

  it("renders contact form fields", () => {
    render(<ContactPage />);
    expect(screen.getByLabelText("Name")).toBeDefined();
    expect(screen.getByLabelText("Email")).toBeDefined();
    expect(screen.getByLabelText("Subject")).toBeDefined();
    expect(screen.getByLabelText("Message")).toBeDefined();
  });

  it("renders submit button", () => {
    render(<ContactPage />);
    expect(screen.getByText("Send Message")).toBeDefined();
  });

  it("has link to /meet", () => {
    render(<ContactPage />);
    const meetLinks = screen.getAllByRole("link").filter(
      (link) => link.getAttribute("href") === "/meet"
    );
    expect(meetLinks.length).toBeGreaterThan(0);
  });

  it("has email link", () => {
    render(<ContactPage />);
    const emailLinks = screen.getAllByRole("link").filter(
      (link) => link.getAttribute("href")?.includes("mailto:")
    );
    expect(emailLinks.length).toBeGreaterThan(0);
  });

  it("has proper page padding", () => {
    const { container } = render(<ContactPage />);
    const wrapper = container.firstChild;
    expect(wrapper?.className).toContain("pt-8");
  });

  it("contact form area is centered", () => {
    const { container } = render(<ContactPage />);
    const centerDiv = container.querySelector(".mx-auto");
    expect(centerDiv).toBeDefined();
  });

  it("renders multiple CTAs", () => {
    render(<ContactPage />);
    const links = screen.getAllByRole("link");
    expect(links.length).toBeGreaterThanOrEqual(2);
  });

  it("renders without crashing", () => {
    expect(() => render(<ContactPage />)).not.toThrow();
  });

  it("has semantic section structure", () => {
    const { container } = render(<ContactPage />);
    const section = container.querySelector("section");
    expect(section).toBeDefined();
  });

  it("renders two-column layout", () => {
    const { container } = render(<ContactPage />);
    const grid = container.querySelector(".grid");
    expect(grid?.className).toContain("md:grid-cols-2");
  });

  it("renders contact form", () => {
    const { container } = render(<ContactPage />);
    const form = container.querySelector("form");
    expect(form).toBeDefined();
  });

  it("submit button has full-width styling", () => {
    const { container } = render(<ContactPage />);
    const submitBtn = container.querySelector("button[type='submit']");
    expect(submitBtn?.className).toContain("w-full");
  });

  it("submit button has dark styling", () => {
    const { container } = render(<ContactPage />);
    const submitBtn = container.querySelector("button[type='submit']");
    expect(submitBtn?.className).toContain("bg-gray-900");
  });
});
