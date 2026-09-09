// Ported verbatim from index.html lines 1959-2056 (the shared dialog
// controller: background inert, focus trap, Escape, backdrop click, and the
// stacking hand-off in close()). See CLAUDE.md, Dialogs. Kept as JavaScript:
// this is the old site's code, not a rewrite.
export function createModalController(overlay, opts) {
  opts = opts || {};
  var panel = overlay.querySelector('.modal-panel');
  var closeBtn = overlay.querySelector('.modal-close');
  var lastFocused = null;

  function backgroundEls() {
    return [].filter.call(document.body.children, function (el) {
      return el !== overlay && el.tagName !== 'SCRIPT';
    });
  }

  function setBackgroundInert(on) {
    backgroundEls().forEach(function (el) {
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

  function open(restoreFocusTo) {
    // Remember where focus came from so closing can put it back, unless the
    // caller is chaining dialogs and wants the original opener preserved.
    if (restoreFocusTo !== undefined) { lastFocused = restoreFocusTo; }
    else { lastFocused = document.activeElement; }
    overlay.classList.add('open');
    document.body.style.overflow = 'hidden';
    setBackgroundInert(true);
    // If another dialog opened first (the contact form, whose own inert
    // sweep marks every sibling - this overlay included), this one was
    // inert before it was ever shown. Inert elements are excluded from
    // hit-testing, so the close button did nothing and the body could
    // not be scrolled. Lift it explicitly: being the topmost dialog is
    // what should decide interactivity, not who opened first.
    overlay.removeAttribute('inert');
    panel.scrollTop = 0;
    var body = overlay.querySelector('.case-modal-body');
    if (body) body.scrollTop = 0;
    panel.focus();
  }

  function close(skipRestore) {
    overlay.classList.remove('open');
    // A dialog can be opened from inside another one (the contact form's
    // Privacy Policy link opens the legal dialog over it). Clearing inert
    // and the scroll lock unconditionally would hand the page back to the
    // keyboard while that first dialog is still on screen, so if anything
    // is still open the lock is handed to it rather than released.
    var stillOpen = document.querySelector('.modal-overlay.open');
    if (stillOpen) {
      [].forEach.call(document.body.children, function (el) {
        if (el === stillOpen || el.tagName === 'SCRIPT') { el.removeAttribute('inert'); }
        else { el.setAttribute('inert', ''); }
      });
    } else {
      document.body.style.overflow = '';
      setBackgroundInert(false);
    }
    if (skipRestore === true) return;
    if (lastFocused && document.contains(lastFocused)) {
      lastFocused.focus();
    } else if (overlay.contains(document.activeElement)) {
      document.activeElement.blur();
    }
  }

  closeBtn.addEventListener('click', function () { close(); });

  overlay.addEventListener('click', function (e) {
    if (e.target === overlay) close();
  });

  document.addEventListener('keydown', function (e) {
    if (!overlay.classList.contains('open')) return;
    if (e.key === 'Escape') { close(); return; }
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

  return { open: open, close: close, lastFocusedRef: function () { return lastFocused; } };
}
