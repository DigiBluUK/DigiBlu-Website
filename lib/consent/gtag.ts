// The Google side of consent: Consent Mode v2 signals and the GA4 loader.
// Nothing Google is loaded until analytics consent exists; the default
// (everything denied except security) is set by CONSENT_DEFAULT_SCRIPT in
// the document head before any Google code could run. Reusable as is: the
// measurement id comes from config.ts.
import { consentConfig, analyticsEnabled } from "./config";

export type ConsentState = { necessary: true; analytics: boolean; marketing: boolean };

// Inline in <head>, before anything else: the dataLayer, a gtag() that
// queues into it, and the Consent Mode defaults. Denied across the board
// except security_storage, which Google treats as always allowed. The
// functionality and personalization signals stay denied because the site
// uses none of Google's storage for those - its own theme preference is
// its own local storage, outside Consent Mode.
export const CONSENT_DEFAULT_SCRIPT =
  "window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}window.gtag=gtag;" +
  "gtag('consent','default',{ad_storage:'denied',ad_user_data:'denied',ad_personalization:'denied',analytics_storage:'denied',functionality_storage:'denied',personalization_storage:'denied',security_storage:'granted'});";

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
    [key: `ga-disable-${string}`]: boolean | undefined;
  }
}

let loaded = false;
let pendingPageView = false;

function gtag(...args: unknown[]) {
  if (typeof window === "undefined") return;
  window.dataLayer = window.dataLayer || [];
  if (!window.gtag) window.gtag = function () { window.dataLayer!.push(arguments); };
  window.gtag(...args);
}

/** Consent Mode signals for a consent state. Analytics maps to
 *  analytics_storage; marketing to the three advertising signals. */
export function consentSignals(state: ConsentState) {
  const g = (on: boolean) => (on ? "granted" : "denied");
  return {
    analytics_storage: g(state.analytics),
    ad_storage: g(state.marketing),
    ad_user_data: g(state.marketing),
    ad_personalization: g(state.marketing),
  };
}

/** Apply a consent decision to Google: update the signals, then load GA4 if
 *  analytics is now allowed and it is not loaded, or switch it off if it
 *  was loaded and analytics has been withdrawn. Safe to call repeatedly. */
export function applyConsentToGoogle(state: ConsentState) {
  gtag("consent", "update", consentSignals(state));
  if (!analyticsEnabled) return;
  const id = consentConfig.gaMeasurementId;
  if (state.analytics) {
    // GA's own kill switch, in case it was set by an earlier withdrawal
    window[`ga-disable-${id}`] = false;
    if (!loaded) loadGa4(id);
    else trackPageView(); // re-enabled in the same session: a fresh view
  } else if (loaded) {
    // gtag.js cannot be unloaded; this flag stops every hit for the id,
    // and the consent library clears the _ga cookies (config: autoClear).
    window[`ga-disable-${id}`] = true;
  }
}

function loadGa4(id: string) {
  if (loaded || typeof document === "undefined") return;
  loaded = true;
  const s = document.createElement("script");
  s.async = true;
  s.src = "https://www.googletagmanager.com/gtag/js?id=" + encodeURIComponent(id);
  document.head.appendChild(s);
  gtag("js", new Date());
  // send_page_view: false - page views are sent by trackPageView() so a
  // single-page site sends exactly one per page load (or per client-side
  // route change, when configured), never one per anchor or hash change.
  gtag("config", id, { send_page_view: false });
  trackPageView();
}

/** True while GA4 is loaded and analytics consent stands. */
export function analyticsActive(): boolean {
  return loaded && typeof window !== "undefined" && window[`ga-disable-${consentConfig.gaMeasurementId}`] !== true;
}

/** One page view for the current location. A no-op until GA4 is active,
 *  so calling it early is harmless; the loader sends the first one. */
export function trackPageView(path?: string) {
  if (!analyticsActive()) { pendingPageView = true; return; }
  pendingPageView = false;
  gtag("event", "page_view", {
    page_location: typeof location !== "undefined" ? location.href : undefined,
    page_path: path ?? (typeof location !== "undefined" ? location.pathname : undefined),
    page_title: typeof document !== "undefined" ? document.title : undefined,
  });
}

/** Any GA4 event, dropped silently without analytics consent. Add new
 *  events by calling this from a behaviour: trackEvent("service_open",
 *  { service: "ai" }). */
export function trackEvent(name: string, params: Record<string, unknown> = {}) {
  if (!analyticsActive()) return;
  gtag("event", name, params);
}

/** For tests and diagnostics. */
export function analyticsDebug() {
  return { loaded, pendingPageView, active: analyticsActive(), id: consentConfig.gaMeasurementId };
}
