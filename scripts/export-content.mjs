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

  const payload = { projects, recommendations };
  const target = process.argv[2] ?? 'backend-service/content_seed.json';
  await writeFile(target, JSON.stringify(payload, null, 2) + '\n');

  console.log(`Wrote ${target}`);
  console.log(`  projects:        ${projects.length}`);
  console.log(`  recommendations: ${recommendations.length}`);
} finally {
  await rm(outDir, { recursive: true, force: true });
}
