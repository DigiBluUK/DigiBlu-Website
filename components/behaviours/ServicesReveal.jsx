"use client";
import { useEffect } from "react";
import { once } from "@/lib/client/once";

// Ported from index.html lines 1598-1628 by
// scripts/port-behaviour.cjs: the old script's body, verbatim, run once on
// mount against the server-rendered markup. Kept as JavaScript on purpose -
// this is the old site's code, not a rewrite. Hand edits after generation
// are allowed and are noted in the file where made.
export default function ServicesReveal() {
  useEffect(() => {
    once("services-reveal", () => {
      // Services now follows the Accreditations strip (About moved below
      // Clients on 8 Sep 2026), and keeps its small
      // entrance rather than simply being there: the label, the heading and
      // then the six cards settle upward in sequence.
      //
      // The hidden state is added by THIS script (.reveal-ready), never in the
      // markup, so with JS off or an observer missing the section is just
      // visible - the same rule the narrative fill follows. Skipped outright
      // under reduced motion.
      var sec = document.getElementById('services');
      if (!sec || !window.matchMedia) return;
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
      if (!('IntersectionObserver' in window)) return;

      sec.classList.add('reveal-ready');

      // Fires once and disconnects: this is an entrance, not a state that
      // should replay every time the section is scrolled back past.
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          if (!e.isIntersecting) return;
          sec.classList.add('reveal-in');
          io.disconnect();
          // Drop the staging class once the entrance is over. It carries the
          // transition and the per-card delays, and leaving it on would hand a
          // future hover or focus transition on these cards an inherited delay
          // of up to 0.46s. Longest card: 0.46 delay + 0.7 duration.
          setTimeout(function () { sec.classList.remove('reveal-ready'); }, 1300);
        });
      }, { threshold: 0.12 });
      io.observe(sec);
    });
  }, []);
  return null;
}
