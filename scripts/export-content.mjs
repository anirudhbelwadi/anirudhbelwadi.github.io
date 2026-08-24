/**
 * Dump the frontend content modules to JSON.
 *
 * Used to seed the backend with the data that currently lives in src/data/,
 * and re-runnable if those files change before the backend takes over.
 */
import { build } from 'esbuild';
import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';

const outDir = await mkdtemp(join(tmpdir(), 'content-'));

try {
  await build({
    entryPoints: ['src/data/projects.ts', 'src/data/recommendations.ts'],
    outdir: outDir,
    format: 'esm',
    platform: 'node',
    // Bundled so the re-export of projectCategories resolves without Node
    // needing explicit .js extensions in the emitted output.
    bundle: true,
  });

  const { projects } = await import(pathToFileURL(join(outDir, 'projects.js')).href);
  const { recommendations } = await import(
    pathToFileURL(join(outDir, 'recommendations.js')).href
  );

  // The database stores host-independent paths; the backend turns them into
  // absolute URLs on read. The snapshot this is generated from holds those
  // absolute URLs, so strip the host back off before seeding.
  const toStoredPath = (url) =>
    typeof url === 'string'
      ? url.replace(/^https?:\/\/[^/]+\/content\/images\//, '/assets/images/')
      : url;

  const normalise = (item) => ({
    ...item,
    ...(item.image ? { image: toStoredPath(item.image) } : {}),
    ...(item.avatar ? { avatar: toStoredPath(item.avatar) } : {}),
    modal: {
      ...item.modal,
      blocks: item.modal.blocks.map((block) =>
        block.kind === 'image' ? { ...block, src: toStoredPath(block.src) } : block
      ),
    },
  });

  const payload = {
    projects: projects.map(normalise),
    recommendations: recommendations.map(normalise),
  };
  const target = process.argv[2] ?? 'backend-service/content_seed.json';
  await writeFile(target, JSON.stringify(payload, null, 2) + '\n');

  console.log(`Wrote ${target}`);
  console.log(`  projects:        ${projects.length}`);
  console.log(`  recommendations: ${recommendations.length}`);
} finally {
  await rm(outDir, { recursive: true, force: true });
}
