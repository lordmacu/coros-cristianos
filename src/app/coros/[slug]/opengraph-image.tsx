import { ImageResponse } from "next/og";
import { getAllSongPosts, getSongPostBySlug, splitAuthors } from "@/lib/song-posts";

export const dynamic = "force-static";

export async function generateStaticParams() {
  const songs = await getAllSongPosts();
  return songs.map((s) => ({ slug: s.slug }));
}

export const size = {
  width: 1200,
  height: 630,
};

export const contentType = "image/png";

type OgImageProps = {
  params: Promise<{ slug: string }>;
};

export default async function OgImage({ params }: OgImageProps) {
  const { slug } = await params;
  const post = await getSongPostBySlug(slug);

  if (!post) {
    return new ImageResponse(
      (
        <div
          style={{
            width: "100%",
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "#0f172a",
            color: "#f8fafc",
            fontSize: 58,
            fontWeight: 700,
            padding: 64,
            textAlign: "center",
          }}
        >
          Coro no encontrado
        </div>
      ),
      size
    );
  }

  const authorLabel = splitAuthors(post.author).join(", ");

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "linear-gradient(135deg, #0b1220 0%, #1e293b 45%, #1f2937 100%)",
          color: "#f8fafc",
          padding: "58px 62px",
          fontFamily: "Arial, sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 14,
            fontSize: 28,
            fontWeight: 700,
            color: "#cbd5e1",
            letterSpacing: "0.06em",
            textTransform: "uppercase",
          }}
        >
          Coros Cristianos
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <div
            style={{
              fontSize: 64,
              lineHeight: 1.08,
              fontWeight: 800,
              letterSpacing: "-0.02em",
              display: "flex",
            }}
          >
            {post.title}
          </div>
          <div style={{ fontSize: 32, color: "#dbeafe", fontWeight: 600, display: "flex" }}>{authorLabel}</div>
          {post.album ? (
            <div style={{ fontSize: 28, color: "#bfdbfe", fontWeight: 500, display: "flex" }}>Album: {post.album}</div>
          ) : null}
        </div>

        <div
          style={{
            fontSize: 28,
            lineHeight: 1.4,
            color: "#d1d5db",
            maxWidth: "94%",
            display: "flex",
          }}
        >
          {post.metaDescription}
        </div>
      </div>
    ),
    size
  );
}
