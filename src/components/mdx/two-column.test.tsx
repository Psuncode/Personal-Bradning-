import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { TwoColumn } from "./two-column";

describe("TwoColumn", () => {
  it("renders both children", () => {
    render(
      <TwoColumn>
        <div>Left side</div>
        <div>Right side</div>
      </TwoColumn>,
    );
    expect(screen.getByText("Left side")).toBeInTheDocument();
    expect(screen.getByText("Right side")).toBeInTheDocument();
  });

  it("uses md:grid-cols-2 wrapper", () => {
    const { container } = render(
      <TwoColumn>
        <div>a</div>
        <div>b</div>
      </TwoColumn>,
    );
    expect(container.querySelector(".md\\:grid-cols-2")).not.toBeNull();
  });
});
