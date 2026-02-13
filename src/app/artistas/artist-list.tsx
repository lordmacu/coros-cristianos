"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";

type ArtistItem = {
  name: string;
  slug: string;
  songCount: number;
  thumbnailUrl: string | null;
};

type SortMode = "canciones" | "alfabetico";

export default function ArtistList({ artists }: { artists: ArtistItem[] }) {
  const [sortMode, setSortMode] = useState<SortMode>("canciones");

  const sorted = [...artists].sort((a, b) =>
    sortMode === "canciones"
      ? b.songCount - a.songCount || a.name.localeCompare(b.name, "es")
      : a.name.localeCompare(b.name, "es")
  );

  /* ── Alphabetical grouping ── */
  const isAlpha = sortMode === "alfabetico";

  const grouped = new Map<string, ArtistItem[]>();
  if (isAlpha) {
    for (const artist of sorted) {
      const letter = artist.name
        .charAt(0)
        .toUpperCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "");
      const key = /[A-Z]/.test(letter) ? letter : "#";
      if (!grouped.has(key)) grouped.set(key, []);
      grouped.get(key)!.push(artist);
    }
  }

  const letters = isAlpha
    ? Array.from(grouped.keys()).sort((a, b) =>
        a === "#" ? 1 : b === "#" ? -1 : a.localeCompare(b, "es")
      )
    : [];

  return (
    <>
      {/* Sort controls */}
      <div className="mt-6 flex flex-wrap items-center gap-3">
        <span className="text-sm font-medium text-[#6b7280]">Ordenar por:</span>
        <div className="flex gap-1.5">
          <button
            type="button"
            onClick={() => setSortMode("canciones")}
            className={`rounded-full border px-4 py-2 text-sm font-semibold transition ${
              sortMode === "canciones"
                ? "border-[#111827] bg-[#111827] text-white"
                : "border-[#d6dae1] bg-[#f8fafc] text-[#374151] hover:bg-[#eef2f7]"
            }`}
          >
            Mas coros
          </button>
          <button
            type="button"
            onClick={() => setSortMode("alfabetico")}
            className={`rounded-full border px-4 py-2 text-sm font-semibold transition ${
              sortMode === "alfabetico"
                ? "border-[#111827] bg-[#111827] text-white"
                : "border-[#d6dae1] bg-[#f8fafc] text-[#374151] hover:bg-[#eef2f7]"
            }`}
          >
            A – Z
          </button>
        </div>
      </div>

      {/* Letter quick-nav (only in alpha mode) */}
      {isAlpha ? (
        <nav aria-label="Navegacion por letra" className="mt-5 flex flex-wrap gap-1.5">
          {letters.map((letter) => (
            <a
              key={letter}
              href={`#letra-${letter}`}
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#d6dae1] bg-[#f8fafc] text-sm font-bold text-[#374151] transition hover:bg-[#eef2f7]"
            >
              {letter}
            </a>
          ))}
        </nav>
      ) : null}

      {/* ── Alphabetical view ── */}
      {isAlpha
        ? letters.map((letter) => {
            const group = grouped.get(letter)!;
            return (
              <section key={letter} id={`letra-${letter}`} className="mt-10">
                <h2 className="sticky top-0 z-10 mb-4 border-b border-[#eef0f3] bg-white/95 pb-2 font-[family-name:var(--font-display)] text-2xl text-[#111827] backdrop-blur-sm">
                  {letter}
                </h2>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {group.map((artist, idx) => (
                    <ArtistCard key={`${artist.slug}-${idx}`} artist={artist} />
                  ))}
                </div>
              </section>
            );
          })
        : null}

      {/* ── By song count view ── */}
      {!isAlpha ? (
        <section className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {sorted.map((artist, idx) => (
            <ArtistCard key={`${artist.slug}-${idx}`} artist={artist} rank={idx + 1} />
          ))}
        </section>
      ) : null}
    </>
  );
}

/* ── Reusable card ── */

function ArtistCard({ artist, rank }: { artist: ArtistItem; rank?: number }) {
  return (
    <Link
      href={`/artistas/${artist.slug}`}
      className="group flex items-center gap-4 rounded-2xl border border-[#e5e7eb] bg-white p-4 transition duration-200 hover:border-[#cfd8e3] hover:shadow-[0_10px_30px_-24px_rgba(15,23,42,0.45)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#9ca3af] focus-visible:ring-offset-2"
    >
      {rank != null ? (
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#f1f3f6] text-sm font-bold text-[#6b7280]">
          {rank}
        </div>
      ) : null}

      {artist.thumbnailUrl ? (
        <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-full border border-[#dbe2ea] bg-[#e5e7eb]">
          <Image
            src={artist.thumbnailUrl}
            alt={`Foto de ${artist.name}`}
            fill
            sizes="56px"
            className="object-cover"
          />
        </div>
      ) : (
        <div
          className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-[#eceff4] text-xl font-bold text-[#374151]"
          aria-hidden="true"
        >
          {artist.name.charAt(0).toUpperCase()}
        </div>
      )}

      <div className="min-w-0">
        <h3 className="truncate font-semibold text-[#111827] transition group-hover:text-[#1f3b63]">
          {artist.name}
        </h3>
        <p className="mt-0.5 text-sm text-[#6b7280]">
          {artist.songCount} {artist.songCount === 1 ? "coro" : "coros"}
        </p>
      </div>
    </Link>
  );
}
