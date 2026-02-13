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

export type VideoArtistSummary = {
  artist: string;
  artistSlug: string;
  videoCount: number;
  thumbnailUrl: string | null;
};

export type VideoArtistDetail = VideoArtistSummary & {
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

function buildVideoArtists(videos: VideoEntry[]): VideoArtistSummary[] {
  const groups = new Map<
    string,
    {
      count: number;
      displayName: string;
      thumbnailUrl: string | null;
    }
  >();

  for (const video of videos) {
    const existing = groups.get(video.artistSlug);
    if (existing) {
      existing.count += 1;
      if (!existing.thumbnailUrl && video.thumbnailUrl) {
        existing.thumbnailUrl = video.thumbnailUrl;
      }
      continue;
    }

    groups.set(video.artistSlug, {
      count: 1,
      displayName: video.artist,
      thumbnailUrl: video.thumbnailUrl ?? null,
    });
  }

  return Array.from(groups.entries())
    .map(([artistSlug, data]) => ({
      artistSlug,
      artist: data.displayName,
      videoCount: data.count,
      thumbnailUrl: data.thumbnailUrl,
    }))
    .sort((a, b) => b.videoCount - a.videoCount || a.artist.localeCompare(b.artist, "es"));
}

export async function getVideoArtists(): Promise<VideoArtistSummary[]> {
  const videosData = await getVideosData();
  if (!videosData) return [];
  return buildVideoArtists(videosData.videos);
}

export async function getVideoArtistBySlug(artistSlug: string): Promise<VideoArtistDetail | null> {
  const videosData = await getVideosData();
  if (!videosData) return null;

  const videos = videosData.videos.filter((video) => video.artistSlug === artistSlug);
  if (videos.length === 0) return null;

  const summary = buildVideoArtists(videosData.videos).find((item) => item.artistSlug === artistSlug);
  const artist = summary?.artist ?? videos[0].artist;
  const thumbnailUrl = summary?.thumbnailUrl ?? videos.find((v) => v.thumbnailUrl)?.thumbnailUrl ?? null;

  return {
    artist,
    artistSlug,
    videoCount: videos.length,
    thumbnailUrl,
    videos,
  };
}
