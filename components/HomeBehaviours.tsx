import { getAccreditations, getCaseStudies, getLegalDocs, getServices, getTeam } from "@/lib/content";

// Reads the content once at build time and hands each behaviour its props.
// Every child is a client component that renders nothing and wires the
// server-rendered markup on mount. Order matters only where the old
// scripts' order did: the service dialog before the contact form, whose
// "Discuss this service" CTA hands off to it.
export default function HomeBehaviours() {
  const content = {
    services: getServices(),
    caseStudies: getCaseStudies(),
    legalDocs: getLegalDocs(),
    accreditations: getAccreditations(),
    team: getTeam(),
  };
  void content;
  return <></>;
}
