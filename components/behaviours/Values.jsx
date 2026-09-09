"use client";
import { useEffect } from "react";
import { once } from "@/lib/client/once";
import { ensureAboutPin } from "@/lib/client/about-pin";

// Ported from index.html lines 1118-1231 by
// scripts/port-behaviour.cjs: the old script's body, verbatim, run once on
// mount against the server-rendered markup. Kept as JavaScript on purpose -
// this is the old site's code, not a rewrite. Hand edits after generation
// are allowed and are noted in the file where made.
export default function Values() {
  useEffect(() => {
    ensureAboutPin();
    once("values", () => {
      // Values. Scrolling drives which value is open, so the list runs 01 to
      // 05 by itself as the section passes and has finished before Services
      // arrives. Click still works and simply sets the open one; the next
      // scroll takes over again. Hover is a tint only (see the CSS): it has no
      // touch equivalent and cannot be reached from the keyboard.
      var items = document.querySelectorAll('.value-item');
      if (!items.length) return;
      var list = document.querySelector('.value-list');
      var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      // Desktop (8 Sep 2026): every value is open at once in a 3 + 2 grid,
      // so there is nothing for scrolling or a click to drive. Feedback was
      // that the one-at-a-time reveal went past too fast to read. The phone
      // column keeps its cumulative scroll reveal. Checked per event rather
      // than once, so a window resized across 761px lands in the right state.
      var desktop = window.matchMedia ? window.matchMedia('(min-width: 761px)') : null;
      function isDesktop() { return !!(desktop && desktop.matches); }
      function openAll() {
        items.forEach(function (item) {
          item.classList.add('is-revealed');
          item.classList.add('is-open');
          var b = item.querySelector('.value-open');
          if (b) b.setAttribute('aria-expanded', 'true');
        });
      }

      // keep: true from a tap, false from the scroll driver. Scrolling owns
      // the reveal in both directions - down reveals cumulatively, back up
      // takes it away again, which is intended. A tap must only ever ADD: it
      // used to run the same cumulative rule, so on a phone with all five
      // revealed, tapping 03 quietly faded 04 and 05 out (reported as a bug,
      // and it was one).
      function setOpen(n, keep) {
        items.forEach(function (item, i) {
          var on = i === n;
          item.classList.toggle('is-open', on);
          // Cumulative, so a phone leaves the section with all five values
          // readable rather than one open and four behind a tap. Desktop has
          // room for a single open value, so the CSS there keeps .is-revealed
          // to nothing more than a marker.
          // !! is load-bearing. Without it the expression is undefined for
          // items beyond n whenever keep is not passed, and toggle() with an
          // undefined force FLIPS the class rather than removing it - every
          // scroll event flipped 03/04/05 on and off, which is the "revealing
          // out of order" a phone showed. A boolean is a real force argument.
          item.classList.toggle('is-revealed', !!(i <= n || (keep && item.classList.contains('is-revealed'))));
          var b = item.querySelector('.value-open');
          if (b) b.setAttribute('aria-expanded', String(on));
        });
      }

      items.forEach(function (item, i) {
        var btn = item.querySelector('.value-open');
        if (!btn) return;
        btn.addEventListener('click', function () {
          // Clicking the open one is a no-op rather than a collapse: with
          // nothing open the row loses all its copy, which is worse than
          // simply staying put.
          if (isDesktop()) return;
          if (item.classList.contains('is-open')) return;
          setOpen(i, true);
          // Keep the scroll memo honest, or the next scroll inside this same
          // band would compare against a stale value, short-circuit, and leave
          // the clicked value stuck until a band boundary was crossed.
          last = i;
        });
      });

      if (reduce || !list) {
        // Nothing may be reachable only through a gesture that never happens,
        // so reveal the lot and open the first.
        items.forEach(function (item) { item.classList.add('is-revealed'); });
        setOpen(0);
        return;
      }

      // Two ways of measuring how far through the values the scroll is, chosen
      // by whether the pin is live - which the CSS decides, on width and on
      // viewport height, so the script reads the spacer's own height rather
      // than re-testing those media queries and risking the two disagreeing.
      function progress() {
        var vh = window.innerHeight || document.documentElement.clientHeight;
        var pinned = window.__aboutPinProgress && window.__aboutPinProgress.live();
        if (pinned) return window.__aboutPinProgress();

        // Unpinned: measured from the list's own box, so the short desktop row
        // and the much taller phone column both complete inside the section.
        // The band ends with the list's BOTTOM at 55% of the viewport - mapped
        // off the top instead, 05 on a phone would land only once Services
        // already filled the screen. Each value's turn then comes as it rises
        // through the lower half.
        var r = list.getBoundingClientRect();
        var travel = (vh * 0.82 - vh * 0.55) + r.height;
        return (vh * 0.82 - r.top) / (travel || 1);
      }

      var last = -1;
      function onScroll() {
        if (isDesktop()) {
          if (last !== 'all') { openAll(); last = 'all'; }
          return;
        }
        var p = progress();
        var n = Math.floor((p < 0 ? 0 : p > 1 ? 1 : p) * items.length);
        if (n > items.length - 1) n = items.length - 1;
        if (n === last) return;
        last = n;
        setOpen(n);
      }

      // Not rAF-throttled: one rect read plus a class toggle on five nodes,
      // and rAF is throttled to a stop in the preview environment.
      window.addEventListener('scroll', onScroll, { passive: true });
      window.addEventListener('resize', onScroll);
      onScroll();
    });
  }, []);
  return null;
}
