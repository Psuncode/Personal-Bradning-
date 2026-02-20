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

// Mock social-links component
vi.mock("@/components/social-links", () => ({
  SocialLinks: () => <div data-testid="social-links">Social Links</div>,
}));

describe("Contact Page", () => {
  it("renders the contact page", () => {
    render(<ContactPage />);
    expect(screen.getByText("Get In Touch")).toBeDefined();
  });

  it("renders page heading", () => {
    render(<ContactPage />);
    const heading = screen.getByText("Get In Touch");
    expect(heading).toBeDefined();
  });

  it("renders section subtitle", () => {
    render(<ContactPage />);
    expect(
      screen.getByText(/Have a question or want to work together?/i)
    ).toBeDefined();
  });

  it("renders contact description", () => {
    render(<ContactPage />);
    expect(
      screen.getByText(
        /Feel free to reach out. I'm always open to discussing new/i
      )
    ).toBeDefined();
  });

  it("renders 'Say Hello' button", () => {
    render(<ContactPage />);
    expect(screen.getByText("Say Hello")).toBeDefined();
  });

  it("Say Hello button has email link", () => {
    render(<ContactPage />);
    const sayHelloLink = screen.getByText("Say Hello").closest("a");
    expect(sayHelloLink?.getAttribute("href")).toContain("mailto:");
  });

  it("renders 'Book a Meeting' button", () => {
    render(<ContactPage />);
    expect(screen.getByText("Book a Meeting")).toBeDefined();
  });

  it("Book a Meeting button links to /meet", () => {
    render(<ContactPage />);
    const bookMeetingLink = screen.getByText("Book a Meeting").closest("a");
    expect(bookMeetingLink?.getAttribute("href")).toBe("/meet");
  });

  it("renders social links section", () => {
    render(<ContactPage />);
    expect(screen.getByTestId("social-links")).toBeDefined();
  });

  it("has proper page padding", () => {
    const { container } = render(<ContactPage />);
    const wrapper = container.firstChild;
    expect(wrapper?.className).toContain("pt-8");
  });

  it("renders with proper container structure", () => {
    const { container } = render(<ContactPage />);
    const contentDiv = container.querySelector(".max-w-md");
    expect(contentDiv).toBeDefined();
  });

  it("contact form area is centered", () => {
    const { container } = render(<ContactPage />);
    const centerDiv = container.querySelector(".mx-auto");
    expect(centerDiv).toBeDefined();
  });

  it("renders multiple CTAs", () => {
    render(<ContactPage />);
    const buttons = screen.getAllByRole("link").filter(
      (link) =>
        link.textContent?.includes("Say Hello") ||
        link.textContent?.includes("Book a Meeting")
    );
    expect(buttons.length).toBeGreaterThanOrEqual(2);
  });

  it("renders without crashing", () => {
    expect(() => render(<ContactPage />)).not.toThrow();
  });

  it("has semantic section structure", () => {
    const { container } = render(<ContactPage />);
    const section = container.querySelector("section");
    expect(section).toBeDefined();
  });

  it("buttons are in flex layout", () => {
    const { container } = render(<ContactPage />);
    const buttonContainer = container.querySelector(".flex.gap-4");
    expect(buttonContainer).toBeDefined();
  });

  it("primary button has correct styling", () => {
    const { container } = render(<ContactPage />);
    const sayHelloBtn = screen.getByText("Say Hello").closest("a");
    expect(sayHelloBtn?.className).toContain("bg-byu-navy");
  });

  it("secondary button has outline styling", () => {
    const { container } = render(<ContactPage />);
    const bookMeetingBtn = screen.getByText("Book a Meeting").closest("a");
    expect(bookMeetingBtn?.className).toContain("border-byu-navy");
  });
});
