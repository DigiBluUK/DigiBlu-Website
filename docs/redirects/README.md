# Redirects from the old Wix site

`wix-to-new-site.csv` maps every address the old site publishes in its
sitemaps (fetched from www.digiblu.com on 10 September 2026: 17 pages, 8
project pages, 8 leadership profiles, 17 blog posts, 13 news items) to the
page on the new site that carries the same content, or the nearest section
of the home page where the content is now a dialog. The file is in
Cloudflare's Bulk Redirects CSV format and uploads as one list
(Cloudflare dashboard > Bulk Redirects > Create list > Upload CSV), then
needs one Bulk Redirect rule that enables the list.

## How the mapping was chosen

- **Services** (`/ai-artificial-intelligence`, `/digital-solutions`,
  `/process-excellence`, `/target-operating-model`,
  `/opportunity-discovery`, `/post-implementation-services`) go to the
  matching anchor on `/services` (`#ai`, `#digital`, `#process`, `#tom`,
  `#discovery`, `#post`), the page that carries every service in full
  since 11 September 2026.
- **About** (`/about-us`, `/about-us-1`) go to `/#about`; the leadership
  page (`/about-digiblu`) and every `/leadership-team/<name>` profile go to
  `/team`, the page with every bio (since 11 September 2026). Four of the eight old profiles are people no longer on the
  team page (Tarryn Chetty, Will Ells, Michael Cobbledick, Steve Burke) and
  one is a placeholder ("you"); all of them land on the team section.
- **Contact** (`/contact-us`) goes to `/#contact`, which opens the contact
  dialog on load.
- **Legal** pages keep their slugs under `/legal/`.
- **Projects** (`/our-projects/<title>`) go to the matching
  `/case-studies/<key>` page. Wix encodes the punctuation in these
  addresses (`%3A`, `%2C`) and two end in a trailing hyphen; the sources
  are given exactly as the sitemap publishes them. The eighth project
  (First National Bank, "Training for transformation") is no longer a
  case study and goes to `/case-studies`, the index page (since 11
  September 2026). A prefix rule catches any other `/our-projects/...`
  address and sends it there too. The old `/case-studies` page itself
  needs no row: the new site answers at the same address.
- **Blog and news** (`/blog`, `/post/...`, `/News/...`) go to the home
  page. There is no blog or news section on the new site. **Settled with
  DigiBlu on 10 September 2026**: a permanent redirect sends a visitor
  from an old link somewhere useful and keeps any link equity, although
  Google treats a mass redirect to the home page much like a "not found"
  for ranking purposes, so nothing is gained in search terms. The
  alternative, letting these addresses return 404, was offered and not
  taken. If a news or insights section is added later, each post can be
  redirected to its new home then. The three prefix rules cover all 31
  addresses.

## Format notes

- `source_url` is the host and path without a scheme. `include_subdomains`
  is `true` on every row so the same rule matches `www.digiblu.com/...`
  as well as `digiblu.com/...`; the separate www-to-apex redirect set up
  with the custom domain runs first anyway.
- `subpath_matching` is `true` on the five prefix rows
  (`/leadership-team`, `/our-projects`, `/blog`, `/post`, `/News`), which
  is what makes them catch everything beneath the prefix.
  `preserve_path_suffix` is `false` so the suffix is dropped rather than
  appended to the target.
- Cloudflare applies the most specific matching source, so the exact
  `/our-projects/...` rows win over the `/our-projects` prefix row.
- `preserve_query_string` is `false` throughout; nothing on the new site
  reads a query string.
- Targets use `https://digiblu.com`. If the live host ends up as
  `www.digiblu.com`, replace the host in the target column before
  uploading.

## After go-live

Check the redirects with a browser or `curl -I` on a handful of old
addresses, then watch Search Console's "Pages" report: old addresses
should move to "Page with redirect" over the following weeks.
