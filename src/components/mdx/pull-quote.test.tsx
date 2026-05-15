import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { PullQuote } from "./pull-quote";

describe("PullQuote", () => {
  it("renders the quote children", () => {
    render(
      <PullQuote>The point of writing is to discover what you think.</PullQuote>,
    );
    expect(
      screen.getByText(/The point of writing is to discover what you think/),
    ).toBeInTheDocument();
  });

  it("renders attribution when provided", () => {
    render(<PullQuote attribution="Annie Dillard">A line.</PullQuote>);
    expect(screen.getByText(/Annie Dillard/)).toBeInTheDocument();
  });

  it("omits attribution when not provided", () => {
    const { container } = render(<PullQuote>A line.</PullQuote>);
    expect(container.querySelector("[data-attribution]")).toBeNull();
  });
});
