import Link from "next/link";

export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-[70vh] max-w-3xl flex-col items-center justify-center px-6 text-center">
      <h1 className="font-[family-name:var(--font-display)] text-5xl text-[#2d241d]">404</h1>
      <p className="mt-4 text-xl font-semibold text-[#3b3128]">Coro no encontrado</p>
      <p className="mt-3 max-w-xl text-base leading-8 text-[#5e5146]">
        El enlace no corresponde a un coro publicado o el contenido fue movido durante la
        sincronizacion.
      </p>
      <Link
        href="/"
        className="mt-7 inline-flex rounded-full bg-[#8f4d1a] px-5 py-2.5 text-sm font-semibold text-[#fff8f0] transition hover:bg-[#743b12]"
      >
        Ir al listado principal
      </Link>
    </main>
  );
}
