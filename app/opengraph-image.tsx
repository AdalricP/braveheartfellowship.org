import { ImageResponse } from "next/og";

export const alt = "Braveheart Fellowship social preview";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          alignItems: "stretch",
          background: "#5a0a14",
          color: "#fff8eb",
          display: "flex",
          height: "100%",
          overflow: "hidden",
          position: "relative",
          width: "100%",
        }}
      >
        <div
          style={{
            background:
              "radial-gradient(circle at 78% 22%, rgba(214, 153, 71, 0.28), transparent 30%), radial-gradient(circle at 22% 76%, rgba(255, 248, 235, 0.14), transparent 30%), linear-gradient(135deg, #5a0a14 0%, #6f101b 48%, #3f0710 100%)",
            display: "flex",
            inset: 0,
            position: "absolute",
          }}
        />
        <div
          style={{
            backgroundImage:
              "linear-gradient(rgba(255, 248, 235, 0.055) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 248, 235, 0.055) 1px, transparent 1px)",
            backgroundSize: "48px 48px",
            display: "flex",
            inset: 0,
            maskImage: "linear-gradient(90deg, rgba(0,0,0,0.78), rgba(0,0,0,0.18))",
            position: "absolute",
          }}
        />
        <div
          style={{
            border: "1px solid rgba(255, 248, 235, 0.18)",
            display: "flex",
            inset: 38,
            position: "absolute",
          }}
        />
        <img
          alt=""
          src="https://braveheartfellowship.org/assets/icon.png"
          style={{
            borderRadius: 24,
            height: 118,
            objectFit: "cover",
            position: "absolute",
            right: 78,
            top: 70,
            width: 118,
          }}
        />
        <div
          style={{
            alignItems: "flex-start",
            display: "flex",
            flexDirection: "column",
            height: "100%",
            justifyContent: "space-between",
            padding: "82px 92px 72px",
            position: "relative",
            width: "100%",
          }}
        >
          <div
            style={{
              color: "rgba(255, 248, 235, 0.7)",
              display: "flex",
              fontSize: 26,
              letterSpacing: 6,
              textTransform: "uppercase",
            }}
          >
            Audentes Fortuna Iuvat
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 26, maxWidth: 890 }}>
            <div
              style={{
                color: "#fff8eb",
                display: "flex",
                fontSize: 96,
                fontWeight: 600,
                letterSpacing: -2,
                lineHeight: 0.94,
              }}
            >
              Braveheart Fellowship
            </div>
            <div
              style={{
                color: "rgba(255, 248, 235, 0.82)",
                display: "flex",
                fontSize: 33,
                lineHeight: 1.24,
                maxWidth: 780,
              }}
            >
              Backing young founders and researchers willing to go against the world in pursuit of truth.
            </div>
          </div>
          <div
            style={{
              alignItems: "center",
              color: "rgba(255, 248, 235, 0.68)",
              display: "flex",
              fontSize: 24,
              justifyContent: "space-between",
              width: "100%",
            }}
          >
            <span>braveheartfellowship.org</span>
            <span style={{ color: "#d69947" }}>fellowship / grant</span>
          </div>
        </div>
      </div>
    ),
    size,
  );
}
