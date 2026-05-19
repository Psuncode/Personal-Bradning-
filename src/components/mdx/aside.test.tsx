import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Aside } from "./aside";

describe("Aside", () => {
  it("renders the body content", () => {
    render(<Aside>A margin note.</Aside>);
    expect(screen.getByText("A margin note.")).toBeInTheDocument();
  });

  it("uses an aside element with margin-note styling classes", () => {
    const { container } = render(<Aside>x</Aside>);
    const el = container.querySelector("aside");
    expect(el).not.toBeNull();
    expect(el?.className).toMatch(/border-l/);
  });
});
