"use client";
import { useEffect } from "react";
import { once } from "@/lib/client/once";

// Ported from index.html lines 1823-1953 by
// scripts/port-behaviour.cjs: the old script's body, verbatim, run once on
// mount against the server-rendered markup. Kept as JavaScript on purpose -
// this is the old site's code, not a rewrite. Hand edits after generation
// are allowed and are noted in the file where made.
export default function ServiceDialog({ services }) {
  useEffect(() => {
    once("service-dialog", () => {

      var overlay = document.getElementById('serviceModal');
      if (!overlay) return;
      var panel = overlay.querySelector('.modal-panel');
      var closeBtn = overlay.querySelector('.modal-close');
      // Also opened by the footer's Services links (plain buttons, styled as
      // footer links rather than the card "Learn more" affordance, but they
      // carry the same data-service key so openModal() below needs no changes.
      var openers = document.querySelectorAll('.service-learn-more, .footer-col button[data-service]');
      var contactBtn = overlay.querySelector('.js-contact-open');
      var eyebrowEl = overlay.querySelector('#svcEyebrow');
      var titleEl = overlay.querySelector('#svcTitle');
      var introEl = overlay.querySelector('#svcIntro');
      var listEl = overlay.querySelector('#svcList');
      var lastFocused = null;

      // Everything outside the dialog is made inert while it is open, so
      // neither Tab nor a screen reader can reach the page behind it.
      var backgroundEls = [].filter.call(document.body.children, function (el) {
        return el !== overlay && el.tagName !== 'SCRIPT';
      });

      function setBackgroundInert(on) {
        backgroundEls.forEach(function (el) {
          if (on) { el.setAttribute('inert', ''); }
          else { el.removeAttribute('inert'); }
        });
      }

      function visibleFocusables() {
        return [].filter.call(
          overlay.querySelectorAll('button, input, select, textarea, a[href]'),
          function (el) { return !el.hidden && el.offsetParent !== null && !el.disabled; }
        );
      }

      // The number comes off the card's own .service-num, not from this
      // object's key order. Deriving it from key order is what put the wrong
      // number on two services: the cards were reordered (Opportunity
      // Discovery to 2, Process Excellence to 3) and the markup was updated,
      // but SERVICES kept its original order, so the popup and the card
      // disagreed. Reading the rendered value means they cannot diverge
      // again. Footer links carry the same data-service key and resolve
      // through the card too, so they need no special case.
      function serviceNumber(key) {
        var opener = document.querySelector('.service-card [data-service="' + key + '"]');
        var card = opener && opener.closest('.service-card');
        var numEl = card && card.querySelector('.service-num');
        if (numEl && numEl.textContent.trim()) return numEl.textContent.trim();
        // Only reached if a service has no card on the page.
        var i = Object.keys(SERVICES).indexOf(key) + 1;
        return (i < 10 ? '0' : '') + i;
      }

      function populate(key) {
        var data = services.find(function (x) { return x.key === key; });
        if (!data) return false;
        eyebrowEl.textContent = 'Service ' + serviceNumber(key);
        titleEl.textContent = data.title;
        introEl.textContent = data.intro;
        listEl.innerHTML = '';
        data.sections.forEach(function (item) {
          var row = document.createElement('div');
          row.className = 'service-modal-item';
          var h = document.createElement('h3');
          h.textContent = item.heading;
          var p = document.createElement('div');
          p.innerHTML = item.html;
          row.appendChild(h);
          row.appendChild(p);
          listEl.appendChild(row);
        });
        return true;
      }

      function openModal(e) {
        var key = e.currentTarget.getAttribute('data-service');
        if (!populate(key)) return;
        lastFocused = document.activeElement;
        overlay.classList.add('open');
        document.body.style.overflow = 'hidden';
        setBackgroundInert(true);
        panel.focus();
      }

      function closeModal() {
        overlay.classList.remove('open');
        document.body.style.overflow = '';
        setBackgroundInert(false);
        if (lastFocused && document.contains(lastFocused)) {
          lastFocused.focus();
        } else if (overlay.contains(document.activeElement)) {
          document.activeElement.blur();
        }
      }

      openers.forEach(function (btn) {
        btn.addEventListener('click', openModal);
      });

      closeBtn.addEventListener('click', closeModal);

      overlay.addEventListener('click', function (e) {
        if (e.target === overlay) closeModal();
      });

      document.addEventListener('keydown', function (e) {
        if (!overlay.classList.contains('open')) return;

        if (e.key === 'Escape') { closeModal(); return; }

        // Focus trap: cycle Tab within the dialog.
        if (e.key === 'Tab') {
          var f = visibleFocusables();
          if (!f.length) return;
          var first = f[0];
          var last = f[f.length - 1];
          if (e.shiftKey && (document.activeElement === first || document.activeElement === panel)) {
            e.preventDefault();
            last.focus();
          } else if (!e.shiftKey && document.activeElement === last) {
            e.preventDefault();
            first.focus();
          }
        }
      });

      // The footer CTA hands off to the contact modal: close this dialog
      // first, then let its own .js-contact-open listener (bound below)
      // open the contact modal on the same click.
      if (contactBtn) contactBtn.addEventListener('click', closeModal);
    });
  }, []);
  return null;
}
