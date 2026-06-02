import type { Metadata } from "next";
import Link from "next/link";
import { getSiteUrl, siteConfig } from "@/lib/site";
import { OCCASIONS, OCCASIONS_HUB_PATH } from "@/lib/occasions";

export async function generateMetadata(): Promise<Metadata> {
  const siteUrl = getSiteUrl();
  const canonical = `${siteUrl}${OCCASIONS_HUB_PATH}`;
  const fallbackImage = `${siteUrl}/opengraph-image`;

  const title = "Canciones para ocasiones especiales: aniversarios, Día de la Madre y más";
  const description =
    "Guías de canciones cristianas por ocasión: aniversarios, Día de la Madre, San Valentín, Amor y Amistad y cumpleaños, con ideas para dedicarlas y celebrar.";

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
      images: [{ url: fallbackImage, width: 1200, height: 630, alt: title }],
    },
    twitter: { card: "summary_large_image", title, description, images: [fallbackImage] },
    robots: {
      index: true,
      follow: true,
      googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1 },
    },
  };
}

export default function OcasionesHubPage() {
  const siteUrl = getSiteUrl();
  const canonical = `${siteUrl}${OCCASIONS_HUB_PATH}`;

  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "CollectionPage",
        "@id": `${canonical}#webpage`,
        url: canonical,
        name: "Canciones para ocasiones especiales",
        description:
          "Guías de canciones cristianas por ocasión, con ideas para dedicarlas y celebrar momentos importantes.",
        inLanguage: "es",
        isPartOf: { "@type": "WebSite", "@id": `${siteUrl}/#website` },
      },
      {
        "@type": "BreadcrumbList",
        "@id": `${canonical}#breadcrumb`,
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Inicio", item: siteUrl },
          { "@type": "ListItem", position: 2, name: "Canciones para ocasiones especiales", item: canonical },
        ],
      },
      {
        "@type": "ItemList",
        "@id": `${canonical}#guides`,
        name: "Guías por ocasión",
        numberOfItems: OCCASIONS.length,
        itemListElement: OCCASIONS.map((o, idx) => ({
          "@type": "ListItem",
          position: idx + 1,
          url: `${canonical}/${o.slug}`,
          name: o.h1,
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
              <li><Link href="/" className="transition hover:text-[#374151]">Inicio</Link></li>
              <li aria-hidden="true">/</li>
              <li className="text-[#111827]">Canciones para ocasiones especiales</li>
            </ol>
          </nav>

          <header className="border-b border-[#eef0f3] pb-8">
            <p className="text-sm font-semibold uppercase tracking-[0.14em] text-[#6b7280]">Guías</p>
            <h1 className="mt-2 max-w-4xl font-[family-name:var(--font-display)] text-4xl leading-tight text-[#111827] sm:text-5xl">
              Canciones para ocasiones especiales
            </h1>
            <p className="mt-4 max-w-3xl text-base leading-8 text-[#4b5563]">
              La música acompaña los momentos que más recordamos. Reunimos guías de canciones cristianas para cada
              ocasión, con ideas para elegirlas, dedicarlas y celebrar. Explora también las{" "}
              <Link href="/coros/recientes" className="font-semibold text-[#111827] underline decoration-[#cbd5e1] underline-offset-4 transition hover:decoration-[#111827]">
                canciones más recientes
              </Link>{" "}
              y la{" "}
              <Link href="/artistas" className="font-semibold text-[#111827] underline decoration-[#cbd5e1] underline-offset-4 transition hover:decoration-[#111827]">
                lista de artistas
              </Link>.
            </p>
          </header>

          <ul className="mt-8 grid gap-4 sm:grid-cols-2">
            {OCCASIONS.map((o) => (
              <li key={o.slug}>
                <Link
                  href={`${OCCASIONS_HUB_PATH}/${o.slug}`}
                  className="block h-full rounded-2xl border border-[#e5e7eb] bg-white p-5 transition hover:border-[#cbd5e1] hover:shadow-[0_14px_40px_-35px_rgba(15,23,42,0.32)]"
                >
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#9ca3af]">{o.kicker}</p>
                  <h2 className="mt-2 font-[family-name:var(--font-display)] text-xl text-[#111827]">{o.h1}</h2>
                  <p className="mt-2 text-sm leading-7 text-[#4b5563]">{o.summary}</p>
                  <span className="mt-3 inline-block text-sm font-semibold text-[#111827]">Ver guía →</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </main>
    </>
  );
}
