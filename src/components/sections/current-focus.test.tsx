import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { CurrentFocus } from "./current-focus";

vi.mock("next/link", () => ({
  default: ({ children, href, ...props }: any) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

describe("CurrentFocus", () => {
  it("renders the desk-notes heading", () => {
    render(<CurrentFocus />);
    expect(screen.getByText(/Current Focus/i)).toBeDefined();
    expect(screen.getByText(/Signals from the desk/i)).toBeDefined();
  });

  it("renders the focus items from data", () => {
    render(<CurrentFocus />);
    expect(screen.getAllByText(/Building|Reading|Open To/i).length).toBeGreaterThan(0);
  });

  it("uses the revised CTA wording for linked items", () => {
    render(<CurrentFocus />);
    expect(screen.getByText(/Open the conversation/i)).toBeDefined();
  });
});
