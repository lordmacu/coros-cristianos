import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { getArtistBySlug, getArtistsIndex } from "@/lib/artists";
import { formatGeneratedDate } from "@/lib/song-posts";
import { getSiteUrl, siteConfig } from "@/lib/site";

export async function generateStaticParams() {
  const index = await getArtistsIndex();
  if (!index) return [];
  return index.artists.map((a) => ({ slug: a.slug }));
}

type ArtistPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: ArtistPageProps): Promise<Metadata> {
  const { slug } = await params;
  const artist = await getArtistBySlug(slug);

  if (!artist) {
    return { title: "Artista no encontrado", description: "No encontramos el artista solicitado." };
  }

  const siteUrl = getSiteUrl();
  const pageUrl = `${siteUrl}/artistas/${artist.slug}`;
  const fallbackImage = `${siteUrl}/opengraph-image`;
  const title = `Letras de ${artist.name} – ${artist.songCount} coros cristianos`;
  const description = `Todas las letras de coros cristianos de ${artist.name}. ${artist.songCount} canciones con reflexiones devocionales, video de YouTube y ficha del autor.`;
  const imageUrl = artist.thumbnailUrl ?? fallbackImage;
  const imageWidth = artist.thumbnailUrl ? 480 : 1200;
  const imageHeight = artist.thumbnailUrl ? 360 : 630;

  return {
    title,
    description,
    keywords: [
      artist.name,
      `letras de ${artist.name}`,
      "coros cristianos",
      "letras cristianas",
      "musica de adoracion",
    ],
    alternates: { canonical: pageUrl },
    openGraph: {
      type: "website",
      locale: "es_CO",
      url: pageUrl,
      title,
      description,
      siteName: siteConfig.name,
      images: [{ url: imageUrl, width: imageWidth, height: imageHeight, alt: `Foto de ${artist.name}` }],
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

export default async function ArtistDetailPage({ params }: ArtistPageProps) {
  const { slug } = await params;
  const artist = await getArtistBySlug(slug);

  if (!artist) {
    notFound();
  }

  const siteUrl = getSiteUrl();
  const pageUrl = `${siteUrl}/artistas/${artist.slug}`;

  // Collect unique albums
  const albums = Array.from(
    new Set(artist.songs.map((s) => s.album).filter((a): a is string => Boolean(a)))
  ).sort((a, b) => a.localeCompare(b, "es"));

  /* ── JSON-LD ── */
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
        "@type": "WebPage",
        "@id": `${pageUrl}#webpage`,
        url: pageUrl,
        name: `Letras de ${artist.name}`,
        description: `${artist.songCount} coros cristianos de ${artist.name}.`,
        inLanguage: "es",
        isPartOf: { "@type": "WebSite", "@id": `${siteUrl}/#website` },
      },
      {
        "@type": "BreadcrumbList",
        "@id": `${pageUrl}#breadcrumb`,
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Inicio", item: siteUrl },
          { "@type": "ListItem", position: 2, name: "Artistas", item: `${siteUrl}/artistas` },
          { "@type": "ListItem", position: 3, name: artist.name, item: pageUrl },
        ],
      },
      {
        "@type": "MusicGroup",
        "@id": `${pageUrl}#artist`,
        name: artist.name,
        url: pageUrl,
        genre: "Musica cristiana",
        track: artist.songs.slice(0, 50).map((song) => ({
          "@type": "MusicRecording",
          name: song.title,
          url: `${siteUrl}/coros/${song.slug}`,
          inAlbum: song.album ? { "@type": "MusicAlbum", name: song.album } : undefined,
        })),
      },
      {
        "@type": "ItemList",
        "@id": `${pageUrl}#songlist`,
        name: `Coros de ${artist.name}`,
        numberOfItems: artist.songCount,
        itemListOrder: "https://schema.org/ItemListOrderAscending",
        itemListElement: artist.songs.map((song, idx) => ({
          "@type": "ListItem",
          position: idx + 1,
          url: `${siteUrl}/coros/${song.slug}`,
          item: {
            "@type": "MusicComposition",
            name: song.title,
            url: `${siteUrl}/coros/${song.slug}`,
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
              <li>
                <Link href="/artistas" className="transition hover:text-[#374151]">Artistas</Link>
              </li>
              <li aria-hidden="true">/</li>
              <li className="text-[#111827]">{artist.name}</li>
            </ol>
          </nav>

          <header className="border-b border-[#eef0f3] pb-8">
            <div className="flex items-start gap-5">
              {artist.thumbnailUrl ? (
                <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-full border-2 border-[#dbe2ea] bg-[#e5e7eb] sm:h-24 sm:w-24">
                  <Image
                    src={artist.thumbnailUrl}
                    alt={`Foto de ${artist.name}`}
                    fill
                    sizes="96px"
                    priority
                    className="object-cover"
                  />
                </div>
              ) : (
                <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-[#eceff4] text-3xl font-bold text-[#374151] sm:h-24 sm:w-24" aria-hidden="true">
                  {artist.name.charAt(0).toUpperCase()}
                </div>
              )}

              <div className="min-w-0">
                <p className="text-sm font-semibold uppercase tracking-[0.14em] text-[#6b7280]">
                  Artista
                </p>
                <h1 className="mt-1 font-[family-name:var(--font-display)] text-4xl leading-tight text-[#111827] sm:text-5xl">
                  {artist.name}
                </h1>

                <div className="mt-4 flex flex-wrap gap-2 text-xs font-semibold uppercase tracking-wide text-[#6b7280]">
                  <span className="rounded-full border border-[#d6dae1] bg-[#f8fafc] px-3 py-1.5">
                    {artist.songCount} {artist.songCount === 1 ? "coro" : "coros"}
                  </span>
                  {albums.length > 0 ? (
                    <span className="rounded-full border border-[#d6dae1] bg-[#f8fafc] px-3 py-1.5">
                      {albums.length} {albums.length === 1 ? "album" : "albumes"}
                    </span>
                  ) : null}
                </div>
              </div>
            </div>
          </header>

          {/* Albums tags */}
          {albums.length > 0 ? (
            <div className="mt-6 flex flex-wrap gap-2">
              {albums.map((album) => (
                <span
                  key={album}
                  className="rounded-full border border-[#d6dae1] bg-[#f8fafc] px-3 py-1.5 text-xs font-semibold text-[#4b5563]"
                >
                  {album}
                </span>
              ))}
            </div>
          ) : null}

          {/* Artist content */}
          {artist.content ? (
            <section
              aria-label={`Sobre ${artist.name}`}
              className="artist-bio mt-8 rounded-2xl border border-[#e2e6ed] bg-gradient-to-br from-[#f8fafc] to-[#f1f4f9] px-6 py-6 sm:px-8 sm:py-8"
              dangerouslySetInnerHTML={{ __html: artist.content }}
            />
          ) : null}

          <style>{`
            .artist-bio h2 {
              font-family: var(--font-display);
              font-size: 1.5rem;
              font-weight: 700;
              color: #111827;
              margin-bottom: 1rem;
              padding-bottom: 0.75rem;
              border-bottom: 2px solid #e5e7eb;
            }
            .artist-bio h3 {
              font-size: 1.05rem;
              font-weight: 700;
              color: #1f2937;
              margin-top: 1.5rem;
              margin-bottom: 0.5rem;
              display: flex;
              align-items: center;
              gap: 0.4rem;
            }
            .artist-bio h3::before {
              content: '';
              display: inline-block;
              width: 3px;
              height: 1em;
              background: #9ca3af;
              border-radius: 2px;
            }
            .artist-bio p {
              color: #374151;
              font-size: 0.938rem;
              line-height: 1.8;
              margin-bottom: 0.75rem;
            }
            .artist-bio strong {
              color: #111827;
              font-weight: 600;
            }
            .artist-bio em {
              color: #4b5563;
              font-style: italic;
            }
          `}</style>

          {/* Songs grid */}
          <section aria-label={`Coros de ${artist.name}`} className="mt-8 columns-1 [column-gap:1rem] md:columns-2 xl:columns-3">
            {artist.songs.map((song, songIndex) => {
              const updatedLabel = formatGeneratedDate(song.generatedAt);

              return (
                <article
                  key={`${song.slug}-${songIndex}`}
                  className="mb-4 w-full break-inside-avoid rounded-2xl border border-[#e5e7eb] bg-white transition duration-200 hover:border-[#cfd8e3] hover:shadow-[0_10px_30px_-24px_rgba(15,23,42,0.45)]"
                >
                  <Link
                    href={`/coros/${song.slug}`}
                    aria-label={`Leer letra del coro: ${song.title}`}
                    className="group block rounded-2xl p-5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#9ca3af] focus-visible:ring-offset-2"
                  >
                    {song.thumbnailUrl ? (
                      <div className="-mx-5 -mt-5 mb-4 overflow-hidden rounded-t-2xl border-b border-[#dbe2ea] bg-[#e5e7eb]">
                        <div className="relative aspect-video">
                          <Image
                            src={song.thumbnailUrl}
                            alt={`Video de ${song.title} por ${artist.name}`}
                            fill
                            sizes="(min-width: 1280px) 30vw, (min-width: 768px) 45vw, 100vw"
                            priority={songIndex === 0}
                            className="object-cover transition duration-300 group-hover:scale-[1.02]"
                          />
                        </div>
                      </div>
                    ) : null}

                    <h2 className="line-clamp-2 font-[family-name:var(--font-display)] text-2xl leading-tight text-[#111827]">
                      <span className="transition group-hover:text-[#1f3b63]">{song.title}</span>
                    </h2>

                    {song.album ? (
                      <div className="mt-3 flex flex-wrap gap-2 text-xs font-semibold uppercase tracking-wide text-[#6b7280]">
                        <span className="rounded-full border border-[#d6dae1] bg-[#f8fafc] px-2.5 py-1">
                          Album: {song.album}
                        </span>
                      </div>
                    ) : null}

                    {song.metaDescription ? (
                      <p className="mt-3 text-sm leading-6 text-[#4b5563]">{song.metaDescription}</p>
                    ) : null}

                    <p className="mt-3 rounded-xl border border-[#e5e7eb] bg-[#f8fafc] px-4 py-3 text-sm leading-7 text-[#374151]">
                      {song.lyricsPreview}
                    </p>

                    <div className="mt-4 flex items-center justify-between gap-3">
                      <span className="rounded-full border border-[#d6dae1] bg-[#f8fafc] px-4 py-2 text-sm font-semibold text-[#374151] transition group-hover:bg-[#eef2f7]">
                        Ver coro
                      </span>
                      {updatedLabel ? (
                        <time className="text-xs font-medium text-[#6b7280]" dateTime={song.generatedAt ?? undefined}>
                          {updatedLabel}
                        </time>
                      ) : null}
                    </div>
                  </Link>
                </article>
              );
            })}
          </section>

          {/* Back link */}
          <div className="mt-8">
            <Link
              href="/artistas"
              className="inline-flex items-center gap-2 rounded-full border border-[#d6dae1] bg-[#f8fafc] px-5 py-2.5 text-sm font-semibold text-[#374151] transition hover:bg-[#eef2f7]"
            >
              ← Todos los artistas
            </Link>
          </div>
        </div>
      </main>
    </>
  );
}
