"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

type PresenterSegment = {
  text: string;
  gapAfter: number;
};

type PresenterControlsProps = {
  slug: string;
  authorLabel: string;
  segments: PresenterSegment[];
};

function ensurePresenterShell(presenterWindow: Window): {
  authorElement: HTMLElement;
  stanzaElement: HTMLElement;
  counterElement: HTMLElement;
} | null {
  const doc = presenterWindow.document;

  if (!doc.getElementById("presenter-root")) {
    doc.open();
    doc.write(`<!doctype html>
<html lang="es">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Presenter</title>
    <style>
      :root { color-scheme: dark; }
      * { box-sizing: border-box; }
      body {
        margin: 0;
        min-height: 100vh;
        font-family: "Manrope", Arial, sans-serif;
        background: radial-gradient(circle at 20% 20%, #1e293b 0%, #0b1220 58%, #070b14 100%);
        color: #f8fafc;
      }
      main {
        min-height: 100vh;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 44px 48px;
      }
      .meta {
        text-align: center;
        margin-bottom: 26px;
      }
      .author {
        margin: 0;
        color: #cbd5e1;
        font-size: clamp(1rem, 1.5vw, 1.35rem);
      }
      .stanza {
        width: min(1020px, 100%);
        border-radius: 24px;
        border: 1px solid rgba(148, 163, 184, 0.28);
        background: rgba(15, 23, 42, 0.55);
        padding: clamp(26px, 4.5vw, 50px);
        text-align: center;
        white-space: pre-line;
        font-size: clamp(1.6rem, 3.1vw, 3rem);
        line-height: 1.55;
        box-shadow: 0 18px 60px -35px rgba(2, 6, 23, 0.9);
      }
      .counter {
        margin-top: 24px;
        color: #cbd5e1;
        font-size: clamp(0.95rem, 1.2vw, 1.1rem);
      }
      .hint {
        margin-top: 10px;
        color: #94a3b8;
        font-size: clamp(0.8rem, 1vw, 0.95rem);
      }
    </style>
  </head>
  <body>
    <main id="presenter-root">
      <div class="meta">
        <p id="presenter-author" class="author"></p>
      </div>
      <p id="presenter-stanza" class="stanza"></p>
      <p id="presenter-counter" class="counter"></p>
      <p class="hint">Doble clic para pantalla completa</p>
    </main>
    <script>
      document.addEventListener("dblclick", async () => {
        try {
          if (document.fullscreenElement) {
            await document.exitFullscreen();
          } else {
            await document.documentElement.requestFullscreen();
          }
        } catch (_) {}
      });
    </script>
  </body>
</html>`);
    doc.close();
  }

  const authorElement = doc.getElementById("presenter-author");
  const stanzaElement = doc.getElementById("presenter-stanza");
  const counterElement = doc.getElementById("presenter-counter");

  if (!authorElement || !stanzaElement || !counterElement) {
    return null;
  }

  return { authorElement, stanzaElement, counterElement };
}

export default function PresenterControls({ slug, authorLabel, segments }: PresenterControlsProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPresenterOpen, setIsPresenterOpen] = useState(false);
  const [popupBlocked, setPopupBlocked] = useState(false);
  const presenterWindowRef = useRef<Window | null>(null);

  const totalSegments = segments.length;
  const currentSegment = segments[currentIndex];
  const currentLabel = `${Math.min(currentIndex + 1, Math.max(totalSegments, 1))}/${Math.max(totalSegments, 1)}`;
  const canGoPrev = currentIndex > 0;
  const canGoNext = currentIndex < totalSegments - 1;

  const previewText = useMemo(() => {
    if (!currentSegment) {
      return "No hay estrofas disponibles.";
    }

    return currentSegment.text;
  }, [currentSegment]);

  const syncPresenter = useCallback(
    (targetWindow: Window, index: number) => {
      if (targetWindow.closed || !segments[index]) {
        return;
      }

      const shell = ensurePresenterShell(targetWindow);

      if (!shell) {
        return;
      }

      shell.authorElement.textContent = authorLabel;
      shell.stanzaElement.textContent = segments[index].text;
      shell.counterElement.textContent = `Estrofa ${index + 1} de ${segments.length}`;
      targetWindow.document.title = `Presenter - Estrofa ${index + 1}`;
    },
    [authorLabel, segments]
  );

  const openPresenter = useCallback(() => {
    if (segments.length === 0) {
      return;
    }

    const name = `song-presenter-${slug}`;
    const popup = window.open("", name, "popup,width=1440,height=900,left=60,top=40");

    if (!popup) {
      setPopupBlocked(true);
      return;
    }

    presenterWindowRef.current = popup;
    setPopupBlocked(false);
    setIsPresenterOpen(true);
    syncPresenter(popup, currentIndex);
    popup.focus();
  }, [currentIndex, segments.length, slug, syncPresenter]);

  const closePresenter = useCallback(() => {
    presenterWindowRef.current?.close();
    presenterWindowRef.current = null;
    setIsPresenterOpen(false);
  }, []);

  const goToPrev = useCallback(() => {
    setCurrentIndex((index) => Math.max(0, index - 1));
  }, []);

  const goToNext = useCallback(() => {
    setCurrentIndex((index) => Math.min(segments.length - 1, index + 1));
  }, [segments.length]);

  useEffect(() => {
    const popup = presenterWindowRef.current;

    if (!popup || popup.closed) {
      return;
    }

    syncPresenter(popup, currentIndex);
  }, [currentIndex, syncPresenter]);

  useEffect(() => {
    const timer = window.setInterval(() => {
      if (presenterWindowRef.current && presenterWindowRef.current.closed) {
        presenterWindowRef.current = null;
        setIsPresenterOpen(false);
      }
    }, 800);

    return () => {
      window.clearInterval(timer);
    };
  }, []);

  return (
    <section className="rounded-2xl border border-[#e5e7eb] bg-white p-6">
      <h2 className="font-[family-name:var(--font-display)] text-2xl text-[#111827]">Modo Presenter</h2>
      <p className="mt-3 text-sm leading-7 text-[#4b5563]">
        Abre una ventana para proyectar la letra por estrofas y controla el avance desde aqui.
      </p>

      <div className="mt-5 flex flex-wrap gap-3">
        <button
          type="button"
          onClick={openPresenter}
          disabled={segments.length === 0}
          className="rounded-full border border-[#d6dae1] bg-[#f8fafc] px-4 py-2 text-sm font-semibold text-[#374151] transition hover:bg-[#eef2f7] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isPresenterOpen ? "Reenfocar presenter" : "Abrir presenter"}
        </button>
        <button
          type="button"
          onClick={closePresenter}
          disabled={!isPresenterOpen}
          className="rounded-full border border-[#d6dae1] bg-white px-4 py-2 text-sm font-semibold text-[#374151] transition hover:bg-[#f9fafb] disabled:cursor-not-allowed disabled:opacity-50"
        >
          Cerrar presenter
        </button>
      </div>

      {popupBlocked ? (
        <p className="mt-3 text-sm text-[#b91c1c]">
          El navegador bloqueo la ventana emergente. Habilita pop-ups para este sitio.
        </p>
      ) : null}

      <div className="mt-6 rounded-xl border border-[#e5e7eb] bg-[#f8fafc] p-4 sm:p-5">
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={goToPrev}
            disabled={!canGoPrev}
            className="rounded-full border border-[#d6dae1] bg-white px-4 py-2 text-sm font-semibold text-[#374151] transition hover:bg-[#f3f4f6] disabled:cursor-not-allowed disabled:opacity-50"
          >
            Estrofa anterior
          </button>

          <button
            type="button"
            onClick={goToNext}
            disabled={!canGoNext}
            className="rounded-full border border-[#d6dae1] bg-white px-4 py-2 text-sm font-semibold text-[#374151] transition hover:bg-[#f3f4f6] disabled:cursor-not-allowed disabled:opacity-50"
          >
            Siguiente estrofa
          </button>

          <span className="rounded-full border border-[#d6dae1] bg-white px-3 py-1.5 text-xs font-semibold uppercase tracking-wide text-[#6b7280]">
            Estrofa {currentLabel}
          </span>
        </div>

        <p className="mt-4 whitespace-pre-line rounded-xl border border-[#e5e7eb] bg-white px-4 py-4 text-sm leading-7 text-[#374151]">
          {previewText}
        </p>
      </div>
    </section>
  );
}
