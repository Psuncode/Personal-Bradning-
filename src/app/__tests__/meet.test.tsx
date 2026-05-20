import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import MeetPage from "@/app/(main)/meet/page";
import { siteConfig } from "@/data/site-config";

vi.mock("@/components/cal-embed", () => ({
  CalEmbed: ({ calLink }: { calLink: string }) => (
    <div data-testid="cal-embed" data-cal-link={calLink} />
  ),
}));

describe("Meet page (/meet)", () => {
  it("renders the editorial heading and kicker", () => {
    render(<MeetPage />);
    expect(screen.getByText("Book a quick chat")).toBeDefined();
    expect(screen.getByText(/Let's talk/i)).toBeDefined();
  });

  it("mounts the Cal.com embed with the configured quick-chat event link", () => {
    render(<MeetPage />);
    const embed = screen.getByTestId("cal-embed");
    expect(embed).toBeDefined();
    expect(embed.getAttribute("data-cal-link")).toBe(
      `${siteConfig.cal.username}/${siteConfig.cal.quickChatEventSlug}`,
    );
  });

  it("renders the How it works steps", () => {
    render(<MeetPage />);
    expect(screen.getByText(/Pick a date and time/i)).toBeDefined();
    expect(screen.getByText(/calendar invite from Cal\.com/i)).toBeDefined();
  });
});
