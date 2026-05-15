import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ProjectCover } from "./project-cover";
import type { Project } from "@/types";

const baseProject: Project = {
  id: "test",
  slug: "test",
  title: "Test Project",
  description: "d",
  techStack: [],
  coverImage: {
    src: "/images/projects/test-cover.jpg",
    alt: "test cover",
    layout: "overlay",
  },
};

describe("ProjectCover", () => {
  it("renders the cover image with correct alt", () => {
    render(<ProjectCover project={baseProject} />);
    expect(screen.getByAltText("test cover")).toBeInTheDocument();
  });

  it("renders the project title as an h1", () => {
    render(<ProjectCover project={baseProject} />);
    expect(screen.getByRole("heading", { level: 1, name: "Test Project" })).toBeInTheDocument();
  });

  it("applies view-transition-name on the cover element", () => {
    const { container } = render(<ProjectCover project={baseProject} />);
    const styled = Array.from(container.querySelectorAll("[style]")).find((el) =>
      el.getAttribute("style")?.includes("view-transition-name"),
    );
    expect(styled).toBeTruthy();
  });

  it("uses overlay layout when project.coverImage.layout is overlay", () => {
    const { container } = render(<ProjectCover project={baseProject} />);
    expect(container.querySelector("[data-layout='overlay']")).not.toBeNull();
  });

  it("uses beside layout when project.coverImage.layout is beside", () => {
    const beside = {
      ...baseProject,
      coverImage: { ...baseProject.coverImage, layout: "beside" as const },
    };
    const { container } = render(<ProjectCover project={beside} />);
    expect(container.querySelector("[data-layout='beside']")).not.toBeNull();
  });
});
