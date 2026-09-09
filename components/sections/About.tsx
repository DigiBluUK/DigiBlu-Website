// Generated from index.html by scripts/html-to-jsx.cjs; hand-fixes are
// allowed after generation, so do not regenerate over a tuned file.
import Lattice from "./Lattice";

export default function About() {
  return (
    <>
        <section className="about" id="about">
          {/* Top block is the earlier stacked layout, restored on request: heading,
               blue rule, then the narrative at full size. The label-left /
               statement-right arrangement from the first reference is gone; the copy
               it introduced ("At DigiBlu, we bring together...") is kept, since that
               is the wording the scroll reveal was specified against.

               The narrative reads muted and fills to full ink word by word as the
               block scrolls up the viewport - see the about IIFE. */}
          {/* .about-inner is what sticks while the values run 01 to 05: the whole
               composition holds, not the list alone, so the hold reads as the page
               pausing on About rather than a bare list floating in an empty screen.
               .about-pin-space below is the scroll that hold consumes - a sticky
               element is constrained by its parent's CONTENT box, so extra padding
               on .about could not have supplied it. Both are inert below 901px or
               on a short viewport (see the CSS). */}
          <div className="about-inner">
          <span className="pill">About Us</span>
          <h2>Who we are</h2>

          <div className="about-top">
            <div className="about-head">
              <p className="about-lede">At DigiBlu, we bring together experienced practitioners with client-side, technology, and consultancy backgrounds. We act as pragmatic partners, focused on getting to value quickly rather than getting lost in process.</p>
              <p className="about-lede">Our vision is to be one of the UK's foremost independent AI-enabled digital transformation businesses, turning today's pressures into lasting advantage.</p>
            </div>

            <div className="geo-figure" aria-hidden="true">
              <Lattice />
            </div>
          </div>
          <div className="about-values">
            <h3 className="about-values-title">Our values</h3>
          {/* Values as a numeral accordion, per the second reference supplied: the
               open value shows its title and description beside a full-ink numeral,
               the rest collapse to a muted numeral under a hairline rule. Click to
               open rather than hover, so it works on touch and from the keyboard;
               hover only tints, which is the state the reference shows on item 4.
               Below 761px it is not an accordion at all - every value is shown in
               full, because a horizontal accordion has nowhere to expand on a
               phone. */}
          <ol className="value-list">
              <li className="value-item is-open">
                <button type="button" className="value-open" aria-expanded="true">
                  <span className="value-num">01</span>
                  <span className="value-text">
                    <span className="value-title">Equitable partnerships</span>
                    <span className="value-desc">We engage commercially with our clients transparently and on the basis of shared success.</span>
                  </span>
                </button>
              </li>
              <li className="value-item">
                <button type="button" className="value-open" aria-expanded="false">
                  <span className="value-num">02</span>
                  <span className="value-text">
                    <span className="value-title">Innovation with purpose</span>
                    <span className="value-desc">We embrace new ideas and challenge convention to solve real problems and drive meaningful impact.</span>
                  </span>
                </button>
              </li>
              <li className="value-item">
                <button type="button" className="value-open" aria-expanded="false">
                  <span className="value-num">03</span>
                  <span className="value-text">
                    <span className="value-title">Technology on merit</span>
                    <span className="value-desc">We choose the right technology for the problem, not preferred vendors.</span>
                  </span>
                </button>
              </li>
              <li className="value-item">
                <button type="button" className="value-open" aria-expanded="false">
                  <span className="value-num">04</span>
                  <span className="value-text">
                    <span className="value-title">Lasting capability</span>
                    <span className="value-desc">We empower our clients with the skills, knowledge and ways of working to succeed long after we're gone.</span>
                  </span>
                </button>
              </li>
              <li className="value-item">
                <button type="button" className="value-open" aria-expanded="false">
                  <span className="value-num">05</span>
                  <span className="value-text">
                    <span className="value-title">Trust and Likeability</span>
                    <span className="value-desc">Our client NPS is +85: our clients like and trust us.</span>
                  </span>
                </button>
              </li>
          </ol>
          </div>
          </div>
          <div className="about-pin-space" aria-hidden="true"></div>
        </section>
    </>
  );
}
