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
import ContactDialog from "@/components/dialogs/ContactDialog";
import HomeBehaviours from "@/components/HomeBehaviours";

// The home page in the old site's order: hero, accreditations, services,
// case studies, clients, about, team; then the footer, the scroll-to-top
// button and the contact dialog, outside <main> as the dialogs always were.
// The content dialogs (service, case reader, accreditation, team profile,
// legal) were removed on 18 Sep 2026 at DigiBlu's developer's request:
// each opener is a link to its page, and the content is only there.
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
      <ContactDialog />
      <HomeBehaviours />
    </>
  );
}
