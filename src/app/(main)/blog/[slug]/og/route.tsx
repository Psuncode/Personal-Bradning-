import { ImageResponse } from "next/og";
import { getPostBySlug } from "@/lib/blog";

export const runtime = "nodejs";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const post = getPostBySlug(slug);

  const title = post?.frontmatter.title ?? "Writing";
  const date = post?.frontmatter.date ?? "";

  return new ImageResponse(
    (
      <div
        style={{
          background: "#f4efe6",
          width: "1200px",
          height: "630px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "80px",
          fontFamily: "Georgia, serif",
        }}
      >
        <div
          style={{
            color: "#5f2f2a",
            fontSize: 18,
            letterSpacing: "0.28em",
            textTransform: "uppercase",
          }}
        >
          Writing{date ? ` · ${date}` : ""}
        </div>
        <div
          style={{
            color: "#201c1a",
            fontSize: 84,
            fontWeight: 700,
            lineHeight: 1.04,
            letterSpacing: "-0.02em",
            maxWidth: 1000,
          }}
        >
          {title}
        </div>
        <div
          style={{
            color: "#5f5851",
            fontSize: 22,
            lineHeight: 1.4,
          }}
        >
          philipsun.com
        </div>
      </div>
    ),
    { width: 1200, height: 630 },
  );
}
