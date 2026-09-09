"use client";
import { useEffect } from "react";
import { once } from "@/lib/client/once";

// Ported from index.html lines 1457-1565 by
// scripts/port-behaviour.cjs: the old script's body, verbatim, run once on
// mount against the server-rendered markup. Kept as JavaScript on purpose -
// this is the old site's code, not a rewrite. Hand edits after generation
// are allowed and are noted in the file where made.
export default function GeoCursor() {
  useEffect(() => {
    once("geo-cursor", () => {
      // Dots swell around the cursor as it crosses the figure, then ease back.
      //
      // Written to the `transform` property, while the idle pulse animates the
      // `scale` property. The two compose, so the pointer response adds to the
      // pulse instead of being overridden by it - a running CSS animation beats
      // an inline style on the same property, so sharing one would have
      // silently done nothing.
      var fig = document.querySelector('.geo-figure');
      if (!fig || !window.matchMedia) return;
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
      // Pointer-driven, so it is for pointer devices. On touch there is no
      // hover to track and every dash would only move on a drag.
      if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;

      var svg = fig.querySelector('svg');
      var circles = [].slice.call(fig.querySelectorAll('circle'));
      if (!svg || !circles.length) return;

      // Centre of each dot, in viewBox units, measured once. Reading these back
      // per frame would be hundreds of layout queries.
      var VB = 384;
      var dash = circles.map(function (c) {
        return {
          el: c,
          x: parseFloat(c.getAttribute('cx')),
          y: parseFloat(c.getAttribute('cy')),
          mk: c.classList.contains('mk'),
          set: false
        };
      });

      var RADIUS = 150;    // viewBox units of influence, out of 384
      var MAX = 3.4;       // field dots, scale multiplier at the cursor
      var PUSH = 9;        // viewBox units EVERYTHING is parted by
      var MARK_MAX = 1.9;  // the mark swells less - geometry, see the loop
      var px = 0, py = 0, active = false, queued = false;

      function apply() {
        if (fig.classList.contains('is-lowend')) { queued = false; return; }
        queued = false;
        for (var i = 0; i < dash.length; i++) {
          var d = dash[i];
          if (!active) {
            if (d.set) { d.el.style.transform = ''; d.set = false; }
            continue;
          }
          var dx = d.x - px, dy = d.y - py;
          var dist = Math.sqrt(dx * dx + dy * dy);
          if (dist > RADIUS) {
            if (d.set) { d.el.style.transform = ''; d.set = false; }
            continue;
          }
          // Dots swell AND part around the cursor, so the field visibly opens
          // as it passes rather than only brightening. Eased rather than
          // linear, so the bulge has a soft shoulder instead of a visible
          // circular edge where the radius ends.
          //
          // DISPLACEMENT IS UNIFORM - the mark is pushed exactly as far as the
          // field, so the whole lattice parts around the pointer as one
          // surface. The mark used to move only 2 units against the field's 9,
          // which read as a layer of dots sitting over a logo that ignored the
          // cursor entirely (reported).
          //
          // SCALE is not uniform, and that is geometry rather than caution. A
          // mark dot is r=3.15 against the field's 1.05, so the field's 3.4x
          // would give it a 21-unit diameter on a 12.28-unit pitch: the
          // letterforms would merge into a blob wherever the cursor went.
          // 1.9x puts the mark at 11.97, just inside the pitch, so it swells
          // with everything else and still reads as a db. Re-derive this if
          // R_MARK or the grid pitch in dots.cjs ever changes.
          //
          // Written to the transform property while the idle pulse animates
          // the scale property: the two compose. Sharing one property would
          // silently do nothing, since a running animation beats an inline
          // style.
          var t = 1 - dist / RADIUS;
          var falloff = t * t * (3 - 2 * t);
          var maxS = d.mk ? MARK_MAX : MAX;
          var push = PUSH * falloff;
          var grow = 1 + (maxS - 1) * falloff;
          // Away from the cursor, along the line joining it. dist can be 0 when
          // the pointer sits exactly on a dot, which would divide by zero.
          var ux = dist > 0.001 ? dx / dist : 0;
          var uy = dist > 0.001 ? dy / dist : 0;
          d.el.style.transform = 'translate(' + (ux * push).toFixed(2) + 'px,' + (uy * push).toFixed(2) + 'px) scale(' + grow.toFixed(3) + ')';
          d.set = true;
        }
      }

      function schedule() {
        if (queued) return;
        queued = true;
        if (window.requestAnimationFrame) requestAnimationFrame(apply);
        else apply();
      }

      fig.addEventListener('pointermove', function (e) {
        var r = svg.getBoundingClientRect();
        if (!r.width || !r.height) return;
        px = (e.clientX - r.left) / r.width * VB;
        py = (e.clientY - r.top) / r.height * VB;
        active = true;
        schedule();
      });

      fig.addEventListener('pointerleave', function () {
        active = false;
        schedule();
      });
    });
  }, []);
  return null;
}
