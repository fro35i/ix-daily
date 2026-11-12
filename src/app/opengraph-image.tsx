import { ImageResponse } from "next/og";
import { site } from "@/lib/site";

export const alt = site.name;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "flex-end",
        padding: 80,
        background: "#2f0163",
        color: "#ffffff",
      }}
    >
      <div style={{ fontSize: 96, fontWeight: 600 }}>{site.name}</div>
      <div style={{ marginTop: 24, fontSize: 36, color: "#dcc7ff" }}>
        Articles from the IBM iX blog
      </div>
    </div>,
    size,
  );
}
