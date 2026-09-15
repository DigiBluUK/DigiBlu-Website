import { defineConfig } from "vite";
import vinext from "vinext";
import { cloudflare } from "@cloudflare/vite-plugin";
import { kvDataAdapter } from "@vinext/cloudflare/cache/kv-data-adapter";
import { cdnAdapter } from "@vinext/cloudflare/cache/cdn-adapter";

// The @azure/communication-email SDK the contact API uses ships a browser
// build (global fetch + WebCrypto) and a Node build (node:https +
// node:crypto). The Cloudflare plugin adds "browser" to the client
// environment's resolve conditions but NOT to the rsc/ssr environments, and
// /api/contact is bundled into one of those, so without this the Worker gets
// the heavier Node build. Adding "browser" here makes both the Worker bundle
// and the node:test run select the same fetch-based build (the test passes
// --conditions=browser), so a mocked global.fetch is the one the code calls.
const azureBrowserBuild = {
  name: "digiblu-azure-browser-build",
  enforce: "pre",
  config() {
    const conditions = ["workerd", "worker", "module", "browser"];
    return { environments: { rsc: { resolve: { conditions } }, ssr: { resolve: { conditions } } } };
  },
};

// Image optimisation is deliberately not configured: the site uses plain <img>
// and next.config.ts sets images.unoptimized, so there is no IMAGES binding.
export default defineConfig({
  plugins: [
    azureBrowserBuild,
    vinext({
      cache: { data: kvDataAdapter(), cdn: cdnAdapter() },
      prerender: { routes: "*" },
    }),
    cloudflare({
      viteEnvironment: {
        name: "rsc",
        childEnvironments: ["ssr"],
      },
    }),
  ],
});
