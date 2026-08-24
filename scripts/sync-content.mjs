/**
 * Refresh the bundled content snapshot from the live backend.
 *
 * The frontend renders this snapshot first and swaps in the API response when
 * it arrives, so the snapshot only shows through when the backend is
 * unreachable. Running this before a deploy keeps that fallback current.
 */
import { writeFile } from 'node:fs/promises';

const API = process.env.CONTENT_API ?? 'https://anirudhbelwadiportfolio.pythonanywhere.com';

const q = (value) => JSON.stringify(value);

/**
 * Project and recommendation images live only on the backend now, so the
 * snapshot keeps the absolute URLs the API returns. The trade-off is that a
 * backend outage leaves those images broken while the text still renders from
 * the snapshot — the frontend no longer holds a copy to fall back to.
 */
const imageUrl = (url) => url;

const blockSource = (block) => {
  if (block.kind === 'image') {
    return `{ kind: 'image', src: ${q(imageUrl(block.src))}${block.alt ? `, alt: ${q(block.alt)}` : ''} }`;
  }
  if (block.kind === 'heading') return `{ kind: 'heading', text: ${q(block.text)} }`;
  if (block.kind === 'list') {
    return `{ kind: 'list', items: [\n${block.items
      .map((item) => `          ${q(item)},`)
      .join('\n')}\n        ] }`;
  }
  return `{ kind: 'paragraph', text: ${q(block.text)} }`;
};

const modalSource = (modal, indent) => {
  const pad = ' '.repeat(indent);
  return [
    '{',
    `${pad}  title: ${q(modal.title)},`,
    `${pad}  blocks: [\n${modal.blocks.map((b) => `${pad}    ${blockSource(b)},`).join('\n')}\n${pad}  ],`,
    modal.link ? `${pad}  link: { href: ${q(modal.link.href)}, label: ${q(modal.link.label)} },` : null,
    `${pad}}`,
  ]
    .filter(Boolean)
    .join('\n');
};

const header = `// Snapshot of the content served by the backend, refreshed by\n// \`npm run sync-content\`. The app renders this until the API responds, and\n// keeps it on screen if the API is unreachable — so edit content in the\n// backend, not here.\n`;

async function get(path, key) {
  const response = await fetch(`${API}${path}`);
  if (!response.ok) throw new Error(`${path} responded ${response.status}`);
  const items = (await response.json())[key];
  if (!Array.isArray(items) || items.length === 0) {
    throw new Error(`${path} returned no ${key}`);
  }
  return items;
}

const projects = await get('/content/projects', 'projects');
const recommendations = await get('/content/recommendations', 'recommendations');

await writeFile(
  'src/data/projects.ts',
  header +
    `import type { Project, ProjectCategory } from '../types';\n\n` +
    `export { projectCategories } from './projectCategories';\n` +
    `export type { ProjectCategory };\n\n` +
    `export const projects: Project[] = [\n` +
    projects
      .map((p) =>
        [
          '  {',
          `    id: ${q(p.id)},`,
          `    category: ${q(p.category)},`,
          `    title: ${q(p.title)},`,
          `    description: ${q(p.description)},`,
          p.href ? `    href: ${q(p.href)},` : null,
          `    image: ${q(imageUrl(p.image))},`,
          p.imageAlt ? `    imageAlt: ${q(p.imageAlt)},` : null,
          p.hidden ? '    hidden: true,' : null,
          `    modal: ${modalSource(p.modal, 4)},`,
          '  },',
        ]
          .filter(Boolean)
          .join('\n')
      )
      .join('\n') +
    '\n];\n'
);

await writeFile(
  'src/data/recommendations.ts',
  header +
    `import type { Recommendation } from '../types';\n\nexport const recommendations: Recommendation[] = [\n` +
    recommendations
      .map((r) =>
        [
          '  {',
          `    id: ${q(r.id)},`,
          `    name: ${q(r.name)},`,
          `    role: ${q(r.role)},`,
          `    avatar: ${q(imageUrl(r.avatar))},`,
          `    excerpt: ${q(r.excerpt)},`,
          `    modal: ${modalSource(r.modal, 4)},`,
          '  },',
        ].join('\n')
      )
      .join('\n') +
    '\n];\n'
);

console.log(`Snapshot refreshed from ${API}`);
console.log(`  projects:        ${projects.length}`);
console.log(`  recommendations: ${recommendations.length}`);
