import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { EditorialEntry } from "./editorial-entry";

describe("EditorialEntry", () => {
  it("renders title, description, and link", () => {
    render(
      <EditorialEntry
        index={0}
        title="Inara Health"
        description="A continuous progesterone monitor."
        href="/projects/inara-health"
      />,
    );
    expect(screen.getByRole("heading", { name: "Inara Health" })).toBeInTheDocument();
    expect(screen.getByText("A continuous progesterone monitor.")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /inara health/i })).toHaveAttribute(
      "href",
      "/projects/inara-health",
    );
  });

  it("uses left orientation on even index, right on odd", () => {
    const { container: even } = render(
      <EditorialEntry index={0} title="A" description="x" href="/a" />,
    );
    expect(even.querySelector(".editorial-asym-left")).not.toBeNull();

    const { container: odd } = render(
      <EditorialEntry index={1} title="B" description="y" href="/b" />,
    );
    expect(odd.querySelector(".editorial-asym-right")).not.toBeNull();
  });

  it("renders cover image when provided", () => {
    render(
      <EditorialEntry
        index={0}
        title="A"
        description="x"
        href="/a"
        cover={{ src: "/photography/landscape-1.svg", alt: "cover" }}
      />,
    );
    expect(screen.getByAltText("cover")).toBeInTheDocument();
  });

  it("renders the kicker numeral when provided", () => {
    render(
      <EditorialEntry index={0} title="A" description="x" href="/a" kicker="01" />,
    );
    expect(screen.getByText("01")).toBeInTheDocument();
  });
});
