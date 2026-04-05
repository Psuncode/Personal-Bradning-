import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import PhotographyPage from "@/app/(photography)/photography/page";

vi.mock("next/link", () => ({
  default: ({ children, href, ...props }: any) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

vi.mock("next/image", () => ({
  default: ({ alt, fill: _fill, priority: _priority, src, ...props }: any) => (
    <img alt={alt} src={src} {...props} />
  ),
}));

describe("Photography Page", () => {
  it("renders Utah couples and portrait landing page content", () => {
    render(<PhotographyPage />);

    expect(
      screen.getByRole("heading", {
        level: 1,
        name: /Utah Couples & Portrait Photographer/i,
      }),
    ).toBeDefined();
    expect(
      screen.getByText(/Serving Provo, Utah County, and Salt Lake City/i),
    ).toBeDefined();
    expect(screen.getAllByRole("link", { name: /Book a Session/i }).length).toBeGreaterThan(0);
    expect(screen.getAllByRole("link", { name: /View Pricing/i }).length).toBeGreaterThan(0);
  });
});
