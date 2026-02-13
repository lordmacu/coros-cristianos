#!/usr/bin/env node

/**
 * generate-artist-pages.mjs
 *
 * Lee todos los JSON de song-posts, agrupa las canciones por artista
 * y genera:
 *   - content/artists/index.json       → lista de todos los artistas
 *   - content/artists/{slug}.json      → canciones de cada artista
 *
 * Uso:
 *   node scripts/generate-artist-pages.mjs
 */

import { promises as fs } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, "..");

const songPostsDir = path.join(projectRoot, "content", "song-posts");
const outputDir = path.join(projectRoot, "content", "artists");

/* ── Helpers ── */

function slugify(text) {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

function splitAuthors(author) {
  if (!author || typeof author !== "string") return ["Desconocido"];
  const tokens = author
    .split(",")
    .map((a) => a.trim())
    .filter(Boolean);
  return tokens.length > 0 ? tokens : ["Desconocido"];
}

function buildThumbnailUrl(youtubeId) {
  if (!youtubeId || typeof youtubeId !== "string" || youtubeId.trim().length === 0) {
    return null;
  }
  return `https://i.ytimg.com/vi/${encodeURIComponent(youtubeId.trim())}/hqdefault.jpg`;
}

function getLyricsPreview(lyrics, maxLength = 180) {
  let text = "";
  if (Array.isArray(lyrics)) {
    text = lyrics
      .filter((s) => typeof s === "string")
      .join(" ")
      .replace(/\s+/g, " ")
      .trim();
  } else if (typeof lyrics === "string") {
    text = lyrics.replace(/\s+/g, " ").trim();
  }
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength - 1).trimEnd() + "...";
}

/* ── Main ── */

async function main() {
  console.log("🎤 Generando páginas de artistas...");
  console.log(`   Fuente:  ${songPostsDir}`);
  console.log(`   Destino: ${outputDir}`);
  console.log();

  // 1. Leer todos los JSON de song-posts
  let files;
  try {
    files = (await fs.readdir(songPostsDir))
      .filter((f) => f.endsWith(".json"))
      .sort((a, b) => a.localeCompare(b));
  } catch (err) {
    console.error(`❌ No se pudo leer ${songPostsDir}:`, err.message);
    process.exit(1);
  }

  console.log(`   Archivos encontrados: ${files.length}`);

  // 2. Parsear cada archivo y agrupar por artista
  /** @type {Map<string, { name: string; slug: string; songs: any[] }>} */
  const artistMap = new Map();

  let skipped = 0;

  for (const fileName of files) {
    try {
      const filePath = path.join(songPostsDir, fileName);
      const content = await fs.readFile(filePath, "utf-8");
      const raw = JSON.parse(content);

      const songSlug = (raw.slug || "").trim();
      const title = (raw.title || "").trim();
      if (!songSlug || !title) {
        skipped++;
        continue;
      }

      const authorRaw = (raw.author || "Desconocido").trim();
      const authors = splitAuthors(authorRaw);
      const youtubeId =
        raw.youtube_id && typeof raw.youtube_id === "string" ? raw.youtube_id.trim() : null;

      const songData = {
        slug: songSlug,
        title,
        author: authorRaw,
        album:
          raw.album && typeof raw.album === "string" && raw.album.trim()
            ? raw.album.trim()
            : null,
        metaDescription: (raw.meta_description || "").trim(),
        lyricsPreview: getLyricsPreview(raw.lyrics),
        youtubeId: youtubeId || null,
        thumbnailUrl: buildThumbnailUrl(youtubeId),
        generatedAt:
          raw.generated_at && typeof raw.generated_at === "string"
            ? raw.generated_at.trim()
            : null,
      };

      // Add song to each of its authors
      for (const authorName of authors) {
        const artistSlug = slugify(authorName);
        if (!artistSlug) continue;

        if (!artistMap.has(artistSlug)) {
          artistMap.set(artistSlug, {
            name: authorName,
            slug: artistSlug,
            songs: [],
          });
        }

        artistMap.get(artistSlug).songs.push(songData);
      }
    } catch (err) {
      console.warn(`   ⚠ Error parseando ${fileName}: ${err.message}`);
      skipped++;
    }
  }

  console.log(`   Canciones válidas procesadas: ${files.length - skipped}`);
  console.log(`   Artistas únicos: ${artistMap.size}`);

  // 3. Crear directorio de salida (limpiar archivos previos)
  await fs.mkdir(outputDir, { recursive: true });

  const existing = (await fs.readdir(outputDir)).filter((f) => f.endsWith(".json"));
  for (const old of existing) {
    await fs.unlink(path.join(outputDir, old));
  }

  // 4. Ordenar artistas alfabéticamente
  const artists = Array.from(artistMap.values()).sort((a, b) =>
    a.name.localeCompare(b.name, "es")
  );

  // 5. Escribir un JSON por cada artista
  for (const artist of artists) {
    // Ordenar canciones del artista por título
    artist.songs.sort((a, b) => a.title.localeCompare(b.title, "es"));

    // Pick a representative thumbnail (first song with a thumbnail)
    const representativeSong = artist.songs.find((s) => s.thumbnailUrl) || artist.songs[0];

    const artistData = {
      name: artist.name,
      slug: artist.slug,
      songCount: artist.songs.length,
      thumbnailUrl: representativeSong?.thumbnailUrl || null,
      songs: artist.songs,
    };

    const filePath = path.join(outputDir, `${artist.slug}.json`);
    await fs.writeFile(filePath, JSON.stringify(artistData, null, 2), "utf-8");
  }

  // 6. Escribir index.json con lista de artistas (sin las canciones, solo metadata)
  const indexArtists = artists.map((a) => ({
    name: a.name,
    slug: a.slug,
    songCount: a.songs.length,
    thumbnailUrl: (a.songs.find((s) => s.thumbnailUrl) || a.songs[0])?.thumbnailUrl || null,
  }));

  const indexData = {
    totalArtists: artists.length,
    generatedAt: new Date().toISOString(),
    artists: indexArtists,
  };

  await fs.writeFile(
    path.join(outputDir, "index.json"),
    JSON.stringify(indexData, null, 2),
    "utf-8"
  );

  // 7. Summary
  console.log();
  console.log(`✅ Generados ${artists.length} archivos de artista + index.json`);
  console.log(`   ${outputDir}/`);

  const top5 = artists.slice(0, 5);
  for (const a of top5) {
    console.log(`   ├─ ${a.slug}.json  (${a.songs.length} canciones)`);
  }
  if (artists.length > 5) {
    console.log(`   ├─ ... ${artists.length - 5} más`);
  }
  console.log(`   └─ index.json`);
}

main().catch((err) => {
  console.error("❌ Error fatal:", err);
  process.exit(1);
});
