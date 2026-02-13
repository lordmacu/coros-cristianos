import type { Metadata } from "next";
import { Fraunces, Manrope } from "next/font/google";
import Link from "next/link";
import "./globals.css";
import { getSiteUrl, siteConfig } from "@/lib/site";

const bodyFont = Manrope({
  variable: "--font-body",
  subsets: ["latin"],
});

const displayFont = Fraunces({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["600", "700"],
});

const siteUrl = getSiteUrl();

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: siteConfig.name,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
  keywords: [
    "canciones cristianas",
    "letras cristianas",
    "musica de adoracion",
    "alabanza",
    "coros cristianos",
  ],
  openGraph: {
    type: "website",
    locale: "es_CO",
    siteName: siteConfig.name,
    title: siteConfig.name,
    description: siteConfig.description,
    url: siteUrl,
    images: [
      {
        url: `${siteUrl}/opengraph-image`,
        width: 1200,
        height: 630,
        alt: `${siteConfig.name} – Letras y contenido devocional`,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: siteConfig.name,
    description: siteConfig.description,
    images: [`${siteUrl}/opengraph-image`],
  },
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: "/",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <head>
        {/* Favicons & Web App Manifest */}
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/site.webmanifest" />
        <meta name="theme-color" content="#111827" />
        {/* LLMs.txt for AI crawlers – https://llmstxt.org */}
        <link rel="alternate" type="text/plain" href={`${siteUrl}/llms.txt`} title="LLMs.txt" />
        <link rel="alternate" type="text/plain" href={`${siteUrl}/llms-full.txt`} title="LLMs-full.txt" />
        <script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-8060767564262502"
          crossOrigin="anonymous"
        />
      </head>
      <body className={`${bodyFont.variable} ${displayFont.variable} antialiased`}>
        <nav className="sticky top-0 z-50 border-b border-[#e5e7eb] bg-white/80 backdrop-blur-md">
          <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-8 lg:px-12">
            <Link
              href="/"
              className="font-[family-name:var(--font-display)] text-lg font-bold text-[#111827] transition hover:text-[#374151]"
            >
              🎵 Canciones Cristianas
            </Link>
            <ul className="flex items-center gap-1 sm:gap-2">
              <li>
                <Link
                  href="/"
                  className="rounded-full px-3 py-1.5 text-sm font-medium text-[#4b5563] transition hover:bg-[#f3f4f6] hover:text-[#111827]"
                >
                  Inicio
                </Link>
              </li>
              <li>
                <Link
                  href="/artistas"
                  className="rounded-full px-3 py-1.5 text-sm font-medium text-[#4b5563] transition hover:bg-[#f3f4f6] hover:text-[#111827]"
                >
                  Artistas
                </Link>
              </li>
              <li>
                <Link
                  href="/videos"
                  className="rounded-full px-3 py-1.5 text-sm font-medium text-[#4b5563] transition hover:bg-[#f3f4f6] hover:text-[#111827]"
                >
                  Videos
                </Link>
              </li>
              <li>
                <Link
                  href="/buscar"
                  className="rounded-full p-2 text-[#4b5563] transition hover:bg-[#f3f4f6] hover:text-[#111827]"
                  aria-label="Buscar"
                >
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </Link>
              </li>
            </ul>
          </div>
        </nav>
        {children}
      </body>
    </html>
  );
}
