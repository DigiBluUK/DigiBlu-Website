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
export default function Home() {
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
