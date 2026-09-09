"use client";
import { useEffect } from "react";
import { once } from "@/lib/client/once";
import { createModalController } from "@/lib/client/modal";

// Ported from index.html lines 2582-2615 by
// scripts/port-behaviour.cjs: the old script's body, verbatim, run once on
// mount against the server-rendered markup. Kept as JavaScript on purpose -
// this is the old site's code, not a rewrite. Hand edits after generation
// are allowed and are noted in the file where made.
export default function BadgeDialog({ accreditations }) {
  useEffect(() => {
    once("badge-dialog", () => {
      function unwrap(html) { return String(html).replace(/^<p>([\s\S]*)<\/p>$/, '$1'); }
      var overlay = document.getElementById('badgeModal');
      if (!overlay) return;
      var modal = createModalController(overlay);

      var visual = document.getElementById('badgeModalVisual');
      var visualWrap = document.getElementById('badgeModalVisualWrap');
      var titleEl = document.getElementById('badgeModalTitle');
      var descEl = document.getElementById('badgeModalDesc');

      function populate(key) {
        var d = accreditations.find(function (x) { return x.key === key; });
        if (!d) return false;
        visual.src = d.img;
        visual.alt = d.title + ' certification mark';
        visualWrap.classList.toggle('on-dark-plate', !!d.onDark);
        titleEl.textContent = d.title;
        descEl.innerHTML = unwrap(d.html);
        return true;
      }

      // Delegated on the track rather than bound per-chip: the strip shows
      // each chip twice (the duplicate group drives the seamless loop), and
      // because it auto-scrolls, whichever copy is under the cursor when a
      // visitor clicks is arbitrary. Binding only the six real buttons would
      // leave the other six looking identical but doing nothing.
      var track = document.querySelector('.accred-track');
      if (!track) return;
      track.addEventListener('click', function (e) {
        var btn = e.target.closest('.accred-chip');
        if (!btn || !populate(btn.dataset.badge)) return;
        // Focus is only restored to the real, tab-reachable copy; clicking a
        // duplicate leaves createModalController's default behaviour.
        modal.open(btn.getAttribute('tabindex') === '-1' ? undefined : btn);
      });
    });
  }, []);
  return null;
}
