import { promises as fs } from "node:fs";
import path from "node:path";

/* ── Types ── */

export type ArtistSong = {
  slug: string;
  title: string;
  author: string;
  album: string | null;
  metaDescription: string;
  lyricsPreview: string;
  youtubeId: string | null;
  thumbnailUrl: string | null;
  generatedAt: string | null;
};

export type ArtistDetail = {
  name: string;
  slug: string;
  songCount: number;
  thumbnailUrl: string | null;
  songs: ArtistSong[];
  content?: string;
  content_generated?: boolean;
  content_generated_at?: string;
};

export type ArtistSummary = {
  name: string;
  slug: string;
  songCount: number;
  thumbnailUrl: string | null;
};

export type ArtistsIndex = {
  totalArtists: number;
  generatedAt: string;
  artists: ArtistSummary[];
};

/* ── Paths ── */

const artistsDir =
  process.env.ARTISTS_DIR?.trim() ||
  path.join(process.cwd(), "content", "artists");

/* ── Readers ── */

export async function getArtistsIndex(): Promise<ArtistsIndex | null> {
  try {
    const raw = await fs.readFile(path.join(artistsDir, "index.json"), "utf8");
    return JSON.parse(raw) as ArtistsIndex;
  } catch {
    return null;
  }
}

export async function getArtistBySlug(slug: string): Promise<ArtistDetail | null> {
  try {
    const raw = await fs.readFile(path.join(artistsDir, `${slug}.json`), "utf8");
    return JSON.parse(raw) as ArtistDetail;
  } catch {
    return null;
  }
}
