"use client";
import { useEffect } from "react";
import { once } from "@/lib/client/once";

// Ported from index.html lines 1569-1594 by
// scripts/port-behaviour.cjs: the old script's body, verbatim, run once on
// mount against the server-rendered markup. Kept as JavaScript on purpose -
// this is the old site's code, not a rewrite. Hand edits after generation
// are allowed and are noted in the file where made.
export default function PhoneDigits() {
  useEffect(() => {
    once("phone-digits", () => {
      // Phone field takes numbers only - letters and stray punctuation are
      // stripped as they are typed or pasted.
      //
      // "Numbers only" here means no letters, not digits alone: + ( ) - and
      // spaces are kept, because stripping them would mangle every
      // international number (+44 ...) and DigiBlu's clients are not all in
      // the UK. Ask before tightening this to digits alone.
      var phone = document.getElementById('cf-phone');
      if (!phone) return;

      var DISALLOWED = /[^0-9+()\-\s]/g;

      phone.addEventListener('input', function () {
        var before = phone.value;
        var after = before.replace(DISALLOWED, '');
        if (after === before) return;

        // Rewriting .value drops the caret to the end of the field, which
        // makes editing mid-number impossible. Count how many characters were
        // removed ahead of the caret and put it back where it was.
        var caret = phone.selectionStart;
        var removedBeforeCaret = before.slice(0, caret).replace(/[0-9+()\-\s]/g, '').length;
        phone.value = after;
        var pos = caret - removedBeforeCaret;
        try { phone.setSelectionRange(pos, pos); } catch (e) {}
      });
    });
  }, []);
  return null;
}
