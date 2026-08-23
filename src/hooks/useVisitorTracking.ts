import { useCallback, useEffect, useRef, useState } from 'react';
import { IP_LOOKUP_ENDPOINT, visitorApiBaseUrl, visitorDomainParam } from '../config';

interface CounterResponse {
  count?: number;
  visit_id?: string;
  has_entered_name_before?: string;
}

export interface VisitorTracking {
  /** Total site visits, shown in the footer. Null until the API answers. */
  visitCount: number | null;
  /** True once the backend confirms this visitor already told us who they are. */
  hasIntroducedBefore: boolean | null;
  /** Safe to call before the visit id arrives — the payload is queued. */
  submitVisitorMeta: (name: string, role: string) => void;
}

/**
 * The counter increment must fire exactly once per page load. A module-level
 * flag (rather than a ref) survives React StrictMode's dev-only double mount,
 * which would otherwise record two visits for every local page view.
 */
let counterRequested = false;

export function useVisitorTracking(isMobile: boolean): VisitorTracking {
  const [visitCount, setVisitCount] = useState<number | null>(null);
  const [hasIntroducedBefore, setHasIntroducedBefore] = useState<boolean | null>(null);
  const visitIdRef = useRef<string | null>(null);
  const pendingMetaRef = useRef<{ name: string; role: string } | null>(null);

  const postMeta = useCallback((visitId: string, name: string, role: string) => {
    fetch(`${visitorApiBaseUrl()}/visitMeta/${visitId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, role }),
    }).catch((error: unknown) => {
      console.error('Error saving visitor meta:', error);
    });
  }, []);

  useEffect(() => {
    if (counterRequested) return;
    counterRequested = true;

    let cancelled = false;

    const run = async () => {
      try {
        const ipResponse = await fetch(IP_LOOKUP_ENDPOINT);
        const { ip } = (await ipResponse.json()) as { ip: string };

        const url = new URL(`${visitorApiBaseUrl()}/counterIncrease/${ip}`);
        url.searchParams.set('domain', visitorDomainParam());
        url.searchParams.set('source', document.referrer);
        url.searchParams.set('is_mobile', String(isMobile));

        const counterResponse = await fetch(url.toString());
        const data = (await counterResponse.json()) as CounterResponse;
        if (cancelled) return;

        if (typeof data.count === 'number') setVisitCount(data.count);
        visitIdRef.current = data.visit_id ?? null;
        setHasIntroducedBefore(
          data.has_entered_name_before ? data.has_entered_name_before === 'Y' : false
        );

        const pending = pendingMetaRef.current;
        if (visitIdRef.current && pending) {
          pendingMetaRef.current = null;
          postMeta(visitIdRef.current, pending.name, pending.role);
        }
      } catch (error) {
        if (cancelled) return;
        console.error('Error recording visit:', error);
        // hasIntroducedBefore stays null, which keeps the visitor prompt hidden.
        // Without a visit id there is nowhere to send the answer anyway.
      }
    };

    void run();
    return () => {
      cancelled = true;
    };
  }, [isMobile, postMeta]);

  const submitVisitorMeta = useCallback(
    (name: string, role: string) => {
      const visitId = visitIdRef.current;
      if (!visitId) {
        pendingMetaRef.current = { name, role };
        return;
      }
      postMeta(visitId, name, role);
    },
    [postMeta]
  );

  return { visitCount, hasIntroducedBefore, submitVisitorMeta };
}
