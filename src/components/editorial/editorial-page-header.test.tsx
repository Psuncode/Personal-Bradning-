import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { EditorialPageHeader } from "./editorial-page-header";

describe("EditorialPageHeader", () => {
  it("renders the title as an h1", () => {
    render(<EditorialPageHeader title="Selected Work" />);
    expect(screen.getByRole("heading", { level: 1, name: "Selected Work" })).toBeInTheDocument();
  });

  it("renders the kicker when provided", () => {
    render(<EditorialPageHeader title="Selected Work" kicker="Projects" />);
    expect(screen.getByText("Projects")).toBeInTheDocument();
  });

  it("omits the kicker when not provided", () => {
    const { container } = render(<EditorialPageHeader title="Selected Work" />);
    expect(container.querySelector(".editorial-kicker")).toBeNull();
  });

  it("renders the sub-line when provided", () => {
    render(<EditorialPageHeader title="Selected Work" sub="A magazine of recent projects." />);
    expect(screen.getByText("A magazine of recent projects.")).toBeInTheDocument();
  });

  it("renders the numeral when provided", () => {
    render(<EditorialPageHeader title="Selected Work" numeral="01" />);
    expect(screen.getByText("01")).toBeInTheDocument();
  });
});
