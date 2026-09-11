import BackLink from "@/components/BackLink";

// The top of a listing page (services, team, accreditations, case studies,
// 11 Sep 2026): the same chrome the case-study and legal pages open with,
// so the four new pages read as siblings of the sixteen that existed
// before them.
export default function PageIntro({ eyebrow, title, intro }: { eyebrow: string; title: string; intro: string }) {
  return (
    <>
      <BackLink />
      <span className="pill service-modal-eyebrow">{eyebrow}</span>
      <h1>{title}</h1>
      <p className="service-modal-intro">{intro}</p>
    </>
  );
}
