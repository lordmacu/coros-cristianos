import type { Metadata } from "next";
import Link from "next/link";
import { getArtistsIndex } from "@/lib/artists";
import { getSiteUrl, siteConfig } from "@/lib/site";
import ArtistList from "./artist-list";

export async function generateMetadata(): Promise<Metadata> {
  const siteUrl = getSiteUrl();
  const index = await getArtistsIndex();
  const totalArtists = index?.totalArtists ?? 0;

  const title = "Artistas de Coros Cristianos – Directorio Completo";
  const description = `Explora ${totalArtists} artistas y compositores de coros cristianos. Encuentra todas las letras organizadas por autor con reflexiones devocionales.`;

  return {
    title,
    description,
    keywords: [
      "artistas cristianos",
      "compositores cristianos",
      "autores de coros",
      "musica de adoracion",
      "cantantes cristianos",
      "himnos cristianos autores",
    ],
    alternates: {
      canonical: `${siteUrl}/artistas`,
    },
    openGraph: {
      type: "website",
      locale: "es_CO",
      url: `${siteUrl}/artistas`,
      title,
      description,
      siteName: siteConfig.name,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
  };
}

export default async function ArtistsPage() {
  const siteUrl = getSiteUrl();
  const index = await getArtistsIndex();

  if (!index || index.totalArtists === 0) {
    return (
      <main className="mx-auto max-w-7xl px-4 pb-16 pt-8 sm:px-8 lg:px-12">
        <div className="rounded-3xl border border-[#e5e7eb] bg-[#ffffff] p-6 shadow-[0_14px_40px_-35px_rgba(15,23,42,0.32)] sm:p-8 lg:p-10">
          <section className="mt-8 rounded-2xl border border-dashed border-[#d1d5db] bg-[#f8fafc] p-10 text-center">
            <h2 className="font-[family-name:var(--font-display)] text-3xl text-[#111827]">
              No hay artistas disponibles
            </h2>
            <p className="mt-4 text-base text-[#4b5563]">
              Ejecuta <code>node scripts/generate-artist-pages.mjs</code> para generar los datos.
            </p>
          </section>
        </div>
      </main>
    );
  }

  const artists = index.artists;

  /* ── JSON-LD ── */
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
      },
      {
        "@type": "CollectionPage",
        "@id": `${siteUrl}/artistas#webpage`,
        url: `${siteUrl}/artistas`,
        name: "Artistas de Coros Cristianos",
        description: `Directorio de ${artists.length} artistas y compositores de coros cristianos.`,
        inLanguage: "es",
        isPartOf: { "@type": "WebSite", "@id": `${siteUrl}/#website` },
      },
      {
        "@type": "BreadcrumbList",
        "@id": `${siteUrl}/artistas#breadcrumb`,
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Inicio", item: siteUrl },
          { "@type": "ListItem", position: 2, name: "Artistas", item: `${siteUrl}/artistas` },
        ],
      },
      {
        "@type": "ItemList",
        "@id": `${siteUrl}/artistas#artistlist`,
        name: "Artistas de Coros Cristianos",
        numberOfItems: artists.length,
        itemListOrder: "https://schema.org/ItemListOrderAscending",
        itemListElement: artists.slice(0, 50).map((artist, idx) => ({
          "@type": "ListItem",
          position: idx + 1,
          url: `${siteUrl}/artistas/${artist.slug}`,
          item: {
            "@type": "Person",
            name: artist.name,
            url: `${siteUrl}/artistas/${artist.slug}`,
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
              <li className="text-[#111827]">Artistas</li>
            </ol>
          </nav>

          <header className="border-b border-[#eef0f3] pb-8">
            <p className="text-sm font-semibold uppercase tracking-[0.14em] text-[#6b7280]">
              Directorio de Artistas
            </p>
            <h1 className="mt-2 max-w-4xl font-[family-name:var(--font-display)] text-4xl leading-tight text-[#111827] sm:text-5xl">
              Artistas y compositores de coros cristianos
            </h1>
            <p className="mt-4 max-w-3xl text-base leading-8 text-[#4b5563]">
              Explora {artists.length} artistas y encuentra todas sus letras con reflexiones
              devocionales, video y ficha del autor.
            </p>

            <div className="mt-6 flex flex-wrap gap-2 text-xs font-semibold uppercase tracking-wide text-[#6b7280]">
              <span className="rounded-full border border-[#d6dae1] bg-[#f8fafc] px-3 py-1.5">
                {artists.length} artistas
              </span>
            </div>
          </header>

          {/* Interactive artist list with sort controls */}
          <ArtistList artists={artists} />
        </div>
      </main>
    </>
  );
}
