/** Every third-party endpoint and key the site talks to, in one place. */

/** Google Apps Script endpoint backing the contact form. */
export const CONTACT_FORM_ENDPOINT =
  'https://script.google.com/macros/s/AKfycbyWNWRv5wzR9rnL4DuvISw0crIXioO2XmJRHPChOZTSYtZSRVh5u87XOxnIRgM1XPFQ/exec';

/** reCAPTCHA v2 checkbox site key. */
export const RECAPTCHA_SITE_KEY = '6LdPY2MsAAAAAAHOo9_oM3vzuJOLn68yJiE67BON';

export const IP_LOOKUP_ENDPOINT = 'https://api.ipify.org?format=json';

/** Flask analytics service in backend-service/. */
const VISITOR_API_PRODUCTION = 'https://anirudhbelwadiportfolio.pythonanywhere.com';
const VISITOR_API_LOCAL_PORT = '5000';

const isLocalhost = () =>
  window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';

export const visitorApiBaseUrl = (): string =>
  isLocalhost() ? `http://127.0.0.1:${VISITOR_API_LOCAL_PORT}` : VISITOR_API_PRODUCTION;

/** The analytics service counts a visit as "mine" only on the canonical domain. */
export const visitorDomainParam = (): string =>
  window.location.hostname === 'anirudhbelwadi.com' || isLocalhost() ? 'true' : 'false';
