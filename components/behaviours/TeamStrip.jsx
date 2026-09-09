"use client";
import { useEffect } from "react";
import { once } from "@/lib/client/once";
import { createModalController } from "@/lib/client/modal";

// Ported from index.html lines 1235-1338 by
// scripts/port-behaviour.cjs: the old script's body, verbatim, run once on
// mount against the server-rendered markup. Kept as JavaScript on purpose -
// this is the old site's code, not a rewrite. Hand edits after generation
// are allowed and are noted in the file where made.
export default function TeamStrip({ team }) {
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

      // Name, role and photo are all real and published on
      // digiblu.com/about-digiblu. That page carries nothing beyond name and
      // title, so the bios were placeholders until DigiBlu supplied this copy
      // (feedback #11) - it is theirs verbatim, not written here. Three role
      // titles changed with it and the strip labels were updated to match.
      // Content from props (content/team/*.md), in the script's own shape.
      var TEAM_MEMBERS = team;
      function unwrap(html) { return String(html).replace(/^<p>([\s\S]*)<\/p>$/, '$1'); }


      var overlay = document.getElementById('teamModal');
      var modal = overlay ? createModalController(overlay) : null;
      var photoEl = document.getElementById('teamModalPhoto');
      var nameEl = document.getElementById('teamModalName');
      var roleEl = document.getElementById('teamModalRole');
      var bioEl = document.getElementById('teamModalBio');

      function openProfile(i, opener) {
        var m = TEAM_MEMBERS[i];
        if (!m || !modal) return;
        // The photo classes (.tp-*) already carry each headshot as a CSS
        // background, so the modal reuses them rather than duplicating paths.
        photoEl.className = 'team-modal-photo ' + m.cls;
        photoEl.setAttribute('aria-label', m.name);
        nameEl.textContent = m.name;
        roleEl.textContent = m.role;

        if (m.html) { bioEl.innerHTML = unwrap(m.html); bioEl.hidden = false; }
        else { bioEl.textContent = ''; bioEl.hidden = true; }

        modal.open(opener);
      }

      // Below 760px the strip is a stacked list with every name already
      // visible, so there is nothing to expand and a tap goes straight to the
      // profile - but it still moves the highlight, so the blue row follows
      // the member being viewed rather than staying on the first slice for
      // the whole session. Above it, a tap on a collapsed slice expands it
      // first (its name isn't readable until it does) and a second tap opens
      // the profile.
      var stacked = window.matchMedia('(max-width: 760px)');

      // The desktop card shows the bio beside the photo (see .team-slice-bio).
      // Injected here rather than authored in the markup, so the bios stay in
      // TEAM_MEMBERS, the one place they are written - the dialog reads the
      // same array, so the two can never disagree. A span, not a <p>: the
      // slice is a <button>, which allows phrasing content only.
      slices.forEach(function (el, i) {
        var m = TEAM_MEMBERS[i];
        var label = el.querySelector('.team-slice-label');
        if (!m || !label || label.querySelector('.team-slice-bio')) return;
        var bio = document.createElement('span');
        bio.className = 'team-slice-bio';
        bio.innerHTML = unwrap(m.html);
        label.appendChild(bio);
      });

      slices.forEach(function (el, i) {
        el.addEventListener('click', function () {
          if (stacked.matches) { setActive(i); openProfile(i, el); }
          else if (el.classList.contains('active')) openProfile(i, el);
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
