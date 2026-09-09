import { getAccreditations, getCaseStudies, getLegalDocs, getServices, getTeam } from "@/lib/content";
import NavChrome from "@/components/behaviours/NavChrome";
import ServicesReveal from "@/components/behaviours/ServicesReveal";
import PhoneDigits from "@/components/behaviours/PhoneDigits";
import AboutNarrative from "@/components/behaviours/AboutNarrative";
import Values from "@/components/behaviours/Values";
import GeoFigure from "@/components/behaviours/GeoFigure";
import GeoCursor from "@/components/behaviours/GeoCursor";
import TeamStrip from "@/components/behaviours/TeamStrip";
import ServiceDialog from "@/components/behaviours/ServiceDialog";
import CaseReader from "@/components/behaviours/CaseReader";
import BadgeDialog from "@/components/behaviours/BadgeDialog";
import LegalDialog from "@/components/behaviours/LegalDialog";
import ContactForm from "@/components/behaviours/ContactForm";

// Reads the content once at build time and hands each behaviour its props.
// Every child is a client component that renders nothing and wires the
// server-rendered markup on mount. Order matters only where the old
// scripts' order did: the service dialog before the contact form, whose
// "Discuss this service" CTA hands off to it.
export default function HomeBehaviours() {
  return (
    <>
      <NavChrome />
      <ServicesReveal />
      <PhoneDigits />
      <AboutNarrative />
      <Values />
      <GeoFigure />
      <GeoCursor />
      <TeamStrip team={getTeam()} />
      <ServiceDialog services={getServices()} />
      <CaseReader caseStudies={getCaseStudies()} />
      <BadgeDialog accreditations={getAccreditations()} />
      <LegalDialog legalDocs={getLegalDocs()} />
      <ContactForm />
    </>
  );
}
