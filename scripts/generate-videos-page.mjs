#!/usr/bin/env node
/**
 * generate-videos-page.mjs
 *
 * Reads every artist JSON in content/artists/ and selects up to 5 videos
 * per artist (from those with the most videos). Produces a single
 * content/videos.json that the /videos page consumes.
 *
 * The output is NOT pre-shuffled — the page shuffles client-side on every load.
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const artistsDir = path.join(root, "content", "artists");
const outPath = path.join(root, "content", "videos.json");

/* ── Config ── */
const MAX_VIDEOS_PER_ARTIST = 5;
const MIN_VIDEOS_TO_QUALIFY = 3; // artist must have at least this many to be included

/* ── Main ── */
const files = fs
  .readdirSync(artistsDir)
  .filter((f) => f.endsWith(".json") && f !== "index.json");

console.log(`📂  Reading ${files.length} artist files…`);

/**
 * @typedef {{ youtubeId: string, title: string, slug: string, artist: string, artistSlug: string, album: string|null, thumbnailUrl: string|null }} VideoEntry
 */

/** @type {{ artist: string, artistSlug: string, videoCount: number, videos: VideoEntry[] }[]} */
const artistBuckets = [];

for (const file of files) {
  const raw = fs.readFileSync(path.join(artistsDir, file), "utf8");
  const data = JSON.parse(raw);

  // Skip "Desconocido" — not a real artist page
  if (data.slug === "desconocido") continue;

  const withVideo = data.songs.filter(
    (s) => s.youtubeId && typeof s.youtubeId === "string" && s.youtubeId.length > 5
  );

  if (withVideo.length < MIN_VIDEOS_TO_QUALIFY) continue;

  // Pick up to MAX_VIDEOS_PER_ARTIST, spread across the list (not just the first N)
  const step = Math.max(1, Math.floor(withVideo.length / MAX_VIDEOS_PER_ARTIST));
  const picked = [];
  for (let i = 0; i < withVideo.length && picked.length < MAX_VIDEOS_PER_ARTIST; i += step) {
    const s = withVideo[i];
    picked.push({
      youtubeId: s.youtubeId,
      title: s.title,
      slug: s.slug,
      artist: data.name,
      artistSlug: data.slug,
      album: s.album || null,
      thumbnailUrl: s.thumbnailUrl || `https://i.ytimg.com/vi/${s.youtubeId}/hqdefault.jpg`,
    });
  }

  artistBuckets.push({
    artist: data.name,
    artistSlug: data.slug,
    videoCount: withVideo.length,
    videos: picked,
  });
}

// Sort buckets by video count descending
artistBuckets.sort((a, b) => b.videoCount - a.videoCount);

// Flatten all selected videos
const allVideos = artistBuckets.flatMap((b) => b.videos);

const output = {
  totalVideos: allVideos.length,
  totalArtists: artistBuckets.length,
  generatedAt: new Date().toISOString(),
  videos: allVideos,
};

fs.writeFileSync(outPath, JSON.stringify(output, null, 2), "utf8");

console.log(`✅  Generated ${outPath}`);
console.log(`    ${output.totalVideos} videos from ${output.totalArtists} artists`);
console.log(`    Top contributors:`);
artistBuckets.slice(0, 10).forEach((b, i) =>
  console.log(`    ${i + 1}. ${b.artist} — ${b.videos.length} selected (of ${b.videoCount})`)
);
