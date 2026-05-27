import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { SectionHeading } from "./section-heading";

describe("SectionHeading Component", () => {
  it("renders the section heading with title", () => {
    render(<SectionHeading title="Test Title" />);
    expect(screen.getByText("Test Title")).toBeDefined();
  });

  it("renders the heading as h2 element", () => {
    const { container } = render(<SectionHeading title="Test Title" />);
    const heading = container.querySelector("h2");
    expect(heading?.textContent).toBe("Test Title");
  });

  it("renders subtitle when provided", () => {
    render(<SectionHeading title="Main" subtitle="Sub" />);
    expect(screen.getByText("Sub")).toBeDefined();
  });

  it("does not render subtitle when not provided", () => {
    const { container } = render(<SectionHeading title="Main" />);
    const paragraph = container.querySelector("p");
    expect(paragraph).toBeNull();
  });

  it("renders decorative underline", () => {
    const { container } = render(<SectionHeading title="Test" />);
    const underline = container.querySelector(".h-1");
    expect(underline).toBeDefined();
  });

  it("centers text by default", () => {
    const { container } = render(<SectionHeading title="Test" />);
    const wrapper = container.querySelector(".mb-12");
    expect(wrapper?.className).toContain("text-center");
  });

  it("aligns text to left when align prop is 'left'", () => {
    const { container } = render(
      <SectionHeading title="Test" align="left" />
    );
    const wrapper = container.querySelector(".mb-12");
    expect(wrapper?.className).toContain("text-left");
    expect(wrapper?.className).not.toContain("text-center");
  });

  it("centers underline when align is center", () => {
    const { container } = render(
      <SectionHeading title="Test" align="center" />
    );
    const underline = container.querySelector(".h-1");
    expect(underline?.className).toContain("mx-auto");
  });

  it("does not center underline when align is left", () => {
    const { container } = render(
      <SectionHeading title="Test" align="left" />
    );
    const underline = container.querySelector(".h-1");
    expect(underline?.className).not.toContain("mx-auto");
  });

  it("applies correct heading styling", () => {
    const { container } = render(<SectionHeading title="Test" />);
    const heading = container.querySelector("h2");
    expect(heading?.className).toContain("text-3xl");
    expect(heading?.className).toContain("font-bold");
    expect(heading?.className).toContain("text-byu-navy");
  });

  it("has responsive heading size", () => {
    const { container } = render(<SectionHeading title="Test" />);
    const heading = container.querySelector("h2");
    expect(heading?.className).toContain("sm:text-4xl");
  });

  it("applies custom className when provided", () => {
    const { container } = render(
      <SectionHeading title="Test" className="custom-class" />
    );
    const wrapper = container.querySelector(".mb-12");
    expect(wrapper?.className).toContain("custom-class");
  });

  it("subtitle has correct styling", () => {
    const { container } = render(
      <SectionHeading title="Main" subtitle="Sub" />
    );
    const subtitle = container.querySelector("p");
    expect(subtitle?.className).toContain("text-lg");
    expect(subtitle?.className).toContain("text-byu-dark-gray");
  });

  it("underline has correct color", () => {
    const { container } = render(<SectionHeading title="Test" />);
    const underline = container.querySelector(".h-1");
    expect(underline?.className).toContain("bg-byu-light-blue");
  });

  it("renders wrapper div with proper spacing", () => {
    const { container } = render(<SectionHeading title="Test" />);
    const wrapper = container.querySelector(".mb-12");
    expect(wrapper?.className).toContain("mb-12");
  });

  it("has margin between title and subtitle", () => {
    const { container } = render(
      <SectionHeading title="Main" subtitle="Sub" />
    );
    const subtitle = container.querySelector("p");
    expect(subtitle?.className).toContain("mt-4");
  });

  it("has margin between subtitle and underline", () => {
    const { container } = render(
      <SectionHeading title="Main" subtitle="Sub" />
    );
    const underline = container.querySelector(".h-1");
    expect(underline?.className).toContain("mt-4");
  });

  it("renders without crashing", () => {
    expect(() =>
      render(<SectionHeading title="Test" subtitle="Sub" />)
    ).not.toThrow();
  });

  it("handles empty strings correctly", () => {
    render(<SectionHeading title="" subtitle="" />);
    const heading = screen.getByRole("heading");
    expect(heading).toBeDefined();
  });

  it("handles long titles correctly", () => {
    const longTitle = "This is a very long section heading that spans multiple words";
    render(<SectionHeading title={longTitle} />);
    expect(screen.getByText(longTitle)).toBeDefined();
  });
});
