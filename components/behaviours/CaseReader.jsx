"use client";
import { useEffect } from "react";
import { once } from "@/lib/client/once";
import { createModalController } from "@/lib/client/modal";

// Ported from index.html lines 2253-2538 by
// scripts/port-behaviour.cjs: the old script's body, verbatim, run once on
// mount against the server-rendered markup. Kept as JavaScript on purpose -
// this is the old site's code, not a rewrite. Hand edits after generation
// are allowed and are noted in the file where made.
export default function CaseReader({ caseStudies }) {
  useEffect(() => {
    once("case-reader", () => {
      var byKey = {};
      caseStudies.forEach(function (c) { byKey[c.key] = c; });

      var overlay = document.getElementById('caseDetailModal');
      if (!overlay) return;
      var panel = overlay.querySelector('.modal-panel');
      var sideEl = overlay.querySelector('.reader-side');
      var bodyEl = overlay.querySelector('.case-modal-body');
      var modal = createModalController(overlay);

      var listEl = document.getElementById('caseIndexList');
      var countEl = document.getElementById('caseReaderCount');
      var pagerEl = document.getElementById('caseReaderPager');
      var artEl = document.getElementById('caseDetailArt');
      var sectorEl = document.getElementById('caseDetailSector');
      var titleEl = document.getElementById('caseDetailTitle');
      var clientEl = document.getElementById('caseDetailClient');
      var statsEl = document.getElementById('caseDetailStats');
      var sectionsEl = document.getElementById('caseDetailSections');
      var quoteEl = document.getElementById('caseDetailQuote');
      var quoteTextEl = document.getElementById('caseDetailQuoteText');
      var quoteCiteEl = document.getElementById('caseDetailQuoteCite');
      var backBtn = document.getElementById('caseDetailBack');
      var currentKey = null;

      // Reader layout: every engagement is listed down the left of the
      // dialog and the selected one reads on the right, so moving between
      // case studies is one click rather than close, View all, pick, back.
      // Below 900px the two columns cannot fit, so the panel shows one at a
      // time - .show-list swaps the reading pane for the list, toggled by
      // the footer's "All case studies" button, which only renders at that
      // width. Rows are real links (case-studies/<key>.html) so crawlers
      // and ctrl/cmd/middle-click still get the standalone page.
      function isModified(e) {
        return e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button === 1;
      }

      // The sidebar pages at 10 rows. Below that no pager is rendered at all -
      // a lone "Page 1" is noise - so at today's eight case studies it is
      // invisible, and it turns itself on when an eleventh is added rather
      // than needing to be wired up again then.
      var PAGE_SIZE = 10;
      var currentPage = 1;

      function pageCount() {
        return Math.max(1, Math.ceil(caseStudies.length / PAGE_SIZE));
      }

      function pageOfKey(key) {
        for (var i = 0; i < caseStudies.length; i++) {
          if (caseStudies[i].key === key) return Math.floor(i / PAGE_SIZE) + 1;
        }
        return 1;
      }

      function buildRow(c) {
        var row = document.createElement('a');
        row.href = '/case-studies/' + c.key;
        row.className = 'case-index-item';
        row.setAttribute('data-case', c.key);

        var text = document.createElement('span');
        var client = document.createElement('span');
        client.className = 'case-index-client';
        client.textContent = c.client + ' · ' + c.service;
        var title = document.createElement('span');
        title.className = 'case-index-title';
        title.textContent = c.title;
        client.style.display = 'block';
        title.style.display = 'block';
        text.appendChild(client);
        text.appendChild(title);

        var go = document.createElement('span');
        go.className = 'case-index-go';
        go.innerHTML = '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true" xmlns="http://www.w3.org/2000/svg"><path d="M5 12h14m0 0-6-6m6 6-6 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';

        row.appendChild(text);
        row.appendChild(go);
        row.addEventListener('click', function (e) {
          if (isModified(e)) return;
          e.preventDefault();
          select(c.key);
          panel.classList.remove('show-list');
        });
        return row;
      }

      function pageButton(label, ariaLabel, targetPage, isCurrent, isDisabled) {
        var b = document.createElement('button');
        b.type = 'button';
        b.className = 'reader-page-btn';
        b.innerHTML = label;
        if (ariaLabel) b.setAttribute('aria-label', ariaLabel);
        if (isCurrent) b.setAttribute('aria-current', 'page');
        if (isDisabled) b.disabled = true;
        else b.addEventListener('click', function () { goToPage(targetPage); });
        return b;
      }

      function renderPager() {
        if (!pagerEl) return;
        var total = pageCount();
        pagerEl.innerHTML = '';
        // One page means no pager, rather than a pager that cannot go anywhere.
        pagerEl.hidden = total < 2;
        if (total < 2) return;

        var prev = '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true" xmlns="http://www.w3.org/2000/svg"><path d="M15 5l-7 7 7 7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
        var next = '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true" xmlns="http://www.w3.org/2000/svg"><path d="M9 5l7 7-7 7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';

        pagerEl.appendChild(pageButton(prev, 'Previous page', currentPage - 1, false, currentPage === 1));
        for (var p = 1; p <= total; p++) {
          pagerEl.appendChild(pageButton(String(p), 'Page ' + p, p, p === currentPage, false));
        }
        pagerEl.appendChild(pageButton(next, 'Next page', currentPage + 1, false, currentPage === total));
      }

      function goToPage(n) {
        var total = pageCount();
        currentPage = Math.min(Math.max(1, n), total);
        renderIndex();
        // Send the reader to the top of the new page rather than leaving it
        // wherever the previous page happened to be scrolled to.
        if (listEl) listEl.scrollTop = 0;
      }

      function renderIndex() {
        listEl.innerHTML = '';
        if (countEl) countEl.textContent = 'All case studies · ' + caseStudies.length;
        var start = (currentPage - 1) * PAGE_SIZE;
        caseStudies.slice(start, start + PAGE_SIZE).forEach(function (c) {
          listEl.appendChild(buildRow(c));
        });
        renderPager();
        // Rows are rebuilt from scratch, so the highlight has to be re-applied
        // rather than surviving on the old nodes.
        if (currentKey) highlight(currentKey);
      }

      // Highlights the row being read and, only if the list has scrolled it
      // out of view, brings it back - picking a row near the bottom of the
      // list must not yank the list to the top. Silently does nothing when the
      // entry is not on the page currently shown, which is what markActive
      // below sorts out first.
      function highlight(key) {
        var activeRow = null;
        [].forEach.call(listEl.querySelectorAll('.case-index-item'), function (row) {
          var on = row.getAttribute('data-case') === key;
          row.classList.toggle('is-active', on);
          if (on) { row.setAttribute('aria-current', 'true'); activeRow = row; }
          else row.removeAttribute('aria-current');
        });
        if (activeRow) {
          var top = activeRow.offsetTop;
          var bottom = top + activeRow.offsetHeight;
          if (top < listEl.scrollTop) listEl.scrollTop = top - 16;
          else if (bottom > listEl.scrollTop + listEl.clientHeight) listEl.scrollTop = bottom - listEl.clientHeight + 16;
        }
      }

      // Opening a case study from a card can land on an entry that is not on
      // the page the sidebar happens to be showing, so the page follows the
      // selection rather than the reader silently highlighting nothing.
      function markActive(key) {
        var target = pageOfKey(key);
        if (target !== currentPage) {
          currentPage = target;
          renderIndex();
          return;
        }
        highlight(key);
      }

      function addSection(label, body) {
        var wrap = document.createElement('div');
        wrap.className = 'case-section';
        var h = document.createElement('h3');
        h.textContent = label;
        wrap.appendChild(h);
        // A body may carry several paragraphs separated by a literal newline
        // (Cedar Creek Church was the first); each becomes its own <p>.
        // The body is markdown-rendered html (content/case-studies/*.md); its
        // paragraphs are already <p>s.
        var bodyEl = document.createElement('div');
        bodyEl.innerHTML = body;
        while (bodyEl.firstChild) wrap.appendChild(bodyEl.firstChild);
        sectionsEl.appendChild(wrap);
      }

      // Fills the reading pane. Works whether or not the dialog is open, so
      // the sidebar rows and the section's own openers share it.
      function select(key) {
        var c = byKey[key];
        if (!c) return false;

        // Gradient is chosen by position rather than stored per entry, so the
        // four hues stay evenly spread as case studies are added and no two
        // neighbours in the list share one. generate-static-pages.js derives
        // it the same way from the same array order.
        if (artEl) {
          // The photograph sits under a brand scrim, and nothing else - the
          // panel carried a service icon over it until the photographs arrived,
          // at which point the icon was just something sitting on the picture.
          // The gradient class stays: it is what shows if the photo ever fails
          // to load.
          var src = c.photo || '';
          var photo = src
            ? '<img class="case-art-photo" src="' + src + '" alt="" loading="lazy" decoding="async"><span class="case-art-scrim"></span>'
            : '';
          artEl.innerHTML = '<div class="blog-art a' + ((caseStudies.indexOf(c) % 4) + 1) + '">' + photo + '</div>';
        }

        sectorEl.textContent = c.sector + ' · ' + c.service;
        titleEl.textContent = c.title;
        clientEl.textContent = c.client;

        statsEl.innerHTML = '';
        c.stats.forEach(function (s) {
          var d = document.createElement('div');
          d.className = 'case-stat';
          var b = document.createElement('b');
          b.textContent = s.v;
          var sp = document.createElement('span');
          sp.textContent = s.l;
          d.appendChild(b);
          d.appendChild(sp);
          statsEl.appendChild(d);
        });

        sectionsEl.innerHTML = '';
        c.sections.forEach(function (sec) { addSection(sec.heading, sec.html); });

        if (c.quote) {
          quoteTextEl.textContent = c.quote.text;
          quoteCiteEl.textContent = c.quote.cite;
          quoteEl.hidden = false;
        } else {
          quoteEl.hidden = true;
        }

        currentKey = key;
        markActive(key);
        if (bodyEl) bodyEl.scrollTop = 0;
        return true;
      }

      function openDetail(key, opener, listFirst) {
        if (!select(key)) return;
        panel.classList.toggle('show-list', !!listFirst);
        modal.open(opener);
      }

      if (backBtn) {
        backBtn.addEventListener('click', function () {
          panel.classList.add('show-list');
          var row = listEl.querySelector('.case-index-item.is-active') || listEl.querySelector('.case-index-item');
          if (row) row.focus();
        });
      }

      // Real hrefs (case-studies/<key>.html) give crawlers and ctrl/cmd/middle
      // click a genuine page to land on; a plain left-click still opens the
      // reader instead of navigating there.
      document.querySelectorAll('.case-read-more').forEach(function (btn) {
        btn.addEventListener('click', function (e) {
          if (isModified(e)) return;
          e.preventDefault();
          openDetail(btn.getAttribute('data-case'), btn, false);
        });
      });

      // "View all" opens the reader on whichever case study was last read
      // (the first, before any has been), with the list up front on mobile.
      var viewAllBtn = document.getElementById('caseViewAll');
      if (viewAllBtn) {
        viewAllBtn.addEventListener('click', function () {
          openDetail(currentKey || caseStudies[0].key, viewAllBtn, true);
        });
      }

      renderIndex();
    });
  }, []);
  return null;
}
