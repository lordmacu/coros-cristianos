import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import {
  getAllSongPosts,
  formatGeneratedDate,
  getLyricsPreview,
  getSongPostBySlug,
  slugify,
  splitAuthors,
} from "@/lib/song-posts";
import { getSiteUrl, siteConfig } from "@/lib/site";
import PresenterControls from "./presenter-controls";

export async function generateStaticParams() {
  const posts = await getAllSongPosts();
  return posts.map((p) => ({ slug: p.slug }));
}

type SongPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: SongPageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await getSongPostBySlug(slug);

  if (!post) {
    return {
      title: "Coro no encontrado",
      description: "No encontramos el coro solicitado.",
    };
  }

  const siteUrl = getSiteUrl();
  const pageUrl = `${siteUrl}/coros/${post.slug}`;
  const pageTitle = post.postTitle || post.title;
  const pageDescription = post.metaDescription || getLyricsPreview(post.lyrics, 155);
  const authorList = splitAuthors(post.author);
  const imageUrl =
    post.thumbnailUrl ??
    (post.youtubeId ? `https://i.ytimg.com/vi/${post.youtubeId}/hqdefault.jpg` : `${siteUrl}/opengraph-image`);
  const keywords = [
    "letra cristiana",
    "coro cristiano",
    "música de adoración",
    post.title,
    post.author,
    post.album ?? "",
  ].filter(Boolean);

  return {
    title: pageTitle,
    description: pageDescription,
    keywords,
    authors: authorList.map((author) => ({ name: author })),
    creator: authorList.join(", "),
    publisher: siteConfig.name,
    alternates: {
      canonical: pageUrl,
    },
    robots: {
      index: true,
      follow: true,
      nocache: false,
      googleBot: {
        index: true,
        follow: true,
        "max-image-preview": "large",
        "max-snippet": -1,
        "max-video-preview": -1,
      },
    },
    openGraph: {
      type: "article",
      locale: "es_CO",
      url: pageUrl,
      title: pageTitle,
      description: pageDescription,
      siteName: siteConfig.name,
      publishedTime: post.generatedAt ?? undefined,
      modifiedTime: post.generatedAt ?? undefined,
      authors: authorList,
      tags: [post.album, post.author].filter((value): value is string => Boolean(value)),
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: `Portada de ${post.title}`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: pageTitle,
      description: pageDescription,
      images: [imageUrl],
    },
  };
}

export default async function SongDetailPage({ params }: SongPageProps) {
  const { slug } = await params;
  const post = await getSongPostBySlug(slug);

  if (!post) {
    notFound();
  }

  const siteUrl = getSiteUrl();
  const pageUrl = `${siteUrl}/coros/${post.slug}`;
  const pageTitle = post.postTitle || post.title;
  const pageDescription = post.metaDescription || getLyricsPreview(post.lyrics, 155);
  const imageUrl =
    post.thumbnailUrl ??
    (post.youtubeId ? `https://i.ytimg.com/vi/${post.youtubeId}/hqdefault.jpg` : `${siteUrl}/opengraph-image`);
  const authors = splitAuthors(post.author);
  const authorLabel = authors.join(", ");
  const generatedLabel = formatGeneratedDate(post.generatedAt);
  const lyricsSegments = post.lyricsStanzas.map((stanza, index) => ({
    text: stanza,
    gapAfter: index < post.lyricsStanzas.length - 1 ? 4 : 0,
  }));
  const allSongs = await getAllSongPosts();
  const relatedSongs = allSongs
    .filter((song) => song.slug !== post.slug)
    .slice(0, 4);

  const structuredDataGraph: Record<string, unknown>[] = [
    {
      "@type": "WebPage",
      "@id": `${pageUrl}#webpage`,
      url: pageUrl,
      name: pageTitle,
      description: pageDescription,
      inLanguage: "es",
      isPartOf: {
        "@type": "WebSite",
        "@id": `${siteUrl}/#website`,
        name: siteConfig.name,
        url: siteUrl,
      },
    },
    {
      "@type": "BreadcrumbList",
      "@id": `${pageUrl}#breadcrumb`,
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: "Coros",
          item: `${siteUrl}/`,
        },
        {
          "@type": "ListItem",
          position: 2,
          name: post.title,
          item: pageUrl,
        },
      ],
    },
    {
      "@type": "Article",
      "@id": `${pageUrl}#article`,
      headline: pageTitle,
      description: pageDescription,
      inLanguage: "es",
      mainEntityOfPage: {
        "@type": "WebPage",
        "@id": `${pageUrl}#webpage`,
      },
      datePublished: post.generatedAt ?? undefined,
      dateModified: post.generatedAt ?? undefined,
      author: authors.map((author) => ({
        "@type": "Person",
        name: author,
      })),
      publisher: {
        "@type": "Organization",
        name: siteConfig.name,
        url: siteUrl,
      },
      image: [imageUrl],
    },
    {
      "@type": "MusicComposition",
      "@id": `${pageUrl}#composition`,
      name: post.title,
      composer: authors.map((author) => ({
        "@type": "Person",
        name: author,
      })),
      lyrics: {
        "@type": "CreativeWork",
        text: getLyricsPreview(post.lyrics, 2500),
      },
      isPartOf: post.album
        ? {
            "@type": "MusicAlbum",
            name: post.album,
          }
        : undefined,
      url: pageUrl,
      inLanguage: "es",
    },
    {
      "@type": "MusicRecording",
      "@id": `${pageUrl}#recording`,
      name: post.title,
      description: pageDescription,
      inLanguage: "es",
      url: pageUrl,
      byArtist: authors.map((author) => ({
        "@type": "Person",
        name: author,
      })),
      inAlbum: post.album
        ? {
            "@type": "MusicAlbum",
            name: post.album,
          }
        : undefined,
    },
  ];

  if (post.youtubeId) {
    structuredDataGraph.push({
      "@type": "VideoObject",
      "@id": `${pageUrl}#video`,
      name: `Video de ${post.title}`,
      description: pageDescription,
      embedUrl: `https://www.youtube-nocookie.com/embed/${post.youtubeId}`,
      contentUrl: `https://www.youtube.com/watch?v=${post.youtubeId}`,
      uploadDate: post.generatedAt ?? undefined,
      thumbnailUrl: post.thumbnailUrl ?? `https://i.ytimg.com/vi/${post.youtubeId}/hqdefault.jpg`,
      isFamilyFriendly: true,
    });
  }

  const structuredData = {
    "@context": "https://schema.org",
    "@graph": structuredDataGraph,
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />

      <main className="mx-auto max-w-7xl px-4 pb-16 pt-8 sm:px-8 lg:px-12">
        <div className="rounded-3xl border border-[#e5e7eb] bg-[#ffffff] p-6 shadow-[0_14px_40px_-35px_rgba(15,23,42,0.32)] sm:p-8 lg:p-10">
          <nav aria-label="Miga de pan" className="text-sm text-[#6b7280]">
            <ol className="flex flex-wrap items-center gap-2">
              <li>
                <Link href="/" className="transition hover:text-[#374151]">
                  Coros
                </Link>
              </li>
              <li aria-hidden="true">/</li>
              <li className="text-[#111827]">{post.title}</li>
            </ol>
          </nav>

          <header className="mt-5 border-b border-[#eef0f3] pb-8">
            <div className="flex items-start gap-4">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-[#eceff4] text-2xl font-bold text-[#374151]">
                {authors[0].charAt(0).toUpperCase()}
              </div>

              <div className="min-w-0">
                <p className="text-sm font-semibold uppercase tracking-[0.14em] text-[#6b7280]">
                  {authors.map((author, i) => (
                    <span key={author}>
                      {i > 0 && ", "}
                      <Link
                        href={`/artistas/${slugify(author)}`}
                        className="transition hover:text-[#111827] hover:underline"
                      >
                        {author}
                      </Link>
                    </span>
                  ))}
                </p>
                <h1 className="mt-1 font-[family-name:var(--font-display)] text-4xl leading-tight text-[#111827] sm:text-5xl">
                  {post.title}
                </h1>
              </div>
            </div>

            <div className="mt-6 flex flex-wrap gap-2 text-xs font-semibold uppercase tracking-wide text-[#6b7280]">
              {post.album ? (
                <span className="rounded-full border border-[#d6dae1] bg-[#f8fafc] px-3 py-1.5">
                  Album: {post.album}
                </span>
              ) : null}

              {generatedLabel ? (
                <span className="rounded-full border border-[#d6dae1] bg-[#f8fafc] px-3 py-1.5">
                  Actualizado: {generatedLabel}
                </span>
              ) : null}
            </div>
          </header>

          <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1fr)_380px]">
            <article className="min-w-0">
              <div className="mb-5 flex flex-wrap gap-2">
                <a
                  href="#letra"
                  className="rounded-full border border-[#d6dae1] bg-[#f8fafc] px-4 py-2 text-sm font-semibold text-[#374151] transition hover:bg-[#eef2f7]"
                >
                  Letra
                </a>
              </div>

              <section id="letra" className="rounded-2xl border border-[#e5e7eb] bg-white px-6 py-7 sm:px-8">
                <h2 className="font-[family-name:var(--font-display)] text-3xl text-[#111827]">Letra</h2>

                {lyricsSegments.length === 0 ? (
                  <p className="mt-5 text-base text-[#4b5563]">No hay letra disponible para este coro.</p>
                ) : (
                  <div className="lyrics-text mt-6">
                    {lyricsSegments.map((segment, index) => {
                      const hasNext = index < lyricsSegments.length - 1;
                      const extraSpace = hasNext && segment.gapAfter >= 4;
                      const spacingClass = hasNext
                        ? extraSpace
                          ? "mb-10 sm:mb-12"
                          : "mb-5 sm:mb-6"
                        : "";

                      return (
                        <p
                          key={`${post.slug}-lyric-${index + 1}`}
                          className={`whitespace-pre-line ${spacingClass}`}
                        >
                          {segment.text}
                        </p>
                      );
                    })}
                  </div>
                )}
              </section>

              <section id="post" className="mt-8 rounded-2xl border border-[#e5e7eb] bg-white px-6 py-7 sm:px-8">
                {post.content ? (
                  <div className="song-content" dangerouslySetInnerHTML={{ __html: post.content }} />
                ) : (
                  <p className="text-base text-[#4b5563]">No hay contenido editorial disponible.</p>
                )}
              </section>

              {relatedSongs.length > 0 ? (
                <section className="mt-8 rounded-2xl border border-[#e5e7eb] bg-white px-6 py-7 sm:px-8">
                  <h2 className="font-[family-name:var(--font-display)] text-3xl text-[#111827]">
                    Mas coros
                  </h2>
                  <ul className="mt-6 grid gap-3 sm:grid-cols-2">
                    {relatedSongs.map((song) => (
                      <li key={song.slug}>
                        <Link
                          href={`/coros/${song.slug}`}
                          className="group block overflow-hidden rounded-xl border border-[#e5e7eb] bg-[#f8fafc] transition hover:bg-[#eef2f7]"
                        >
                          {song.youtubeId ? (
                            <div className="relative aspect-video border-b border-[#dbe2ea] bg-[#e5e7eb]">
                              <Image
                                src={song.thumbnailUrl ?? `https://i.ytimg.com/vi/${song.youtubeId}/mqdefault.jpg`}
                                alt={`Miniatura de ${song.title}`}
                                fill
                                sizes="(min-width: 640px) 240px, 100vw"
                                className="object-cover transition duration-300 group-hover:scale-[1.02]"
                              />
                            </div>
                          ) : null}

                          <div className="px-4 py-3">
                            <p className="text-sm font-semibold text-[#374151]">{song.title}</p>
                          </div>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </section>
              ) : null}
            </article>

            <aside className="space-y-4 lg:sticky lg:top-6 lg:self-start">
              <section className="rounded-2xl border border-[#e5e7eb] bg-white p-6">
                {post.youtubeId ? (
                  <div className="overflow-hidden rounded-xl border border-[#d1d5db] bg-black">
                    <div className="relative aspect-video">
                      <iframe
                        title={`Video de ${post.title}`}
                        src={`https://www.youtube-nocookie.com/embed/${post.youtubeId}`}
                        className="absolute inset-0 h-full w-full"
                        loading="lazy"
                        referrerPolicy="strict-origin-when-cross-origin"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                        allowFullScreen
                      />
                    </div>
                  </div>
                ) : (
                  <p className="rounded-xl border border-dashed border-[#d1d5db] bg-[#f9fafb] px-4 py-5 text-sm leading-7 text-[#6b7280]">
                    Este coro aun no tiene video de YouTube asignado.
                  </p>
                )}

                {post.metaDescription ? (
                  <p className="mt-4 text-sm leading-7 text-[#4b5563]">{post.metaDescription}</p>
                ) : null}
              </section>

              <PresenterControls slug={post.slug} authorLabel={authorLabel} segments={lyricsSegments} />

              <section className="rounded-2xl border border-[#e5e7eb] bg-white p-6">
                <h2 className="font-[family-name:var(--font-display)] text-2xl text-[#111827]">Ficha</h2>
                <dl className="mt-4 space-y-3 text-sm leading-7">
                  <div className="rounded-xl border border-[#e5e7eb] bg-[#f8fafc] px-4 py-3">
                    <dt className="font-semibold text-[#4b5563]">Autores</dt>
                    <dd className="text-[#111827]">{authorLabel}</dd>
                  </div>

                  <div className="rounded-xl border border-[#e5e7eb] bg-[#f8fafc] px-4 py-3">
                    <dt className="font-semibold text-[#4b5563]">Album</dt>
                    <dd className="text-[#111827]">{post.album ?? "No especificado"}</dd>
                  </div>

                  <div className="rounded-xl border border-[#e5e7eb] bg-[#f8fafc] px-4 py-3">
                    <dt className="font-semibold text-[#4b5563]">URL canonica</dt>
                    <dd className="break-words text-[#111827]">{pageUrl}</dd>
                  </div>
                </dl>
              </section>
            </aside>
          </div>
        </div>
      </main>
    </>
  );
}
