import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

/**
 * Apple-touch-icon · 180×180 monogram for iOS home screens.
 * Bigger canvas, full "RV" mark on cream with a marigold accent dot.
 */
export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          background: "#0d1b12",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          color: "#f4efe2",
          fontFamily: "Georgia, serif",
        }}
      >
        <div
          style={{
            fontSize: 96,
            fontWeight: 500,
            fontStyle: "italic",
            letterSpacing: "-0.05em",
            lineHeight: 1,
          }}
        >
          RV
        </div>
        <div
          style={{
            marginTop: 14,
            width: 10,
            height: 10,
            borderRadius: "50%",
            background: "#d89a3e",
          }}
        />
      </div>
    ),
    { ...size },
  );
}
