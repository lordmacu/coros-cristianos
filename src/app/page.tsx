import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import {
  formatGeneratedDate,
  getHomeIndex,
  getHomePage,
} from "@/lib/song-posts";
import { getSiteUrl, siteConfig } from "@/lib/site";
import SongList from "./song-list";

function getPageHref(page: number): string {
  return page <= 1 ? "/" : `/page/${page}`;
}

/* ── Metadata ── */

export async function generateMetadata(): Promise<Metadata> {
  const siteUrl = getSiteUrl();
  const index = await getHomeIndex();
  const totalSongs = index?.totalSongs ?? 0;

  const title = "Coros Cristianos: Letras, Acordes y Reflexiones Devocionales";
  const description = `Explora mas de ${totalSongs.toLocaleString("es")} letras de coros cristianos con reflexiones devocionales, video de YouTube y ficha del autor. Encuentra alabanzas, adoracion y canticos espirituales.`;

  return {
    title,
    description,
    keywords: [
      "coros cristianos",
      "letras cristianas",
      "musica de adoracion",
      "alabanza",
      "canciones cristianas",
      "letra de coros",
      "coros de adoracion",
      "himnos cristianos",
      "canticos espirituales",
      "musica cristiana letras",
    ],
    alternates: { canonical: siteUrl },
    openGraph: {
      type: "website",
      locale: "es_CO",
      url: siteUrl,
      title,
      description,
      siteName: siteConfig.name,
      images: [
        {
          url: `${siteUrl}/og-home.png`,
          width: 1200,
          height: 630,
          alt: "Coros Cristianos – Letras y reflexiones devocionales",
        },
      ],
    },
    twitter: { card: "summary_large_image", title, description },
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
  };
}

export default async function HomePage() {
  const siteUrl = getSiteUrl();
  const index = await getHomeIndex();

  if (!index || index.totalPages === 0) {
    return (
      <main className="mx-auto max-w-7xl px-4 pb-16 pt-8 sm:px-8 lg:px-12">
        <div className="rounded-3xl border border-[#e5e7eb] bg-[#ffffff] p-6 shadow-[0_14px_40px_-35px_rgba(15,23,42,0.32)] sm:p-8 lg:p-10">
          <section className="mt-8 rounded-2xl border border-dashed border-[#d1d5db] bg-[#f8fafc] p-10 text-center">
            <h2 className="font-[family-name:var(--font-display)] text-3xl text-[#111827]">
              No hay coros disponibles
            </h2>
            <p className="mt-4 text-base text-[#4b5563]">
              Ejecuta <code>node scripts/generate-home-pages.mjs</code> para generar las páginas.
            </p>
          </section>
        </div>
      </main>
    );
  }

  const currentPage = 1;
  const pageData = await getHomePage(0);
  const songs = pageData?.songs ?? [];
  const totalPages = index.totalPages;
  const totalSongs = index.totalSongs;
  const firstSong = songs.length === 0 ? 0 : pageData!.from + 1;
  const lastSong = pageData ? pageData.to + 1 : 0;
  const nextPageHref = totalPages > 1 ? getPageHref(2) : null;

  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "@id": `${siteUrl}/#website`,
        url: siteUrl,
        name: siteConfig.name,
        description: siteConfig.description,
        inLanguage: "es",
        publisher: { "@type": "Organization", name: siteConfig.name, url: siteUrl },
      },
      {
        "@type": "CollectionPage",
        "@id": `${siteUrl}#webpage`,
        url: siteUrl,
        name: "Coros Cristianos: Letras, Acordes y Reflexiones Devocionales",
        description: `Explora mas de ${totalSongs.toLocaleString("es")} letras de coros cristianos con reflexiones devocionales.`,
        inLanguage: "es",
        isPartOf: { "@type": "WebSite", "@id": `${siteUrl}/#website` },
      },
      {
        "@type": "BreadcrumbList",
        "@id": `${siteUrl}#breadcrumb`,
        itemListElement: [{ "@type": "ListItem", position: 1, name: "Inicio", item: siteUrl }],
      },
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
      {nextPageHref ? <link rel="next" href={`${siteUrl}${nextPageHref}`} /> : null}

      <main className="mx-auto max-w-7xl px-4 pb-16 pt-8 sm:px-8 lg:px-12">
        <div className="rounded-3xl border border-[#e5e7eb] bg-[#ffffff] p-6 shadow-[0_14px_40px_-35px_rgba(15,23,42,0.32)] sm:p-8 lg:p-10">

          <nav aria-label="Miga de pan" className="mb-4 text-sm text-[#6b7280]">
            <ol className="flex flex-wrap items-center gap-2">
              <li><span>Inicio</span></li>
            </ol>
          </nav>

          <header className="border-b border-[#eef0f3] pb-8">
            <p className="text-sm font-semibold uppercase tracking-[0.14em] text-[#6b7280]">Biblioteca De Coros</p>
            <h1 className="mt-2 max-w-4xl font-[family-name:var(--font-display)] text-4xl leading-tight text-[#111827] sm:text-5xl">
              Letras cristianas con contexto, video y contenido devocional
            </h1>
            <p className="mt-4 max-w-3xl text-base leading-8 text-[#4b5563]">
              Explora mas de {totalSongs.toLocaleString("es")} letras de coros cristianos. Cada coro incluye la
              letra completa, una reflexion devocional, ficha del autor y video de YouTube cuando esta disponible.
            </p>
            <div className="mt-6 flex flex-wrap gap-2 text-xs font-semibold uppercase tracking-wide text-[#6b7280]">
              <span className="rounded-full border border-[#d6dae1] bg-[#f8fafc] px-3 py-1.5">{totalSongs} coros</span>
              <span className="rounded-full border border-[#d6dae1] bg-[#f8fafc] px-3 py-1.5">Mostrando: {firstSong}–{lastSong}</span>
              <span className="rounded-full border border-[#d6dae1] bg-[#f8fafc] px-3 py-1.5">Pagina {currentPage} de {totalPages}</span>
            </div>
          </header>

          <SongList songs={songs} />

          {totalPages > 1 ? (
            <nav aria-label="Paginacion de coros" className="mt-8 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[#e5e7eb] bg-white px-4 py-3 sm:px-5">
              <p className="text-sm font-medium text-[#4b5563]">Pagina {currentPage} de {totalPages} · {totalSongs} coros en total</p>
              <div className="flex items-center gap-2">
                <span className="rounded-full border border-[#e5e7eb] bg-[#f8fafc] px-4 py-2 text-sm font-semibold text-[#9ca3af]" aria-disabled="true">← Anterior</span>
                {nextPageHref ? (
                  <Link href={nextPageHref} rel="next" className="rounded-full border border-[#d6dae1] bg-[#f8fafc] px-4 py-2 text-sm font-semibold text-[#374151] transition hover:bg-[#eef2f7]">
                    Siguiente →
                  </Link>
                ) : (
                  <span className="rounded-full border border-[#e5e7eb] bg-[#f8fafc] px-4 py-2 text-sm font-semibold text-[#9ca3af]" aria-disabled="true">Siguiente →</span>
                )}
              </div>
            </nav>
          ) : null}
        </div>
      </main>
    </>
  );
}
