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
    src: "/photography/landscape-1.svg",
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

  it("applies view-transition-name on the image", () => {
    const { container } = render(<ProjectCover project={baseProject} />);
    const img = container.querySelector("img");
    expect(img?.getAttribute("style") || "").toContain("view-transition-name");
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
