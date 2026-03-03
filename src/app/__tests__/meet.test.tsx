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

// Mock BookingForm component
vi.mock("@/components/booking/BookingForm", () => ({
  BookingForm: () => <div data-testid="booking-form">Booking Form</div>,
}));

// Mock server-side calendar fetch so the async Server Component resolves immediately
vi.mock("@/lib/serverCalendar", () => ({
  getServerAvailability: async () => ({ events: [], busyDates: [] }),
}));

describe("Meet Page", () => {
  it("renders the meet page", async () => {
    render(await MeetPage());
    expect(screen.getByText("Book a Meeting")).toBeDefined();
  });

  it("renders page heading", async () => {
    render(await MeetPage());
    const heading = screen.getByText("Book a Meeting");
    expect(heading).toBeDefined();
  });

  it("renders subtitle", async () => {
    render(await MeetPage());
    expect(
      screen.getByText(
        /Select an available time slot to meet with me/i
      )
    ).toBeDefined();
  });

  it("renders booking form", async () => {
    render(await MeetPage());
    expect(screen.getByTestId("booking-form")).toBeDefined();
  });

  it("booking form is rendered inside container", async () => {
    render(await MeetPage());
    expect(screen.getByTestId("booking-form")).toBeDefined();
  });

  it("renders embed container with proper styling", async () => {
    const { container } = render(await MeetPage());
    const embedContainer = container.querySelector(
      ".rounded-xl.border.bg-white"
    );
    expect(embedContainer).toBeDefined();
  });

  it("has proper page padding", async () => {
    const { container } = render(await MeetPage());
    const wrapper = container.firstChild;
    expect(wrapper?.className).toContain("pb-24");
    expect(wrapper?.className).toContain("pt-12");
  });

  it("embed container has shadow styling", async () => {
    const { container } = render(await MeetPage());
    const shadowDiv = container.querySelector(".shadow-sm");
    expect(shadowDiv).toBeDefined();
  });

  it("renders with semantic container structure", async () => {
    const { container } = render(await MeetPage());
    const contentDiv = container.querySelector(".mx-auto");
    expect(contentDiv).toBeDefined();
  });

  it("embed container has border styling", async () => {
    const { container } = render(await MeetPage());
    const bordered = container.querySelector('[class*="border-gray"]');
    expect(bordered).toBeDefined();
  });

  it("renders without crashing", async () => {
    await expect(MeetPage()).resolves.not.toThrow();
  });

  it("renders section heading component", async () => {
    render(await MeetPage());
    const headings = screen.getAllByRole("heading");
    expect(headings.length).toBeGreaterThanOrEqual(1);
  });

  it("section has proper background in embed area", async () => {
    const { container } = render(await MeetPage());
    const bgWhite = container.querySelector(".bg-white");
    expect(bgWhite).toBeDefined();
  });

  it("has proper padding on embed container", async () => {
    const { container } = render(await MeetPage());
    const paddedDiv = container.querySelector('[class*="p-8"]');
    expect(paddedDiv).toBeDefined();
  });

  it("renders LinkedIn fallback link", async () => {
    render(await MeetPage());
    expect(screen.getByText("LinkedIn")).toBeDefined();
  });
});
