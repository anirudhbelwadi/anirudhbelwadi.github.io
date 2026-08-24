import { useEffect, useState } from 'react';
import { fetchContent } from '../api/content';
import { projects as bundledProjects } from '../data/projects';
import { recommendations as bundledRecommendations } from '../data/recommendations';
import type { Project, Recommendation } from '../types';

export interface Content {
  projects: Project[];
  recommendations: Recommendation[];
  /** Where the rendered content came from. Useful when debugging a stale page. */
  source: 'bundled' | 'api';
}

/**
 * Content comes from the backend so it can be edited without a redeploy, but the
 * build ships a snapshot and that is what renders first.
 *
 * Rendering the bundle immediately and swapping in the API response when it
 * arrives means there is no spinner, no layout shift on a slow backend, and
 * nothing blank if the backend is expired or down. In the common case the two
 * are identical and the swap is invisible.
 */
export function useContent(): Content {
  const [content, setContent] = useState<Content>({
    projects: bundledProjects,
    recommendations: bundledRecommendations,
    source: 'bundled',
  });

  useEffect(() => {
    let cancelled = false;

    fetchContent()
      .then((remote) => {
        if (cancelled) return;
        setContent({ ...remote, source: 'api' });
      })
      .catch((error: unknown) => {
        // Not fatal: the bundled copy is already on screen.
        const reason = error instanceof Error ? error.message : String(error);
        console.warn(`Using bundled content — ${reason}`);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return content;
}
