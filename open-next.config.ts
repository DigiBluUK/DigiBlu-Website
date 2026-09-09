import { defineCloudflareConfig } from "@opennextjs/cloudflare";

// Defaults: no incremental cache yet, since every route is static today.
// When a route goes dynamic, add the R2 or KV cache here per the OpenNext
// docs. Nothing in this file needs a Cloudflare account to build locally.
export default defineCloudflareConfig({});
