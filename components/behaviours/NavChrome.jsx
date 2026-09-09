"use client";
import { useEffect } from "react";
import { once } from "@/lib/client/once";

// Ported from index.html lines 1649-1671, 1675-1714, 1718-1754, 1632-1645 by
// scripts/port-behaviour.cjs: the old script's body, verbatim, run once on
// mount against the server-rendered markup. Kept as JavaScript on purpose -
// this is the old site's code, not a rewrite. Hand edits after generation
// are allowed and are noted in the file where made.
export default function NavChrome() {
  useEffect(() => {
    once("nav-measure", () => {
      // Nav is now position: fixed (see .site-nav) so it stays available
      // while scrolling instead of disappearing with the hero, on request.
      // --nav-h drives .hero's padding-top and html's scroll-padding-top, so
      // it is measured from the real rendered nav rather than hand-guessed —
      // a mismatch either hides content under the bar or leaves a gap.
      var siteNav = document.getElementById('siteNav');
      var navEl = siteNav ? siteNav.querySelector('nav') : null;
      if (!siteNav || !navEl) return;

      function syncHeight() {
        document.documentElement.style.setProperty('--nav-h', navEl.offsetHeight + 'px');
      }
      window.addEventListener('resize', syncHeight);
      syncHeight();

      // Solidifies almost immediately on scroll, not only once the hero is
      // fully passed — a transparent bar over the very top of the next
      // section's content would still be hard to read.
      function syncScrolled() {
        siteNav.classList.toggle('scrolled', window.scrollY > 24);
      }
      window.addEventListener('scroll', syncScrolled, { passive: true });
      syncScrolled();
    });
    once("theme-toggle", () => {
      // Every .theme-toggle, not just #themeToggle: below 900px the nav's
      // copy is hidden and a second one inside the mobile menu takes over,
      // and both have to stay in sync (a stale aria-label would announce
      // the wrong action).
      var btns = document.querySelectorAll('.theme-toggle');
      var meta = document.querySelector('meta[name="theme-color"]');
      if (!btns.length) return;

      // With no explicit choice stamped yet, the effective theme is whatever
      // the OS preference resolves to.
      function effective() {
        var attr = document.documentElement.getAttribute('data-theme');
        if (attr === 'light' || attr === 'dark') return attr;
        return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
      }

      function label() {
        var isLight = effective() === 'light';
        var text = isLight ? 'Switch to dark mode' : 'Switch to light mode';
        btns.forEach(function (b) {
          b.setAttribute('aria-label', text);
          // The menu copy carries a visible label; it must match the
          // aria-label exactly (WCAG 2.5.3), so both are set from one string.
          var vis = b.querySelector('.theme-toggle-label');
          if (vis) vis.textContent = text;
        });
        if (meta) meta.setAttribute('content', isLight ? '#ffffff' : '#000000');
      }

      btns.forEach(function (b) {
        b.addEventListener('click', function () {
          var next = effective() === 'light' ? 'dark' : 'light';
          document.documentElement.setAttribute('data-theme', next);
          try { localStorage.setItem('digiblu-theme', next); } catch (e) {}
          label();
        });
      });

      window.matchMedia('(prefers-color-scheme: light)').addEventListener('change', label);
      label();
    });
    once("mobile-menu", () => {
      var toggle = document.querySelector('.nav-toggle');
      var menu = document.getElementById('mobileMenu');
      if (!toggle || !menu) return;

      function setMenu(open) {
        menu.classList.toggle('open', open);
        toggle.setAttribute('aria-expanded', String(open));
        toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
      }

      toggle.addEventListener('click', function () {
        setMenu(!menu.classList.contains('open'));
      });

      menu.addEventListener('click', function (e) {
        // Nav links close the menu; so does the CTA, which would otherwise
        // leave the panel sitting open behind the contact dialog. The theme
        // toggle deliberately does not — you should be able to see the theme
        // change without the menu shutting on you.
        if (e.target.tagName === 'A' || e.target.closest('.js-contact-open')) setMenu(false);
      });

      document.addEventListener('click', function (e) {
        if (!menu.contains(e.target) && !toggle.contains(e.target)) setMenu(false);
      });

      document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && menu.classList.contains('open')) {
          setMenu(false);
          toggle.focus();
        }
      });

      // A resize back to desktop should not leave the panel latched open.
      window.addEventListener('resize', function () {
        if (window.innerWidth > 900) setMenu(false);
      });
    });
    once("scroll-top", () => {
      var scrollBtn = document.getElementById('scrollTopBtn');
      if (scrollBtn) {
        var SHOW_AFTER = 480;
        var toggleVisible = function () {
          scrollBtn.classList.toggle('visible', window.scrollY > SHOW_AFTER);
        };
        window.addEventListener('scroll', toggleVisible, { passive: true });
        toggleVisible();

        scrollBtn.addEventListener('click', function () {
          var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
          window.scrollTo({ top: 0, behavior: reduced ? 'auto' : 'smooth' });
        });
      }
    });
  }, []);
  return null;
}
