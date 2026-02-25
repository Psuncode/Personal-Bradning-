import { ImageResponse } from "next/og";

export const runtime = "edge";

export function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          background: "#002E5D",
          width: "1200px",
          height: "630px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "80px",
        }}
      >
        <div style={{ color: "#C5E3F6", fontSize: 24, marginBottom: 16 }}>
          philipsun.com
        </div>
        <div
          style={{
            color: "#FFFFFF",
            fontSize: 64,
            fontWeight: 700,
            lineHeight: 1.1,
          }}
        >
          Philip Sun
        </div>
        <div style={{ color: "#6BB1E0", fontSize: 28, marginTop: 16 }}>
          Product · Founder · Investor
        </div>
      </div>
    ),
    { width: 1200, height: 630 }
  );
}
