// Generated from index.html by scripts/html-to-jsx.cjs; hand-fixes are
// allowed after generation, so do not regenerate over a tuned file.
export default function CaseReaderDialog() {
  return (
    <>
        <div className="modal-overlay" id="caseDetailModal">
          <div className="modal-panel case-modal-panel reader-panel" role="dialog" aria-modal="true" aria-labelledby="caseDetailTitle" tabIndex={-1}>
            <button className="modal-close" aria-label="Close">
              <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" xmlns="http://www.w3.org/2000/svg"><path d="M5 5l14 14M19 5 5 19" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></svg>
            </button>
            {/* Reader sidebar: every engagement, with the one being read
                 highlighted (.is-active). Replaced the separate "All case studies"
                 index popup. Below 900px it is hidden until the panel gets
                 .show-list from the footer's "All case studies" button. */}
            <aside className="reader-side" aria-label="All case studies">
              <p className="reader-side-count" id="caseReaderCount">All case studies</p>
              <div className="case-index-list reader-list" id="caseIndexList"></div>
              {/* Only rendered when there is more than one page - see PAGE_SIZE in
                   the case-study IIFE. Invisible at today's eight case studies. */}
              <nav className="reader-pager" id="caseReaderPager" aria-label="Case study pages" hidden></nav>
            </aside>
            <div className="case-modal-body">
              {/* A duplicate "All case studies" link was trialled here at the top
                   of the popup and rejected on review — it belongs only in the
                   footer below. Don't re-add it. */}
              {/* Leads the case study the same way .blog-modal-art leads a post.
                   Reuses the blog art classes deliberately so the two panels are
                   literally the same object rather than two that have to be kept
                   looking alike; same accepted naming debt as the blog reusing
                   .case-viewall-btn and .service-modal-*. */}
              <div className="blog-modal-art" id="caseDetailArt" aria-hidden="true"></div>
              <span className="pill case-modal-eyebrow" id="caseDetailSector">Case Study</span>
              <h2 id="caseDetailTitle"></h2>
              <p className="case-modal-client" id="caseDetailClient"></p>
              <div className="case-stats" id="caseDetailStats"></div>
              <div id="caseDetailSections"></div>
              <figure className="case-modal-quote" id="caseDetailQuote" hidden>
                <p id="caseDetailQuoteText"></p>
                <cite id="caseDetailQuoteCite"></cite>
              </figure>
              <div className="case-modal-footer">
                {/* Mobile only (see .reader-toggle): swaps the reading pane for
                     the sidebar list, which has no room beside it at that width. */}
                <button type="button" className="case-back-btn reader-toggle" id="caseDetailBack">
                  <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" xmlns="http://www.w3.org/2000/svg"><path d="M19 12H5m0 0 6-6m-6 6 6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  All case studies
                </button>
              </div>
            </div>
          </div>
        </div>

    </>
  );
}
