#!/usr/bin/env node
/**
 * generate-lyrics-json.mjs
 *
 * Reads every song-post JSON and generates a lightweight lyrics-only
 * JSON in public/lyrics/{slug}.json for the video modal to fetch statically.
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const songPostsDir = path.join(root, "content", "song-posts");
const outDir = path.join(root, "public", "lyrics");

// Ensure output dir
fs.mkdirSync(outDir, { recursive: true });

const files = fs
  .readdirSync(songPostsDir)
  .filter((f) => f.endsWith(".json"));

console.log(`📂  Reading ${files.length} song-post files…`);

let count = 0;

for (const file of files) {
  const raw = fs.readFileSync(path.join(songPostsDir, file), "utf8");
  const data = JSON.parse(raw);

  const slug = (data.slug || "").trim();
  if (!slug) continue;

  const title = (data.title || "").trim();
  const author = (data.author || "Desconocido").trim();
  const album = data.album ? data.album.trim() : null;

  // Extract lyrics stanzas
  let lyricsStanzas = [];
  const lyricsRaw = data.lyrics;

  if (Array.isArray(lyricsRaw)) {
    lyricsStanzas = lyricsRaw
      .map((item) => {
        if (typeof item === "string") return item.trim();
        if (item && typeof item === "object") {
          const text = item.text || item.lyric || item.lyrics || item.stanza || item.verse;
          return typeof text === "string" ? text.trim() : null;
        }
        return null;
      })
      .filter(Boolean);
  } else if (typeof lyricsRaw === "string") {
    const text = lyricsRaw.trim();
    const byGap = text.split(/\n{4,}/).map((p) => p.trim()).filter(Boolean);
    lyricsStanzas = byGap.length > 1 ? byGap : [text];
  }

  const lyrics = lyricsStanzas.join("\n\n\n\n");

  const out = { title, slug, author, album, lyrics, lyricsStanzas };
  fs.writeFileSync(path.join(outDir, `${slug}.json`), JSON.stringify(out), "utf8");
  count++;
}

console.log(`✅  Generated ${count} lyrics JSONs in public/lyrics/`);
