import { ImageResponse } from "next/og";
import { getSiteUrl, siteConfig } from "@/lib/site";

export const dynamic = "force-static";

export const size = {
  width: 1200,
  height: 630,
};

export const contentType = "image/png";

export default function OpenGraphImage() {
  const siteLabel = new URL(getSiteUrl()).host;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "linear-gradient(135deg, #0b1220 0%, #1e293b 48%, #0f172a 100%)",
          color: "#f8fafc",
          padding: "64px",
          fontFamily: "Arial, sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            fontSize: 28,
            fontWeight: 700,
            letterSpacing: "0.06em",
            textTransform: "uppercase",
            color: "#cbd5e1",
          }}
        >
          Canciones Cristianas
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <div
            style={{
              fontSize: 78,
              lineHeight: 1.06,
              fontWeight: 800,
              letterSpacing: "-0.02em",
              display: "flex",
            }}
          >
            {siteConfig.name}
          </div>
          <div
            style={{
              fontSize: 34,
              lineHeight: 1.3,
              color: "#dbeafe",
              maxWidth: "92%",
              display: "flex",
            }}
          >
            Letras, reflexiones devocionales y videos de alabanza
          </div>
        </div>

        <div
          style={{
            fontSize: 24,
            color: "#93c5fd",
            display: "flex",
          }}
        >
          {siteLabel}
        </div>
      </div>
    ),
    size
  );
}
