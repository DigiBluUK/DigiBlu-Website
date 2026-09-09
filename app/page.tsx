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
import ServiceDialog from "@/components/dialogs/ServiceDialog";
import CaseReaderDialog from "@/components/dialogs/CaseReaderDialog";
import BadgeDialog from "@/components/dialogs/BadgeDialog";
import TeamDialog from "@/components/dialogs/TeamDialog";
import LegalDialog from "@/components/dialogs/LegalDialog";

// The home page in the old site's order: hero, accreditations, services,
// case studies, clients, about, team; then the footer, the scroll-to-top
// button and the six dialogs, which sit outside <main> as they always did.
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
      <ServiceDialog />
      <CaseReaderDialog />
      <BadgeDialog />
      <TeamDialog />
      <LegalDialog />
    </>
  );
}
