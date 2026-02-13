"use client";

import { useState, useMemo, useCallback, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import type { VideoEntry } from "@/lib/videos";
import { getSitePathPrefix } from "@/lib/site";

/* ── Types ── */

type VideoGridProps = {
  videos: VideoEntry[];
  totalArtists: number;
};

type LyricsData = {
  title: string;
  slug: string;
  author: string;
  album: string | null;
  lyrics: string;
  lyricsStanzas: string[];
};

/* ── Helpers ── */

function shuffleArray<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

const INITIAL_COUNT = 24;
const LOAD_MORE = 24;

/* ── Modal ── */

function VideoModal({
  video,
  onClose,
}: {
  video: VideoEntry;
  onClose: () => void;
}) {
  const sitePathPrefix = useMemo(() => {
    const configuredPrefix = getSitePathPrefix();
    if (configuredPrefix) {
      return configuredPrefix;
    }

    if (typeof window === "undefined") {
      return "";
    }

    const marker = "/videos";
    const idx = window.location.pathname.indexOf(marker);
    return idx > 0 ? window.location.pathname.slice(0, idx) : "";
  }, []);
  const [lyrics, setLyrics] = useState<LyricsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const backdropRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setLoading(true);
    setError(false);
    fetch(`${sitePathPrefix}/lyrics/${video.slug}.json`)
      .then((r) => {
        if (!r.ok) throw new Error("Not found");
        return r.json();
      })
      .then((data) => {
        setLyrics(data as LyricsData);
        setLoading(false);
      })
      .catch(() => {
        setError(true);
        setLoading(false);
      });
  }, [sitePathPrefix, video.slug]);

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [onClose]);

  // Lock body scroll
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  return (
    <div
      ref={backdropRef}
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/60 px-4 py-6 backdrop-blur-sm sm:py-10"
      onClick={(e) => {
        if (e.target === backdropRef.current) onClose();
      }}
    >
      <div className="relative w-full max-w-3xl animate-[modalIn_0.25s_ease-out] rounded-2xl border border-[#e5e7eb] bg-white shadow-2xl">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute right-3 top-3 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-black/60 text-white transition hover:bg-black/80"
          aria-label="Cerrar"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} className="h-5 w-5">
            <path d="M18 6 6 18M6 6l12 12" />
          </svg>
        </button>

        {/* Embedded video */}
        <div className="relative aspect-video w-full overflow-hidden rounded-t-2xl bg-black">
          <iframe
            src={`https://www.youtube-nocookie.com/embed/${video.youtubeId}?autoplay=1&rel=0`}
            title={video.title}
            allow="autoplay; encrypted-media; picture-in-picture"
            allowFullScreen
            className="absolute inset-0 h-full w-full"
          />
        </div>

        {/* Song info + lyrics */}
        <div className="px-5 py-5 sm:px-7 sm:py-6">
          {/* Header */}
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h2 className="font-[family-name:var(--font-display)] text-2xl leading-tight text-[#111827] sm:text-3xl">
                {video.title}
              </h2>
              <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-[#6b7280]">
                <Link
                  href={`/artistas/${video.artistSlug}`}
                  className="font-semibold transition hover:text-[#111827] hover:underline"
                  onClick={onClose}
                >
                  {video.artist}
                </Link>
                {video.album ? (
                  <>
                    <span aria-hidden="true">·</span>
                    <span>{video.album}</span>
                  </>
                ) : null}
              </div>
            </div>
            <Link
              href={`/coros/${video.slug}`}
              onClick={onClose}
              className="shrink-0 rounded-full border border-[#d6dae1] bg-[#f8fafc] px-4 py-2 text-xs font-semibold text-[#374151] transition hover:bg-[#eef2f7]"
            >
              Ver coro ↗
            </Link>
          </div>

          {/* Lyrics */}
          <div className="mt-5 rounded-xl border border-[#e5e7eb] bg-[#f8fafc] px-5 py-5 sm:px-6">
            <h3 className="mb-4 text-xs font-bold uppercase tracking-widest text-[#9ca3af]">
              Letra
            </h3>

            {loading ? (
              <div className="flex items-center gap-2 py-8 text-sm text-[#9ca3af]">
                <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" className="opacity-25" />
                  <path
                    d="M4 12a8 8 0 018-8"
                    stroke="currentColor"
                    strokeWidth="3"
                    strokeLinecap="round"
                    className="opacity-75"
                  />
                </svg>
                Cargando letra…
              </div>
            ) : error ? (
              <p className="py-6 text-sm text-[#9ca3af]">No se encontró la letra de este coro.</p>
            ) : lyrics ? (
              <div className="space-y-5 text-[0.94rem] leading-7 text-[#374151]">
                {lyrics.lyricsStanzas.map((stanza, i) => (
                  <p key={`stanza-${i}`} className="whitespace-pre-line">
                    {stanza}
                  </p>
                ))}
              </div>
            ) : null}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes modalIn {
          from { opacity: 0; transform: translateY(20px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>
    </div>
  );
}

/* ── Grid ── */

export default function VideoGrid({ videos, totalArtists }: VideoGridProps) {
  const [mounted, setMounted] = useState(false);
  const [seed, setSeed] = useState(0);
  const shuffled = useMemo(
    () => (mounted ? shuffleArray(videos) : videos),
    [videos, seed, mounted]
  );
  const [visible, setVisible] = useState(INITIAL_COUNT);
  const [activeVideo, setActiveVideo] = useState<VideoEntry | null>(null);

  // Shuffle only after hydration to avoid mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  const handleShuffle = useCallback(() => {
    setSeed((s) => s + 1);
    setVisible(INITIAL_COUNT);
    setActiveVideo(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const shown = shuffled.slice(0, visible);
  const hasMore = visible < shuffled.length;

  return (
    <>
      {/* Stats + shuffle */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-[#6b7280]">
          <span className="font-semibold text-[#111827]">{videos.length}</span> videos
          {" · "}
          <span className="font-semibold text-[#111827]">{totalArtists}</span> artistas
        </p>
        <button
          onClick={handleShuffle}
          className="flex items-center gap-2 rounded-full border border-[#d6dae1] bg-[#f8fafc] px-4 py-2 text-sm font-semibold text-[#374151] transition hover:bg-[#eef2f7] active:scale-95"
        >
          <span className="text-base">🔀</span> Mezclar
        </button>
      </div>

      {/* Video grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {shown.map((video) => (
          <article
            key={`${video.youtubeId}-${video.slug}`}
            className="group cursor-pointer overflow-hidden rounded-2xl border border-[#e5e7eb] bg-white transition duration-200 hover:border-[#cfd8e3] hover:shadow-[0_10px_30px_-24px_rgba(15,23,42,0.45)]"
            onClick={() => setActiveVideo(video)}
          >
            {/* Thumbnail */}
            <div className="relative aspect-video bg-[#0f0f0f]">
              <Image
                src={video.thumbnailUrl || `https://i.ytimg.com/vi/${video.youtubeId}/hqdefault.jpg`}
                alt={`${video.title} — ${video.artist}`}
                fill
                sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                className="object-cover transition duration-300 group-hover:scale-[1.03]"
              />
              {/* Play button overlay */}
              <div className="absolute inset-0 flex items-center justify-center bg-black/20 transition group-hover:bg-black/30">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-red-600 shadow-lg transition group-hover:scale-110">
                  <svg viewBox="0 0 24 24" fill="white" className="ml-1 h-7 w-7">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Info */}
            <div className="px-4 py-3">
              <p className="line-clamp-2 text-sm font-semibold leading-snug text-[#111827] transition group-hover:text-[#1f3b63]">
                {video.title}
              </p>
              <div className="mt-1.5 flex items-center gap-1.5 text-xs text-[#6b7280]">
                <span className="font-medium">{video.artist}</span>
                {video.album ? (
                  <>
                    <span aria-hidden="true">·</span>
                    <span className="truncate">{video.album}</span>
                  </>
                ) : null}
              </div>
            </div>
          </article>
        ))}
      </div>

      {/* Load more */}
      {hasMore ? (
        <div className="mt-8 text-center">
          <button
            onClick={() => setVisible((v) => v + LOAD_MORE)}
            className="inline-flex items-center gap-2 rounded-full border border-[#d6dae1] bg-[#f8fafc] px-6 py-3 text-sm font-semibold text-[#374151] transition hover:bg-[#eef2f7] active:scale-95"
          >
            Mostrar más videos
            <span className="text-xs text-[#9ca3af]">
              ({visible} de {videos.length})
            </span>
          </button>
        </div>
      ) : null}

      {/* Modal */}
      {activeVideo ? (
        <VideoModal video={activeVideo} onClose={() => setActiveVideo(null)} />
      ) : null}
    </>
  );
}
