import type { MetadataRoute } from "next";
import { getAllSongPosts, getHomeIndex } from "@/lib/song-posts";
import { getArtistsIndex } from "@/lib/artists";
import { getSiteUrl } from "@/lib/site";

export const dynamic = "force-static";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = getSiteUrl();
  const [songs, homeIndex, artistsIndex] = await Promise.all([
    getAllSongPosts(),
    getHomeIndex(),
    getArtistsIndex(),
  ]);

  const totalPages = homeIndex?.totalPages ?? 1;

  /* ── Paginated home pages ── */
  const homePages: MetadataRoute.Sitemap = Array.from(
    { length: totalPages },
    (_, i) => {
      const pageNum = i + 1;
      return {
        url: pageNum === 1 ? siteUrl : `${siteUrl}/page/${pageNum}`,
        changeFrequency: "daily" as const,
        priority: pageNum === 1 ? 1 : 0.6,
      };
    }
  );

  /* ── Artists index ── */
  const artistsPages: MetadataRoute.Sitemap = [
    {
      url: `${siteUrl}/artistas`,
      changeFrequency: "weekly" as const,
      priority: 0.9,
    },
    ...(artistsIndex?.artists ?? []).map((artist) => ({
      url: `${siteUrl}/artistas/${artist.slug}`,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    })),
  ];

  /* ── Videos page ── */
  const videosPage: MetadataRoute.Sitemap = [
    {
      url: `${siteUrl}/videos`,
      changeFrequency: "weekly" as const,
      priority: 0.9,
    },
  ];

  /* ── Individual song pages ── */
  const songPages: MetadataRoute.Sitemap = songs.map((song) => ({
    url: `${siteUrl}/coros/${song.slug}`,
    lastModified: song.generatedAt ? new Date(song.generatedAt) : undefined,
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  return [...homePages, ...artistsPages, ...videosPage, ...songPages];
}
