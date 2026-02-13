import { promises as fs } from "node:fs";
import path from "node:path";
import { getSiteUrl } from "@/lib/site";

export const dynamic = "force-static";

export async function GET() {
  const siteUrl = getSiteUrl();
  const homeIndexPath =
    process.env.HOME_PAGES_DIR?.trim() || path.join(process.cwd(), "content", "home-pages");
  const artistsDir =
    process.env.ARTISTS_DIR?.trim() || path.join(process.cwd(), "content", "artists");

  const [homeIndex, artistsIndex] = await Promise.all([
    fs
      .readFile(path.join(homeIndexPath, "index.json"), "utf8")
      .then((raw) => JSON.parse(raw) as { totalSongs?: number; totalPages?: number })
      .catch(() => null),
    fs
      .readFile(path.join(artistsDir, "index.json"), "utf8")
      .then((raw) => JSON.parse(raw) as { totalArtists?: number })
      .catch(() => null),
  ]);

  const totalSongs = homeIndex?.totalSongs ?? 0;
  const totalArtists = artistsIndex?.totalArtists ?? 0;
  const totalPages = homeIndex?.totalPages ?? 0;

  const text = `# Coros Cristianos

> Letras de coros cristianos con reflexiones devocionales, ficha del autor y video de YouTube cuando esta disponible.

Coros Cristianos es una plataforma de consulta de letras cristianas en español.

## Contenido principal

- [Inicio](${siteUrl}/): Catalogo paginado de coros.
- [Coros recientes](${siteUrl}/coros/recientes): Ultimos coros actualizados.
- [Artistas](${siteUrl}/artistas): Directorio de autores e interpretes.
- [Ranking de artistas](${siteUrl}/ranking/artistas): Artistas con mas coros.
- [Videos](${siteUrl}/videos): Seleccion de videos relacionados.
- [Videos por artista](${siteUrl}/videos/artistas): Videos agrupados por artista.
- [Sitemap](${siteUrl}/sitemap.xml): URLs indexables.
- [Documentacion extendida para LLMs](${siteUrl}/llms-full.txt): Version detallada.

## Cobertura

- Coros: ${totalSongs.toLocaleString("es")}
- Artistas: ${totalArtists.toLocaleString("es")}
- Paginas de listado: ${totalPages.toLocaleString("es")}

## Rutas estables

- Coro individual: \`${siteUrl}/coros/{slug}\`
- Artista individual: \`${siteUrl}/artistas/{slug}\`
- Videos de un artista: \`${siteUrl}/videos/artistas/{slug}\`
- Paginacion: \`${siteUrl}/page/{n}\`
`;

  return new Response(text, {
    headers: {
      "content-type": "text/plain; charset=utf-8",
    },
  });
}
