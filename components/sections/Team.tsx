import { getTeam } from "@/lib/content";

// A bio is one paragraph of our own markdown; the <p> comes off so it can
// sit in a <span> inside the slice's <button>, which allows phrasing
// content only.
const unwrap = (html: string) => html.trim().replace(/^<p>([\s\S]*)<\/p>$/, "$1");

// Generated from index.html by scripts/html-to-jsx.cjs; hand-fixes are
// allowed after generation, so do not regenerate over a tuned file.
export default function Team() {
  const team = getTeam();
  return (
    <>
        <section className="team" id="team">
          <span className="pill">Our Experts</span>
          <div className="team-head">
            <div>
              <h2>Meet the leadership team</h2>
              <p className="team-sub">Practitioners with client, technology, and consultancy backgrounds, leading each of our practice areas from strategy through delivery.</p>
            </div>
            <div className="team-nav-btns">
              <button type="button" className="team-prev" aria-label="Previous team member">
                <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" xmlns="http://www.w3.org/2000/svg"><path d="M15 5 8 12l7 7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </button>
              <button type="button" className="team-next" aria-label="Next team member">
                <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" xmlns="http://www.w3.org/2000/svg"><path d="M9 5l7 7-7 7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </button>
            </div>
          </div>

          {/* The leadership team from content/team, in its order (21 Sep 2026;
               the slices were authored here and matched to the bios by
               position). Names, titles and photos are real and published
               (digiblu.com/about-digiblu); the photos are chroma-keyed
               cutouts under a CSS grayscale filter, see .team-slice-photo.
               The bio is in the markup, shown by CSS in the desktop card
               only; the accessible name is "Name, Role" with the bio as
               the description, so the button is not named by a paragraph.
               TeamStrip.jsx opens /team#key from data-key. */}
          <div className="team-strip">
            {team.map((m, i) => (
              <button
                type="button"
                className={i === 0 ? "team-slice active" : "team-slice"}
                aria-pressed={i === 0 ? "true" : "false"}
                aria-label={`${m.name}, ${m.role}`}
                aria-describedby={`team-bio-${m.key}`}
                data-key={m.key}
                key={m.key}
              >
                <span className={`team-slice-photo ${m.cls}`} aria-hidden="true"></span>
                <span className="team-slice-label">
                  <span className="team-slice-name">{m.name}</span>
                  <span className="team-slice-role">{m.role}</span>
                  <span className="team-slice-bio" id={`team-bio-${m.key}`} dangerouslySetInnerHTML={{ __html: unwrap(m.html) }} />
                </span>
                <span className="team-slice-more" aria-hidden="true">
                  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"/></svg>
                </span>
              </button>
            ))}
          </div>
          {/* The bios live on /team as a page since 11 Sep 2026; the footer's
               Our Experts link is the crawl path there from every page. A
               "Read the full profiles" link sat under the strip for an hour
               and was removed on request as redundant. */}
        </section>
    </>
  );
}
