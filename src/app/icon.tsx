import { ImageResponse } from "next/og";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

/** The Trail Amber tile from the wordmark, drawn as the favicon. */
export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#c2410c",
          borderRadius: 7,
          color: "#ffffff",
          fontSize: 22,
          fontWeight: 700,
        }}
      >
        G
      </div>
    ),
    size,
  );
}
