import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ProjectNavLinks } from "./project-nav-links";
import type { Project } from "@/types";

const make = (id: string): Project => ({
  id,
  slug: id,
  title: id,
  description: "",
  techStack: [],
  coverImage: { src: "/photography/landscape-1.svg", alt: "x", layout: "overlay" },
});

const all = [make("a"), make("b"), make("c")];

describe("ProjectNavLinks", () => {
  it("renders prev and next when in the middle", () => {
    render(<ProjectNavLinks current={all[1]} all={all} />);
    expect(screen.getByRole("link", { name: /a/i })).toHaveAttribute("href", "/projects/a");
    expect(screen.getByRole("link", { name: /c/i })).toHaveAttribute("href", "/projects/c");
  });

  it("omits prev on the first project", () => {
    render(<ProjectNavLinks current={all[0]} all={all} />);
    expect(screen.queryByRole("link", { name: /previous/i })).toBeNull();
    expect(screen.getByRole("link", { name: /b/i })).toBeInTheDocument();
  });

  it("omits next on the last project", () => {
    render(<ProjectNavLinks current={all[2]} all={all} />);
    expect(screen.queryByRole("link", { name: /next/i })).toBeNull();
    expect(screen.getByRole("link", { name: /b/i })).toBeInTheDocument();
  });
});
