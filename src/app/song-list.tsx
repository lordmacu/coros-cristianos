import Image from "next/image";
import Link from "next/link";
import { formatGeneratedDate, type HomeSong } from "@/lib/song-posts";

type SongListProps = {
  songs: HomeSong[];
};

export default function SongList({ songs }: SongListProps) {
  return (
    <section aria-label="Lista de coros" className="mt-8 columns-1 [column-gap:1rem] md:columns-2 xl:columns-3">
      {songs.map((song, songIndex) => {
        const mainAuthor = song.authors[0] ?? "Desconocido";
        const updatedLabel = formatGeneratedDate(song.generatedAt);

        return (
          <article
            key={`${song.slug}-${songIndex}`}
            className="mb-4 w-full break-inside-avoid rounded-2xl border border-[#e5e7eb] bg-white transition duration-200 hover:border-[#cfd8e3] hover:shadow-[0_10px_30px_-24px_rgba(15,23,42,0.45)]"
          >
            <Link
              href={`/coros/${song.slug}`}
              aria-label={`Leer letra del coro: ${song.title} por ${mainAuthor}`}
              className="group block p-5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#9ca3af] focus-visible:ring-offset-2 rounded-2xl"
            >
              {song.thumbnailUrl ? (
                <div className="-mx-5 -mt-5 mb-4 overflow-hidden rounded-t-2xl border-b border-[#dbe2ea] bg-[#e5e7eb]">
                  <div className="relative aspect-video">
                    <Image
                      src={song.thumbnailUrl}
                      alt={`Video del coro ${song.title} por ${mainAuthor}`}
                      fill
                      sizes="(min-width: 1280px) 30vw, (min-width: 768px) 45vw, 100vw"
                      priority={songIndex === 0}
                      className="object-cover transition duration-300 group-hover:scale-[1.02]"
                    />
                  </div>
                </div>
              ) : null}

              <div className="flex items-start gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#eceff4] text-lg font-bold text-[#374151]" aria-hidden="true">
                  {mainAuthor.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-[#4b5563]">{mainAuthor}</p>
                  <h2 className="mt-0.5 line-clamp-2 font-[family-name:var(--font-display)] text-2xl leading-tight text-[#111827]">
                    <span className="transition group-hover:text-[#1f3b63]">{song.title}</span>
                  </h2>
                </div>
              </div>

              <div className="mt-4 flex flex-wrap gap-2 text-xs font-semibold uppercase tracking-wide text-[#6b7280]">
                {song.authors.slice(0, 2).map((author, authorIdx) => (
                  <span key={`${song.slug}-${author}-${authorIdx}`} className="rounded-full border border-[#d6dae1] bg-[#f8fafc] px-2.5 py-1">
                    {author}
                  </span>
                ))}
                {song.album ? (
                  <span className="rounded-full border border-[#d6dae1] bg-[#f8fafc] px-2.5 py-1">
                    Album: {song.album}
                  </span>
                ) : null}
              </div>

              <p className="mt-4 text-sm leading-6 text-[#4b5563]">{song.metaDescription}</p>

              <p className="mt-4 rounded-xl border border-[#e5e7eb] bg-[#f8fafc] px-4 py-3 text-sm leading-7 text-[#374151]">
                {song.lyricsPreview}
              </p>

              <div className="mt-5 flex items-center justify-between gap-3">
                <span className="rounded-full border border-[#d6dae1] bg-[#f8fafc] px-4 py-2 text-sm font-semibold text-[#374151] transition group-hover:bg-[#eef2f7]">
                  Ver coro
                </span>
                {updatedLabel ? (
                  <time className="text-xs font-medium text-[#6b7280]" dateTime={song.generatedAt ?? undefined}>
                    Actualizado: {updatedLabel}
                  </time>
                ) : (
                  <span className="text-xs font-medium text-[#6b7280]">Sin fecha</span>
                )}
              </div>
            </Link>
          </article>
        );
      })}
    </section>
  );
}
