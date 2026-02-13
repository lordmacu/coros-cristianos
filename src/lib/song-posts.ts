import { promises as fs } from "node:fs";
import path from "node:path";

export type SongPost = {
  title: string;
  postTitle: string;
  slug: string;
  metaDescription: string;
  author: string;
  lyrics: string;
  lyricsStanzas: string[];
  youtubeId: string | null;
  thumbnailUrl: string | null;
  album: string | null;
  content: string;
  generatedAt: string | null;
};

type SongPostRaw = {
  title?: unknown;
  post_title?: unknown;
  slug?: unknown;
  meta_description?: unknown;
  author?: unknown;
  lyrics?: unknown;
  youtube_id?: unknown;
  album?: unknown;
  content?: unknown;
  generated_at?: unknown;
};

const songPostsDir =
  process.env.SONG_POSTS_DIR?.trim() || path.join(process.cwd(), "content", "song-posts");

const homePagesDir =
  process.env.HOME_PAGES_DIR?.trim() || path.join(process.cwd(), "content", "home-pages");

/* ── Types for pre-built home pages ── */

export type HomeSong = {
  slug: string;
  title: string;
  author: string;
  authors: string[];
  album: string | null;
  metaDescription: string;
  lyricsPreview: string;
  youtubeId: string | null;
  thumbnailUrl: string | null;
  generatedAt: string | null;
};

export type HomePageData = {
  page: number;
  totalPages: number;
  totalSongs: number;
  perPage: number;
  from: number;
  to: number;
  songs: HomeSong[];
};

type HomeIndexData = {
  totalSongs: number;
  totalPages: number;
  perPage: number;
  generatedAt: string;
  pages: string[];
};

function toCleanString(value: unknown): string {
  if (typeof value !== "string") {
    return "";
  }

  return value.trim();
}

function toNullableString(value: unknown): string | null {
  const clean = toCleanString(value);
  return clean.length > 0 ? clean : null;
}

function buildYouTubeThumbnailUrl(youtubeId: string | null, size: "hqdefault" | "mqdefault" = "hqdefault") {
  if (!youtubeId) {
    return null;
  }

  return `https://i.ytimg.com/vi/${encodeURIComponent(youtubeId)}/${size}.jpg`;
}

function toLyricStanza(value: unknown): string | null {
  if (typeof value === "string") {
    const stanza = value.trim();
    return stanza.length > 0 ? stanza : null;
  }

  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return null;
  }

  const record = value as Record<string, unknown>;
  const candidates = [record.text, record.lyric, record.lyrics, record.stanza, record.verse];

  for (const candidate of candidates) {
    if (typeof candidate === "string" && candidate.trim().length > 0) {
      return candidate.trim();
    }
  }

  return null;
}

function extractLyricsStanzas(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value
      .map((item) => toLyricStanza(item))
      .filter((item): item is string => Boolean(item));
  }

  const text = toCleanString(value);

  if (!text) {
    return [];
  }

  const byLargeGap = text
    .split(/\n{4,}/)
    .map((part) => part.trim())
    .filter(Boolean);

  if (byLargeGap.length > 1) {
    return byLargeGap;
  }

  return [text];
}

function parseSongPost(raw: SongPostRaw, fileName: string): SongPost {
  const slug = toCleanString(raw.slug);
  const title = toCleanString(raw.title);

  if (!slug || !title) {
    throw new Error(`Song post ${fileName} must include slug and title`);
  }

  const generatedAt = toNullableString(raw.generated_at);
  const lyricsStanzas = extractLyricsStanzas(raw.lyrics);
  const lyrics = lyricsStanzas.join("\n\n\n\n");
  const youtubeId = toNullableString(raw.youtube_id);

  return {
    slug,
    title,
    postTitle: toCleanString(raw.post_title),
    metaDescription: toCleanString(raw.meta_description),
    author: toCleanString(raw.author) || "Desconocido",
    lyrics,
    lyricsStanzas,
    youtubeId,
    thumbnailUrl: buildYouTubeThumbnailUrl(youtubeId, "hqdefault"),
    album: toNullableString(raw.album),
    content: toCleanString(raw.content),
    generatedAt,
  };
}

/* ── Home page helpers (read pre-built paginated files) ── */

export async function getHomeIndex(): Promise<HomeIndexData | null> {
  try {
    const raw = await fs.readFile(path.join(homePagesDir, "index.json"), "utf8");
    return JSON.parse(raw) as HomeIndexData;
  } catch {
    return null;
  }
}

export async function getHomePage(page: number): Promise<HomePageData | null> {
  try {
    const fileName = `home_${page}.json`;
    const raw = await fs.readFile(path.join(homePagesDir, fileName), "utf8");
    return JSON.parse(raw) as HomePageData;
  } catch {
    return null;
  }
}

/* ── Full song-post readers (used by detail pages) ── */

let _allSongsCache: SongPost[] | null = null;

export async function getAllSongPosts(): Promise<SongPost[]> {
  if (_allSongsCache) return _allSongsCache;

  try {
    const files = (await fs.readdir(songPostsDir))
      .filter((file) => file.endsWith(".json"))
      .sort((a, b) => a.localeCompare(b));

    // Read files in batches of 200 to avoid ENFILE (file table overflow)
    const songs: SongPost[] = [];
    const BATCH = 200;
    for (let i = 0; i < files.length; i += BATCH) {
      const batch = files.slice(i, i + BATCH);
      const results = await Promise.all(
        batch.map(async (fileName) => {
          const filePath = path.join(songPostsDir, fileName);
          const raw = await fs.readFile(filePath, "utf8");
          const parsed = JSON.parse(raw) as SongPostRaw;
          return parseSongPost(parsed, fileName);
        })
      );
      songs.push(...results);
    }

    _allSongsCache = songs.sort((a, b) => a.title.localeCompare(b.title, "es"));
    return _allSongsCache;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      return [];
    }

    throw error;
  }
}

export async function getSongPostBySlug(slug: string): Promise<SongPost | null> {
  const songs = await getAllSongPosts();
  return songs.find((song) => song.slug === slug) ?? null;
}

export function splitAuthors(author: string): string[] {
  const tokens = author
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);

  return tokens.length > 0 ? tokens : ["Desconocido"];
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

export function formatGeneratedDate(generatedAt: string | null): string | null {
  if (!generatedAt) {
    return null;
  }

  const date = new Date(generatedAt);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return new Intl.DateTimeFormat("es-CO", {
    dateStyle: "long",
  }).format(date);
}

export function getLyricsPreview(lyrics: string, maxLength = 180): string {
  const collapsed = lyrics.replace(/\s+/g, " ").trim();

  if (collapsed.length <= maxLength) {
    return collapsed;
  }

  return `${collapsed.slice(0, Math.max(0, maxLength - 1)).trimEnd()}...`;
}
