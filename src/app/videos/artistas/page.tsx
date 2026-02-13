import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { getSiteUrl, siteConfig } from "@/lib/site";
import { getVideoArtists, getVideosData } from "@/lib/videos";

export async function generateMetadata(): Promise<Metadata> {
  const siteUrl = getSiteUrl();
  const fallbackImage = `${siteUrl}/opengraph-image`;
  const [artists, videosData] = await Promise.all([getVideoArtists(), getVideosData()]);

  const title = `Videos por artista (${artists.length}) – Coros Cristianos`;
  const description = `Explora ${videosData?.totalVideos ?? 0} videos de coros cristianos agrupados por ${artists.length} artistas.`;
  const canonical = `${siteUrl}/videos/artistas`;

  return {
    title,
    description,
    alternates: { canonical },
    openGraph: {
      type: "website",
      locale: "es_CO",
      url: canonical,
      title,
      description,
      siteName: siteConfig.name,
      images: [{ url: fallbackImage, width: 1200, height: 630, alt: "Videos de coros por artista" }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [fallbackImage],
    },
    robots: {
      index: true,
      follow: true,
      googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1 },
    },
  };
}

export default async function VideosByArtistPage() {
  const siteUrl = getSiteUrl();
  const [artists, videosData] = await Promise.all([getVideoArtists(), getVideosData()]);

  if (artists.length === 0) {
    return (
      <main className="mx-auto max-w-7xl px-4 pb-16 pt-8 sm:px-8 lg:px-12">
        <div className="rounded-3xl border border-[#e5e7eb] bg-[#ffffff] p-6 shadow-[0_14px_40px_-35px_rgba(15,23,42,0.32)] sm:p-8 lg:p-10">
          <section className="mt-8 rounded-2xl border border-dashed border-[#d1d5db] bg-[#f8fafc] p-10 text-center">
            <h2 className="font-[family-name:var(--font-display)] text-3xl text-[#111827]">
              No hay artistas con videos
            </h2>
          </section>
        </div>
      </main>
    );
  }

  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "CollectionPage",
        "@id": `${siteUrl}/videos/artistas#webpage`,
        url: `${siteUrl}/videos/artistas`,
        name: "Videos por artista",
        description: `${videosData?.totalVideos ?? 0} videos agrupados por artista.`,
        inLanguage: "es",
        isPartOf: { "@type": "WebSite", "@id": `${siteUrl}/#website` },
      },
      {
        "@type": "BreadcrumbList",
        "@id": `${siteUrl}/videos/artistas#breadcrumb`,
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Inicio", item: siteUrl },
          { "@type": "ListItem", position: 2, name: "Videos", item: `${siteUrl}/videos` },
          { "@type": "ListItem", position: 3, name: "Artistas", item: `${siteUrl}/videos/artistas` },
        ],
      },
      {
        "@type": "ItemList",
        "@id": `${siteUrl}/videos/artistas#artistlist`,
        name: "Artistas con videos",
        numberOfItems: artists.length,
        itemListOrder: "https://schema.org/ItemListOrderDescending",
        itemListElement: artists.map((artist, idx) => ({
          "@type": "ListItem",
          position: idx + 1,
          url: `${siteUrl}/videos/artistas/${artist.artistSlug}`,
          item: {
            "@type": "Person",
            name: artist.artist,
            url: `${siteUrl}/videos/artistas/${artist.artistSlug}`,
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
          <nav aria-label="Miga de pan" className="mb-4 text-sm text-[#6b7280]">
            <ol className="flex flex-wrap items-center gap-2">
              <li>
                <Link href="/" className="transition hover:text-[#374151]">Inicio</Link>
              </li>
              <li aria-hidden="true">/</li>
              <li>
                <Link href="/videos" className="transition hover:text-[#374151]">Videos</Link>
              </li>
              <li aria-hidden="true">/</li>
              <li className="text-[#111827]">Artistas</li>
            </ol>
          </nav>

          <header className="border-b border-[#eef0f3] pb-8">
            <p className="text-sm font-semibold uppercase tracking-[0.14em] text-[#6b7280]">Videos Por Artista</p>
            <h1 className="mt-2 max-w-4xl font-[family-name:var(--font-display)] text-4xl leading-tight text-[#111827] sm:text-5xl">
              Artistas con videos de coros cristianos
            </h1>
            <p className="mt-4 max-w-3xl text-base leading-8 text-[#4b5563]">
              Explora {videosData?.totalVideos ?? 0} videos agrupados en {artists.length} artistas.
            </p>
          </header>

          <section aria-label="Listado de artistas con videos" className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {artists.map((artist, idx) => (
              <Link
                key={`${artist.artistSlug}-${idx}`}
                href={`/videos/artistas/${artist.artistSlug}`}
                className="group flex items-center gap-4 rounded-2xl border border-[#e5e7eb] bg-white p-4 transition duration-200 hover:border-[#cfd8e3] hover:shadow-[0_10px_30px_-24px_rgba(15,23,42,0.45)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#9ca3af] focus-visible:ring-offset-2"
              >
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#f1f3f6] text-sm font-bold text-[#6b7280]">
                  {idx + 1}
                </div>

                {artist.thumbnailUrl ? (
                  <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-full border border-[#dbe2ea] bg-[#e5e7eb]">
                    <Image
                      src={artist.thumbnailUrl}
                      alt={`Imagen de ${artist.artist}`}
                      fill
                      sizes="56px"
                      className="object-cover"
                    />
                  </div>
                ) : (
                  <div
                    className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-[#eceff4] text-xl font-bold text-[#374151]"
                    aria-hidden="true"
                  >
                    {artist.artist.charAt(0).toUpperCase()}
                  </div>
                )}

                <div className="min-w-0">
                  <h2 className="truncate font-semibold text-[#111827] transition group-hover:text-[#1f3b63]">
                    {artist.artist}
                  </h2>
                  <p className="mt-0.5 text-sm text-[#6b7280]">
                    {artist.videoCount} {artist.videoCount === 1 ? "video" : "videos"}
                  </p>
                </div>
              </Link>
            ))}
          </section>
        </div>
      </main>
    </>
  );
}
