"use client";
import { useEffect } from "react";
import { once } from "@/lib/client/once";

// Ported from index.html lines 2764-2938 by
// scripts/port-behaviour.cjs: the old script's body, verbatim, run once on
// mount against the server-rendered markup. Kept as JavaScript on purpose -
// this is the old site's code, not a rewrite. Hand edits after generation
// are allowed and are noted in the file where made.
export default function ContactForm() {
  useEffect(() => {
    once("contact-form", () => {
      var overlay = document.getElementById('contactModal');
      if (!overlay) return;
      var panel = overlay.querySelector('.modal-panel');
      var form = overlay.querySelector('.modal-form');
      var closeBtn = overlay.querySelector('.modal-close');
      var openers = document.querySelectorAll('.js-contact-open');
      var backBtn = overlay.querySelector('.modal-back');
      var nextBtn = overlay.querySelector('.modal-next');
      var submitBtn = overlay.querySelector('.modal-submit');
      var doneBtn = overlay.querySelector('.modal-done');
      var formSteps = overlay.querySelectorAll('.form-step');
      var stepIndicators = overlay.querySelectorAll('.modal-step');
      var titleEl = overlay.querySelector('#mm-title');
      var subEl = overlay.querySelector('#mm-sub');
      var counterEl = overlay.querySelector('#mm-counter');
      var lastFocused = null;
      var currentStep = 1;
      var totalSteps = formSteps.length;

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

      // Two steps. "Schedule a time" was removed on request, and its consent
      // checkbox moved onto step 2. totalSteps reads .form-step off the DOM,
      // so nothing here hardcodes the count.
      var STEP_COPY = {
        1: { title: 'Your details', sub: 'Let us know who we will be speaking with.' },
        2: { title: 'Your enquiry', sub: 'Tell us a little about what you need.' }
      };

      function showStep(n) {
        currentStep = n;
        formSteps.forEach(function (el) {
          el.classList.toggle('active', Number(el.dataset.step) === n);
        });
        stepIndicators.forEach(function (el) {
          var i = Number(el.dataset.stepIndicator);
          el.classList.toggle('active', i === n);
          el.classList.toggle('done', i < n);
        });
        titleEl.textContent = STEP_COPY[n].title;
        subEl.textContent = STEP_COPY[n].sub;
        counterEl.textContent = 'Step ' + n + ' of ' + totalSteps;
        backBtn.hidden = n === 1;
        nextBtn.hidden = n === totalSteps;
        submitBtn.hidden = n !== totalSteps;
      }

      function focusFirstFieldOf(n) {
        var firstField = formSteps[n - 1].querySelector('input, select, textarea');
        if (firstField) firstField.focus();
      }

      function currentStepIsValid() {
        var fields = formSteps[currentStep - 1].querySelectorAll('input[required], select[required], textarea[required]');
        for (var i = 0; i < fields.length; i++) {
          if (!fields[i].checkValidity()) {
            fields[i].reportValidity();
            return false;
          }
        }
        return true;
      }

      function openModal(e) {
        if (e) e.preventDefault();
        lastFocused = document.activeElement;
        overlay.classList.add('open');
        document.body.style.overflow = 'hidden';
        setBackgroundInert(true);
        showStep(1);
        // Focus the dialog itself rather than the first input: screen readers
        // announce the dialog, and mobile keyboards do not spring open.
        panel.focus();
      }

      function closeModal() {
        overlay.classList.remove('open');
        document.body.style.overflow = '';
        setBackgroundInert(false);
        // Reset to the form view so a reopened modal doesn't show the
        // previous submission's success state or a stale step.
        panel.classList.remove('sent');
        if (form) form.reset();
        showStep(1);
        // Focus must leave the dialog, otherwise the browser keeps the subtree
        // visible (and focusable) while it still contains the active element.
        if (lastFocused && document.contains(lastFocused)) {
          lastFocused.focus();
        } else if (overlay.contains(document.activeElement)) {
          document.activeElement.blur();
        }
      }

      openers.forEach(function (btn) {
        btn.addEventListener('click', openModal);
      });

      // The standalone case-study/blog/legal pages can't open this dialog
      // directly (it only exists on the homepage), so their "Get in touch" and
      // "Contact Us" links point at index.html#contact and this opens it on
      // arrival. hashchange covers the link being followed while already here.
      function openFromHash() {
        if (window.location.hash === '#contact') openModal();
      }
      openFromHash();
      window.addEventListener('hashchange', openFromHash);

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

      nextBtn.addEventListener('click', function () {
        if (currentStepIsValid() && currentStep < totalSteps) {
          showStep(currentStep + 1);
          focusFirstFieldOf(currentStep);
        }
      });

      backBtn.addEventListener('click', function () {
        if (currentStep > 1) {
          showStep(currentStep - 1);
          focusFirstFieldOf(currentStep);
        }
      });

      doneBtn.addEventListener('click', closeModal);

      form.addEventListener('submit', function (e) {
        e.preventDefault();
        if (!currentStepIsValid()) return;
        // No backend is wired up yet: this only shows the confirmation state.
        panel.classList.add('sent');
        doneBtn.focus();
      });
    });
  }, []);
  return null;
}
