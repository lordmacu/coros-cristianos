import { promises as fs } from "node:fs";
import path from "node:path";

/* ── Types ── */

export type VideoEntry = {
  youtubeId: string;
  title: string;
  slug: string;
  artist: string;
  artistSlug: string;
  album: string | null;
  thumbnailUrl: string | null;
};

export type VideosData = {
  totalVideos: number;
  totalArtists: number;
  generatedAt: string;
  videos: VideoEntry[];
};

/* ── Path ── */

const videosPath =
  process.env.VIDEOS_PATH?.trim() ||
  path.join(process.cwd(), "content", "videos.json");

/* ── Reader ── */

export async function getVideosData(): Promise<VideosData | null> {
  try {
    const raw = await fs.readFile(videosPath, "utf8");
    return JSON.parse(raw) as VideosData;
  } catch {
    return null;
  }
}
