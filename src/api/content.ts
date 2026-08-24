import { visitorApiBaseUrl } from '../config';
import type { Project, Recommendation } from '../types';

/** Give up rather than let a cold or expired backend hold up the page. */
const TIMEOUT_MS = 6000;

async function getJson<T>(path: string, signal: AbortSignal): Promise<T> {
  const response = await fetch(`${visitorApiBaseUrl()}${path}`, { signal });
  if (!response.ok) {
    throw new Error(`${path} responded ${response.status}`);
  }
  return (await response.json()) as T;
}

/**
 * An empty collection is treated as a failure, not as valid content. A backend
 * that answers with nothing — a fresh database, a failed seed — should leave the
 * bundled copy on screen rather than blank the section.
 */
function requireNonEmpty<T>(items: unknown, label: string): T[] {
  if (!Array.isArray(items) || items.length === 0) {
    throw new Error(`${label} came back empty`);
  }
  return items as T[];
}

export interface RemoteContent {
  projects: Project[];
  recommendations: Recommendation[];
}

export async function fetchContent(): Promise<RemoteContent> {
  const controller = new AbortController();
  const timer = window.setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const [projectsPayload, recommendationsPayload] = await Promise.all([
      getJson<{ projects: Project[] }>('/content/projects', controller.signal),
      getJson<{ recommendations: Recommendation[] }>(
        '/content/recommendations',
        controller.signal
      ),
    ]);

    return {
      projects: requireNonEmpty<Project>(projectsPayload.projects, 'projects'),
      recommendations: requireNonEmpty<Recommendation>(
        recommendationsPayload.recommendations,
        'recommendations'
      ),
    };
  } finally {
    window.clearTimeout(timer);
  }
}
