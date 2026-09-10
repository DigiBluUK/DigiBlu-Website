// The consent manager: vanilla-cookieconsent (MIT, no dependencies, ~8KB)
// configured from config.ts, with its decisions fed to the Google layer in
// gtag.ts and to anyone who subscribes. This file knows the library; the
// components and gtag.ts do not.
import * as CookieConsent from "vanilla-cookieconsent";
import { consentConfig, analyticsEnabled } from "./config";
import { applyConsentToGoogle, type ConsentState } from "./gtag";

const listeners = new Set<(state: ConsentState) => void>();
let started = false;

/** The current decision. Before the visitor has chosen, everything optional
 *  is false, which is the only safe reading. */
export function getConsentState(): ConsentState {
  return {
    necessary: true,
    analytics: analyticsEnabled && CookieConsent.acceptedCategory("analytics"),
    marketing: consentConfig.categories.marketing && CookieConsent.acceptedCategory("marketing"),
  };
}

/** Subscribe to consent decisions (first consent, later changes). Returns
 *  the unsubscribe. */
export function onConsentChange(cb: (state: ConsentState) => void): () => void {
  listeners.add(cb);
  return () => listeners.delete(cb);
}

/** Reopen the preferences dialog - the footer's Cookie settings control. */
export function openConsentPreferences() {
  CookieConsent.showPreferences();
}

/** Withdraw every optional category (the preferences dialog can do the same
 *  with its Reject button; this is the programmatic route). */
export function withdrawConsent() {
  CookieConsent.acceptCategory([]);
}

/** True once the visitor has made a decision for the current revision. */
export function hasDecided(): boolean {
  return CookieConsent.validConsent();
}

function announce() {
  const state = getConsentState();
  applyConsentToGoogle(state);
  listeners.forEach((cb) => cb(state));
}

/** Start the manager. Idempotent; the mounting component calls it once. */
export function initConsent() {
  if (started || typeof window === "undefined") return;
  started = true;
  const c = consentConfig;
  const privacy = `<a href="${c.privacyPolicyUrl}">Privacy and Cookies Policy</a>`;
  const cookies = c.cookiePolicyUrl ? ` and <a href="${c.cookiePolicyUrl}">Cookie Policy</a>` : "";

  const categories: CookieConsent.CookieConsentConfig["categories"] = {
    necessary: { enabled: true, readOnly: true },
  };
  if (analyticsEnabled) {
    // If analytics is switched off later, the library deletes GA's cookies.
    categories.analytics = { autoClear: { cookies: [{ name: /^_ga/ }, { name: /^_gid/ }, { name: /^_gat/ }] } };
  }
  if (c.categories.marketing) categories.marketing = {};

  const necessaryTable = {
    caption: "Storage the site needs to work",
    headers: { name: "Name", where: "Where", purpose: "Purpose", duration: "Kept for" },
    body: c.necessaryStorage.map((s) => ({ name: s.name, where: s.where, purpose: s.purpose, duration: s.duration })),
  };
  const analyticsTable = {
    caption: "Cookies Google Analytics sets, only with your permission",
    headers: { name: "Name", where: "Where", purpose: "Purpose", duration: "Kept for" },
    body: [
      { name: "_ga", where: "Cookie", purpose: "Tells Google Analytics apart one visitor's browser from another, so visits can be counted. It does not identify you to us.", duration: "2 years" },
      { name: "_ga_" + c.gaMeasurementId.replace(/^G-/, ""), where: "Cookie", purpose: "Keeps the state of the current visit for Google Analytics.", duration: "2 years" },
    ],
  };

  const sections: CookieConsent.Section[] = [
    {
      title: "Your choices",
      description: `This site stores only what it needs to work and to remember your choices. We measure how it is used only if you let us, and never track you for advertising. Change your mind any time from Cookie settings in the footer. Details are in our ${privacy}${cookies}.`,
    },
    {
      title: "Necessary",
      description: "Needed for the site to work. These do not track you and cannot be switched off. Nothing here is a cookie: both items live in your browser's local storage.",
      linkedCategory: "necessary",
      cookieTable: necessaryTable,
    },
  ];
  if (analyticsEnabled) {
    sections.push({
      title: "Analytics",
      description: `With your permission we use Google Analytics 4 to see which parts of the site are read and how people arrive, so we can improve it. It runs only after you allow it here, and sets the cookies below. Google's own privacy policy explains how Google handles this data: <a href="https://policies.google.com/privacy" target="_blank" rel="noopener">policies.google.com/privacy</a>.`,
      linkedCategory: "analytics",
      cookieTable: analyticsTable,
    });
  }
  if (c.categories.marketing) {
    sections.push({
      title: "Marketing",
      description: "Used to measure or personalise advertising. Off unless you allow it.",
      linkedCategory: "marketing",
    });
  }
  sections.push({
    title: "More information",
    description: `Questions about how we use data are answered in our ${privacy}${cookies}.`,
  });

  CookieConsent.run({
    cookie: {
      name: c.storage.key,
      useLocalStorage: c.storage.mechanism === "localStorage",
      expiresAfterDays: c.storage.expiresAfterDays,
    },
    revision: c.revision,
    disablePageInteraction: false,
    hideFromBots: true,
    guiOptions: {
      consentModal: { layout: "box", position: "bottom left", equalWeightButtons: true, flipButtons: false },
      preferencesModal: { layout: "box", equalWeightButtons: true, flipButtons: false },
    },
    categories,
    language: {
      default: "en",
      translations: {
        en: {
          consentModal: {
            title: "Cookies and your choices",
            description: analyticsEnabled
              ? `${c.siteName} uses a small amount of storage so the site works and remembers your choices. With your permission, we also use Google Analytics to understand how the site is used. No advertising or marketing tracking. You can change your mind at any time.`
              : `${c.siteName} uses a small amount of storage so the site works and remembers your choices. There is no analytics, advertising or marketing tracking on this site.`,
            acceptAllBtn: "Accept all",
            acceptNecessaryBtn: "Reject optional",
            showPreferencesBtn: "Manage preferences",
            footer: `${privacy}${cookies}`,
          },
          preferencesModal: {
            title: "Cookie settings",
            acceptAllBtn: "Accept all",
            acceptNecessaryBtn: "Reject optional",
            savePreferencesBtn: "Save my choices",
            closeIconLabel: "Close",
            serviceCounterLabel: "Service|Services",
            sections,
          },
        },
      },
    },
    onFirstConsent: announce,
    onConsent: announce,
    onChange: announce,
  });
}
