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

const placeholderProject: Project = {
  ...baseProject,
  id: "inara",
  slug: "inara",
  title: "Inara Health Diagnostic",
  coverImage: {
    src: "/photography/landscape-1.svg",
    alt: "placeholder cover",
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

  describe("typography plate fallback", () => {
    it("renders a typography plate (not an <img>) when the cover is a placeholder SVG", () => {
      render(<ProjectCover project={placeholderProject} />);
      expect(screen.getByTestId("project-cover-plate")).toBeInTheDocument();
      expect(screen.queryByAltText("placeholder cover")).toBeNull();
    });

    it("renders a real image when the cover is a raster path", () => {
      render(<ProjectCover project={baseProject} />);
      expect(screen.getByAltText("test cover")).toBeInTheDocument();
      expect(screen.queryByTestId("project-cover-plate")).toBeNull();
    });

    it("includes the project title in accessible h1 even when the plate is used", () => {
      render(<ProjectCover project={placeholderProject} />);
      expect(
        screen.getByRole("heading", { level: 1, name: "Inara Health Diagnostic" }),
      ).toBeInTheDocument();
    });

    it("shows a 'Plate' kicker label in the plate", () => {
      render(<ProjectCover project={placeholderProject} numeral="03" />);
      expect(screen.getByText("Plate 03")).toBeInTheDocument();
    });

    it("renders the plate variant for the beside layout too", () => {
      const besidePlaceholder: Project = {
        ...placeholderProject,
        coverImage: { ...placeholderProject.coverImage, layout: "beside" },
      };
      render(<ProjectCover project={besidePlaceholder} />);
      expect(screen.getByTestId("project-cover-plate")).toBeInTheDocument();
    });

    it("treats a missing src as a placeholder and renders the plate", () => {
      const missing: Project = {
        ...placeholderProject,
        coverImage: { ...placeholderProject.coverImage, src: "" },
      };
      render(<ProjectCover project={missing} />);
      expect(screen.getByTestId("project-cover-plate")).toBeInTheDocument();
    });
  });
});
