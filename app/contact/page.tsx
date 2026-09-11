import type { Metadata } from "next";
import { SITE_ORIGIN } from "@/lib/site";
import SkipLink from "@/components/SkipLink";
import PageHeader from "@/components/PageHeader";
import BackLink from "@/components/BackLink";
import ContactFormBody from "@/components/ContactFormBody";
import Footer from "@/components/Footer";
import PageBehaviours from "@/components/PageBehaviours";
import PhoneDigits from "@/components/behaviours/PhoneDigits";
import ContactForm from "@/components/behaviours/ContactForm";

// The contact form as a page (11 Sep 2026, the developer's review): the
// same markup and script as the home page's dialog, in a panel in the
// flow rather than an overlay. Every "Get in touch" and "Contact Us" is a
// real link here; on the home page a plain click still opens the dialog.
const TITLE = "Get in touch | DigiBlu";
const DESCRIPTION = "Tell DigiBlu about your project or question and a member of the team will be in touch. Two quick steps: your details, then your enquiry.";
const URL = `${SITE_ORIGIN}/contact`;
const OG = "/assets/og/contact.jpg";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: URL },
  openGraph: { type: "website", siteName: "DigiBlu", title: TITLE, description: DESCRIPTION, url: URL, images: [{ url: OG, width: 1200, height: 630, type: "image/jpeg", alt: "Get in touch with DigiBlu" }] },
  twitter: { card: "summary_large_image", title: TITLE, description: DESCRIPTION, images: [OG] },
};

export default function ContactPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ContactPage",
    name: TITLE,
    description: DESCRIPTION,
    url: URL,
    isPartOf: { "@type": "WebSite", name: "DigiBlu", url: SITE_ORIGIN + "/" },
  };
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <SkipLink target="#detail-content" />
      <PageHeader />
      <main>
        <div className="contact-page" id="detail-content">
          <BackLink />
          {/* .modal-panel for the dialog's two-column layout and success
               state; .contact-panel lifts it out of the overlay's constraints. */}
          <div className="modal-panel contact-panel" id="contactPage">
            <ContactFormBody heading="h1" />
          </div>
        </div>
      </main>
      <Footer standalone />
      <PageBehaviours />
      <PhoneDigits />
      <ContactForm rootId="contactPage" turnstileSiteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || ""} />
    </>
  );
}
