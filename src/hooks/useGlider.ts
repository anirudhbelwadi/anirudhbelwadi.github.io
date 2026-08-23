import { useEffect, useRef } from 'react';
import Glider from 'glider-js';

interface GliderOptions {
  slidesToShow: number;
  slidesToScroll: number;
  draggable?: boolean;
  responsive?: { breakpoint: number; settings: { slidesToShow: number; slidesToScroll: number } }[];
}

interface GliderInstance {
  /** Glider's bound window-resize handler, kept so we can detach it. */
  resize: () => void;
}

/**
 * Wraps glider-js, which mutates the DOM directly.
 *
 * Two things make it awkward inside React, and both are handled here:
 *
 *  1. By default glider wraps the slides in its own `.glider-track` element.
 *     We render that wrapper in JSX and pass `skipTrack` so glider only ever
 *     reads React's DOM instead of restructuring it.
 *
 *  2. `destroy()` swaps the carousel element for a *clone* of itself
 *     (`parentNode.replaceChild`), which detaches the node React and our ref
 *     still point at. Calling it leaves the carousel blank on the next mount —
 *     which is exactly what StrictMode's double-mount triggers in development.
 *     So we tear down by hand instead: the only listener glider puts outside
 *     the carousel element is `resize` on window, and everything else lives on
 *     nodes React discards on unmount.
 */
export function useGlider(options: GliderOptions) {
  const trackRef = useRef<HTMLDivElement>(null);
  const dotsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const carousel = trackRef.current;
    if (!carousel) return;

    const instance = new Glider(carousel, {
      ...options,
      skipTrack: true,
      dots: dotsRef.current ?? undefined,
    } as never) as unknown as GliderInstance;

    return () => {
      window.removeEventListener('resize', instance.resize);
    };
    // Options are static config; rebuilding the carousel on every render would
    // reset the visitor's scroll position.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { trackRef, dotsRef };
}
