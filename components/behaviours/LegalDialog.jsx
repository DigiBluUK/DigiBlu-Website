"use client";
import { useEffect } from "react";
import { once } from "@/lib/client/once";
import { createModalController } from "@/lib/client/modal";

// Ported from index.html lines 2722-2760 by
// scripts/port-behaviour.cjs: the old script's body, verbatim, run once on
// mount against the server-rendered markup. Kept as JavaScript on purpose -
// this is the old site's code, not a rewrite. Hand edits after generation
// are allowed and are noted in the file where made.
export default function LegalDialog({ legalDocs }) {
  useEffect(() => {
    once("legal-dialog", () => {
      var overlay = document.getElementById('legalModal');
      if (!overlay) return;
      var modal = createModalController(overlay);

      var titleEl = document.getElementById('legalModalTitle');
      var introEl = document.getElementById('legalModalIntro');
      var listEl = document.getElementById('legalModalList');

      function populate(key) {
        var d = legalDocs.find(function (x) { return x.key === key; });
        if (!d) return false;

        titleEl.textContent = d.title;
        introEl.textContent = d.intro;

        listEl.innerHTML = '';
        d.sections.forEach(function (item) {
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

      document.querySelectorAll('[data-legal]').forEach(function (btn) {
        btn.addEventListener('click', function (e) {
          if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button === 1) return;
          e.preventDefault();
          if (!populate(btn.getAttribute('data-legal'))) return;
          modal.open(e.currentTarget);
        });
      });
    });
  }, []);
  return null;
}
