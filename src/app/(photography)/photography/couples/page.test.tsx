import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import CouplesPhotographyPage from "@/app/(photography)/photography/couples/page";

vi.mock("next/link", () => ({
  default: ({ children, href, ...props }: any) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

describe("Couples Photography Page", () => {
  it("renders Utah couples photography SEO page content", () => {
    render(<CouplesPhotographyPage />);

    expect(
      screen.getByRole("heading", {
        level: 1,
        name: "Utah Couples Photography",
      }),
    ).toBeDefined();
    expect(
      screen.getByText(/engagements, anniversaries, and everyday couples sessions/i),
    ).toBeDefined();
    expect(
      screen.getByRole("link", { name: "Book a Couples Session" }),
    ).toBeDefined();
  });
});
