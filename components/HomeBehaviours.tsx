import NavChrome from "@/components/behaviours/NavChrome";
import ServicesReveal from "@/components/behaviours/ServicesReveal";
import AboutNarrative from "@/components/behaviours/AboutNarrative";
import Values from "@/components/behaviours/Values";
import GeoFigure from "@/components/behaviours/GeoFigure";
import GeoCursor from "@/components/behaviours/GeoCursor";
import TeamStrip from "@/components/behaviours/TeamStrip";

// Mounts the home page's behaviours. Every child is a client component that
// renders nothing and wires the server-rendered markup on mount; none takes
// content any more (the dialogs went on 18 Sep 2026, and the team strip's
// bios are server-rendered since 21 Sep 2026), so the home page ships no
// document text in its payload.
export default function HomeBehaviours() {
  return (
    <>
      <NavChrome />
      <ServicesReveal />
      <AboutNarrative />
      <Values />
      <GeoFigure />
      <GeoCursor />
      <TeamStrip />
    </>
  );
}
