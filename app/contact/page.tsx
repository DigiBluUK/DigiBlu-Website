import type { Metadata } from "next";
import { SITE_ORIGIN } from "@/lib/site";
import SkipLink from "@/components/SkipLink";
import PageHeader from "@/components/PageHeader";
import BackLink from "@/components/BackLink";
import ContactFormBody from "@/components/ContactFormBody";
import Footer from "@/components/Footer";
import ScrollTop from "@/components/ScrollTop";
import PageBehaviours from "@/components/PageBehaviours";
import PhoneDigits from "@/components/behaviours/PhoneDigits";
import ContactForm from "@/components/behaviours/ContactForm";

// The contact form's page (11 Sep 2026), and its only home since the home
// page's dialog went on 18 Sep 2026: every "Get in touch" and "Contact Us"
// links here.
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
          {/* .modal-panel gives the two-column layout and the success state
               (the class names are from when this was a dialog). */}
          <div className="modal-panel contact-panel" id="contactPage">
            <ContactFormBody />
          </div>
        </div>
      </main>
      <Footer />
      <ScrollTop />
      <PageBehaviours />
      <PhoneDigits />
      <ContactForm turnstileSiteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || ""} />
    </>
  );
}
