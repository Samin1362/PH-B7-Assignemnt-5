import { ImageResponse } from "next/og";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "GearUp — rent sports and outdoor gear instantly";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#0b1120",
          color: "#ffffff",
          padding: 72,
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <div
            style={{
              width: 64,
              height: 64,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "#fb923c",
              borderRadius: 16,
              color: "#0b1120",
              fontSize: 40,
              fontWeight: 700,
            }}
          >
            G
          </div>
          <div style={{ fontSize: 44, fontWeight: 700 }}>GearUp</div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{ fontSize: 68, fontWeight: 700, lineHeight: 1.1 }}>
            Rent sports &amp; outdoor gear
          </div>
          <div style={{ fontSize: 34, color: "#94a3b8" }}>
            Tents, bikes, boards and kayaks from trusted local providers.
          </div>
        </div>

        <div style={{ display: "flex", gap: 28, fontSize: 26, color: "#fb923c" }}>
          <span>Browse</span>
          <span>Book</span>
          <span>Pay securely</span>
        </div>
      </div>
    ),
    size,
  );
}
