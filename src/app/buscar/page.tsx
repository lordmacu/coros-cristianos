import type { Metadata } from "next";
import { getSiteUrl, siteConfig } from "@/lib/site";
import SearchClient from "./search-client";

const siteUrl = getSiteUrl();
const pageUrl = `${siteUrl}/buscar`;

export const metadata: Metadata = {
  title: "Buscar canciones cristianas",
  description:
    "Busca entre más de 3.000 letras de canciones cristianas por título, autor o álbum. Encuentra la canción que buscas al instante.",
  alternates: { canonical: pageUrl },
  openGraph: {
    type: "website",
    locale: "es_CO",
    url: pageUrl,
    title: "Buscar canciones cristianas",
    description:
      "Busca entre más de 3.000 letras de canciones cristianas por título, autor o álbum.",
    siteName: siteConfig.name,
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function SearchPage() {
  return <SearchClient />;
}
