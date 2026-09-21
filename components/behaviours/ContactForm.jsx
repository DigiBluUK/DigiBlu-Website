"use client";
import { useEffect } from "react";
import { once } from "@/lib/client/once";
import { trackEvent } from "@/lib/consent/gtag";

// Ported from index.html lines 2764-2938 by
// scripts/port-behaviour.cjs: the old script's body, verbatim, run once on
// mount against the server-rendered markup. Kept as JavaScript on purpose -
// this is the old site's code, not a rewrite. Hand edits after generation
// are allowed and are noted in the file where made.
//
// Hand edits (11 Sep 2026): the form posts to /api/contact, with a
// Cloudflare Turnstile check on the last step, a honeypot and an error
// line (see the Turnstile block and the submit handler).
//
// Hand edits (18 Sep 2026): the form is on /contact only (#contactPage, a
// panel in the flow). The home page's dialog went, and with it the
// overlay-only code this script carried: openers, close, backdrop, Escape,
// the focus trap, inert and the /#contact arrival. A successful send
// reports a GA4 generate_lead event (nothing when analytics is not
// allowed, and never any of what was typed).
export default function ContactForm({ turnstileSiteKey, rootId = 'contactPage' }) {
  useEffect(() => {
    once("contact-form", () => {
      var overlay = document.getElementById(rootId);
      if (!overlay) return;
      var panel = overlay;
      var form = overlay.querySelector('.modal-form');
      var backBtn = overlay.querySelector('.modal-back');
      var nextBtn = overlay.querySelector('.modal-next');
      var submitBtn = overlay.querySelector('.modal-submit');
      var doneBtn = overlay.querySelector('.modal-done');
      var formSteps = overlay.querySelectorAll('.form-step');
      var stepIndicators = overlay.querySelectorAll('.modal-step');
      var titleEl = overlay.querySelector('#mm-title');
      var subEl = overlay.querySelector('#mm-sub');
      var counterEl = overlay.querySelector('#mm-counter');
      var currentStep = 1;
      var totalSteps = formSteps.length;

      var errorEl = overlay.querySelector('#cf-error');
      var turnstileEl = overlay.querySelector('#cf-turnstile');
      var SITE_KEY = turnstileSiteKey || '';
      var widgetId = null;
      var sending = false;

      function showError(msg) { if (errorEl) { errorEl.textContent = msg; errorEl.hidden = false; } }
      function clearError() { if (errorEl) { errorEl.textContent = ''; errorEl.hidden = true; } }

      // Turnstile (11 Sep 2026): loaded the first time the last step shows,
      // not with the page, and rendered explicitly then so the widget
      // measures itself in a visible container. No site key means no
      // widget and no script; the API then refuses every enquiry in
      // production, which is what the build-time warning in next.config.ts
      // is for.
      function loadTurnstile(cb) {
        if (!SITE_KEY) return;
        if (window.turnstile) return cb();
        var existing = document.getElementById('cf-turnstile-script');
        if (existing) { existing.addEventListener('load', cb); return; }
        var s = document.createElement('script');
        s.id = 'cf-turnstile-script';
        s.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
        s.async = true;
        s.defer = true;
        s.addEventListener('load', cb);
        document.head.appendChild(s);
      }
      function renderTurnstile() {
        if (!SITE_KEY || !turnstileEl) return;
        loadTurnstile(function () {
          if (widgetId !== null) { window.turnstile.reset(widgetId); return; }
          widgetId = window.turnstile.render(turnstileEl, {
            sitekey: SITE_KEY,
            theme: document.documentElement.getAttribute('data-theme') || 'auto',
            'error-callback': function () { showError('The security check could not load. Please try again.'); }
          });
        });
      }
      function resetTurnstile() { if (widgetId !== null && window.turnstile) window.turnstile.reset(widgetId); }
      function turnstileToken() {
        return (widgetId !== null && window.turnstile) ? (window.turnstile.getResponse(widgetId) || '') : '';
      }

      function payload() {
        var g = function (id) { var el = overlay.querySelector('#' + id); return el ? el.value : ''; };
        var consentEl = overlay.querySelector('#cf-consent');
        return {
          firstName: g('cf-first'), lastName: g('cf-last'), email: g('cf-email'), phone: g('cf-phone'),
          company: g('cf-company'), message: g('cf-message'),
          consent: !!(consentEl && consentEl.checked),
          website: g('cf-website'),
          turnstileToken: turnstileToken()
        };
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
        clearError();
        if (n === totalSteps) renderTurnstile();
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

      // Back to the form view: Done must not leave the previous
      // submission's success state or a stale step.
      function resetForm() {
        panel.classList.remove('sent');
        if (form) form.reset();
        resetTurnstile();
        clearError();
        showStep(1);
      }

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

      // Done brings the empty form back.
      doneBtn.addEventListener('click', function () {
        resetForm();
        focusFirstFieldOf(1);
      });

      // Posts to /api/contact (app/api/contact/route.ts), which validates,
      // verifies the Turnstile token and hands the enquiry on. Success shows
      // the confirmation state; anything else shows the API's message (or a
      // generic one) on the error line and leaves the form as it was, with
      // the Turnstile widget reset for another go.
      //
      // Success also sends GA4's recommended lead event, so DigiBlu can count
      // enquiries (mark generate_lead as a key event in GA4 Admin). Only the
      // fact of a send goes, never the fields; trackEvent drops it unless
      // analytics consent stands, so this undercounts: the enquiries mailbox
      // is the true total.
      form.addEventListener('submit', function (e) {
        e.preventDefault();
        if (!currentStepIsValid() || sending) return;
        if (SITE_KEY && !turnstileToken()) {
          showError('Please wait for the security check to finish, then try again.');
          return;
        }
        sending = true;
        submitBtn.disabled = true;
        var label = submitBtn.textContent;
        submitBtn.textContent = 'Sending...';
        clearError();
        var fallback = 'We could not send your request. Please try again or email us.';
        fetch('/api/contact', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload()) })
          .then(function (r) {
            return r.json().catch(function () { return {}; }).then(function (j) { return { ok: r.ok && j.ok === true, error: j.error }; });
          })
          .then(function (res) {
            if (res.ok) {
              panel.classList.add('sent');
              // The heading, not Done (21 Sep 2026): focusing the button
              // straight after the role="status" block appears talks over it.
              var sentTitle = overlay.querySelector('#cf-sent-title');
              (sentTitle || doneBtn).focus();
              trackEvent('generate_lead', { lead_source: 'contact_form' });
            }
            else { showError(res.error || fallback); resetTurnstile(); }
          })
          .catch(function () { showError(fallback); resetTurnstile(); })
          .then(function () { sending = false; submitBtn.disabled = false; submitBtn.textContent = label; });
      });

      // The first step shows on load: set the step copy so the counter and
      // buttons are right.
      showStep(1);
    });
  }, []);
  return null;
}
