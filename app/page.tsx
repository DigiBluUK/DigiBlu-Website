import type { Metadata } from "next";
import { preload } from "react-dom";
import { SITE_URL, SITE_OPEN_GRAPH } from "@/lib/site";
import SkipLink from "@/components/SkipLink";
import Hero from "@/components/sections/Hero";
import Accreditations from "@/components/sections/Accreditations";
import Services from "@/components/sections/Services";
import CaseStudies from "@/components/sections/CaseStudies";
import Clients from "@/components/sections/Clients";
import About from "@/components/sections/About";
import Team from "@/components/sections/Team";
import Footer from "@/components/Footer";
import ScrollTop from "@/components/ScrollTop";
import HomeBehaviours from "@/components/HomeBehaviours";

// The home page in the old site's order: hero, accreditations, services,
// case studies, clients, about, team; then the footer and the scroll-to-top
// button. There are no dialogs since 18 Sep 2026 (DigiBlu's developer's
// request): every opener, the contact buttons included, links to its page.
// Title and description come from the layout; the canonical and og:url are
// the home page's own, so the 404 no longer claims to be it.
export const metadata: Metadata = {
  alternates: { canonical: SITE_URL },
  openGraph: { ...SITE_OPEN_GRAPH, url: SITE_URL },
};

export default function Home() {
  // The hero art is the first thing drawn, so it is fetched early - on this
  // page only; the other pages have no hero (it was preloaded on all of them).
  preload("/assets/hero.svg", { as: "image", type: "image/svg+xml", fetchPriority: "high" });
  return (
    <>
      <SkipLink />
      <main>
        <Hero />
        <Accreditations />
        <Services />
        <CaseStudies />
        <Clients />
        <About />
        <Team />
      </main>
      <Footer />
      <ScrollTop />
      <HomeBehaviours />
    </>
  );
}
