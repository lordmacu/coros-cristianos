# Song Posts Web

Sitio en Next.js para publicar coros leyendo los JSON desde `content/song-posts`.

## Scripts

- `npm run sync:songs`: copia y valida JSON hacia `content/song-posts`.
- `npm run dev`: levanta el entorno local.
- `npm run build`: compila en modo produccion.
- `npm run start`: ejecuta el build.

## Estructura

- `content/song-posts`: directorio de JSON usado en tiempo de render.
- `../song-posts`: fuente por defecto para sincronizacion (si existe).
- `src/app/page.tsx`: listado de coros.
- `src/app/coros/[slug]/page.tsx`: detalle de cada coro con video y post.
- `src/lib/song-posts.ts`: lectura y normalizacion de datos.

## Configuracion opcional

- `SONG_POSTS_DIR`: permite sobrescribir la ruta de JSON fuente (por defecto `content/song-posts`).
- `SONG_POSTS_SOURCE_DIR`: permite sobrescribir la ruta de origen para `sync:songs`.
