import type { Metadata } from "next";
import Link from "next/link";
import SongList from "@/app/song-list";
import {
  getAllSongPosts,
  getLyricsPreview,
  splitAuthors,
  type HomeSong,
} from "@/lib/song-posts";
import { getSiteUrl, siteConfig } from "@/lib/site";

const MAX_RECENT_SONGS = 180;

function toTimestamp(value: string | null): number {
  if (!value) return 0;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? 0 : date.getTime();
}

function toHomeSong(song: Awaited<ReturnType<typeof getAllSongPosts>>[number]): HomeSong {
  return {
    slug: song.slug,
    title: song.title,
    author: song.author,
    authors: splitAuthors(song.author),
    album: song.album,
    metaDescription: song.metaDescription || getLyricsPreview(song.lyrics, 180),
    lyricsPreview: getLyricsPreview(song.lyrics, 260),
    youtubeId: song.youtubeId,
    thumbnailUrl: song.thumbnailUrl,
    generatedAt: song.generatedAt,
  };
}

export async function generateMetadata(): Promise<Metadata> {
  const siteUrl = getSiteUrl();
  const fallbackImage = `${siteUrl}/opengraph-image`;
  const songs = await getAllSongPosts();
  const datedSongs = songs.filter((song) => toTimestamp(song.generatedAt) > 0);

  const title = "Canciones cristianas recientes";
  const description = `Descubre las ${Math.min(MAX_RECENT_SONGS, datedSongs.length)} canciones cristianas mas recientes y actualizadas de nuestro catalogo.`;
  const canonical = `${siteUrl}/coros/recientes`;

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
      images: [{ url: fallbackImage, width: 1200, height: 630, alt: "Canciones cristianas recientes" }],
    },
    twitter: { card: "summary_large_image", title, description, images: [fallbackImage] },
    robots: {
      index: true,
      follow: true,
      googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1 },
    },
  };
}

export default async function RecentSongsPage() {
  const siteUrl = getSiteUrl();
  const songs = await getAllSongPosts();

  const recentSongs = songs
    .filter((song) => toTimestamp(song.generatedAt) > 0)
    .sort((a, b) => toTimestamp(b.generatedAt) - toTimestamp(a.generatedAt) || a.title.localeCompare(b.title, "es"))
    .slice(0, MAX_RECENT_SONGS)
    .map(toHomeSong);

  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "CollectionPage",
        "@id": `${siteUrl}/coros/recientes#webpage`,
        url: `${siteUrl}/coros/recientes`,
        name: "Canciones cristianas recientes",
        description: `Listado de ${recentSongs.length} canciones cristianas recientemente actualizadas.`,
        inLanguage: "es",
        isPartOf: { "@type": "WebSite", "@id": `${siteUrl}/#website` },
      },
      {
        "@type": "BreadcrumbList",
        "@id": `${siteUrl}/coros/recientes#breadcrumb`,
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Inicio", item: siteUrl },
          { "@type": "ListItem", position: 2, name: "Recientes", item: `${siteUrl}/coros/recientes` },
        ],
      },
      {
        "@type": "ItemList",
        "@id": `${siteUrl}/coros/recientes#songlist`,
        name: "Canciones cristianas recientes",
        numberOfItems: recentSongs.length,
        itemListOrder: "https://schema.org/ItemListOrderDescending",
        itemListElement: recentSongs.map((song, idx) => ({
          "@type": "ListItem",
          position: idx + 1,
          url: `${siteUrl}/coros/${song.slug}`,
          item: {
            "@type": "MusicComposition",
            name: song.title,
            byArtist: song.authors.map((author) => ({ "@type": "Person", name: author })),
            url: `${siteUrl}/coros/${song.slug}`,
          },
        })),
      },
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />

      <main className="mx-auto max-w-7xl px-4 pb-16 pt-8 sm:px-8 lg:px-12">
        <div className="rounded-3xl border border-[#e5e7eb] bg-[#ffffff] p-6 shadow-[0_14px_40px_-35px_rgba(15,23,42,0.32)] sm:p-8 lg:p-10">
          <nav aria-label="Miga de pan" className="mb-4 text-sm text-[#6b7280]">
            <ol className="flex flex-wrap items-center gap-2">
              <li>
                <Link href="/" className="transition hover:text-[#374151]">Inicio</Link>
              </li>
              <li aria-hidden="true">/</li>
              <li className="text-[#111827]">Coros recientes</li>
            </ol>
          </nav>

          <header className="border-b border-[#eef0f3] pb-8">
            <p className="text-sm font-semibold uppercase tracking-[0.14em] text-[#6b7280]">Actualizaciones</p>
            <h1 className="mt-2 max-w-4xl font-[family-name:var(--font-display)] text-4xl leading-tight text-[#111827] sm:text-5xl">
              Canciones cristianas recientes
            </h1>
            <p className="mt-4 max-w-3xl text-base leading-8 text-[#4b5563]">
              Los {recentSongs.length} coros con fecha de actualizacion mas reciente.
            </p>
          </header>

          <SongList songs={recentSongs} />
        </div>
      </main>
    </>
  );
}
