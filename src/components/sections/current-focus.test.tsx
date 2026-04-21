import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { CurrentFocus } from "./current-focus";
import { currentFocus } from "@/data/current-focus";

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
    currentFocus.forEach((item) => {
      expect(screen.getByText(item.heading)).toBeDefined();
      expect(screen.getByText(item.body)).toBeDefined();
    });
  });

  it("uses the revised CTA wording for linked items", () => {
    render(<CurrentFocus />);
    const linkedItem = currentFocus.find((item) => item.href);
    expect(linkedItem).toBeDefined();

    const link = screen.getByRole("link", { name: new RegExp(linkedItem!.heading) });
    expect(link.tagName).toBe("A");
    expect(link.getAttribute("href")).toBe(linkedItem!.href);
    expect(screen.getByText(/Open the conversation/i)).toBeDefined();
  });
});
