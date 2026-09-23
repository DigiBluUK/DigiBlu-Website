# DigiBlu site: release sign-off checklist

For DigiBlu's sign-off before a release (fast-forwarding `main` to `dev`) and again on the live site after the DNS switch. Current as of 21 September 2026.

**Where**: the `dev` preview, https://dev-digiblu-website.radu-ghitescu.workers.dev/ (behind Cloudflare Access: sign in with a DigiBlu login). After the switch, https://digiblu.com/.

**How**: go through the list on a desktop browser and on a real phone (or a browser window narrower than 900px), each in dark theme and in light (the sun/moon button in the nav). Tick a line when it matches; for anything that does not, note the page, the device and the theme.

**First, the automated checks** (there is no CI, so someone has to run them): `pnpm test`, then `pnpm build` and `pnpm test:pages`. On this machine pnpm runs as `npx -y pnpm@latest <script>`.

## Every page

- [ ] The nav is fixed at the top: transparent at rest, then a rounded frosted-glass panel once you scroll. On the home page its links scroll to the sections; on every other page they go to Services, Case Studies, About Us (on the home page) and Our Experts. Get in touch goes to the contact page.
- [ ] The theme button flips the whole site between dark and light, remembers the choice on reload, and its label names the mode it will switch to.
- [ ] Below 900px the hamburger opens a menu with the same links and the theme button; tapping a link closes it.
- [ ] A round arrow button appears bottom right after you scroll down and takes you back to the top. It is hidden while the cookie banner is showing.
- [ ] No sideways scrolling at any width, down to 320px.
- [ ] No pop-up dialogs anywhere except the cookie choices: every Learn more, Read more, badge, profile, legal and contact link opens a page.
- [ ] Footer: the address reads "DigiBlu UK Limited, First Floor, Steeple House, Church Lane, Chelmsford, CM1 1NH, United Kingdom." with "Registered in England and Wales, company number 12015792." under it. The Services links go to each service on the services page, Our Experts to the team page, Contact Us to the contact page, the six Legal links to their pages; Cookie settings reopens the cookie choices; the LinkedIn icon opens in a new tab.
- [ ] Each page has its own title in the browser tab.

## Cookie banner and analytics

- [ ] On a first visit (use a private window), a compact box appears bottom right (full width on a phone) with Accept all, Reject optional and Manage preferences, none favoured over the others. The page stays usable behind it.
- [ ] Reject optional: the banner goes and stays gone after a reload, and nothing loads from Google (browser developer tools, Network tab, filter "google").
- [ ] Accept all: Google Analytics loads, and GA4 Realtime shows the visit. (Only on a build with the measurement id set: production.)
- [ ] Cookie settings in the footer reopens the choices; switching Analytics off stops it.

## Home page

- [ ] Hero: "Applied AI, real ROI" on one line on desktop, breaking only at the comma on a phone; the framed artwork behind the nav, with lights travelling along its ridges; the paragraph and the Get in touch button at the bottom.
- [ ] Accreditations: six certifications scroll in a single continuous line, pause on hover, and each opens its entry on the accreditations page.
- [ ] Services: six blue cards numbered 01 to 06 animate in as the section arrives; each Learn more opens that service on the services page.
- [ ] Case studies: three cards - SSE / OVO, Safari Destinations and AssuranceSD - with headlines on two lines and no full stops. Read more opens each one's page; View all case studies opens the case studies page.
- [ ] Clients: fourteen logos scroll continuously as single-colour marks, muted at rest and full on hover, with no jump at the seam.
- [ ] Who we are: two paragraphs light up word by word as you scroll, beside the dot-lattice figure whose "db" fills with the brand gradient mid-screen; on desktop the dots part around the cursor. Our values: all five open on desktop (3 + 2), revealed one after another on a phone.
- [ ] Meet the leadership team: eight people. On desktop the open card shows a colour photo in a white circle with name, role and bio, and the others grey circles; clicking a closed slice opens it, clicking the open one goes to that person on the team page. On a phone: a list of eight rows, and tapping one goes to that person on the team page.

## The other pages

- [ ] Services page: all six services in full, numbered 01 to 06, each with Discuss this service going to the contact page. An address such as `/services#discovery` lands on that service just below the nav.
- [ ] Case studies page: all nine case studies, each linking to its own page.
- [ ] Each of the nine case-study pages: the photograph in natural colour, three blue stat pills, Overview / The problem / What we did / Outcome, the quote, and a Back to home link.
- [ ] Team page: all eight bios; each person opened from the home page's strip lands on their own bio.
- [ ] Accreditations page: the six badges with their descriptions; the G-Cloud badge sits on a dark plate in both themes.
- [ ] The six legal pages (Terms of Use, Privacy and Cookies Policy, Modern Slavery Policy, Carbon Reduction Plan, Armed Forces Covenant, Accessibility Statement): the full text, with "Last updated ..." ("Last signed ..." for the Covenant) under the title.
- [ ] A mistyped address (for example `/nothing-here`) shows the site's own "That page is not here" page, with the nav and the footer.
- [ ] After the DNS switch only (link previews cannot get past Cloudflare Access): a link pasted into LinkedIn or Teams shows that page's own title and picture card.

## Contact form (the contact page)

- [ ] Step 1 needs first name, last name and a valid work email before Next works; the optional phone field drops letters as you type.
- [ ] Step 2: company and message are optional; Send request needs the consent box ticked and the security check to finish. The Privacy and Cookies Policy link opens in a new tab, and nothing typed is lost.
- [ ] A real test enquiry shows the "Request sent" screen and arrives in the enquiries mailbox within a few minutes, with the sender as the reply-to address. (If it never arrives, the failure shows only in Cloudflare Observability: ask Radu.)
- [ ] With analytics accepted, that enquiry appears in GA4 as a `generate_lead` event (Realtime or DebugView; production only); with analytics rejected, nothing goes to Google. The event never carries anything that was typed.
- [ ] Done brings back an empty form. On a phone the form fills the screen and the fields scroll under its header.

## Keyboard and motion

- [ ] On any page, the first Tab stop is "Skip to content", which jumps past the nav. Every link and button after it shows a visible blue focus ring, in a sensible order, and the menu, the theme button, the contact form and the cookie banner all work from the keyboard alone (Escape closes the cookie preferences).
- [ ] With the device's reduce-motion setting on (Windows: Settings > Accessibility > Visual effects > Animation effects off; Mac and iPhone: Reduce motion): the two logo strips stand still, the Services cards and the Who we are text show in full without scroll animation, the About section does not pin, and the scroll-to-top button jumps rather than glides.
