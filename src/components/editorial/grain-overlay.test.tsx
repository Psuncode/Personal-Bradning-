import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { GrainOverlay } from "./grain-overlay";

describe("GrainOverlay", () => {
  it("renders a fixed, aria-hidden, non-interactive overlay", () => {
    const { container } = render(<GrainOverlay />);
    const el = container.firstChild as HTMLElement;
    expect(el).not.toBeNull();
    expect(el.classList.contains("grain-overlay")).toBe(true);
    expect(el.getAttribute("aria-hidden")).toBe("true");
    expect(el.getAttribute("role")).toBe("presentation");
  });
});
