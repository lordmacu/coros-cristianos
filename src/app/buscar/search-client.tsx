"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import Fuse, { type FuseResult } from "fuse.js";

type SongEntry = {
  /** title */
  t: string;
  /** author */
  a: string;
  /** slug */
  s: string;
  /** album */
  al: string;
};

const RESULTS_PER_PAGE = 30;

export default function SearchClient() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<FuseResult<SongEntry>[]>([]);
  const [visible, setVisible] = useState(RESULTS_PER_PAGE);
  const [loading, setLoading] = useState(true);
  const fuseRef = useRef<Fuse<SongEntry> | null>(null);
  const indexRef = useRef<SongEntry[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  // Load index once
  useEffect(() => {
    fetch("/search-index.json")
      .then((r) => r.json())
      .then((data: SongEntry[]) => {
        indexRef.current = data;
        fuseRef.current = new Fuse(data, {
          keys: [
            { name: "t", weight: 0.6 },
            { name: "a", weight: 0.3 },
            { name: "al", weight: 0.1 },
          ],
          threshold: 0.35,
          ignoreLocation: true,
          minMatchCharLength: 2,
        });
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  // Autofocus
  useEffect(() => {
    if (!loading && inputRef.current) {
      inputRef.current.focus();
    }
  }, [loading]);

  // Read ?q= from URL on mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const q = params.get("q");
    if (q) {
      setQuery(q);
    }
  }, []);

  // Search on query change
  useEffect(() => {
    if (!fuseRef.current || !query.trim()) {
      setResults([]);
      setVisible(RESULTS_PER_PAGE);
      return;
    }
    const r = fuseRef.current.search(query.trim(), { limit: 200 });
    setResults(r);
    setVisible(RESULTS_PER_PAGE);

    // Update URL without reload
    const url = new URL(window.location.href);
    if (query.trim()) {
      url.searchParams.set("q", query.trim());
    } else {
      url.searchParams.delete("q");
    }
    window.history.replaceState({}, "", url.toString());
  }, [query]);

  const handleLoadMore = useCallback(() => {
    setVisible((v) => v + RESULTS_PER_PAGE);
  }, []);

  const visibleResults = results.slice(0, visible);
  const hasMore = visible < results.length;

  return (
    <main className="mx-auto max-w-7xl px-4 pb-16 pt-8 sm:px-8 lg:px-12">
      <div className="rounded-3xl border border-[#e5e7eb] bg-[#ffffff] p-6 shadow-[0_14px_40px_-35px_rgba(15,23,42,0.32)] sm:p-8 lg:p-10">
        <nav aria-label="Miga de pan" className="mb-4 text-sm text-[#6b7280]">
          <ol className="flex flex-wrap items-center gap-2">
            <li>
              <Link href="/" className="transition hover:text-[#374151]">
                Inicio
              </Link>
            </li>
            <li aria-hidden="true">/</li>
            <li className="text-[#111827]">Buscar</li>
          </ol>
        </nav>

        <header className="border-b border-[#eef0f3] pb-8">
          <p className="text-sm font-semibold uppercase tracking-[0.14em] text-[#6b7280]">
            Buscador
          </p>
          <h1 className="mt-2 max-w-4xl font-[family-name:var(--font-display)] text-4xl leading-tight text-[#111827] sm:text-5xl">
            Buscar canciones cristianas
          </h1>
          <p className="mt-4 max-w-3xl text-base leading-8 text-[#4b5563]">
            Escribe el título, autor o álbum para encontrar la canción que buscas.
          </p>
        </header>

        {/* Search input */}
        <div className="mt-8">
          <div className="relative">
            <svg
              className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#9ca3af]"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <input
              ref={inputRef}
              type="search"
              placeholder={loading ? "Cargando índice…" : "Buscar por título, autor o álbum…"}
              disabled={loading}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full rounded-2xl border border-[#d1d5db] bg-[#f9fafb] py-4 pl-12 pr-4 text-base text-[#111827] placeholder:text-[#9ca3af] outline-none transition focus:border-[#9ca3af] focus:bg-white focus:ring-2 focus:ring-[#e5e7eb] disabled:opacity-50"
            />
            {query && (
              <button
                onClick={() => setQuery("")}
                className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full p-1 text-[#9ca3af] transition hover:bg-[#f3f4f6] hover:text-[#4b5563]"
                aria-label="Limpiar búsqueda"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        </div>

        {/* Results */}
        <section className="mt-6">
          {query.trim() && results.length > 0 && (
            <p className="mb-4 text-sm text-[#6b7280]">
              {results.length} resultado{results.length !== 1 ? "s" : ""} para &ldquo;{query.trim()}&rdquo;
            </p>
          )}

          {query.trim() && results.length === 0 && !loading && (
            <div className="rounded-2xl border border-dashed border-[#d1d5db] bg-[#f8fafc] p-10 text-center">
              <p className="text-lg font-medium text-[#111827]">Sin resultados</p>
              <p className="mt-2 text-sm text-[#6b7280]">
                No encontramos canciones para &ldquo;{query.trim()}&rdquo;. Intenta con otras palabras.
              </p>
            </div>
          )}

          {visibleResults.length > 0 && (
            <ul className="grid gap-3">
              {visibleResults.map(({ item }) => (
                <li key={item.s}>
                  <Link
                    href={`/coros/${item.s}`}
                    className="group flex items-start gap-4 rounded-2xl border border-[#e5e7eb] bg-white p-4 transition duration-200 hover:border-[#cfd8e3] hover:shadow-[0_10px_30px_-24px_rgba(15,23,42,0.45)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#9ca3af] focus-visible:ring-offset-2 sm:items-center"
                  >
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#f3f4f6] text-lg transition group-hover:bg-[#e5e7eb]">
                      🎵
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-[#111827] transition group-hover:text-[#374151]">
                        {item.t}
                      </p>
                      <p className="mt-0.5 text-sm text-[#6b7280]">
                        {item.a}
                        {item.al ? ` · ${item.al}` : ""}
                      </p>
                    </div>
                    <svg
                      className="hidden h-5 w-5 shrink-0 text-[#d1d5db] transition group-hover:text-[#9ca3af] sm:block"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                </li>
              ))}
            </ul>
          )}

          {hasMore && (
            <div className="mt-6 text-center">
              <button
                onClick={handleLoadMore}
                className="rounded-full border border-[#d1d5db] bg-white px-6 py-2.5 text-sm font-semibold text-[#374151] transition hover:bg-[#f9fafb] hover:shadow-sm"
              >
                Mostrar más resultados
              </button>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
