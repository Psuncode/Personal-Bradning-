import { ImageResponse } from "next/og";

export const runtime = "edge";

export function GET() {
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
          Selected Work
        </div>
        <div
          style={{
            color: "#201c1a",
            fontSize: 96,
            fontWeight: 700,
            lineHeight: 1.04,
            letterSpacing: "-0.02em",
          }}
        >
          Philip Sun
        </div>
        <div
          style={{
            color: "#5f5851",
            fontSize: 26,
            lineHeight: 1.4,
            maxWidth: 880,
          }}
        >
          Portfolio of product, hardware, AI, and analytics work — alongside writing and photography.
        </div>
      </div>
    ),
    { width: 1200, height: 630 }
  );
}
