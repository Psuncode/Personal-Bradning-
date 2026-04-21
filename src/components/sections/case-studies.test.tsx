import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { CaseStudies } from "./case-studies";

vi.mock("next/link", () => ({
  default: ({ children, href, ...props }: any) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

vi.mock("next/image", () => ({
  default: ({ alt }: any) => <img alt={alt} />,
}));

describe("CaseStudies", () => {
  it("renders the refined proof-section heading", () => {
    render(<CaseStudies />);

    expect(screen.getByText(/Selected Work/i)).toBeDefined();
    expect(
      screen.getByText(/A few cases where strategy met measurable execution/i),
    ).toBeDefined();
  });

  it("renders case study links", () => {
    render(<CaseStudies />);

    expect(screen.getAllByText(/View Full Case Study/i).length).toBeGreaterThan(0);
  });
});
