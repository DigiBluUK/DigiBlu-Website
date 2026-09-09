"use client";
import { openConsentPreferences } from "@/lib/consent/consent";

// The footer's way back into the preferences dialog, so a decision can be
// changed or withdrawn at any time without reloading. A real button styled
// like the footer's other controls (.footer-col button shares the anchor
// rule), so it is keyboard-reachable and announced as a control.
export default function CookieSettingsLink({ label = "Cookie settings" }: { label?: string }) {
  return (
    <button type="button" onClick={() => openConsentPreferences()}>
      {label}
    </button>
  );
}
