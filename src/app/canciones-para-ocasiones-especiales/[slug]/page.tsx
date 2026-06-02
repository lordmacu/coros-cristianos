import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getSiteUrl, siteConfig } from "@/lib/site";
import { OCCASIONS, OCCASIONS_HUB_PATH, getOccasion } from "@/lib/occasions";

export const dynamicParams = false;

export function generateStaticParams() {
  return OCCASIONS.map((o) => ({ slug: o.slug }));
}

type PageProps = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const occasion = getOccasion(slug);
  if (!occasion) return {};

  const siteUrl = getSiteUrl();
  const canonical = `${siteUrl}${OCCASIONS_HUB_PATH}/${occasion.slug}`;
  const fallbackImage = `${siteUrl}/opengraph-image`;

  return {
    title: occasion.metaTitle,
    description: occasion.metaDescription,
    alternates: { canonical },
    openGraph: {
      type: "article",
      locale: "es_CO",
      url: canonical,
      title: occasion.metaTitle,
      description: occasion.metaDescription,
      siteName: siteConfig.name,
      images: [{ url: fallbackImage, width: 1200, height: 630, alt: occasion.h1 }],
    },
    twitter: { card: "summary_large_image", title: occasion.metaTitle, description: occasion.metaDescription, images: [fallbackImage] },
    robots: {
      index: true,
      follow: true,
      googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1 },
    },
  };
}

export default async function OccasionPage({ params }: PageProps) {
  const { slug } = await params;
  const occasion = getOccasion(slug);
  if (!occasion) notFound();

  const siteUrl = getSiteUrl();
  const canonical = `${siteUrl}${OCCASIONS_HUB_PATH}/${occasion.slug}`;

  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Article",
        "@id": `${canonical}#article`,
        headline: occasion.h1,
        description: occasion.metaDescription,
        inLanguage: "es",
        isPartOf: { "@type": "WebSite", "@id": `${siteUrl}/#website` },
        mainEntityOfPage: canonical,
        publisher: { "@type": "Organization", name: siteConfig.name, url: siteUrl },
      },
      {
        "@type": "BreadcrumbList",
        "@id": `${canonical}#breadcrumb`,
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Inicio", item: siteUrl },
          { "@type": "ListItem", position: 2, name: "Ocasiones especiales", item: `${siteUrl}${OCCASIONS_HUB_PATH}` },
          { "@type": "ListItem", position: 3, name: occasion.navLabel, item: canonical },
        ],
      },
    ],
  };

  const linkClass =
    "font-semibold text-[#111827] underline decoration-[#cbd5e1] underline-offset-4 transition hover:decoration-[#111827]";

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />

      <main className="mx-auto max-w-7xl px-4 pb-16 pt-8 sm:px-8 lg:px-12">
        <div className="rounded-3xl border border-[#e5e7eb] bg-[#ffffff] p-6 shadow-[0_14px_40px_-35px_rgba(15,23,42,0.32)] sm:p-8 lg:p-10">
          <nav aria-label="Miga de pan" className="mb-4 text-sm text-[#6b7280]">
            <ol className="flex flex-wrap items-center gap-2">
              <li><Link href="/" className="transition hover:text-[#374151]">Inicio</Link></li>
              <li aria-hidden="true">/</li>
              <li><Link href={OCCASIONS_HUB_PATH} className="transition hover:text-[#374151]">Ocasiones especiales</Link></li>
              <li aria-hidden="true">/</li>
              <li className="text-[#111827]">{occasion.navLabel}</li>
            </ol>
          </nav>

          <header className="border-b border-[#eef0f3] pb-8">
            <p className="text-sm font-semibold uppercase tracking-[0.14em] text-[#6b7280]">{occasion.kicker}</p>
            <h1 className="mt-2 max-w-4xl font-[family-name:var(--font-display)] text-4xl leading-tight text-[#111827] sm:text-5xl">
              {occasion.h1}
            </h1>
          </header>

          <article className="mt-8 max-w-3xl">
            {occasion.intro.map((p, i) => (
              <p key={i} className="mt-4 text-base leading-8 text-[#4b5563]">{p}</p>
            ))}

            <h2 className="mt-10 font-[family-name:var(--font-display)] text-2xl text-[#111827]">
              Qué canciones elegir
            </h2>
            <p className="mt-3 text-base leading-8 text-[#4b5563]">{occasion.songGuidance}</p>
            <p className="mt-3 text-base leading-8 text-[#4b5563]">
              Para encontrar ideas, revisa las{" "}
              <Link href="/coros/recientes" className={linkClass}>canciones más recientes</Link>{" "}
              o busca por{" "}
              <Link href="/artistas" className={linkClass}>artista</Link>.
            </p>

            <h2 className="mt-10 font-[family-name:var(--font-display)] text-2xl text-[#111827]">
              Consejos para dedicarla
            </h2>
            <ul className="mt-3 space-y-2">
              {occasion.tips.map((tip, i) => (
                <li key={i} className="flex gap-3 text-base leading-8 text-[#4b5563]">
                  <span aria-hidden="true" className="mt-3 h-1.5 w-1.5 flex-none rounded-full bg-[#9ca3af]" />
                  <span>{tip}</span>
                </li>
              ))}
            </ul>

            <div className="mt-10 rounded-2xl border border-[#e5e7eb] bg-[#f8fafc] p-6 sm:p-8">
              <h2 className="font-[family-name:var(--font-display)] text-2xl text-[#111827]">Completa la sorpresa</h2>
              <p className="mt-3 text-base leading-8 text-[#4b5563]">
                Una canción dedicada se recuerda aún más cuando llega con un detalle. Si estás en Bogotá, mira los{" "}
                <a href={occasion.gift.href} target="_blank" rel="noopener" className={linkClass}>
                  {occasion.gift.text}
                </a>{" "}
                {occasion.giftTail}
                {occasion.extraLinks && occasion.extraLinks.length > 0 ? (
                  <>
                    {" "}También puede servirte la guía de{" "}
                    {occasion.extraLinks.map((l, i) => (
                      <span key={l.href}>
                        <a href={l.href} target="_blank" rel="noopener" className={linkClass}>{l.text}</a>
                        {i < occasion.extraLinks!.length - 1 ? ", " : "."}
                      </span>
                    ))}
                  </>
                ) : null}
              </p>
            </div>

            <p className="mt-10 text-sm text-[#6b7280]">
              Ver más guías en{" "}
              <Link href={OCCASIONS_HUB_PATH} className={linkClass}>canciones para ocasiones especiales</Link>.
            </p>
          </article>
        </div>
      </main>
    </>
  );
}
