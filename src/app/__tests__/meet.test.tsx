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

  it("links to LinkedIn as a scheduling fallback", () => {
    render(<MeetPage />);
    const linkedin = screen.getByText(/LinkedIn/i);
    const anchor = linkedin.closest("a");
    expect(anchor?.getAttribute("href")).toContain("linkedin.com");
    expect(anchor?.getAttribute("target")).toBe("_blank");
  });
});
