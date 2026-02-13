export const siteConfig = {
  name: "Coros Cristianos",
  description:
    "Letras de coros cristianos con reflexiones devocionales, ficha del autor y video de YouTube cuando esta disponible.",
  defaultUrl: "https://coros.biblia.app",
};

export function getSiteUrl(): string {
  const envUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim();

  if (!envUrl) {
    return siteConfig.defaultUrl;
  }

  return envUrl.replace(/\/+$/, "");
}
