"use client";
import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import "vanilla-cookieconsent/dist/cookieconsent.css";
import "./consent.css";
import { initConsent } from "@/lib/consent/consent";
import { trackPageView } from "@/lib/consent/gtag";
import { consentConfig } from "@/lib/consent/config";

// Mounts the consent manager once per page load and, on a site that
// navigates client-side, counts a page view per route change. Renders
// nothing itself: the library owns the banner and preferences dialog.
export default function Consent() {
  const pathname = usePathname();
  const first = useRef(true);

  useEffect(() => {
    initConsent();
  }, []);

  useEffect(() => {
    // The first render's page view is sent by the GA4 loader once consent
    // allows it; later route changes (next/link navigation) count here.
    // Hash changes do not change pathname, so anchor navigation on the
    // single page never counts as a page view.
    if (first.current) { first.current = false; return; }
    if (consentConfig.pageViews === "client-route") trackPageView(pathname);
  }, [pathname]);

  return null;
}
