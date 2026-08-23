import { useEffect, useRef, useState } from 'react';
import { RECAPTCHA_SITE_KEY } from '../config';

interface GreCaptcha {
  render: (container: HTMLElement, params: { sitekey: string }) => number;
  getResponse: (widgetId?: number) => string;
  reset: (widgetId?: number) => void;
}

declare global {
  interface Window {
    grecaptcha?: GreCaptcha;
    onRecaptchaApiLoad?: () => void;
  }
}

const SCRIPT_ID = 'recaptcha-api';
let loader: Promise<GreCaptcha> | null = null;

/**
 * Loads reCAPTCHA in explicit-render mode. The pre-React site relied on the
 * script auto-scanning the DOM for `.g-recaptcha`, which races with React's
 * first paint — rendering explicitly removes that race.
 */
function loadRecaptcha(): Promise<GreCaptcha> {
  if (loader) return loader;
  loader = new Promise((resolve, reject) => {
    if (window.grecaptcha?.render) {
      resolve(window.grecaptcha);
      return;
    }
    window.onRecaptchaApiLoad = () => {
      if (window.grecaptcha) resolve(window.grecaptcha);
      else reject(new Error('reCAPTCHA loaded without an API'));
    };
    const script = document.createElement('script');
    script.id = SCRIPT_ID;
    script.src = 'https://www.google.com/recaptcha/api.js?onload=onRecaptchaApiLoad&render=explicit';
    script.async = true;
    script.defer = true;
    script.onerror = () => reject(new Error('Failed to load reCAPTCHA'));
    document.head.appendChild(script);
  });
  return loader;
}

export interface Recaptcha {
  /** Attach to the element the widget should render into. */
  containerRef: React.RefObject<HTMLDivElement>;
  /** The visitor's token, or an empty string if the box is unchecked. */
  getResponse: () => string;
  reset: () => void;
  ready: boolean;
}

export function useRecaptcha(): Recaptcha {
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<number | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    void loadRecaptcha()
      .then((grecaptcha) => {
        if (cancelled || !containerRef.current || widgetIdRef.current !== null) return;
        widgetIdRef.current = grecaptcha.render(containerRef.current, { sitekey: RECAPTCHA_SITE_KEY });
        setReady(true);
      })
      .catch((error: unknown) => {
        console.error(error);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return {
    containerRef,
    ready,
    getResponse: () => {
      const widgetId = widgetIdRef.current;
      if (widgetId === null || !window.grecaptcha) return '';
      return window.grecaptcha.getResponse(widgetId);
    },
    reset: () => {
      const widgetId = widgetIdRef.current;
      if (widgetId === null || !window.grecaptcha) return;
      window.grecaptcha.reset(widgetId);
    },
  };
}
