import { EmailClient, type EmailMessage } from "@azure/communication-email";
import type { Enquiry } from "./validate.ts";

// The contact form's send step (11 Sep 2026, ACS wired 14 Sep 2026). The
// route handler (app/api/contact/route.ts) calls submitEnquiry only after
// the payload has been validated and the Turnstile token verified, so by
// the time an enquiry arrives here it is a complete one from a person.
//
// Delivery is Azure Communication Services' Email API. All configuration is
// read from the Worker's environment at request time (secrets for the
// connection string, plain vars for the two addresses):
//   AZURE_COMMUNICATION_SERVICES_CONNECTION_STRING  (Worker secret)
//   CONTACT_FORM_SENDER_EMAIL_ADDRESS               (verified ACS domain)
//   CONTACT_FORM_RECIPIENT_EMAIL_ADDRESS            (the enquiries inbox)
//
// Two steps, so the form is not blocked on delivery. submitEnquiry awaits
// only ACS's acceptance of the message - a missing configuration or a
// rejected initial request throws, and the route answers 500 - and returns
// the operation's poller. trackDelivery takes that poller, polls the
// operation to its outcome and logs success or failure; the route
// schedules it after the response through the Workers request context
// (waitUntil), so by the time the outcome is known the response is long
// gone and trackDelivery logs rather than throws. It never rejects, which
// also makes it safe as a floating promise on Node (dev, node:test).

type SendConfig = {
  connectionString: string;
  senderAddress: string;
  recipientAddress: string;
};

function readSendConfig(): SendConfig {
  const connectionString = process.env.AZURE_COMMUNICATION_SERVICES_CONNECTION_STRING;
  const senderAddress = process.env.CONTACT_FORM_SENDER_EMAIL_ADDRESS;
  const recipientAddress = process.env.CONTACT_FORM_RECIPIENT_EMAIL_ADDRESS;
  const missing = [
    !connectionString && "AZURE_COMMUNICATION_SERVICES_CONNECTION_STRING",
    !senderAddress && "CONTACT_FORM_SENDER_EMAIL_ADDRESS",
    !recipientAddress && "CONTACT_FORM_RECIPIENT_EMAIL_ADDRESS",
  ].filter(Boolean);
  if (missing.length) throw new Error(`contact email is not configured, missing: ${missing.join(", ")}`);
  return { connectionString, senderAddress, recipientAddress } as SendConfig;
}

const HTML_ESCAPES: Record<string, string> = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" };
const escapeHtml = (s: string) => s.replace(/[&<>"']/g, (c) => HTML_ESCAPES[c]);

const OR_NONE = "-";
const field = (value: string) => value.trim() || OR_NONE;

export function buildEnquiryEmail(enquiry: Enquiry, senderAddress: string, recipientAddress: string): EmailMessage {
  const name = `${enquiry.firstName} ${enquiry.lastName}`;
  const rows: Array<[string, string]> = [
    ["Name", name],
    ["Email", enquiry.email],
    ["Phone", field(enquiry.phone)],
    ["Company", field(enquiry.company)],
    ["Message", field(enquiry.message)],
  ];
  const plainText = [
    `New contact form submission from ${name}.`,
    "",
    ...rows.map(([label, value]) => `${label}: ${value}`),
    "",
    `Reply to: ${enquiry.email}`,
  ].join("\n");
  const html = [
    "<!doctype html><html><body>",
    `<h1>New contact form submission</h1>`,
    `<table cellpadding="4" cellspacing="0">`,
    ...rows.map(([label, value]) => {
      const cell = label === "Message" ? escapeHtml(value).replace(/\n/g, "<br>") : escapeHtml(value);
      return `<tr><th align="left" valign="top">${escapeHtml(label)}</th><td>${cell}</td></tr>`;
    }),
    "</table>",
    // encodeURIComponent: in a mailto link, ? & # would start or split
    // header fields (a "?bcc=" in the address would add a recipient).
    `<p>Reply to: <a href="mailto:${escapeHtml(encodeURIComponent(enquiry.email))}">${escapeHtml(enquiry.email)}</a></p>`,
    "</body></html>",
  ].join("");
  return {
    senderAddress,
    content: { subject: `New contact form submission: ${name}`, plainText, html },
    recipients: { to: [{ address: recipientAddress }] },
    replyTo: [{ address: enquiry.email }],
  };
}

// What an error may put in the logs (21 Sep 2026). A raw error object can
// carry secrets: the SDK's "Invalid connection string" error quotes the
// whole connection string, access key included, and a validation error can
// quote an address. So the logs get the error's name, code and status, and
// its message with any access key and email address redacted.
export function loggableError(e: unknown): Record<string, unknown> {
  const err = (e && typeof e === "object" ? e : {}) as { name?: unknown; code?: unknown; statusCode?: unknown; message?: unknown };
  const message = typeof err.message === "string" ? err.message : String(e);
  return {
    name: typeof err.name === "string" ? err.name : undefined,
    code: err.code,
    statusCode: err.statusCode,
    message: message
      .replace(/accesskey=[^;\s]*/gi, "accesskey=[redacted]")
      .replace(/[^\s@;,<>"']+@[^\s@;,<>"']+/g, "[email]")
      .slice(0, 300),
  };
}

type SendPoller = Awaited<ReturnType<EmailClient["beginSend"]>>;

// The submit half: hand the email to ACS and return as soon as the service
// has accepted it. Anything wrong with the configuration or the initial
// request throws here and the route answers 500.
export async function submitEnquiry(enquiry: Enquiry): Promise<SendPoller> {
  const { connectionString, senderAddress, recipientAddress } = readSendConfig();
  const client = new EmailClient(connectionString);
  return client.beginSend(buildEnquiryEmail(enquiry, senderAddress, recipientAddress));
}

// The delivery half: poll ACS for the outcome and log it. Never rejects -
// a failure is logged, not thrown, because the response has already gone
// out by the time the outcome is known.
export async function trackDelivery(poller: SendPoller): Promise<void> {
  try {
    const result = await poller.pollUntilDone();
    if (result.status !== "Succeeded") {
      // The ACS message id and status, not the enquiry: no personal data
      // goes to the logs.
      console.error("[contact] ACS email delivery did not succeed", { at: new Date().toISOString(), id: result.id, status: result.status });
      return;
    }
    // The ACS message id, not the enquiry: no personal data goes to the logs.
    console.log("[contact] enquiry emailed", { at: new Date().toISOString(), id: result.id });
  } catch (e) {
    console.error("[contact] ACS email delivery failed", { at: new Date().toISOString(), ...loggableError(e) });
  }
}
