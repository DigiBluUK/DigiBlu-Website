import type { Section } from "@/lib/content";

// First-party content rendered from our own markdown at build time, which
// is why dangerouslySetInnerHTML is acceptable here. The wrapper classes are
// the old site's: .case-section for case studies, .service-modal-item for
// legal points and service items.
export default function Markdown({ sections, itemClass }: { sections: Section[]; itemClass: "case-section" | "service-modal-item" }) {
  return (
    <>
      {sections.map((s) => (
        <div className={itemClass} key={s.heading}>
          <h3>{s.heading}</h3>
          <div dangerouslySetInnerHTML={{ __html: s.html }} />
        </div>
      ))}
    </>
  );
}
