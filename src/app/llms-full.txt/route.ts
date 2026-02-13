import { promises as fs } from "node:fs";
import path from "node:path";
import { getSiteUrl } from "@/lib/site";

export const dynamic = "force-static";

function formatDate(value: string | null | undefined): string {
  if (!value) return "No disponible";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "No disponible";
  return new Intl.DateTimeFormat("es-CO", { dateStyle: "long", timeStyle: "short" }).format(date);
}

export async function GET() {
  const siteUrl = getSiteUrl();
  const homePagesDir =
    process.env.HOME_PAGES_DIR?.trim() || path.join(process.cwd(), "content", "home-pages");
  const artistsDir =
    process.env.ARTISTS_DIR?.trim() || path.join(process.cwd(), "content", "artists");
  const videosPath =
    process.env.VIDEOS_PATH?.trim() || path.join(process.cwd(), "content", "videos.json");

  const [homeIndex, artistsIndex, videosData] = await Promise.all([
    fs
      .readFile(path.join(homePagesDir, "index.json"), "utf8")
      .then((raw) => JSON.parse(raw) as { totalSongs?: number; totalPages?: number; generatedAt?: string })
      .catch(() => null),
    fs
      .readFile(path.join(artistsDir, "index.json"), "utf8")
      .then((raw) => JSON.parse(raw) as { totalArtists?: number; generatedAt?: string })
      .catch(() => null),
    fs
      .readFile(videosPath, "utf8")
      .then((raw) => JSON.parse(raw) as { totalVideos?: number; generatedAt?: string })
      .catch(() => null),
  ]);

  const totalSongs = homeIndex?.totalSongs ?? 0;
  const totalArtists = artistsIndex?.totalArtists ?? 0;
  const totalPages = homeIndex?.totalPages ?? 0;
  const totalVideos = videosData?.totalVideos ?? 0;

  const text = `# Canciones Cristianas – Documentacion completa para LLMs

> Recurso estructurado para asistentes y agentes que necesiten resumir, citar o navegar el sitio.

## Resumen del sitio

- URL base: ${siteUrl}
- Idioma principal: es-CO
- Coros indexados: ${totalSongs.toLocaleString("es")}
- Artistas indexados: ${totalArtists.toLocaleString("es")}
- Paginas del listado principal: ${totalPages.toLocaleString("es")}
- Videos indexados: ${totalVideos.toLocaleString("es")}

## Secciones principales

1. Inicio (${siteUrl}/)
2. Coros recientes (${siteUrl}/coros/recientes)
3. Artistas (${siteUrl}/artistas)
4. Ranking de artistas (${siteUrl}/ranking/artistas)
5. Videos (${siteUrl}/videos)
6. Videos por artista (${siteUrl}/videos/artistas)
7. Coros por slug (${siteUrl}/coros/{slug})
8. Artistas por slug (${siteUrl}/artistas/{slug})
9. Videos por artista/slug (${siteUrl}/videos/artistas/{slug})
10. Paginacion (${siteUrl}/page/{n})

## Metadatos y descubrimiento

- Sitemap: ${siteUrl}/sitemap.xml
- Robots: ${siteUrl}/robots.txt
- LLMs breve: ${siteUrl}/llms.txt
- Open Graph base: ${siteUrl}/opengraph-image

## Estructura por pagina de coro

Cada pagina de coro incluye normalmente:
- Titulo y autor(es)
- Letra completa en estrofas
- Contenido devocional/editorial
- Album (si aplica)
- Video de YouTube (si aplica)
- Datos estructurados Schema.org (Article, MusicComposition, MusicRecording, VideoObject)

## Estructura por pagina de artista

Cada pagina de artista incluye normalmente:
- Nombre y miniatura/foto
- Conteo total de coros
- Lista de albumes detectados
- Listado de canciones enlazadas
- Datos estructurados Schema.org (MusicGroup, ItemList)

## Fechas de actualizacion de indices

- Catalogo principal: ${formatDate(homeIndex?.generatedAt)}
- Directorio de artistas: ${formatDate(artistsIndex?.generatedAt)}
- Directorio de videos: ${formatDate(videosData?.generatedAt)}

## Politica de contenido

El sitio presenta letras con fines informativos/devocionales y enlaza videos de YouTube cuando existen. Los derechos de las canciones pertenecen a sus autores y titulares correspondientes.
`;

  return new Response(text, {
    headers: {
      "content-type": "text/plain; charset=utf-8",
    },
  });
}
