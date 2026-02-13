import { promises as fs } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, "..");

const sourceDirCandidates = [
  process.env.SONG_POSTS_SOURCE_DIR?.trim(),
  path.resolve(projectRoot, "..", "song-posts"),
].filter(Boolean);
const targetDir = path.join(projectRoot, "content", "song-posts");

function normalizeSongPost(raw, fileName) {
  const parsed = JSON.parse(raw);

  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
    throw new Error(`Invalid JSON object in ${fileName}`);
  }

  return `${JSON.stringify(parsed, null, 2)}\n`;
}

async function syncSongPosts() {
  const sourceDir = (
    await Promise.all(
      sourceDirCandidates.map(async (candidate) => {
        try {
          const stat = await fs.stat(candidate);
          return stat.isDirectory() ? candidate : null;
        } catch {
          return null;
        }
      })
    )
  ).find(Boolean);

  if (!sourceDir) {
    throw new Error(
      `Source folder not found. Set SONG_POSTS_SOURCE_DIR or create ${path.resolve(projectRoot, "..", "song-posts")}`
    );
  }

  await fs.mkdir(targetDir, { recursive: true });

  const sourceEntries = await fs.readdir(sourceDir, { withFileTypes: true });
  const sourceFiles = sourceEntries
    .filter((entry) => entry.isFile() && entry.name.endsWith(".json"))
    .map((entry) => entry.name)
    .sort((a, b) => a.localeCompare(b));

  if (sourceFiles.length === 0) {
    throw new Error(`No song posts found in ${sourceDir}`);
  }

  for (const fileName of sourceFiles) {
    const sourceFile = path.join(sourceDir, fileName);
    const destinationFile = path.join(targetDir, fileName);
    const raw = await fs.readFile(sourceFile, "utf8");
    const normalized = normalizeSongPost(raw, fileName);
    await fs.writeFile(destinationFile, normalized, "utf8");
  }

  const targetEntries = await fs.readdir(targetDir, { withFileTypes: true });
  const staleFiles = targetEntries
    .filter((entry) => entry.isFile() && entry.name.endsWith(".json"))
    .map((entry) => entry.name)
    .filter((entry) => !sourceFiles.includes(entry));

  for (const fileName of staleFiles) {
    await fs.unlink(path.join(targetDir, fileName));
  }

  console.log(
    `Synced ${sourceFiles.length} song posts to ${targetDir}${
      staleFiles.length > 0 ? ` and removed ${staleFiles.length} stale files` : ""
    }.`
  );
}

syncSongPosts().catch((error) => {
  console.error("Failed to sync song posts:", error);
  process.exitCode = 1;
});
