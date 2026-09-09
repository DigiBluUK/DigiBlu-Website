import { once } from "./once";

// Ported verbatim from index.html lines 1066-1114: how far the About pin has
// run, shared by the narrative fill and the values. Still published on
// window.__aboutPinProgress so the two consumers' code stays word for word.
export function ensureAboutPin() {
  once("about-pin", () => {
    // How far the About pin has run, 0 at the moment the composition sticks
    // and 1 as it releases. Shared, because the narrative fill and the
    // values both need it and measuring it twice invites the two to drift.
    //
    // Sticky does not move an element in flow, so the spacer's top edge
    // keeps travelling at scroll speed even while the composition looks
    // frozen - which is exactly the ruler this needs. At the moment the pin
    // engages that edge sits at (sticky offset + composition height); one
    // spacer-height later the pin releases.
    //
    // Whether the pin exists at all is the CSS's call (width and viewport
    // height), and .live() just reads whether the spacer has any height, so
    // the script never restates those media queries.
    var pin = document.querySelector('.about-pin-space');
    var inner = document.querySelector('.about-inner');
    var offset = 0;

    // Cached rather than read per scroll event: it only moves when --nav-h
    // does, and getComputedStyle in a scroll handler forces style resolution
    // on every tick.
    function measure() {
      if (!inner) { offset = 0; return; }
      // The CSS centres the composition from this. Written BEFORE the top
      // is read, since the top is computed from it.
      inner.style.setProperty('--about-inner-h', inner.offsetHeight + 'px');
      offset = parseFloat(getComputedStyle(inner).top) || 0;
    }

    function pinProgress() {
      if (!pin || !inner || !pin.offsetHeight) return 0;
      return ((offset + inner.offsetHeight) - pin.getBoundingClientRect().top) / pin.offsetHeight;
    }
    pinProgress.live = function () { return !!(pin && inner && pin.offsetHeight); };

    if (pinProgress.live()) measure();
    window.addEventListener('resize', measure);
    // --nav-h is set by the nav script further down this file, so at this
    // point the sticky top still resolves to its 75px fallback and the value
    // cached above is only right while the nav happens to be 75px tall.
    // Measured once more on the first scroll, by which time the real value
    // exists. This listener is registered before the values IIFE's, so it
    // runs first on that same event.
    var remeasured = false;
    window.addEventListener('scroll', function () {
      if (remeasured) return;
      remeasured = true;
      measure();
    }, { passive: true });
    window.__aboutPinProgress = pinProgress;
  });
}
