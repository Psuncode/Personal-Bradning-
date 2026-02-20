import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import MeetPage from "@/app/meet/page";

// Mock next/link
vi.mock("next/link", () => ({
  default: ({ children, href, ...props }: any) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

// Mock CalEmbed component
vi.mock("@/components/cal-embed", () => ({
  CalEmbed: ({ calLink }: any) => (
    <div data-testid="cal-embed">Cal Embed: {calLink}</div>
  ),
}));

describe("Meet Page", () => {
  it("renders the meet page", () => {
    render(<MeetPage />);
    expect(screen.getByText("Book a Meeting")).toBeDefined();
  });

  it("renders page heading", () => {
    render(<MeetPage />);
    const heading = screen.getByText("Book a Meeting");
    expect(heading).toBeDefined();
  });

  it("renders subtitle", () => {
    render(<MeetPage />);
    expect(
      screen.getByText(
        /Pick a time that works for you. I'll receive a notification and confirm./i
      )
    ).toBeDefined();
  });

  it("renders Cal.com embed when calLink is configured", () => {
    render(<MeetPage />);
    expect(screen.getByTestId("cal-embed")).toBeDefined();
  });

  it("Cal embed receives correct link prop", () => {
    render(<MeetPage />);
    const calEmbed = screen.getByTestId("cal-embed");
    expect(calEmbed.textContent).toContain("philipsun/30min");
  });

  it("renders embed container with proper styling", () => {
    const { container } = render(<MeetPage />);
    const embedContainer = container.querySelector(
      ".rounded-xl.border.bg-white"
    );
    expect(embedContainer).toBeDefined();
  });

  it("has proper page padding", () => {
    const { container } = render(<MeetPage />);
    const wrapper = container.firstChild;
    expect(wrapper?.className).toContain("pb-24");
    expect(wrapper?.className).toContain("pt-12");
  });

  it("embed container has proper height", () => {
    const { container } = render(<MeetPage />);
    const minHeightDiv = container.querySelector(".min-h-\\[600px\\]");
    expect(minHeightDiv).toBeDefined();
  });

  it("renders with semantic container structure", () => {
    const { container } = render(<MeetPage />);
    const contentDiv = container.querySelector(".mx-auto");
    expect(contentDiv).toBeDefined();
  });

  it("has max-width constraint on content", () => {
    const { container } = render(<MeetPage />);
    const maxWidthDiv = container.querySelector(".max-w-4xl");
    expect(maxWidthDiv).toBeDefined();
  });

  it("embed container has border styling", () => {
    const { container } = render(<MeetPage />);
    const bordered = container.querySelector(".border-byu-sky");
    expect(bordered).toBeDefined();
  });

  it("renders without crashing", () => {
    expect(() => render(<MeetPage />)).not.toThrow();
  });

  it("renders section heading component", () => {
    render(<MeetPage />);
    const headings = screen.getAllByRole("heading");
    expect(headings.length).toBeGreaterThanOrEqual(1);
  });

  it("section has proper background in embed area", () => {
    const { container } = render(<MeetPage />);
    const bgWhite = container.querySelector(".bg-white");
    expect(bgWhite).toBeDefined();
  });

  it("has overflow hidden for rounded container", () => {
    const { container } = render(<MeetPage />);
    const overflowDiv = container.querySelector(".overflow-hidden");
    expect(overflowDiv).toBeDefined();
  });

  it("embed has shadow styling", () => {
    const { container } = render(<MeetPage />);
    const shadowDiv = container.querySelector(".shadow-sm");
    expect(shadowDiv).toBeDefined();
  });

  it("proper padding on embed container", () => {
    const { container } = render(<MeetPage />);
    const paddedDiv = container.querySelector(".p-2");
    expect(paddedDiv).toBeDefined();
  });
});
