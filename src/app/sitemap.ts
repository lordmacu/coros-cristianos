import type { MetadataRoute } from "next";
import { getAllSongPosts, getHomeIndex } from "@/lib/song-posts";
import { getArtistsIndex } from "@/lib/artists";
import { getVideoArtists, getVideosData } from "@/lib/videos";
import { getSiteUrl } from "@/lib/site";

export const dynamic = "force-static";

function toValidDate(value: string | null | undefined): Date | undefined {
  if (!value) return undefined;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? undefined : date;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = getSiteUrl();
  const [songs, homeIndex, artistsIndex, videosData, videoArtists] = await Promise.all([
    getAllSongPosts(),
    getHomeIndex(),
    getArtistsIndex(),
    getVideosData(),
    getVideoArtists(),
  ]);

  const totalPages = homeIndex?.totalPages ?? 1;
  const homeLastModified = toValidDate(homeIndex?.generatedAt);
  const artistsLastModified = toValidDate(artistsIndex?.generatedAt);
  const videosLastModified = toValidDate(videosData?.generatedAt);

  /* ── Paginated home pages ── */
  const homePages: MetadataRoute.Sitemap = Array.from(
    { length: totalPages },
    (_, i) => {
      const pageNum = i + 1;
      return {
        url: pageNum === 1 ? siteUrl : `${siteUrl}/page/${pageNum}`,
        lastModified: homeLastModified,
        changeFrequency: "daily" as const,
        priority: pageNum === 1 ? 1 : 0.6,
      };
    }
  );

  /* ── Artists index ── */
  const artistsPages: MetadataRoute.Sitemap = [
    {
      url: `${siteUrl}/artistas`,
      lastModified: artistsLastModified,
      changeFrequency: "weekly" as const,
      priority: 0.9,
    },
    ...(artistsIndex?.artists ?? []).map((artist) => ({
      url: `${siteUrl}/artistas/${artist.slug}`,
      lastModified: artistsLastModified,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    })),
  ];

  /* ── Videos page ── */
  const videosPage: MetadataRoute.Sitemap = [
    {
      url: `${siteUrl}/videos`,
      lastModified: videosLastModified,
      changeFrequency: "weekly" as const,
      priority: 0.9,
    },
    {
      url: `${siteUrl}/videos/artistas`,
      lastModified: videosLastModified,
      changeFrequency: "weekly" as const,
      priority: 0.85,
    },
    ...videoArtists.map((artist) => ({
      url: `${siteUrl}/videos/artistas/${artist.artistSlug}`,
      lastModified: videosLastModified,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    })),
  ];

  /* ── Extra hubs ── */
  const extraPages: MetadataRoute.Sitemap = [
    {
      url: `${siteUrl}/coros/recientes`,
      lastModified: homeLastModified,
      changeFrequency: "daily" as const,
      priority: 0.85,
    },
    {
      url: `${siteUrl}/ranking/artistas`,
      lastModified: artistsLastModified,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    },
  ];

  /* ── Individual song pages ── */
  const songPages: MetadataRoute.Sitemap = songs.map((song) => ({
    url: `${siteUrl}/coros/${song.slug}`,
    lastModified: song.generatedAt ? new Date(song.generatedAt) : undefined,
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  return [...homePages, ...artistsPages, ...videosPage, ...extraPages, ...songPages];
}
