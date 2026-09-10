import type { Section } from "@/lib/content";

// First-party content rendered from our own markdown at build time, which
// is why dangerouslySetInnerHTML is acceptable here. The wrapper classes are
// the old site's: .case-section for case studies, .service-modal-item for
// legal points and service items.
//
// heading: the dialogs title themselves with an h2, so their sections are
// h3; the standalone pages title themselves with an h1, so their sections
// are h2, or the outline skips a level (Lighthouse heading-order, 10 Sep
// 2026). The styling rules cover both tags.
export default function Markdown({ sections, itemClass, heading = "h3" }: { sections: Section[]; itemClass: "case-section" | "service-modal-item"; heading?: "h2" | "h3" }) {
  const Heading = heading;
  return (
    <>
      {sections.map((s) => (
        <div className={itemClass} key={s.heading}>
          <Heading>{s.heading}</Heading>
          <div dangerouslySetInnerHTML={{ __html: s.html }} />
        </div>
      ))}
    </>
  );
}
