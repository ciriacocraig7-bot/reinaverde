import { ImageResponse } from "next/og";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

/**
 * App icon · 32x32 monogram for browser tabs.
 * Ink background with a serif "R" in cream.
 */
export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          background: "#0d1b12",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#f4efe2",
          fontFamily: "Georgia, serif",
          fontSize: 22,
          fontWeight: 500,
          fontStyle: "italic",
          letterSpacing: "-0.04em",
        }}
      >
        R
      </div>
    ),
    { ...size },
  );
}
