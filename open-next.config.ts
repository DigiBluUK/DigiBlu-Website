import { defineCloudflareConfig } from "@opennextjs/cloudflare";
import staticAssetsIncrementalCache from "@opennextjs/cloudflare/overrides/incremental-cache/static-assets-incremental-cache";

// Every route is prerendered at build time and none revalidates, so the
// prerendered pages are served straight from the Worker's static assets
// (read-only). Without an incremental cache the Worker rendered every page
// on demand and the SSG routes 404ed with NoFallbackError. When a route
// goes dynamic or needs ISR, swap this for the R2 or KV cache per the
// OpenNext docs. Nothing here needs a Cloudflare account to build locally.
export default defineCloudflareConfig({
  incrementalCache: staticAssetsIncrementalCache,
});
