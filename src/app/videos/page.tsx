import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getVideosData } from "@/lib/videos";
import { getSiteUrl, siteConfig } from "@/lib/site";
import VideoGrid from "./video-grid";

const siteUrl = getSiteUrl();
const pageUrl = `${siteUrl}/videos`;
const fallbackImage = `${siteUrl}/opengraph-image`;

export const metadata: Metadata = {
  title: "Videos de coros cristianos – Coros Cristianos",
  description:
    "Mira los mejores videos de coros y alabanzas cristianas. Más de 600 videos de YouTube de artistas cristianos con letras completas.",
  keywords: [
    "videos cristianos",
    "coros cristianos videos",
    "alabanzas cristianas youtube",
    "musica cristiana videos",
    "videos de adoracion",
  ],
  alternates: { canonical: pageUrl },
  openGraph: {
    type: "website",
    locale: "es_CO",
    url: pageUrl,
    title: "Videos de coros cristianos",
    description:
      "Mira los mejores videos de coros y alabanzas cristianas. Más de 600 videos de artistas cristianos.",
    siteName: siteConfig.name,
    images: [{ url: fallbackImage, width: 1200, height: 630, alt: "Videos de coros cristianos" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Videos de coros cristianos",
    description:
      "Mira los mejores videos de coros y alabanzas cristianas. Más de 600 videos de artistas cristianos.",
    images: [fallbackImage],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1 },
  },
};

export default async function VideosPage() {
  const data = await getVideosData();

  if (!data || data.videos.length === 0) {
    notFound();
  }

  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "@id": `${siteUrl}/#website`,
        url: siteUrl,
        name: siteConfig.name,
        inLanguage: "es",
      },
      {
        "@type": "CollectionPage",
        "@id": `${pageUrl}#webpage`,
        url: pageUrl,
        name: "Videos de coros cristianos",
        description: `${data.totalVideos} videos de ${data.totalArtists} artistas cristianos.`,
        inLanguage: "es",
        isPartOf: { "@type": "WebSite", "@id": `${siteUrl}/#website` },
      },
      {
        "@type": "BreadcrumbList",
        "@id": `${pageUrl}#breadcrumb`,
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Inicio", item: siteUrl },
          { "@type": "ListItem", position: 2, name: "Videos", item: pageUrl },
        ],
      },
      {
        "@type": "ItemList",
        "@id": `${pageUrl}#videolist`,
        name: "Videos de coros cristianos",
        numberOfItems: data.totalVideos,
        itemListElement: data.videos.slice(0, 50).map((v, i) => ({
          "@type": "ListItem",
          position: i + 1,
          item: {
            "@type": "VideoObject",
            name: v.title,
            description: `${v.title} por ${v.artist}`,
            embedUrl: `https://www.youtube-nocookie.com/embed/${v.youtubeId}`,
            thumbnailUrl: v.thumbnailUrl || `https://i.ytimg.com/vi/${v.youtubeId}/hqdefault.jpg`,
            uploadDate: data.generatedAt,
          },
        })),
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />

      <main className="mx-auto max-w-7xl px-4 pb-16 pt-8 sm:px-8 lg:px-12">
        <div className="rounded-3xl border border-[#e5e7eb] bg-[#ffffff] p-6 shadow-[0_14px_40px_-35px_rgba(15,23,42,0.32)] sm:p-8 lg:p-10">

          {/* Breadcrumb */}
          <nav aria-label="Miga de pan" className="mb-4 text-sm text-[#6b7280]">
            <ol className="flex flex-wrap items-center gap-2">
              <li>
                <Link href="/" className="transition hover:text-[#374151]">Inicio</Link>
              </li>
              <li aria-hidden="true">/</li>
              <li className="text-[#111827]">Videos</li>
            </ol>
          </nav>

          <header className="border-b border-[#eef0f3] pb-6 mb-6">
            <h1 className="font-[family-name:var(--font-display)] text-4xl leading-tight text-[#111827] sm:text-5xl">
              Videos
            </h1>
            <p className="mt-3 max-w-2xl text-base leading-relaxed text-[#4b5563]">
              Los mejores videos de coros y alabanzas cristianas.
              Cada vez que visitas esta página los videos se mezclan para que descubras algo nuevo.
            </p>
          </header>

          <VideoGrid videos={data.videos} totalArtists={data.totalArtists} />

          {/* Back link */}
          <div className="mt-10 flex flex-wrap gap-3">
            <Link
              href="/"
              className="inline-flex items-center gap-2 rounded-full border border-[#d6dae1] bg-[#f8fafc] px-5 py-2.5 text-sm font-semibold text-[#374151] transition hover:bg-[#eef2f7]"
            >
              ← Coros
            </Link>
            <Link
              href="/videos/artistas"
              className="inline-flex items-center gap-2 rounded-full border border-[#d6dae1] bg-[#f8fafc] px-5 py-2.5 text-sm font-semibold text-[#374151] transition hover:bg-[#eef2f7]"
            >
              👥 Videos por artista
            </Link>
            <Link
              href="/artistas"
              className="inline-flex items-center gap-2 rounded-full border border-[#d6dae1] bg-[#f8fafc] px-5 py-2.5 text-sm font-semibold text-[#374151] transition hover:bg-[#eef2f7]"
            >
              🎤 Artistas
            </Link>
          </div>
        </div>
      </main>
    </>
  );
}
