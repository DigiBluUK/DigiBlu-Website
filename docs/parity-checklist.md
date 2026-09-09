# DigiBlu site: sign-off checklist for the Next.js build

Check the preview URL of the `dev` branch against these. Do the whole list twice: once in dark theme and once in light (the sun/moon button in the nav). Do the phone column on a real phone or a browser narrower than 900px. Tick each line when it matches; note anything that does not.

Preview URL: _(filled in when Cloudflare is connected; until then `http://localhost:3000` from `npm run dev`)_

## Everywhere

- [ ] The nav sits over the hero at the top, then turns into a rounded glass panel once you scroll. Its links go to the right sections; Get in touch opens the contact form.
- [ ] The theme button flips the whole site between dark and light, remembers the choice on reload, and its label reads the mode it will switch to.
- [ ] Below 900px the hamburger opens a menu with the same links and the theme button; a link closes it.
- [ ] A round arrow button appears bottom-right after scrolling and takes you to the top.
- [ ] No sideways scrolling at any width, down to 320px.
- [ ] Every dialog closes with its X, with Escape, and by clicking the dark backdrop; focus goes back to what opened it.

## Hero

- [ ] "Applied AI, real ROI" on one line on desktop; breaks only at the comma on a phone.
- [ ] The nested-frames artwork fills the section behind the nav, with lights travelling along its ridges (one or two at a time, never all three).
- [ ] The paragraph and the Get in touch button sit at the bottom.

## Accreditations

- [ ] A single line of six certifications scrolls continuously, pauses on hover, and moves at the same pace as the client logos.
- [ ] Clicking any of them (either copy) opens a dialog with the real badge, its name and a description; G-Cloud's badge sits on a dark plate in both themes.

## Services

- [ ] Six blue-to-navy cards, numbered 01 to 06, animate in as the section arrives.
- [ ] Learn more on each opens a dialog with "Service 0N", the title, an intro and its bullet list; Discuss this service hands over to the contact form.
- [ ] The six links in the footer's Services column open the same dialogs.

## Case studies

- [ ] Three cards (SSE / OVO, AssuranceSD, Cedar Creek Church) with headlines on two lines and no full stops.
- [ ] Read more opens the reader on that engagement: photo in natural colour, three blue stat pills, four sections, the client quote. Ctrl-click or middle-click opens the standalone page instead.
- [ ] View all case studies opens the reader with eight rows in the sidebar; clicking a row switches the reading pane. On a phone the "All case studies" button swaps between list and article.
- [ ] `/case-studies/sse-ovo` (and the other seven) load as real pages with the same content, a Back to home link, and the nav.

## Clients

- [ ] Fourteen logos scroll continuously as single-ink marks, muted at rest, full on hover, no jump at the seam.

## Who we are

- [ ] "Who we are" (no full stop), two paragraphs that light up word by word as you scroll, with the dot-lattice figure beside them.
- [ ] The figure's "db" phases into the brand gradient as it reaches the middle of the screen; on desktop the dots part around the cursor; there are no stray grey dots around the letterform.
- [ ] Our values: on desktop all five are open in a 3 + 2 grid; hovering a value turns its number and top line into the brand gradient. On a phone they reveal one after another as you scroll.

## Meet the leadership team

- [ ] Eight people. The open card shows a colour photo in a white circle with name, role and bio; the rest show grey circles. All eight heads sit at the same size and height in their circles; Vic, Martin and Dave are open-collar.
- [ ] Clicking a closed slice opens it; clicking the open one, or the arrows, works; clicking the open card again opens the profile dialog with the full bio.
- [ ] On a phone: a list of eight rows; tapping one highlights it and opens the profile.

## Footer

- [ ] Address reads "DigiBlu UK Limited, First Floor, Steeple House, Church Lane, Chelmsford, CM1 1NH, United Kingdom."
- [ ] Legal links open the policy in a dialog (Terms, Privacy, Modern Slavery, Carbon Reduction Plan, Armed Forces Covenant); ctrl-click opens the standalone page. The intros read "Last updated ..." only.
- [ ] Contact Us opens the contact form. The LinkedIn icon opens in a new tab.

## Contact form

- [ ] Step 1 needs first name, last name and a valid email before Next works; the phone field drops letters as you type.
- [ ] Step 2 needs the consent box ticked before Submit works; the Privacy Policy link opens the policy on top of the form and closing it returns you to the form.
- [ ] Submit shows the "Request sent" screen. (Nothing is sent yet: the Azure Communication Services endpoint is a separate piece of work.)
- [ ] On a phone the form is full screen and the fields scroll under the header.

## Standalone pages

- [ ] Every case-study page and legal page has its own title in the tab, the nav with a working theme button, a Back to home link, and a footer whose Services links go back to the home page.
