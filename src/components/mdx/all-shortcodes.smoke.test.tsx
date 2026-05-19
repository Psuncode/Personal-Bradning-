import { render } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { Figure } from "./figure";
import { FullBleed } from "./full-bleed";
import { Gallery } from "./gallery";
import { PullQuote } from "./pull-quote";
import { TwoColumn } from "./two-column";
import { Aside } from "./aside";

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

describe("All shortcodes render together", () => {
  it("does not throw", () => {
    expect(() =>
      render(
        <>
          <Figure slug="x" src="./a.jpg" alt="a" caption="cap" />
          <FullBleed slug="x" src="./b.jpg" alt="b" caption="cap" />
          <Gallery
            slug="x"
            columns={3}
            images={[
              { src: "./c.jpg", alt: "c" },
              { src: "./d.jpg", alt: "d" },
              { src: "./e.jpg", alt: "e" },
            ]}
          />
          <PullQuote attribution="Author">Sample quote.</PullQuote>
          <TwoColumn>
            <div>Left</div>
            <div>Right</div>
          </TwoColumn>
          <Aside>Aside body.</Aside>
        </>,
      ),
    ).not.toThrow();
  });
});
