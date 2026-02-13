import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getSiteUrl, siteConfig } from "@/lib/site";
import { getVideoArtistBySlug, getVideoArtists } from "@/lib/videos";
import VideoGrid from "../../video-grid";

type VideosByArtistPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  const artists = await getVideoArtists();
  return artists.map((artist) => ({ slug: artist.artistSlug }));
}

export async function generateMetadata({ params }: VideosByArtistPageProps): Promise<Metadata> {
  const { slug } = await params;
  const siteUrl = getSiteUrl();
  const artistData = await getVideoArtistBySlug(slug);

  if (!artistData) {
    return {
      title: "Artista no encontrado",
      description: "No encontramos videos para este artista.",
    };
  }

  const pageUrl = `${siteUrl}/videos/artistas/${artistData.artistSlug}`;
  const title = `Videos de ${artistData.artist} (${artistData.videoCount})`;
  const description = `Mira ${artistData.videoCount} videos de canciones cristianas de ${artistData.artist} con acceso directo a su letra.`;
  const imageUrl = artistData.thumbnailUrl ?? `${siteUrl}/opengraph-image`;
  const imageWidth = artistData.thumbnailUrl ? 480 : 1200;
  const imageHeight = artistData.thumbnailUrl ? 360 : 630;

  return {
    title,
    description,
    alternates: { canonical: pageUrl },
    openGraph: {
      type: "website",
      locale: "es_CO",
      url: pageUrl,
      title,
      description,
      siteName: siteConfig.name,
      images: [{ url: imageUrl, width: imageWidth, height: imageHeight, alt: `Videos de ${artistData.artist}` }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [imageUrl],
    },
    robots: {
      index: true,
      follow: true,
      googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1 },
    },
  };
}

export default async function VideosByArtistDetailPage({ params }: VideosByArtistPageProps) {
  const { slug } = await params;
  const siteUrl = getSiteUrl();
  const artistData = await getVideoArtistBySlug(slug);

  if (!artistData) {
    notFound();
  }

  const pageUrl = `${siteUrl}/videos/artistas/${artistData.artistSlug}`;
  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "CollectionPage",
        "@id": `${pageUrl}#webpage`,
        url: pageUrl,
        name: `Videos de ${artistData.artist}`,
        description: `${artistData.videoCount} videos de canciones cristianas de ${artistData.artist}.`,
        inLanguage: "es",
        isPartOf: { "@type": "WebSite", "@id": `${siteUrl}/#website` },
      },
      {
        "@type": "BreadcrumbList",
        "@id": `${pageUrl}#breadcrumb`,
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Inicio", item: siteUrl },
          { "@type": "ListItem", position: 2, name: "Videos", item: `${siteUrl}/videos` },
          { "@type": "ListItem", position: 3, name: "Artistas", item: `${siteUrl}/videos/artistas` },
          { "@type": "ListItem", position: 4, name: artistData.artist, item: pageUrl },
        ],
      },
      {
        "@type": "ItemList",
        "@id": `${pageUrl}#videolist`,
        name: `Videos de ${artistData.artist}`,
        numberOfItems: artistData.videoCount,
        itemListOrder: "https://schema.org/ItemListOrderAscending",
        itemListElement: artistData.videos.slice(0, 100).map((video, idx) => ({
          "@type": "ListItem",
          position: idx + 1,
          item: {
            "@type": "VideoObject",
            name: video.title,
            url: `${siteUrl}/coros/${video.slug}`,
            contentUrl: `https://www.youtube.com/watch?v=${video.youtubeId}`,
            embedUrl: `https://www.youtube-nocookie.com/embed/${video.youtubeId}`,
            thumbnailUrl: video.thumbnailUrl ?? `https://i.ytimg.com/vi/${video.youtubeId}/hqdefault.jpg`,
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
              <li>
                <Link href="/videos/artistas" className="transition hover:text-[#374151]">Artistas</Link>
              </li>
              <li aria-hidden="true">/</li>
              <li className="text-[#111827]">{artistData.artist}</li>
            </ol>
          </nav>

          <header className="border-b border-[#eef0f3] pb-8">
            <div className="flex items-start gap-5">
              {artistData.thumbnailUrl ? (
                <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-full border-2 border-[#dbe2ea] bg-[#e5e7eb] sm:h-24 sm:w-24">
                  <Image
                    src={artistData.thumbnailUrl}
                    alt={`Imagen de ${artistData.artist}`}
                    fill
                    sizes="96px"
                    priority
                    className="object-cover"
                  />
                </div>
              ) : (
                <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-[#eceff4] text-3xl font-bold text-[#374151] sm:h-24 sm:w-24" aria-hidden="true">
                  {artistData.artist.charAt(0).toUpperCase()}
                </div>
              )}

              <div className="min-w-0">
                <p className="text-sm font-semibold uppercase tracking-[0.14em] text-[#6b7280]">Videos por artista</p>
                <h1 className="mt-1 font-[family-name:var(--font-display)] text-4xl leading-tight text-[#111827] sm:text-5xl">
                  {artistData.artist}
                </h1>
                <div className="mt-4 flex flex-wrap gap-2 text-xs font-semibold uppercase tracking-wide text-[#6b7280]">
                  <span className="rounded-full border border-[#d6dae1] bg-[#f8fafc] px-3 py-1.5">
                    {artistData.videoCount} {artistData.videoCount === 1 ? "video" : "videos"}
                  </span>
                </div>
              </div>
            </div>
          </header>

          <div className="mt-8">
            <VideoGrid videos={artistData.videos} totalArtists={1} />
          </div>
        </div>
      </main>
    </>
  );
}
