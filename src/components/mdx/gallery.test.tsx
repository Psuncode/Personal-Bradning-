import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { Gallery } from "./gallery";

vi.mock("next/image", () => ({
  default: (props: Record<string, unknown>) => (
    // eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text
    <img {...(props as { src: string; alt: string })} />
  ),
}));

vi.mock("@/lib/blog-assets", () => ({
  resolveBlogAsset: (slug: string, rel: string) => ({
    src: `/_blog-assets/${slug}/${rel.replace(/^\.\//, "")}`,
  }),
}));

describe("Gallery", () => {
  it("renders one img per image entry with its alt", () => {
    render(
      <Gallery
        slug="p"
        images={[
          { src: "./a.jpg", alt: "Photo A" },
          { src: "./b.jpg", alt: "Photo B" },
          { src: "./c.jpg", alt: "Photo C" },
        ]}
      />,
    );
    expect(screen.getByAltText("Photo A")).toBeInTheDocument();
    expect(screen.getByAltText("Photo B")).toBeInTheDocument();
    expect(screen.getByAltText("Photo C")).toBeInTheDocument();
  });

  it("uses 3-column grid when columns=3", () => {
    const { container } = render(
      <Gallery
        slug="p"
        columns={3}
        images={[{ src: "./a.jpg", alt: "A" }]}
      />,
    );
    expect(container.querySelector(".md\\:grid-cols-3")).not.toBeNull();
  });

  it("defaults to 2 columns", () => {
    const { container } = render(
      <Gallery slug="p" images={[{ src: "./a.jpg", alt: "A" }]} />,
    );
    expect(container.querySelector(".md\\:grid-cols-2")).not.toBeNull();
  });
});
