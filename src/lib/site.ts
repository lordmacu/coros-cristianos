export const siteConfig = {
  name: "Coros Cristianos",
  description:
    "Letras de coros cristianos con reflexiones devocionales, ficha del autor y video de YouTube cuando esta disponible.",
  defaultUrl: "https://cancionescristianas.net",
};

export function getSiteUrl(): string {
  const envUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim();

  if (!envUrl) {
    return siteConfig.defaultUrl;
  }

  return envUrl.replace(/\/+$/, "");
}

export function getSitePathPrefix(): string {
  const siteUrl = getSiteUrl();

  try {
    const pathname = new URL(siteUrl).pathname.replace(/\/+$/, "");
    return pathname === "/" ? "" : pathname;
  } catch {
    return "";
  }
}
