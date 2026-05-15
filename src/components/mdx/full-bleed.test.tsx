import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { FullBleed } from "./full-bleed";

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

describe("FullBleed", () => {
  it("renders an edge-to-edge image with alt text", () => {
    render(<FullBleed slug="post" src="./hero.jpg" alt="Hero photo" />);
    expect(screen.getByAltText("Hero photo")).toBeInTheDocument();
  });

  it("renders an optional caption below at shell width", () => {
    render(
      <FullBleed
        slug="post"
        src="./hero.jpg"
        alt="x"
        caption="A view from above."
      />,
    );
    expect(screen.getByText("A view from above.")).toBeInTheDocument();
  });
});
