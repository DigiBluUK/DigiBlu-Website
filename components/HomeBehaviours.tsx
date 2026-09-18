import { getTeam } from "@/lib/content";
import NavChrome from "@/components/behaviours/NavChrome";
import ServicesReveal from "@/components/behaviours/ServicesReveal";
import PhoneDigits from "@/components/behaviours/PhoneDigits";
import AboutNarrative from "@/components/behaviours/AboutNarrative";
import Values from "@/components/behaviours/Values";
import GeoFigure from "@/components/behaviours/GeoFigure";
import GeoCursor from "@/components/behaviours/GeoCursor";
import TeamStrip from "@/components/behaviours/TeamStrip";
import ContactForm from "@/components/behaviours/ContactForm";

// Reads the content once at build time and hands each behaviour its props.
// Every child is a client component that renders nothing and wires the
// server-rendered markup on mount. Only the team strip takes content (its
// desktop card shows the bio); the content dialogs and their data went on
// 18 Sep 2026, so the home page no longer ships every document in its
// payload.
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
      <TeamStrip team={getTeam().map(({ key, html }) => ({ key, html }))} />
      {/* The Turnstile site key is public by design and inlined at build
           time; empty means no widget renders and the API refuses enquiries
           (next.config.ts warns on a production build without it). */}
      <ContactForm turnstileSiteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || ""} />
    </>
  );
}
