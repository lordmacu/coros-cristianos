import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  formatGeneratedDate,
  getHomeIndex,
  getHomePage,
} from "@/lib/song-posts";
import { getSiteUrl, siteConfig } from "@/lib/site";
import SongList from "../../song-list";

type PageProps = {
  params: Promise<{ n: string }>;
};

function getPageHref(page: number): string {
  return page <= 1 ? "/" : `/page/${page}`;
}

export async function generateStaticParams() {
  const index = await getHomeIndex();
  if (!index) return [];
  // Pages 2..N (page 1 is the root /)
  return Array.from({ length: index.totalPages - 1 }, (_, i) => ({
    n: String(i + 2),
  }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { n } = await params;
  const siteUrl = getSiteUrl();
  const index = await getHomeIndex();
  const totalPages = index?.totalPages ?? 1;
  const totalSongs = index?.totalSongs ?? 0;
  const currentPage = Number.parseInt(n, 10);

  const title = `Coros Cristianos – Pagina ${currentPage} de ${totalPages}`;
  const description = `Pagina ${currentPage} de ${totalPages} – Navega por nuestra coleccion de ${totalSongs.toLocaleString("es")} letras de coros cristianos con contenido devocional.`;
  const canonical = `${siteUrl}/page/${currentPage}`;

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
    },
    twitter: { card: "summary_large_image", title, description },
    robots: {
      index: true,
      follow: true,
      googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1 },
    },
  };
}

export default async function PaginatedHomePage({ params }: PageProps) {
  const { n } = await params;
  const siteUrl = getSiteUrl();
  const index = await getHomeIndex();

  if (!index) notFound();

  const currentPage = Number.parseInt(n, 10);
  if (Number.isNaN(currentPage) || currentPage < 2 || currentPage > index.totalPages) {
    notFound();
  }

  const pageData = await getHomePage(currentPage - 1);
  if (!pageData) notFound();

  const songs = pageData.songs;
  const totalPages = index.totalPages;
  const totalSongs = index.totalSongs;
  const firstSong = pageData.from + 1;
  const lastSong = pageData.to + 1;

  const previousPageHref = getPageHref(currentPage - 1);
  const nextPageHref = currentPage < totalPages ? getPageHref(currentPage + 1) : null;
  const canonicalUrl = `${siteUrl}/page/${currentPage}`;

  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "CollectionPage",
        "@id": `${canonicalUrl}#webpage`,
        url: canonicalUrl,
        name: `Coros Cristianos – Pagina ${currentPage}`,
        description: `Coros ${firstSong} a ${lastSong} de ${totalSongs}`,
        inLanguage: "es",
        isPartOf: { "@type": "WebSite", "@id": `${siteUrl}/#website` },
      },
      {
        "@type": "BreadcrumbList",
        "@id": `${canonicalUrl}#breadcrumb`,
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Inicio", item: siteUrl },
          { "@type": "ListItem", position: 2, name: `Pagina ${currentPage}`, item: canonicalUrl },
        ],
      },
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
      <link rel="prev" href={`${siteUrl}${previousPageHref}`} />
      {nextPageHref ? <link rel="next" href={`${siteUrl}${nextPageHref}`} /> : null}

      <main className="mx-auto max-w-7xl px-4 pb-16 pt-8 sm:px-8 lg:px-12">
        <div className="rounded-3xl border border-[#e5e7eb] bg-[#ffffff] p-6 shadow-[0_14px_40px_-35px_rgba(15,23,42,0.32)] sm:p-8 lg:p-10">

          <nav aria-label="Miga de pan" className="mb-4 text-sm text-[#6b7280]">
            <ol className="flex flex-wrap items-center gap-2">
              <li><Link href="/" className="transition hover:text-[#374151]">Inicio</Link></li>
              <li aria-hidden="true">/</li>
              <li className="text-[#111827]">Pagina {currentPage}</li>
            </ol>
          </nav>

          <header className="border-b border-[#eef0f3] pb-8">
            <p className="text-sm font-semibold uppercase tracking-[0.14em] text-[#6b7280]">Biblioteca De Coros</p>
            <h1 className="mt-2 max-w-4xl font-[family-name:var(--font-display)] text-4xl leading-tight text-[#111827] sm:text-5xl">
              Coros cristianos – Pagina {currentPage}
            </h1>
            <p className="mt-4 max-w-3xl text-base leading-8 text-[#4b5563]">
              Navega por nuestra coleccion de coros cristianos. Mostrando coros {firstSong} a {lastSong} de{" "}
              {totalSongs.toLocaleString("es")}.
            </p>
            <div className="mt-6 flex flex-wrap gap-2 text-xs font-semibold uppercase tracking-wide text-[#6b7280]">
              <span className="rounded-full border border-[#d6dae1] bg-[#f8fafc] px-3 py-1.5">{totalSongs} coros</span>
              <span className="rounded-full border border-[#d6dae1] bg-[#f8fafc] px-3 py-1.5">Mostrando: {firstSong}–{lastSong}</span>
              <span className="rounded-full border border-[#d6dae1] bg-[#f8fafc] px-3 py-1.5">Pagina {currentPage} de {totalPages}</span>
            </div>
          </header>

          <SongList songs={songs} />

          <nav aria-label="Paginacion de coros" className="mt-8 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[#e5e7eb] bg-white px-4 py-3 sm:px-5">
            <p className="text-sm font-medium text-[#4b5563]">Pagina {currentPage} de {totalPages} · {totalSongs} coros en total</p>
            <div className="flex items-center gap-2">
              <Link href={previousPageHref} rel="prev" className="rounded-full border border-[#d6dae1] bg-[#f8fafc] px-4 py-2 text-sm font-semibold text-[#374151] transition hover:bg-[#eef2f7]">
                ← Anterior
              </Link>
              {nextPageHref ? (
                <Link href={nextPageHref} rel="next" className="rounded-full border border-[#d6dae1] bg-[#f8fafc] px-4 py-2 text-sm font-semibold text-[#374151] transition hover:bg-[#eef2f7]">
                  Siguiente →
                </Link>
              ) : (
                <span className="rounded-full border border-[#e5e7eb] bg-[#f8fafc] px-4 py-2 text-sm font-semibold text-[#9ca3af]" aria-disabled="true">
                  Siguiente →
                </span>
              )}
            </div>
          </nav>
        </div>
      </main>
    </>
  );
}
