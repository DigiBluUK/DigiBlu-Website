"use client";
import { useEffect } from "react";
import { once } from "@/lib/client/once";
import { ensureAboutPin } from "@/lib/client/about-pin";

// Ported from index.html lines 977-1062 by
// scripts/port-behaviour.cjs: the old script's body, verbatim, run once on
// mount against the server-rendered markup. Kept as JavaScript on purpose -
// this is the old site's code, not a rewrite. Hand edits after generation
// are allowed and are noted in the file where made.
export default function AboutNarrative() {
  useEffect(() => {
    ensureAboutPin();
    once("about-narrative", () => {
      // Scroll read-through on the "Who we are" narrative: the copy starts
      // stepped back and fills to full ink a word at a time as the block
      // travels up the viewport, so the colour follows roughly where the
      // reader is. Skipped under prefers-reduced-motion, where the paragraphs
      // are left at full ink instead.
      var head = document.querySelector('.about-head');
      if (!head || !window.matchMedia) return;
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

      var paras = head.querySelectorAll('.about-lede');
      if (!paras.length) return;

      // Wrap every word in its own span, walking the text nodes rather than
      // rewriting innerHTML so any inline markup inside a paragraph survives
      // instead of being flattened away.
      var words = [];
      [].forEach.call(paras, function (p) {
        var walker = document.createTreeWalker(p, NodeFilter.SHOW_TEXT, null);
        var nodes = [];
        while (walker.nextNode()) nodes.push(walker.currentNode);
        nodes.forEach(function (node) {
          var frag = document.createDocumentFragment();
          node.nodeValue.split(/(\s+)/).forEach(function (part) {
            if (!part) return;
            if (!part.trim()) { frag.appendChild(document.createTextNode(part)); return; }
            var span = document.createElement('span');
            span.className = 'about-word';
            span.textContent = part;
            frag.appendChild(span);
            words.push(span);
          });
          node.parentNode.replaceChild(frag, node);
        });
      });
      if (!words.length) return;

      // Only now does the CSS start muting anything, so a failure above this
      // line leaves the copy at full ink rather than permanently dimmed.
      head.classList.add('is-reading');

      // Deliberately not rAF-throttled: the handler is one rect read plus a
      // walk over only the words whose state actually changed, so it is cheap,
      // and it stays correct where rAF is throttled to a stop rather than
      // silently never running.
      var lit = -1;
      function update() {
        var r = head.getBoundingClientRect();
        var vh = window.innerHeight || document.documentElement.clientHeight;
        // Fills as the block's TOP travels from 92% of the viewport up to 50%
        // - about 0.4 of a screen of scrolling, regardless of the block's own
        // height. It used to run until the whole block had cleared the upper
        // third (roughly a full screen), and a stakeholder scrolling at speed
        // was past the section with the copy still grey. Fast now: a flick
        // lights the paragraph before the eye lands on it.
        var travel = vh * 0.42;
        var p = (vh * 0.92 - r.top) / (travel || 1);
        // The pin holds this block still, so its own travel stops around 80%
        // and the last ten words would never light - they sat muted for the
        // whole hold. While the pin is live the rest of the fill rides the
        // pin's progress instead, finishing just before the second value
        // opens, so the sentence completes and then the counting starts.
        //
        // Read off window each tick rather than captured once: this IIFE runs
        // BEFORE the one that defines it, so a captured reference would be
        // undefined forever and the fill would silently keep freezing.
        var pinP = window.__aboutPinProgress;
        if (pinP && pinP.live()) {
          // Completes by 6% of the pin. With the band above the fill is
          // normally done before the pin engages; this is the safety net.
          var q = pinP() / 0.06;
          if (q > p) p = q;
        }
        p = p < 0 ? 0 : (p > 1 ? 1 : p);
        var n = Math.round(p * words.length);
        if (n === lit) return;
        var from = lit < 0 ? 0 : (lit < n ? lit : n);
        var to = lit > n ? lit : n;
        for (var i = from; i < to && i < words.length; i++) {
          words[i].classList.toggle('is-read', i < n);
        }
        lit = n;
      }

      window.addEventListener('scroll', update, { passive: true });
      window.addEventListener('resize', update);
      update();
    });
  }, []);
  return null;
}
