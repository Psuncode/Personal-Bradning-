import { ImageResponse } from "next/og";
import { getPostBySlug } from "@/lib/blog";

export const runtime = "nodejs";

const MAX_TITLE_LEN = 90;

function truncate(s: string, max: number) {
  if (s.length <= max) return s;
  return s.slice(0, max - 1).trimEnd() + "…";
}

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) {
    return new Response("Not found", { status: 404 });
  }

  const title = truncate(post.frontmatter.title, MAX_TITLE_LEN);
  const date = post.frontmatter.date;

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
