#!/usr/bin/env node

/**
 * generate-home-pages.mjs
 *
 * Lee todos los JSON de song-posts y genera archivos paginados
 * home_0.json, home_1.json, etc. con solo los campos necesarios
 * para renderizar el home, optimizando la carga.
 *
 * Uso:
 *   node scripts/generate-home-pages.mjs
 *   node scripts/generate-home-pages.mjs --per-page 30
 */

import { promises as fs } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, "..");

const songPostsDir = path.join(projectRoot, "content", "song-posts");
const outputDir = path.join(projectRoot, "content", "home-pages");

// Parse --per-page argument
const args = process.argv.slice(2);
const perPageIdx = args.indexOf("--per-page");
const POSTS_PER_PAGE = perPageIdx >= 0 && args[perPageIdx + 1]
  ? Math.max(1, parseInt(args[perPageIdx + 1], 10) || 20)
  : 20;

/**
 * Extrae un preview de los lyrics colapsando espacios.
 */
function getLyricsPreview(lyrics, maxLength = 220) {
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

/**
 * Separa autores por coma.
 */
function splitAuthors(author) {
  if (!author || typeof author !== "string") return ["Desconocido"];
  const tokens = author.split(",").map((a) => a.trim()).filter(Boolean);
  return tokens.length > 0 ? tokens : ["Desconocido"];
}

/**
 * Construye la URL del thumbnail de YouTube.
 */
function buildThumbnailUrl(youtubeId) {
  if (!youtubeId || typeof youtubeId !== "string" || youtubeId.trim().length === 0) {
    return null;
  }
  return `https://i.ytimg.com/vi/${encodeURIComponent(youtubeId.trim())}/hqdefault.jpg`;
}

/**
 * Extrae solo los campos necesarios para el home de un song post.
 */
function extractHomeFields(raw) {
  const slug = (raw.slug || "").trim();
  const title = (raw.title || "").trim();

  if (!slug || !title) return null;

  const author = (raw.author || "Desconocido").trim();
  const authors = splitAuthors(author);
  const youtubeId = raw.youtube_id && typeof raw.youtube_id === "string" ? raw.youtube_id.trim() : null;

  return {
    slug,
    title,
    author,
    authors,
    album: raw.album && typeof raw.album === "string" && raw.album.trim() ? raw.album.trim() : null,
    metaDescription: (raw.meta_description || "").trim(),
    lyricsPreview: getLyricsPreview(raw.lyrics),
    youtubeId: youtubeId || null,
    thumbnailUrl: buildThumbnailUrl(youtubeId),
    generatedAt: raw.generated_at && typeof raw.generated_at === "string" ? raw.generated_at.trim() : null,
  };
}

async function main() {
  console.log("📄 Generando páginas del home...");
  console.log(`   Fuente:  ${songPostsDir}`);
  console.log(`   Destino: ${outputDir}`);
  console.log(`   Posts por página: ${POSTS_PER_PAGE}`);
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

  // 2. Parsear cada archivo y extraer campos del home
  const songs = [];

  for (const fileName of files) {
    try {
      const filePath = path.join(songPostsDir, fileName);
      const content = await fs.readFile(filePath, "utf-8");
      const raw = JSON.parse(content);
      const homeData = extractHomeFields(raw);

      if (homeData) {
        songs.push(homeData);
      } else {
        console.warn(`   ⚠ Saltando ${fileName}: sin slug o título`);
      }
    } catch (err) {
      console.warn(`   ⚠ Error parseando ${fileName}: ${err.message}`);
    }
  }

  // 3. Ordenar alfabéticamente por título
  songs.sort((a, b) => a.title.localeCompare(b.title, "es"));

  console.log(`   Canciones válidas: ${songs.length}`);

  // 4. Crear directorio de salida (limpiar archivos previos)
  await fs.mkdir(outputDir, { recursive: true });

  // Borrar home_*.json anteriores
  const existing = (await fs.readdir(outputDir)).filter((f) => f.startsWith("home_") && f.endsWith(".json"));
  for (const old of existing) {
    await fs.unlink(path.join(outputDir, old));
  }

  // 5. Paginar y escribir
  const totalPages = Math.max(1, Math.ceil(songs.length / POSTS_PER_PAGE));

  for (let page = 0; page < totalPages; page++) {
    const start = page * POSTS_PER_PAGE;
    const pageSongs = songs.slice(start, start + POSTS_PER_PAGE);

    const pageData = {
      page,
      totalPages,
      totalSongs: songs.length,
      perPage: POSTS_PER_PAGE,
      from: start,
      to: start + pageSongs.length - 1,
      songs: pageSongs,
    };

    const fileName = `home_${page}.json`;
    const filePath = path.join(outputDir, fileName);
    await fs.writeFile(filePath, JSON.stringify(pageData, null, 2), "utf-8");
  }

  // 6. Escribir un index.json con metadata general
  const indexData = {
    totalSongs: songs.length,
    totalPages,
    perPage: POSTS_PER_PAGE,
    generatedAt: new Date().toISOString(),
    pages: Array.from({ length: totalPages }, (_, i) => `home_${i}.json`),
  };

  await fs.writeFile(path.join(outputDir, "index.json"), JSON.stringify(indexData, null, 2), "utf-8");

  console.log();
  console.log(`✅ Generados ${totalPages} archivos de página + index.json`);
  console.log(`   ${outputDir}/`);
  for (let i = 0; i < Math.min(totalPages, 5); i++) {
    const pageSongs = songs.slice(i * POSTS_PER_PAGE, (i + 1) * POSTS_PER_PAGE);
    console.log(`   ├─ home_${i}.json  (${pageSongs.length} canciones)`);
  }
  if (totalPages > 5) {
    console.log(`   ├─ ... ${totalPages - 5} más`);
  }
  console.log(`   └─ index.json`);
}

main().catch((err) => {
  console.error("❌ Error fatal:", err);
  process.exit(1);
});
