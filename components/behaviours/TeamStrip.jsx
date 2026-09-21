"use client";
import { useEffect } from "react";
import { once } from "@/lib/client/once";

// Ported from index.html lines 1235-1338 by
// scripts/port-behaviour.cjs: the old script's body, verbatim, run once on
// mount against the server-rendered markup. Kept as JavaScript on purpose -
// this is the old site's code, not a rewrite. Hand edits after generation
// are allowed and are noted in the file where made.
export default function TeamStrip() {
  useEffect(() => {
    once("team-strip", () => {
      var slices = document.querySelectorAll('.team-slice');
      if (!slices.length) return;
      var prevBtn = document.querySelector('.team-prev');
      var nextBtn = document.querySelector('.team-next');

      function currentIndex() {
        var idx = 0;
        slices.forEach(function (el, i) { if (el.classList.contains('active')) idx = i; });
        return idx;
      }

      function setActive(index) {
        slices.forEach(function (el, i) {
          var isActive = i === index;
          el.classList.toggle('active', isActive);
          el.setAttribute('aria-pressed', String(isActive));
        });
      }



      // Hand edit (18 Sep 2026): the profile dialog is gone - content lives
      // on its page only - so opening a profile goes to that member's entry
      // on /team, anchored by the key the page uses for its ids.
      // Hand edit (21 Sep 2026): the key comes from the slice itself
      // (data-key, rendered from content/team), not a parallel array.
      function openProfile(i) {
        var key = slices[i] && slices[i].getAttribute('data-key');
        if (key) window.location.assign('/team#' + key);
      }

      // Below 760px the strip is a stacked list with every name already
      // visible, so there is nothing to expand and a tap goes straight to the
      // profile - but it still moves the highlight, so the blue row follows
      // the member being viewed rather than staying on the first slice for
      // the whole session. Above it, a tap on a collapsed slice expands it
      // first (its name isn't readable until it does) and a second tap opens
      // the profile.
      var stacked = window.matchMedia('(max-width: 760px)');

      // The desktop card's bio is server-rendered since 21 Sep 2026
      // (components/sections/Team.tsx); it used to be injected here.

      slices.forEach(function (el, i) {
        el.addEventListener('click', function () {
          if (stacked.matches) { setActive(i); openProfile(i); }
          else if (el.classList.contains('active')) openProfile(i);
          else setActive(i);
        });
      });

      if (prevBtn) prevBtn.addEventListener('click', function () {
        setActive((currentIndex() - 1 + slices.length) % slices.length);
      });
      if (nextBtn) nextBtn.addEventListener('click', function () {
        setActive((currentIndex() + 1) % slices.length);
      });
    });
  }, []);
  return null;
}
