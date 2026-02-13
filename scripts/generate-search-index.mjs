#!/usr/bin/env node

/**
 * generate-search-index.mjs
 *
 * Genera un JSON ligero con título, autor, slug y álbum
 * para alimentar el buscador client-side con Fuse.js.
 *
 * Uso:
 *   node scripts/generate-search-index.mjs
 */

import { promises as fs } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, "..");

const songPostsDir = path.join(projectRoot, "content", "song-posts");
const outputPath = path.join(projectRoot, "public", "search-index.json");

async function main() {
  const files = (await fs.readdir(songPostsDir)).filter((f) => f.endsWith(".json"));
  console.log(`📖 Leyendo ${files.length} canciones…`);

  const BATCH = 200;
  const songs = [];

  for (let i = 0; i < files.length; i += BATCH) {
    const batch = files.slice(i, i + BATCH);
    const results = await Promise.all(
      batch.map(async (file) => {
        try {
          const raw = await fs.readFile(path.join(songPostsDir, file), "utf8");
          const data = JSON.parse(raw);
          return {
            t: data.title || "",
            a: data.author || "",
            s: data.slug || "",
            al: data.album || "",
          };
        } catch {
          return null;
        }
      })
    );
    for (const r of results) {
      if (r && r.s) songs.push(r);
    }
  }

  // Sort alphabetically by title
  songs.sort((a, b) => a.t.localeCompare(b.t, "es"));

  const output = JSON.stringify(songs);
  await fs.writeFile(outputPath, output, "utf8");

  const sizeKB = (Buffer.byteLength(output, "utf8") / 1024).toFixed(1);
  console.log(`✅ Índice generado: ${songs.length} canciones (${sizeKB} KB)`);
  console.log(`   → ${outputPath}`);
}

main().catch((err) => {
  console.error("❌ Error:", err);
  process.exit(1);
});
