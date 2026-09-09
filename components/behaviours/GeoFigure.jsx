"use client";
import { useEffect } from "react";
import { once } from "@/lib/client/once";

// Ported from index.html lines 1342-1453 by
// scripts/port-behaviour.cjs: the old script's body, verbatim, run once on
// mount against the server-rendered markup. Kept as JavaScript on purpose -
// this is the old site's code, not a rewrite. Hand edits after generation
// are allowed and are noted in the file where made.
export default function GeoFigure() {
  useEffect(() => {
    once("geo-figure", () => {
      // How blue the mark is, as a 0..1 value the CSS mixes with. Driven by
      // where the figure sits in the viewport, so the colour phases in with the
      // scroll rather than switching at a threshold - fully blue with the
      // figure centred, easing back to ink as it leaves. It runs on every
      // device: scrolling is the trigger everywhere, and hovering (where there
      // is a pointer) simply forces it to full.
      //
      // Both are written through the same inline variable rather than one being
      // a CSS rule, because an inline style outranks a stylesheet rule and the
      // hover would never have won.
      var fig = document.querySelector('.geo-figure');
      if (!fig) return;

      var hovering = false;
      var written = -1;
      var smooth = function (t) { return t <= 0 ? 0 : t >= 1 ? 1 : t * t * (3 - 2 * t); };

      function update() {
        var lit = 1;
        if (!hovering) {
          var r = fig.getBoundingClientRect();
          var vh = window.innerHeight || document.documentElement.clientHeight;
          var centre = r.top + r.height / 2;
          lit = smooth(1 - Math.abs(centre - vh / 2) / (vh * 0.55));
        }
        // Quantised to 0.02 and written only on change. Every pixel of scroll
        // used to write a fresh value, and each write restarted a fill
        // interpolation on all 78 mark dots - style and paint work for a
        // change no one can see. Fifty steps across the fade is far below
        // what the eye resolves in a colour mix.
        var q = Math.round(lit * 50) / 50;
        if (q === written) return;
        written = q;
        fig.style.setProperty('--mark-lit', q.toFixed(2));
      }

      // Pause the pulse while the page is scrolling (.is-scrolling, see the
      // CSS). Cleared 160ms after the last scroll event: long enough to span
      // the gap between wheel ticks, short enough that the breath resumes as
      // soon as the page settles.
      //
      // Not rAF-throttled: one rect read and one property write, and rAF is
      // throttled to a stop in the preview environment.
      var settle = null;
      function onScroll() {
        if (!settle) fig.classList.add('is-scrolling');
        clearTimeout(settle);
        settle = setTimeout(function () {
          settle = null;
          fig.classList.remove('is-scrolling');
        }, 160);
        update();
      }
      window.addEventListener('scroll', onScroll, { passive: true });
      window.addEventListener('resize', update);

      // And while it is off-screen entirely: nothing to see, nothing to
      // repaint. The margin keeps it running just before it enters, so it is
      // never caught frozen at the edge.
      if ('IntersectionObserver' in window) {
        new IntersectionObserver(function (entries) {
          entries.forEach(function (e) {
            fig.classList.toggle('is-offscreen', !e.isIntersecting);
            if (e.isIntersecting) probe();
          });
        }, { rootMargin: '80px 0px' }).observe(fig);
      }

      // Frame-time probe (9 Sep 2026). A Surface Pro X showed a glitch on this
      // figure that a desktop does not: the pulse is a software repaint of
      // 978 circles per frame, and an ARM tablet at DPR 2 cannot always hold
      // it. Measured once, the first time the figure is on screen with the
      // page still - the pulse only runs then, so that is the cost in
      // question - over 1.5s of frames. Under ~38fps the figure goes static
      // (.is-lowend, see the CSS) and the cursor loop below stands down.
      // Needs a dozen real frames before it will say anything: a hidden tab,
      // or the preview pane, throttles rAF to nothing, and silence is not
      // slowness.
      var probed = false;
      function probe() {
        if (probed || !window.requestAnimationFrame) return;
        probed = true;
        var start = 0, last = 0, frames = 0, began = performance.now();
        function tick(t) {
          if (fig.classList.contains('is-scrolling') || fig.classList.contains('is-offscreen')) {
            start = 0; frames = 0;
            if (t - began < 12000) requestAnimationFrame(tick);
            return;
          }
          if (!start) { start = last = t; } else { frames++; last = t; }
          if (t - start < 1500) { requestAnimationFrame(tick); return; }
          if (frames < 12) return;
          if ((t - start) / frames > 26) fig.classList.add('is-lowend');
        }
        requestAnimationFrame(tick);
      }

      if (window.matchMedia && window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
        // .is-hovering carries the fill transition (hover-only, see the CSS).
        // Kept on for a beat after leaving so the way out fades too.
        fig.addEventListener('pointerenter', function () {
          hovering = true;
          fig.classList.add('is-hovering');
          update();
        });
        fig.addEventListener('pointerleave', function () {
          hovering = false;
          update();
          setTimeout(function () { if (!hovering) fig.classList.remove('is-hovering'); }, 340);
        });
      }
      update();
    });
  }, []);
  return null;
}
