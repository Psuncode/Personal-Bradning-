import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import WorkHistoryPage from "./page";

describe("/work-history page", () => {
  it("renders the page header 'Work history'", () => {
    render(<WorkHistoryPage />);
    expect(
      screen.getByRole("heading", { level: 1, name: /work history/i }),
    ).toBeInTheDocument();
  });

  it("lists past employment entries (LDS, Nursa, Granger, Cocker)", () => {
    render(<WorkHistoryPage />);
    expect(screen.getAllByText(/LDS Church/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Nursa/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Granger Medical/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Cocker/i).length).toBeGreaterThan(0);
  });

  it("links each entry to its /projects/<slug> page", () => {
    render(<WorkHistoryPage />);
    const ldsLink = screen.getByRole("link", { name: /LDS Church/i });
    expect(ldsLink).toHaveAttribute("href", "/projects/lds-church-pm");
  });

  it("does NOT include Inara (the marquee project)", () => {
    render(<WorkHistoryPage />);
    expect(screen.queryByText(/Inara Health/i)).not.toBeInTheDocument();
    expect(
      screen.queryByRole("link", { name: /inara/i }),
    ).not.toBeInTheDocument();
  });
});
