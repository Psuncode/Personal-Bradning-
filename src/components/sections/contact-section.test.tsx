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

// Mock social-links component
vi.mock("@/components/social-links", () => ({
  SocialLinks: () => <div data-testid="social-links">Social Links</div>,
}));

describe("ContactSection Component", () => {
  it("renders the contact section", () => {
    render(<ContactSection />);
    expect(screen.getByText("Get In Touch")).toBeDefined();
  });

  it("renders section heading", () => {
    render(<ContactSection />);
    expect(screen.getByText("Get In Touch")).toBeDefined();
  });

  it("renders subtitle", () => {
    render(<ContactSection />);
    expect(
      screen.getByText(/Have a question or want to work together?/i)
    ).toBeDefined();
  });

  it("renders description text", () => {
    render(<ContactSection />);
    expect(
      screen.getByText(
        /Feel free to reach out. I'm always open to discussing new\s*projects/i
      )
    ).toBeDefined();
  });

  it("renders 'Say Hello' button", () => {
    render(<ContactSection />);
    const sayHelloBtn = screen.getByText("Say Hello");
    expect(sayHelloBtn).toBeDefined();
  });

  it("Say Hello button has correct email link", () => {
    render(<ContactSection />);
    const sayHelloLink = screen.getByText("Say Hello").closest("a");
    expect(sayHelloLink?.getAttribute("href")).toContain("mailto:");
  });

  it("renders 'Book a Meeting' button", () => {
    render(<ContactSection />);
    const bookMeetingBtn = screen.getByText("Book a Meeting");
    expect(bookMeetingBtn).toBeDefined();
  });

  it("Book a Meeting button links to correct page", () => {
    render(<ContactSection />);
    const bookMeetingLink = screen.getByText("Book a Meeting").closest("a");
    expect(bookMeetingLink?.getAttribute("href")).toBe("/meet");
  });

  it("renders social links component", () => {
    render(<ContactSection />);
    const socialLinks = screen.getByTestId("social-links");
    expect(socialLinks).toBeDefined();
  });

  it("has proper layout classes", () => {
    const { container } = render(<ContactSection />);
    const section = container.querySelector("section");
    expect(section?.className).toContain("py-24");
  });

  it("content is centered", () => {
    const { container } = render(<ContactSection />);
    const motionDiv = container.querySelector("[class*='text-center']");
    expect(motionDiv?.className).toContain("text-center");
  });

  it("has max-width constraint on content", () => {
    const { container } = render(<ContactSection />);
    const contentDiv = container.querySelector(".max-w-md");
    expect(contentDiv).toBeDefined();
  });

  it("buttons are displayed in flex layout", () => {
    const { container } = render(<ContactSection />);
    const buttonContainer = container.querySelector(".flex");
    expect(buttonContainer?.className).toContain("gap-4");
  });

  it("buttons are centered", () => {
    const { container } = render(<ContactSection />);
    const buttonContainer = container.querySelector(".flex.justify-center");
    expect(buttonContainer).toBeDefined();
  });

  it("social links are centered", () => {
    const { container } = render(<ContactSection />);
    const socialContainer = container.querySelector(".mt-8.flex.justify-center");
    expect(socialContainer).toBeDefined();
  });

  it("Say Hello button has primary styling", () => {
    const { container } = render(<ContactSection />);
    const sayHelloBtn = screen.getByText("Say Hello").closest("a");
    expect(sayHelloBtn?.className).toContain("bg-byu-navy");
  });

  it("Book a Meeting button has outline styling", () => {
    const { container } = render(<ContactSection />);
    const bookMeetingBtn = screen.getByText("Book a Meeting").closest("a");
    expect(bookMeetingBtn?.className).toContain("border-byu-navy");
  });

  it("has proper spacing between elements", () => {
    const { container } = render(<ContactSection />);
    const buttons = container.querySelector(".mt-8.flex.gap-4");
    expect(buttons).toBeDefined();
  });

  it("renders without crashing", () => {
    expect(() => render(<ContactSection />)).not.toThrow();
  });

  it("description has proper text styling", () => {
    const { container } = render(<ContactSection />);
    const description = screen.getByText(/Feel free to reach out/i);
    expect(description.className).toContain("text-lg");
    expect(description.className).toContain("text-byu-dark-gray");
  });

  it("has proper container padding", () => {
    const { container } = render(<ContactSection />);
    const section = container.querySelector("section");
    expect(section?.className).toContain("py-24");
  });
});
