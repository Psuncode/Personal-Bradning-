import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Elsewhere } from "./elsewhere";

describe("Elsewhere", () => {
  it("renders the ELSEWHERE eyebrow", () => {
    render(<Elsewhere />);
    expect(screen.getByText(/Elsewhere/i)).toBeDefined();
  });

  it("renders the four expected labels", () => {
    render(<Elsewhere />);
    expect(screen.getByText("Photography")).toBeDefined();
    expect(screen.getByText("Freely Sweet")).toBeDefined();
    expect(screen.getByText("GitHub")).toBeDefined();
    expect(screen.getByText("LinkedIn")).toBeDefined();
  });

  it("each external link opens in a new tab with noopener noreferrer", () => {
    const { container } = render(<Elsewhere />);
    const anchors = container.querySelectorAll("a");
    expect(anchors.length).toBe(4);
    anchors.forEach((a) => {
      expect(a.getAttribute("target")).toBe("_blank");
      expect(a.getAttribute("rel")).toContain("noopener");
      expect(a.getAttribute("rel")).toContain("noreferrer");
    });
  });

  it("GitHub row points to github.com/Psuncode", () => {
    render(<Elsewhere />);
    const github = screen.getByText("@Psuncode");
    expect(github.closest("a")?.getAttribute("href")).toContain("github.com/Psuncode");
  });

  it("LinkedIn row points to linkedin", () => {
    render(<Elsewhere />);
    const linkedin = screen.getByText("/in/philip-sun");
    expect(linkedin.closest("a")?.getAttribute("href")).toContain("linkedin.com");
  });

  it("does NOT render any <img> elements", () => {
    const { container } = render(<Elsewhere />);
    expect(container.querySelectorAll("img").length).toBe(0);
  });
});
