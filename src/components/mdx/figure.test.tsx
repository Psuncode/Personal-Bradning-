import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { Figure } from "./figure";

vi.mock("next/image", () => ({
  default: (props: Record<string, unknown>) => {
    // eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text
    return <img {...(props as { src: string; alt: string })} />;
  },
}));

vi.mock("@/lib/blog-assets", () => ({
  resolveBlogAsset: (slug: string, rel: string) => ({
    src: `/_blog-assets/${slug}/${rel.replace(/^\.\//, "")}`,
    blurDataURL:
      rel === "./has-blur.jpg" ? "data:image/jpeg;base64,XYZ" : undefined,
  }),
}));

describe("Figure", () => {
  it("renders the image with alt text and shell-width caption", () => {
    render(
      <Figure
        slug="post"
        src="./photo.jpg"
        alt="A photo"
        caption="Caption text"
      />,
    );
    expect(screen.getByAltText("A photo")).toBeInTheDocument();
    expect(screen.getByText("Caption text")).toBeInTheDocument();
  });

  it("uses an empty alt when caption is provided without alt (decorative)", () => {
    const { container } = render(
      <Figure slug="post" src="./photo.jpg" caption="Just a caption" />,
    );
    const img = container.querySelector("img");
    expect(img?.getAttribute("alt")).toBe("");
  });

  it("forwards blurDataURL when the resolver returns one", () => {
    const { container } = render(
      <Figure slug="post" src="./has-blur.jpg" alt="x" />,
    );
    const img = container.querySelector("img");
    expect(img?.getAttribute("placeholder")).toBe("blur");
  });
});
